import type { ArchiveData } from './types'

type ArtifactMap = {
  manifest: ArchiveData['manifest']
  story_statistics: ArchiveData['story']
  spotify_hourly: ArchiveData['spotifyHourly']
  spotify_yearly: ArchiveData['spotifyYearly']
  spotify_artists: ArchiveData['spotifyArtists']
  spotify_tracks: ArchiveData['spotifyTracks']
  spotify_sessions: ArchiveData['spotifySessions']
  household_hourly: ArchiveData['householdHourly']
  india_hourly: ArchiveData['indiaHourly']
  household_monthly: ArchiveData['householdMonthly']
  household_categories: ArchiveData['householdCategories']
  household_recurring: ArchiveData['householdRecurring']
  india_monthly: ArchiveData['indiaMonthly']
  india_categories: ArchiveData['indiaCategories']
  india_geo: ArchiveData['indiaGeo']
  india_duplicate_groups: ArchiveData['indiaDuplicates']
  connection_nodes: ArchiveData['connections']
}

type ArtifactName = keyof ArtifactMap

const dataBase = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
const requestTimeoutMs = 15_000
let cache: Promise<ArchiveData> | undefined

export class ArchiveDataError extends Error {
  constructor(public readonly artifact: string, cause?: unknown) {
    super(`Could not load archive artifact: ${artifact}`)
    this.name = 'ArchiveDataError'
    this.cause = cause
  }
}

async function read<T>(name: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${dataBase}data/${name}`, { signal, headers: { Accept: 'application/json' } }).catch((reason: unknown) => {
    throw new ArchiveDataError(name, reason)
  })
  if (!response.ok) throw new ArchiveDataError(`${name} (${response.status})`)
  try {
    return await response.json() as T
  } catch (reason) {
    throw new ArchiveDataError(`${name} (invalid JSON)`, reason)
  }
}

export function resetArchiveDataCache() {
  cache = undefined
}

export function loadArchiveData(): Promise<ArchiveData> {
  if (!cache) {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), requestTimeoutMs)
    cache = Promise.all([
      read('manifest.json', controller.signal),
      read('story_statistics.json', controller.signal),
      read('spotify_hourly.json', controller.signal),
      read('spotify_yearly.json', controller.signal),
      read('spotify_artists.json', controller.signal),
      read('spotify_tracks.json', controller.signal),
      read('spotify_sessions.json', controller.signal),
      read('household_hourly.json', controller.signal),
      read('india_hourly.json', controller.signal),
      read('household_monthly.json', controller.signal),
      read('household_categories.json', controller.signal),
      read('household_recurring.json', controller.signal),
      read('india_monthly.json', controller.signal),
      read('india_categories.json', controller.signal),
      read('india_geo.json', controller.signal),
      read('india_duplicate_groups.json', controller.signal),
      read('connection_nodes.json', controller.signal),
    ]).then(([manifest, story, spotifyHourly, spotifyYearly, spotifyArtists, spotifyTracks, spotifySessions, householdHourly, indiaHourly, householdMonthly, householdCategories, householdRecurring, indiaMonthly, indiaCategories, indiaGeo, indiaDuplicates, connections]) => ({
      manifest, story, spotifyHourly, spotifyYearly, spotifyArtists, spotifyTracks, spotifySessions, householdHourly, indiaHourly, householdMonthly, householdCategories, householdRecurring, indiaMonthly, indiaCategories, indiaGeo, indiaDuplicates, connections,
    } as ArchiveData)).finally(() => window.clearTimeout(timeout)).catch((reason: unknown) => {
      cache = undefined
      throw reason
    })
  }
  return cache
}
