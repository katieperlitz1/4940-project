import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getRecentEvents, getEventCount, resetUser } from '../firebase/events'

export default function Feed() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [eventCount, setEventCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [recent, count] = await Promise.all([
        getRecentEvents(userId),
        getEventCount(userId),
      ])
      setEvents(recent)
      setEventCount(count)
      setLoading(false)
    }
    load()
  }, [userId])

  async function handleReset() {
    if (!window.confirm('Reset all context for this user?')) return
    setResetting(true)
    await resetUser(userId)
    setEvents([])
    setEventCount(0)
    setResetting(false)
  }

  return (
    <div className="min-h-screen bg-espn-darker">
      {/* Header */}
      <header className="bg-espn-red px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            ← Back
          </button>
          <div className="text-white font-black text-2xl tracking-tight">ESPN</div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/80 text-sm font-medium">
            {userId === 'katie' ? '🥍 Katie' : '👤 Guest User'}
          </span>
          {userId === 'user1' && (
            <button
              onClick={handleReset}
              disabled={resetting}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors"
            >
              {resetting ? 'Resetting...' : 'Reset Context'}
            </button>
          )}
        </div>
      </header>

      {/* Status bar */}
      <div className="bg-espn-dark border-b border-espn-lightgray px-6 py-2 flex items-center gap-4">
        <span className="text-espn-muted text-xs">
          {eventCount} interactions logged
        </span>
        <span className="text-espn-lightgray text-xs">·</span>
        <span className="text-espn-muted text-xs">
          {eventCount === 0
            ? 'No history — showing default ESPN layout'
            : eventCount < 5
            ? 'Accumulating context...'
            : 'Personalized feed active'}
        </span>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-espn-muted text-sm">Loading your context...</div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Placeholder — Milestone 4+ will render the AI-generated feed here */}
            <div className="bg-espn-gray border border-espn-lightgray rounded-lg p-8 text-center">
              <div className="text-espn-red text-5xl mb-4">⚡</div>
              <h2 className="text-white font-bold text-xl mb-2">
                Generative Feed Coming in Milestone 4
              </h2>
              <p className="text-espn-muted text-sm mb-6">
                Firebase is connected and your context is loading. Next step:
                wire up the ESPN API and Gemini to generate your personalized UI.
              </p>

              {events.length > 0 && (
                <div className="text-left mt-6">
                  <div className="text-espn-muted text-xs font-semibold uppercase tracking-wider mb-3">
                    Your logged interactions
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {events.map((e, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 text-xs bg-espn-dark rounded px-3 py-2"
                      >
                        <span className={`font-bold w-24 shrink-0 ${
                          e.type === 'CLICKED' ? 'text-green-400' :
                          e.type === 'SEARCHED' ? 'text-blue-400' :
                          'text-espn-muted'
                        }`}>
                          {e.type}
                        </span>
                        <span className="text-espn-text">{e.label}</span>
                        {e.sport && (
                          <span className="text-espn-muted ml-auto shrink-0">{e.sport}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
