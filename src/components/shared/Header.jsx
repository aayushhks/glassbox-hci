import { useNavigate, useLocation } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'

export default function Header() {
    const navigate = useNavigate()
    const location = useLocation()
    const isMobile = useIsMobile()

    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/condition-a', label: 'Chat (A)' },
        { path: '/condition-b', label: 'Glass-Box (B)' },
        { path: '/study', label: '▶ Study' },
        { path: '/results', label: 'Results' },
        { path: '/heuristics', label: 'Eval' },
    ]

    return (
        <header
            className="sticky top-0 z-50"
            style={{
                padding: isMobile ? '10px 12px' : '14px 28px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                background: 'rgba(8,12,20,0.85)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
            }}
        >
            {/* Logo */}
            <div
                onClick={() => navigate('/')}
                style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, cursor: 'pointer', flexShrink: 0 }}
            >
                <div style={{
                    width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 7,
                    background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(0,212,170,0.05))',
                    border: '1px solid rgba(0,212,170,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isMobile ? 12 : 14,
                }}>◈</div>
                {!isMobile && (
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em' }}>
                            Glass-Box <span style={{ color: '#00d4aa' }}>AI</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5a6a7a', letterSpacing: '0.06em' }}>
                            HCI SYSTEM CONTRIBUTION
                        </div>
                    </div>
                )}
            </div>

            {/* Nav - scrollable on mobile */}
            <nav style={{
                display: 'flex', gap: 2,
                overflowX: 'auto', WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                padding: isMobile ? '5px 10px' : '6px 14px',
                                borderRadius: 6, border: 'none',
                                background: isActive ? 'rgba(0,212,170,0.12)' : 'transparent',
                                color: isActive ? '#00d4aa' : '#7a8a9a',
                                fontFamily: 'var(--font-sans)',
                                fontSize: isMobile ? 11 : 12,
                                fontWeight: isActive ? 600 : 400,
                                cursor: 'pointer', transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap', flexShrink: 0,
                            }}
                        >{item.label}</button>
                    )
                })}
            </nav>
        </header>
    )
}
