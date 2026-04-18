import { useState } from 'react'

const SUGGESTIONS = [
  'Show me the Masters leaderboard and betting odds',
  'Give me a full NBA playoffs bracket',
  'Cornell lacrosse schedule and recent results',
  'Top MLB stories and standings',
  'NHL playoffs matchups and scores',
]

export default function PromptBar({ onSubmit, loading }) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || loading) return
    onSubmit(trimmed)
    setValue('')
    setFocused(false)
  }

  function useSuggestion(s) {
    setValue(s)
    setFocused(false)
  }

  return (
    <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-2.5">
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-5xl mx-auto">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Ask for any sports content — e.g. 'Masters leaderboard and odds' or 'NBA playoffs preview'..."
            disabled={loading}
            className="w-full bg-[#111111] border border-[#3a3a3a] focus:border-[#cc0000] text-[#d4d4d4] placeholder-[#555] text-sm px-4 py-2 rounded outline-none disabled:opacity-50 transition-colors"
          />
          {/* Suggestion dropdown */}
          {focused && !value && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#3a3a3a] rounded shadow-xl z-40">
              <div className="px-3 py-1.5 text-[#8a8a8a] text-[10px] font-bold uppercase tracking-wider border-b border-[#2a2a2a]">
                Try asking...
              </div>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => useSuggestion(s)}
                  className="w-full text-left text-[#d4d4d4] text-xs px-3 py-2 hover:bg-[#2a2a2a] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="bg-[#cc0000] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm px-5 py-2 rounded transition-colors whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin inline-block" />
              Generating...
            </span>
          ) : 'Generate Feed'}
        </button>
      </form>
    </div>
  )
}
