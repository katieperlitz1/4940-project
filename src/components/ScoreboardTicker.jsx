import { useEffect, useState } from 'react'
import { fetchMultipleEndpoints } from '../espn/api'

const TICKER_ENDPOINTS = [
  'basketball/nba/scoreboard',
  'baseball/mlb/scoreboard',
  'hockey/nhl/scoreboard',
  'football/nfl/scoreboard',
  'soccer/usa.1/scoreboard',
]

export default function ScoreboardTicker({ onGameClick }) {
  const [games, setGames] = useState([])

  useEffect(() => {
    fetchMultipleEndpoints(TICKER_ENDPOINTS).then(data => {
      const all = []
      Object.values(data).forEach(sport => {
        if (sport && sport.events) all.push(...sport.events)
      })
      // Sort: live first, then upcoming, then final
      all.sort((a, b) => {
        const order = { in: 0, pre: 1, post: 2 }
        return (order[a.statusState] || 1) - (order[b.statusState] || 1)
      })
      setGames(all.slice(0, 30))
    })
  }, [])

  if (games.length === 0) return (
    <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] h-[42px] flex items-center px-4">
      <span className="text-[#8a8a8a] text-xs">Loading scores...</span>
    </div>
  )

  return (
    <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] overflow-x-auto">
      <div className="flex items-stretch min-w-max">
        {/* Top Events label */}
        <div className="flex items-center px-3 border-r border-[#2a2a2a] shrink-0">
          <span className="text-[#8a8a8a] text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
            Top Events
          </span>
        </div>

        {games.map((game, i) => {
          const home = game.competitors.find(c => c.isHome) || game.competitors[0] || {}
          const away = game.competitors.find(c => !c.isHome) || game.competitors[1] || {}
          const isLive = game.statusState === 'in'
          const isFinal = game.statusState === 'post'

          return (
            <button
              key={game.id || i}
              onClick={() => onGameClick && onGameClick(game)}
              className="flex items-center gap-3 px-4 py-2 border-r border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors cursor-pointer shrink-0 min-w-[160px]"
            >
              {/* Status */}
              <div className="flex flex-col items-center w-12 shrink-0">
                {isLive ? (
                  <span className="text-green-400 text-[9px] font-black tracking-widest leading-tight">● LIVE</span>
                ) : (
                  <span className="text-[#8a8a8a] text-[9px] leading-tight text-center">{game.status}</span>
                )}
                {isLive && game.clock && (
                  <span className="text-[#8a8a8a] text-[9px]">{game.clock}</span>
                )}
              </div>

              {/* Teams + scores */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-xs font-bold ${isFinal && away.score > home.score ? 'text-white' : 'text-[#d4d4d4]'}`}>
                    {away.abbreviation || '—'}
                  </span>
                  <span className={`text-sm font-black ${isFinal && away.score > home.score ? 'text-white' : 'text-[#d4d4d4]'}`}>
                    {game.statusState !== 'pre' ? away.score : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-xs font-bold ${isFinal && home.score > away.score ? 'text-white' : 'text-[#d4d4d4]'}`}>
                    {home.abbreviation || '—'}
                  </span>
                  <span className={`text-sm font-black ${isFinal && home.score > away.score ? 'text-white' : 'text-[#d4d4d4]'}`}>
                    {game.statusState !== 'pre' ? home.score : ''}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
