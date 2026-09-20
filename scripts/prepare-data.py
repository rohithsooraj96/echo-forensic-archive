"""Build compact, redacted ECHO data artifacts from the supplied archives."""
from __future__ import annotations

import csv
import io
import json
import math
import os
import zipfile
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source-data"
OUT = ROOT / "public" / "data"
OUT.mkdir(parents=True, exist_ok=True)


def archive_rows(filename: str, member: str) -> list[dict[str, str]]:
    with zipfile.ZipFile(SOURCE / filename) as archive:
        with archive.open(member) as raw:
            with io.TextIOWrapper(raw, encoding="utf-8-sig", newline="") as stream:
                return list(csv.DictReader(stream))


def write_json(filename: str, value: object) -> None:
    (OUT / filename).write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def parse_spotify_time(value: str) -> datetime:
    return datetime.strptime(value, "%Y-%m-%d %H:%M:%S")


def parse_household_time(value: str) -> datetime:
    for fmt in ("%d/%m/%Y %H:%M:%S", "%d/%m/%Y", "%m/%d/%Y %H:%M:%S", "%m/%d/%Y"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            pass
    raise ValueError(value)


def parse_india_time(value: str) -> datetime | None:
    try:
        return datetime.strptime(value, "%m/%d/%Y %H:%M")
    except ValueError:
        return None


def top_pairs(counter: Counter[str], limit: int = 24) -> list[dict[str, object]]:
    return [{"label": label or "UNSPECIFIED", "value": value} for label, value in counter.most_common(limit)]


spotify = archive_rows("spotify-archive.zip", "spotify_history.csv")
spotify_times = [parse_spotify_time(row["ts"]) for row in spotify]
spotify_hour = Counter(t.hour for t in spotify_times)
spotify_year = defaultdict(list)
spotify_artists = Counter(row["artist_name"] for row in spotify)
spotify_tracks = Counter((row["track_name"], row["artist_name"]) for row in spotify)
spotify_skip = Counter(row["skipped"].upper() == "TRUE" for row in spotify)
spotify_year_artists: dict[str, set[str]] = defaultdict(set)
spotify_year_ms: Counter[str] = Counter()
spotify_year_skips: Counter[str] = Counter()
for row, when in zip(spotify, spotify_times):
    year = str(when.year)
    spotify_year[year].append(row)
    spotify_year_artists[year].add(row["artist_name"])
    spotify_year_ms[year] += int(row["ms_played"] or 0)
    spotify_year_skips[year] += row["skipped"].upper() == "TRUE"

sessions: list[dict[str, object]] = []
ordered_spotify = sorted(zip(spotify, spotify_times), key=lambda pair: pair[1])
current: list[tuple[dict[str, str], datetime]] = []
for item in ordered_spotify:
    if current and (item[1] - current[-1][1]).total_seconds() > 30 * 60:
        sessions.append({"start": current[0][1].isoformat(), "end": current[-1][1].isoformat(), "events": len(current), "durationMinutes": round((current[-1][1] - current[0][1]).total_seconds() / 60), "artists": top_pairs(Counter(r["artist_name"] for r, _ in current), 4)})
        current = []
    current.append(item)
if current:
    sessions.append({"start": current[0][1].isoformat(), "end": current[-1][1].isoformat(), "events": len(current), "durationMinutes": round((current[-1][1] - current[0][1]).total_seconds() / 60), "artists": top_pairs(Counter(r["artist_name"] for r, _ in current), 4)})
long_sessions = sorted(sessions, key=lambda session: (session["durationMinutes"], session["events"]), reverse=True)

write_json("spotify_hourly.json", [{"hour": hour, "label": f"{hour:02d}:00", "events": spotify_hour[hour], "night": hour < 6} for hour in range(24)])
write_json("spotify_yearly.json", [{"year": year, "events": len(spotify_year[year]), "artists": len(spotify_year_artists[year]), "skipped": spotify_year_skips[year], "skipRate": round(spotify_year_skips[year] / len(spotify_year[year]) * 100, 2), "hours": round(spotify_year_ms[year] / 3_600_000, 1)} for year in sorted(spotify_year)])
write_json("spotify_artists.json", top_pairs(spotify_artists))
write_json("spotify_tracks.json", [{"track": track or "UNSPECIFIED", "artist": artist or "UNSPECIFIED", "value": count} for (track, artist), count in spotify_tracks.most_common(32)])
write_json("spotify_sessions.json", {"count": len(sessions), "longest": long_sessions[:24], "overFourHours": sum(session["durationMinutes"] >= 240 for session in sessions), "overSixHours": sum(session["durationMinutes"] >= 360 for session in sessions)})

household = archive_rows("household-archive.zip", "Daily Household Transactions.csv")
household_times = [parse_household_time(row["Date"]) for row in household]
# The source contains date-only rows; their hour is intentionally kept separate from timed activity.
hour_counter = Counter()
for row, when in zip(household, household_times):
    if ":" in row["Date"]:
        hour_counter[when.hour] += 1
monthly: dict[str, dict[str, float | int]] = defaultdict(lambda: {"events": 0, "expense": 0.0, "income": 0.0, "transfer": 0.0})
category: dict[str, dict[str, float | int]] = defaultdict(lambda: {"events": 0, "amount": 0.0, "expense": 0.0, "income": 0.0, "transfer": 0.0})
subcategory_counter = Counter()
for row, when in zip(household, household_times):
    month = when.strftime("%Y-%m")
    amount = float(row["Amount"] or 0)
    kind = row["Income/Expense"]
    monthly[month]["events"] += 1
    monthly[month]["expense"] += amount if kind == "Expense" else 0
    monthly[month]["income"] += amount if kind == "Income" else 0
    monthly[month]["transfer"] += amount if kind == "Transfer-Out" else 0
    key = row["Category"] or "Uncategorized"
    category[key]["events"] += 1
    category[key]["amount"] += amount
    category[key]["expense"] += amount if kind == "Expense" else 0
    category[key]["income"] += amount if kind == "Income" else 0
    category[key]["transfer"] += amount if kind == "Transfer-Out" else 0
    if row["Subcategory"]:
        subcategory_counter[row["Subcategory"]] += 1

write_json("household_hourly.json", [{"hour": hour, "label": f"{hour:02d}:00", "events": hour_counter[hour]} for hour in range(24)])
write_json("household_monthly.json", [{"month": month, **{key: round(float(value), 2) if key != "events" else value for key, value in values.items()}} for month, values in sorted(monthly.items())])
write_json("household_categories.json", [{"category": key, **{name: round(float(value), 2) if name != "events" else value for name, value in values.items()}} for key, values in sorted(category.items(), key=lambda item: item[1]["amount"], reverse=True)])
write_json("household_recurring.json", [{"label": label, "events": count} for label, count in subcategory_counter.most_common(32)])

india = archive_rows("india-archive.zip", "Augmented_IndiaTransactMultiFacet2024.csv")
india_fields = list(india[0]) if india else []
row_keys = [tuple(row.get(field, "") for field in india_fields) for row in india]
full_patterns = Counter(row_keys)
india_times = [parse_india_time(row["trans_date_trans_time"]) for row in india]
india_hour: Counter[int] = Counter()
india_month: Counter[str] = Counter()
india_category: Counter[str] = Counter()
india_city: Counter[str] = Counter()
india_state: Counter[str] = Counter()
india_merchant: Counter[str] = Counter()
for row, when in zip(india, india_times):
    if when:
        india_hour[when.hour] += 1
        india_month[when.strftime("%Y-%m")] += 1
    if row["category"]:
        india_category[row["category"]] += 1
    if row["city"]:
        india_city[row["city"]] += 1
    if row["state"]:
        india_state[row["state"]] += 1
    if row["merchant"]:
        india_merchant[row["merchant"]] += 1

def safe_pattern(key: tuple[str, ...], count: int, pattern_id: int) -> dict[str, object]:
    sample = dict(zip(india_fields, key))
    safe = {field: sample.get(field, "") for field in ("merchant", "category", "city", "state", "amt", "is_fraud")}
    nonblank = sum(bool(value) for value in key)
    completeness = round(nonblank / len(key) * 100, 1) if key else 0
    anomaly = round((min(count, 17) / 17) * 0.6 + (1 - completeness / 100) * 0.4, 3)
    return {"patternId": f"P-{pattern_id:04d}", "count": count, "extras": count - 1, "completeness": completeness, "anomalyScore": anomaly, "sample": safe}

patterns = sorted(full_patterns.items(), key=lambda item: (item[1], item[0][0]), reverse=True)
write_json("india_hourly.json", [{"hour": hour, "label": f"{hour:02d}:00", "events": india_hour[hour]} for hour in range(24)])
write_json("india_monthly.json", [{"month": month, "events": count} for month, count in sorted(india_month.items())])
write_json("india_categories.json", top_pairs(india_category, 16))
write_json("india_geo.json", {"cities": top_pairs(india_city, 18), "states": top_pairs(india_state, 18), "merchants": top_pairs(india_merchant, 24)})
write_json("india_duplicate_groups.json", {"totalRows": len(india), "uniquePatterns": len(full_patterns), "duplicateExtras": sum(count - 1 for count in full_patterns.values()), "maxMultiplicity": max(full_patterns.values()), "groups": [safe_pattern(key, count, index + 1) for index, (key, count) in enumerate(patterns[:120])]})

start_spotify, end_spotify = min(spotify_times), max(spotify_times)
start_household, end_household = min(household_times), max(household_times)
parsed_india = [when for when in india_times if when]
manifest = {
    "version": "1.0.0",
    "generatedAt": datetime.utcnow().isoformat(timespec="seconds") + "Z",
    "sources": {
        "spotify": {"rows": len(spotify), "dateRange": [start_spotify.isoformat(sep=" "), end_spotify.isoformat(sep=" ")], "fields": list(spotify[0])},
        "household": {"rows": len(household), "dateRange": [start_household.strftime("%Y-%m-%d"), end_household.strftime("%Y-%m-%d")], "fields": list(household[0])},
        "india": {"rows": len(india), "dateRange": [min(parsed_india).isoformat(sep=" "), max(parsed_india).isoformat(sep=" ")], "fields": india_fields, "exactUniquePatterns": len(full_patterns), "duplicateExtras": sum(count - 1 for count in full_patterns.values()), "redactedFields": ["cc_num", "first", "last", "gender", "street", "job", "dob", "customer_id"]},
    },
    "redaction": "Generated artifacts retain only safe aggregate labels and masked pattern samples. Raw identity, address, payment, and customer fields are never exposed in the browser.",
    "alignmentNote": "ANALYTICAL ALIGNMENT — NOT EVIDENCE OF A SHARED EVENT",
}
write_json("manifest.json", manifest)
write_json("story_statistics.json", {
    "spotify": {"rows": len(spotify), "nightEvents": sum(spotify_hour[h] for h in range(6)), "nightShare": round(sum(spotify_hour[h] for h in range(6)) / len(spotify) * 100, 1), "skipped": spotify_skip[True], "skipRate": round(spotify_skip[True] / len(spotify) * 100, 2), "sessionCount": len(sessions), "longestSessionMinutes": long_sessions[0]["durationMinutes"], "longestSessionEvents": long_sessions[0]["events"]},
    "household": {"rows": len(household), "expenses": round(sum(float(row["Amount"] or 0) for row in household if row["Income/Expense"] == "Expense"), 2), "income": round(sum(float(row["Amount"] or 0) for row in household if row["Income/Expense"] == "Income"), 2), "subscriptions": sum(1 for row in household if row["Category"].lower() == "subscription")},
    "india": {"rows": len(india), "uniquePatterns": len(full_patterns), "duplicateExtras": sum(count - 1 for count in full_patterns.values()), "duplicateShare": round(sum(count - 1 for count in full_patterns.values()) / len(india) * 100, 1), "nonblankTransactionIds": sum(bool(row["trans_id"]) for row in india), "uniqueNonblankTransactionIds": len({row["trans_id"] for row in india if row["trans_id"]})},
})
write_json("connection_nodes.json", [
    {"id": "night", "label": "02:00 CIRCadian PEAK", "kind": "TIME", "datasets": ["spotify", "household", "india"], "description": "A temporal comparison of activity by hour across separate archives."},
    {"id": "repeat", "label": "ODE TO THE METS", "kind": "REPETITION", "datasets": ["spotify"], "description": "The most repeated track in the listening archive."},
    {"id": "session", "label": "13H+ SESSION", "kind": "DURATION", "datasets": ["spotify"], "description": "The longest inactivity-bounded listening session."},
    {"id": "subscription", "label": "RECURRING SERVICES", "kind": "REPETITION", "datasets": ["household"], "description": "Repeated household subcategories reveal financial rhythm."},
    {"id": "duplicate", "label": "85.4% DUPLICATE STRUCTURE", "kind": "ANOMALY", "datasets": ["india"], "description": "Exact full-row equality collapses 10,267 supplied rows into 1,500 patterns."},
])
print(f"Prepared {len(spotify)} Spotify, {len(household)} household, and {len(india)} India rows")
print(f"India exact patterns: {len(full_patterns)}; duplicate extras: {sum(count - 1 for count in full_patterns.values())}")
