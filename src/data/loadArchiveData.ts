import type { ArchiveData } from './types'

const base = '/data/'
let cache: Promise<ArchiveData> | undefined

async function read<T>(name: string): Promise<T> {
  const response = await fetch(`${base}${name}`)
  if (!response.ok) throw new Error(`Could not load ${name}`)
  return response.json() as Promise<T>
}

export function loadArchiveData(): Promise<ArchiveData> {
  if (!cache) {
    cache = Promise.all([
      read('manifest.json'),
      read('story_statistics.json'),
      read('spotify_hourly.json'),
      read('spotify_yearly.json'),
      read('spotify_artists.json'),
      read('spotify_tracks.json'),
      read('spotify_sessions.json'),
      read('household_hourly.json'),
      read('india_hourly.json'),
      read('household_monthly.json'),
      read('household_categories.json'),
      read('household_recurring.json'),
      read('india_monthly.json'),
      read('india_categories.json'),
      read('india_geo.json'),
      read('india_duplicate_groups.json'),
      read('connection_nodes.json'),
    ]).then(([manifest, story, spotifyHourly, spotifyYearly, spotifyArtists, spotifyTracks, spotifySessions, householdHourly, indiaHourly, householdMonthly, householdCategories, householdRecurring, indiaMonthly, indiaCategories, indiaGeo, indiaDuplicates, connections]) => ({
      manifest, story, spotifyHourly, spotifyYearly, spotifyArtists, spotifyTracks, spotifySessions, householdHourly, indiaHourly, householdMonthly, householdCategories, householdRecurring, indiaMonthly, indiaCategories, indiaGeo, indiaDuplicates, connections,
    } as ArchiveData))
  }
  return cache
}
