const BASE = 'https://site.api.espn.com/apis/site/v2/sports'

export function endpointToKey(endpoint) {
  return endpoint.replace(/\//g, '_')
}

export async function fetchESPNEndpoint(endpoint) {
  try {
    const res = await fetch(`${BASE}/${endpoint}`)
    if (!res.ok) return null
    const json = await res.json()
    return normalizeResponse(endpoint, json)
  } catch (e) {
    console.warn(`ESPN fetch failed [${endpoint}]:`, e.message)
    return null
  }
}

export async function fetchMultipleEndpoints(endpoints) {
  const unique = [...new Set(endpoints)]
  const results = await Promise.all(unique.map(fetchESPNEndpoint))
  const data = {}
  unique.forEach((ep, i) => {
    if (results[i] !== null) data[endpointToKey(ep)] = results[i]
  })
  return data
}

// --- Normalizers ---

function normalizeResponse(endpoint, json) {
  const type = endpoint.split('/').pop()
  const sport = endpoint.split('/')[0]
  const league = endpoint.split('/').slice(0, 2).join('/')
  if (type === 'scoreboard') return normalizeScoreboard(json, sport, league)
  if (type === 'news') return normalizeNews(json, sport)
  if (type === 'standings') return normalizeStandings(json)
  return json
}

function normalizeScoreboard(json, sport, league) {
  const events = (json.events || []).map(event => {
    const comp = (event.competitions || [])[0] || {}
    const competitors = (comp.competitors || []).map(c => ({
      team: (c.team && c.team.displayName) || '',
      abbreviation: (c.team && c.team.abbreviation) || '',
      score: c.score || '0',
      isHome: c.homeAway === 'home',
      logo: (c.team && c.team.logo) || null,
      color: (c.team && c.team.color) || null,
    }))
    const statusType = (event.status && event.status.type) || {}
    return {
      id: event.id,
      name: event.name || '',
      shortName: event.shortName || '',
      date: event.date || '',
      status: statusType.shortDetail || statusType.description || '',
      statusState: statusType.state || 'pre',
      period: (event.status && event.status.period) || 0,
      clock: (event.status && event.status.displayClock) || '',
      competitors,
      sport,
      league,
      venue: (comp.venue && comp.venue.fullName) || '',
      broadcast: ((comp.broadcasts || [])[0] && comp.broadcasts[0].names && comp.broadcasts[0].names[0]) || '',
    }
  })
  return { events }
}

function normalizeNews(json, sport) {
  const articles = (json.articles || []).slice(0, 10).map(a => ({
    headline: a.headline || '',
    description: a.description || '',
    published: a.published || '',
    imageUrl: (a.images && a.images[0] && a.images[0].url) || null,
    link: (a.links && a.links.web && a.links.web.href) || null,
    sport,
    author: (a.byline) || '',
    category: (a.categories && a.categories[0] && a.categories[0].description) || '',
  }))
  return { articles }
}

function normalizeStandings(json) {
  const entries = []
  const children = json.children || []
  children.forEach(division => {
    const divName = (division.name || '').replace(' Division', '')
    const divEntries = ((division.standings || {}).entries || [])
    divEntries.forEach(entry => {
      const stats = {}
      ;(entry.stats || []).forEach(s => { stats[s.name] = s.displayValue || s.value })
      entries.push({
        team: (entry.team && entry.team.displayName) || '',
        abbreviation: (entry.team && entry.team.abbreviation) || '',
        logo: (entry.team && entry.team.logo) || null,
        wins: stats.wins || stats.W || '0',
        losses: stats.losses || stats.L || '0',
        pct: stats.winPercent || stats.PCT || '0',
        streak: stats.streak || '',
        division: divName,
        rank: entry.rank || 0,
      })
    })
  })
  return { entries: entries.slice(0, 30) }
}
