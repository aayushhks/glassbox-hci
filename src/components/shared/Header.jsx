import { useNavigate, useLocation } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/condition-a', label: 'Condition A' },
    { path: '/condition-b', label: 'Condition B' },
    { path: '/results', label: 'Results' },
  ]

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        padding: '16px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        background: 'rgba(8,12,20,0.85)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(0,212,170,0.05))',
            border: '1px solid rgba(0,212,170,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
          }}
        >
          ◈
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Glass-Box <span style={{ color: '#00d4aa' }}>AI</span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#5a6a7a',
              letterSpacing: '0.06em',
            }}
          >
            HCI EXPERIMENT
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', gap: 4 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                padding: '7px 16px',
                borderRadius: 6,
                border: 'none',
                background: isActive ? 'rgba(0,212,170,0.12)' : 'transparent',
                color: isActive ? '#00d4aa' : '#7a8a9a',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </header>
  )
}
