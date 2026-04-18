import { useParams } from 'react-router-dom'
import { useEffect, useState, useCallback, useRef } from 'react'
import {
  getRecentEvents, getEventCount, getProfile,
  getCachedUI, setCachedUI,
  resetUser, logEvent,
} from '../firebase/events'
import { generateFeed } from '../gemini/generate'
import Header from '../components/Header'
import ScoreboardTicker from '../components/ScoreboardTicker'
import PromptBar from '../components/PromptBar'
import GeneratedFeed from '../components/GeneratedFeed'

const REGEN_THRESHOLD = 5 // new events before auto-regenerating

export default function Feed() {
  const { userId } = useParams()

  const [jsx, setJsx] = useState(null)
  const [data, setData] = useState({})
  const [reasoning, setReasoning] = useState('')
  const [eventCount, setEventCount] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState(null)
  const initialized = useRef(false)

  // Stable callback so GeneratedFeed scope doesn't re-render constantly
  const onEvent = useCallback(async (type, label, sport, section) => {
    await logEvent(userId, { type, label, sport, section })
    setEventCount(c => c + 1)
  }, [userId])

  async function runGeneration(userPrompt = null) {
    setGenerating(true)
    setError(null)
    setStatusMsg(userPrompt
      ? 'Generating response to your prompt...'
      : 'Generating your personalized feed...'
    )
    try {
      const [events, profile, count] = await Promise.all([
        getRecentEvents(userId, 60),
        getProfile(userId),
        getEventCount(userId),
      ])
      setEventCount(count)

      const result = await generateFeed({
        events,
        preferenceSummary: profile.preferencesSummary || null,
        userPrompt,
      })

      setJsx(result.jsx)
      setData(result.data)
      setReasoning(result.reasoning || '')

      // Cache only non-prompt generations
      if (!userPrompt) {
        await setCachedUI(userId, result.jsx, count)
      }
    } catch (e) {
      console.error('Generation error:', e)
      setError(e.message || 'Generation failed — check console')
    } finally {
      setGenerating(false)
      setStatusMsg('')
    }
  }

  // On mount: try cache first, then generate
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    async function init() {
      setStatusMsg('Loading your feed...')
      setGenerating(true)

      const [cached, count] = await Promise.all([
        getCachedUI(userId),
        getEventCount(userId),
      ])
      setEventCount(count)

      const newEvents = cached ? count - (cached.eventCountAtGeneration || 0) : count

      if (cached && newEvents < REGEN_THRESHOLD) {
        // Serve cached JSX immediately, regenerate silently in background
        setJsx(cached.jsx)
        setGenerating(false)
        setStatusMsg('')
        runGeneration() // background refresh
      } else {
        setGenerating(false)
        await runGeneration()
      }
    }

    init()
  }, [userId])

  async function handlePrompt(prompt) {
    await logEvent(userId, { type: 'SEARCHED', label: prompt, sport: null, section: 'search' })
    setEventCount(c => c + 1)
    await runGeneration(prompt)
  }

  async function handleReset() {
    if (!window.confirm('Clear all context and start fresh?')) return
    setResetting(true)
    await resetUser(userId)
    setJsx(null)
    setData({})
    setReasoning('')
    setEventCount(0)
    setResetting(false)
    await runGeneration()
  }

  function handleNavClick(label, sport) {
    const prompt = `Show me a full ${label} section — scores, news, and standings`
    handlePrompt(prompt)
  }

  function handleGameClick(game) {
    onEvent('CLICKED', game.name || game.shortName, game.sport, 'scoreboard')
  }

  const modeLabel = eventCount === 0
    ? 'Cold start — showing full ESPN default'
    : `Personalized for ${userId === 'katie' ? 'Katie' : 'Guest'} · ${eventCount} interactions`

  return (
    <div className="min-h-screen bg-[#111111]">
      <Header
        userId={userId}
        eventCount={eventCount}
        onReset={handleReset}
        resetting={resetting}
        onNavClick={handleNavClick}
      />

      <ScoreboardTicker onGameClick={handleGameClick} />

      <PromptBar onSubmit={handlePrompt} loading={generating} />

      {/* Info bar */}
      <div className="bg-[#111111] border-b border-[#1e1e1e] px-4 py-1.5 flex items-center justify-between">
        <span className="text-[#555] text-xs">{modeLabel}</span>
        <div className="flex items-center gap-3">
          {reasoning && (
            <span className="text-[#555] text-xs italic hidden md:block truncate max-w-lg">
              AI: {reasoning}
            </span>
          )}
          {generating && (
            <span className="flex items-center gap-1.5 text-[#cc0000] text-xs font-semibold">
              <span className="w-2 h-2 bg-[#cc0000] rounded-full animate-pulse inline-block" />
              {statusMsg || 'Generating...'}
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <main>
        {error && (
          <div className="mx-4 mt-4 p-4 bg-red-950 border border-red-800 rounded text-red-300 text-sm">
            <strong>Error:</strong> {error}
            <button
              onClick={() => runGeneration()}
              className="ml-4 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Full-page spinner on first load */}
        {generating && !jsx && (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-10 h-10 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin" />
            <div className="text-[#8a8a8a] text-sm">{statusMsg}</div>
          </div>
        )}

        {/* Overlay spinner when regenerating over existing feed */}
        {jsx && (
          <div className="relative">
            {generating && (
              <div className="absolute inset-0 bg-[#111111]/70 z-20 flex items-start justify-center pt-20 pointer-events-none">
                <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#3a3a3a] px-5 py-3 rounded-lg shadow-xl">
                  <div className="w-4 h-4 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[#d4d4d4] text-sm">{statusMsg}</span>
                </div>
              </div>
            )}
            <GeneratedFeed jsx={jsx} data={data} onEvent={onEvent} />
          </div>
        )}
      </main>
    </div>
  )
}
