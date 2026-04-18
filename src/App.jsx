import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/shared/Header'
import Home from './pages/Home'
import ConditionA from './pages/ConditionA'
import ConditionB from './pages/ConditionB'
import Results from './pages/Results'
import HeuristicEval from './pages/HeuristicEval'
import Study from './pages/Study'

export default function App() {
    return (
        <BrowserRouter>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Background grid */}
                <div style={{
                    position: 'fixed', inset: 0, opacity: 0.025, pointerEvents: 'none', zIndex: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />

                <Header />

                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/condition-a" element={<ConditionA />} />
                        <Route path="/condition-b" element={<ConditionB />} />
                        <Route path="/results" element={<Results />} />
                        <Route path="/heuristics" element={<HeuristicEval />} />
                        <Route path="/study" element={<Study />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    )
}
