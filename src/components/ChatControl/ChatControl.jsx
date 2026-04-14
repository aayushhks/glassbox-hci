import { useState, useRef, useEffect } from 'react'
import { TASK_PROMPT, CHAT_RESPONSES } from '../../data/responses'

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px' }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1a2440, #131b2e)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        🤖
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#5a6a7a',
              animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function ChatMessage({ role, content }) {
  const isUser = role === 'user'

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '16px 20px',
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: isUser
            ? 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(0,212,170,0.08))'
            : 'linear-gradient(135deg, #1a2440, #131b2e)',
          border: isUser
            ? '1px solid rgba(0,212,170,0.3)'
            : '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Message bubble */}
      <div
        style={{
          maxWidth: '75%',
          padding: '14px 18px',
          borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          background: isUser ? 'rgba(0,212,170,0.08)' : 'rgba(255,255,255,0.04)',
          border: isUser
            ? '1px solid rgba(0,212,170,0.15)'
            : '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.65,
            color: '#d0dce8',
            whiteSpace: 'pre-wrap',
          }}
          dangerouslySetInnerHTML={{
            __html: content
              .replace(
                /\*\*(.*?)\*\*/g,
                '<strong style="color:#e8f0f8;font-weight:600">$1</strong>'
              )
              .replace(
                /```([\s\S]*?)```/g,
                '<pre style="background:rgba(0,0,0,0.3);padding:12px;border-radius:6px;font-family:var(--font-mono);font-size:12.5px;overflow-x:auto;margin:8px 0">$1</pre>'
              )
              .replace(
                /`([^`]+)`/g,
                '<code style="background:rgba(0,0,0,0.25);padding:2px 6px;border-radius:3px;font-family:var(--font-mono);font-size:12.5px">$1</code>'
              ),
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
  const [hasStarted, setHasStarted] = useState(false)
  const messagesEndRef = useRef(null)
  const responseIndexRef = useRef(0)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = (text) => {
    const userMsg = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    onInteraction?.('send_message', { text })

    // Pick a response based on keywords or use the next in sequence
    setTimeout(() => {
      let response = CHAT_RESPONSES[0] // default initial

      if (hasStarted) {
        // Try keyword matching
        const lower = text.toLowerCase()
        if (lower.includes('efficien') || lower.includes('concise') || lower.includes('optim')) {
          response = CHAT_RESPONSES.find((r) => r.trigger === 'efficiency') || CHAT_RESPONSES[1]
        } else if (lower.includes('creativ') || lower.includes('novel') || lower.includes('new')) {
          response = CHAT_RESPONSES.find((r) => r.trigger === 'creative') || CHAT_RESPONSES[2]
        } else if (lower.includes('detail') || lower.includes('edge') || lower.includes('more')) {
          response = CHAT_RESPONSES.find((r) => r.trigger === 'detail') || CHAT_RESPONSES[3]
        } else {
          // Cycle through remaining responses
          const idx = (responseIndexRef.current % (CHAT_RESPONSES.length - 1)) + 1
          response = CHAT_RESPONSES[idx]
          responseIndexRef.current++
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response.text }])
      setIsTyping(false)
      setHasStarted(true)
    }, 1200 + Math.random() * 800)
  }

  const handleSubmit = (e) => {
    e?.preventDefault?.()
    if (!input.trim()) return
    sendMessage(input.trim())
  }

  // Quick-start: send the task prompt
  const handleQuickStart = () => {
    sendMessage(TASK_PROMPT)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
        maxWidth: 820,
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Chat area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 0',
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 40px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a2440, #131b2e)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                marginBottom: 20,
              }}
            >
              🤖
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#c8d6e5', marginBottom: 8 }}>
              Standard AI Chat
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#5a6a7a',
                maxWidth: 400,
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              This is a traditional text-in, text-out AI chat interface. Type your request below or
              use the quick-start button.
            </div>
            <button
              onClick={handleQuickStart}
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: '#8899aa',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              ▶ Start Task: Leader Election Algorithm
            </button>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        {hasStarted && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {['Make it more efficient', 'Add more detail', 'Try a creative approach'].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  disabled={isTyping}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#7a8a9a',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    cursor: isTyping ? 'not-allowed' : 'pointer',
                    opacity: isTyping ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={hasStarted ? 'Ask a follow-up...' : 'Type your prompt...'}
            disabled={isTyping}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              color: '#e0e8f0',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={isTyping || !input.trim()}
            style={{
              padding: '12px 20px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background:
                input.trim() && !isTyping
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.03)',
              color: input.trim() && !isTyping ? '#c8d6e5' : '#3a4a5a',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 600,
              cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
