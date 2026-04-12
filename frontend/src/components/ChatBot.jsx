import { useState, useRef, useEffect } from 'react'
import { chat } from '../lib/api.js'

const QUICK_PROMPTS = [
  "Best time to visit Darjeeling?",
  "What to pack for a hill station trip?",
  "How to get from Kolkata to Dooars?",
  "Cheapest way to travel in India?",
  "Best photography spots near Kolkata?",
  "Offbeat destinations in West Bengal?",
]

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Namaste! I am your AI Travel Assistant. Ask me anything about Indian travel — destinations, routes, costs, packing, photography spots, or trip planning. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const msg = text || input
    if (!msg.trim()) return

    const userMsg = { role: 'user', text: msg }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await chat(msg)
      setMessages(m => [...m, { role: 'ai', text: res.data.response }])
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'Sorry, I could not connect. Make sure the backend is running.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{display:'flex',flexDirection:'column',height:'calc(100vh - 40px)'}}>
      <div className="page-header">
        <h1>💬 Travel Chat</h1>
        <p>Ask anything about Indian travel — instant AI answers</p>
      </div>

      {/* Quick prompts */}
      <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'16px'}}>
        {QUICK_PROMPTS.map((p, i) => (
          <button key={i} className="btn btn-outline btn-sm" onClick={() => sendMessage(p)}>{p}</button>
        ))}
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'12px',paddingBottom:'16px',minHeight:0}}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            <div className="chat-avatar">{m.role === 'ai' ? '🌍' : '👤'}</div>
            <div className="chat-bubble" style={{whiteSpace:'pre-wrap'}}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg ai">
            <div className="chat-avatar">🌍</div>
            <div className="chat-bubble" style={{display:'flex',gap:'6px',alignItems:'center'}}>
              <div className="spinner" style={{width:14,height:14,borderWidth:2}}></div>
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className="chat-input-row" style={{marginTop:'auto',paddingTop:'12px',borderTop:'1px solid #E2E8F0'}}>
        <input
          className="form-input"
          placeholder="Ask anything about travel in India..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
        />
        <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  )
}
