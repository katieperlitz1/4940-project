import { useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'MLB', sport: 'baseball' },
  { label: 'NBA', sport: 'basketball' },
  { label: 'NFL', sport: 'football' },
  { label: 'NCAAM', sport: 'college-basketball' },
  { label: 'NHL', sport: 'hockey' },
  { label: 'Soccer', sport: 'soccer' },
  { label: 'Golf', sport: 'golf' },
  { label: 'Lacrosse', sport: 'lacrosse' },
]

export default function Header({ userId, eventCount, onReset, resetting, onNavClick }) {
  const navigate = useNavigate()

  return (
    <header className="bg-[#cc0000] sticky top-0 z-50 shadow-lg">
      <div className="flex items-center justify-between px-4 py-0">
        {/* Left: back + logo */}
        <div className="flex items-center gap-3 py-2">
          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white text-xs transition-colors"
          >
            ← Profiles
          </button>
          <div className="bg-white text-[#cc0000] font-black text-2xl px-2.5 py-0.5 rounded-sm select-none">
            ESPN
          </div>
          <span className="text-white/50 text-xs hidden sm:block">Generative UI</span>
        </div>

        {/* Center: nav tabs */}
        <nav className="hidden lg:flex items-stretch h-full">
          {NAV_ITEMS.map(item => (
            <button
              key={item.label}
              onClick={() => onNavClick && onNavClick(item.label, item.sport)}
              className="text-white/90 hover:text-white hover:bg-black/20 text-sm font-bold px-4 py-3 transition-colors tracking-wide"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: user + reset */}
        <div className="flex items-center gap-3 py-2">
          <div className="text-right hidden sm:block">
            <div className="text-white font-bold text-sm">
              {userId === 'katie' ? '🥍 Katie' : '👤 Guest'}
            </div>
            <div className="text-white/60 text-xs">{eventCount} interactions</div>
          </div>
          {userId === 'user1' && (
            <button
              onClick={onReset}
              disabled={resetting}
              className="bg-black/20 hover:bg-black/30 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors border border-white/20"
            >
              {resetting ? 'Clearing...' : 'Reset Context'}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
