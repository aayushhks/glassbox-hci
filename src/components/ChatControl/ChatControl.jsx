import { useState, useRef, useEffect } from 'react'
import { TASK_PROMPT } from '../../data/responses'
import { generateChatResponse } from '../../services/gemini'

function TypingIndicator() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px' }}>
            <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a2440, #131b2e)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
            }}>🤖</div>
            <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                        width: 7, height: 7, borderRadius: '50%', background: '#5a6a7a',
                        animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                ))}
            </div>
            <span style={{ fontSize: 12, color: '#4a5a6a' }}>Gemini is thinking...</span>
        </div>
    )
}

function ChatMessage({ role, content }) {
    const isUser = role === 'user'
    return (
        <div style={{ display: 'flex', gap: 12, padding: '16px 20px', flexDirection: isUser ? 'row-reverse' : 'row' }}>
            <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: isUser
                    ? 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(0,212,170,0.08))'
                    : 'linear-gradient(135deg, #1a2440, #131b2e)',
                border: isUser ? '1px solid rgba(0,212,170,0.3)' : '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>{isUser ? '👤' : '🤖'}</div>
            <div style={{
                maxWidth: '75%', padding: '14px 18px',
                borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: isUser ? 'rgba(0,212,170,0.08)' : 'rgba(255,255,255,0.04)',
                border: isUser ? '1px solid rgba(0,212,170,0.15)' : '1px solid rgba(255,255,255,0.06)',
            }}>
                <div
                    style={{ fontSize: 14, lineHeight: 1.65, color: '#d0dce8', whiteSpace: 'pre-wrap' }}
                    dangerouslySetInnerHTML={{
                        __html: content
                            .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e8f0f8;font-weight:600">$1</strong>')
                            .replace(/```([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.3);padding:12px;border-radius:6px;font-family:var(--font-mono);font-size:12.5px;overflow-x:auto;margin:8px 0">$1</pre>')
                            .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.25);padding:2px 6px;border-radius:3px;font-family:var(--font-mono);font-size:12.5px">$1</code>'),
                    }}
                />
            </div>
        </div>
    )
}

export default function ChatControl({ onInteraction }) {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [error, setError] = useState(null)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    const sendMessage = async (text) => {
        const userMsg = { role: 'user', content: text }
        const updatedMessages = [...messages, userMsg]
        setMessages(updatedMessages)
        setInput('')
        setIsTyping(true)
        setError(null)
        onInteraction?.('send_message', { text })

        try {
            const response = await generateChatResponse(updatedMessages)
            setMessages((prev) => [...prev, { role: 'assistant', content: response }])
        } catch (err) {
            setError(err.message)
            setMessages((prev) => [...prev, { role: 'assistant', content: `⚠ Error: ${err.message}` }])
        } finally {
            setIsTyping(false)
        }
    }

    const handleSubmit = () => {
        if (!input.trim() || isTyping) return
        sendMessage(input.trim())
    }

    const handleQuickStart = () => sendMessage(TASK_PROMPT)

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden',
            maxWidth: 820, margin: '0 auto', width: '100%',
        }}>
            {/* Chat area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
                {messages.length === 0 && (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', padding: '80px 40px', textAlign: 'center',
                    }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1a2440, #131b2e)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 24, marginBottom: 20,
                        }}>🤖</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#c8d6e5', marginBottom: 8 }}>
                            Standard AI Chat
                        </div>
                        <div style={{ fontSize: 13, color: '#5a6a7a', maxWidth: 400, lineHeight: 1.6, marginBottom: 16 }}>
                            A traditional text-in, text-out AI interface. Type your request or use the quick-start button.
                        </div>
                        {/* Live API badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            marginBottom: 20, padding: '4px 10px', borderRadius: 4,
                            background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)',
                        }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4aa' }} />
                            <span style={{ fontSize: 10, color: '#00d4aa', fontWeight: 600, letterSpacing: '0.04em' }}>
                LIVE — Gemini 2.5 Flash-Lite API
              </span>
                        </div>
                        <button onClick={handleQuickStart} style={{
                            padding: '10px 24px', borderRadius: 8,
                            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                            color: '#8899aa', fontFamily: 'var(--font-sans)', fontSize: 13, cursor: 'pointer',
                        }}>▶ Start Task: Leader Election Algorithm</button>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <ChatMessage key={i} role={msg.role} content={msg.content} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div style={{
                padding: '16px 20px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
            }}>
                {messages.length > 0 && !isTyping && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                        {['Make it more efficient', 'Add more detail', 'Try a creative approach'].map((s) => (
                            <button
                                key={s} onClick={() => sendMessage(s)} disabled={isTyping}
                                style={{
                                    padding: '6px 12px', borderRadius: 6,
                                    border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                                    color: '#7a8a9a', fontFamily: 'var(--font-sans)', fontSize: 12,
                                    cursor: 'pointer', transition: 'all 0.2s ease',
                                }}
                            >{s}</button>
                        ))}
                    </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                    <input
                        type="text" value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder={messages.length > 0 ? 'Ask a follow-up...' : 'Type your prompt...'}
                        disabled={isTyping}
                        style={{
                            flex: 1, padding: '12px 16px', borderRadius: 8,
                            border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                            color: '#e0e8f0', fontFamily: 'var(--font-sans)', fontSize: 14, outline: 'none',
                        }}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isTyping || !input.trim()}
                        style={{
                            padding: '12px 20px', borderRadius: 8,
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: input.trim() && !isTyping ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                            color: input.trim() && !isTyping ? '#c8d6e5' : '#3a4a5a',
                            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
                            cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                        }}
                    >Send</button>
                </div>
            </div>
        </div>
    )
}
