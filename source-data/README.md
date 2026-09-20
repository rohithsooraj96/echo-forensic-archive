# ECHO source data

The three supplied archives are retained here for reproducible, offline preparation only:

- `spotify-archive.zip` — Spotify history and field dictionary.
- `household-archive.zip` — Daily Household Transactions.
- `india-archive.zip` — India transaction data in several equivalent formats.

Run `npm run prepare:data` to read the archives without extracting raw members into the browser bundle. The script emits compact artifacts in `public/data/`.

Sensitive India columns (card number, names, gender, address, job, date of birth, customer ID) are never emitted to the frontend. Exact duplicate metrics are computed before redaction and refer to full-row equality in the canonical CSV.
