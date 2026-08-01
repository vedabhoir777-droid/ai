import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { analyzeDocument, answerQuestion } from '../lib/analysisEngine'
import { Send, MessageSquare, Brain, User, ArrowLeft, Sparkles, Loader2, FileText } from 'lucide-react'

const SUGGESTED_QUESTIONS = [
  'What are my responsibilities?',
  'Are there any penalties?',
  'When does this contract expire?',
  'What are the risky clauses?',
  'Summarize this document',
]

export default function Chat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [thinking, setThinking] = useState(false)
  const [doc, setDoc] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [docs, setDocs] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (id) loadChatData()
    else loadDocs()
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  const loadDocs = async () => {
    const { data } = await supabase.from('documents').select('*').eq('status', 'completed').order('uploaded_at', { ascending: false })
    setDocs(data || [])
    setLoading(false)
  }

  const loadChatData = async () => {
    setLoading(true)
    const { data: docData } = await supabase.from('documents').select('*').eq('id', id).single()
    setDoc(docData)

    const { data: analysisData } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('document_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setAnalysis(analysisData)

    const { data: existingMessages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('document_id', id)
      .order('created_at', { ascending: true })

    if (existingMessages && existingMessages.length > 0) {
      setMessages(existingMessages.map(m => ({ id: m.id, role: m.role, content: m.content })))
    } else {
      setMessages([{
        role: 'assistant',
        content: `Hello! I've analyzed "${docData?.file_name}". Ask me anything about this document — clauses, risks, obligations, payment terms, and more.`,
      }])
    }
    setLoading(false)
  }

  const handleSend = async (text) => {
    const question = text || input.trim()
    if (!question || !analysis || !doc) return

    setInput('')
    const userMsg = { role: 'user', content: question }
    setMessages(prev => [...prev, userMsg])
    setThinking(true)

    // Save user message
    await supabase.from('chat_messages').insert({
      document_id: id,
      role: 'user',
      content: question,
    })

    // Simulate AI thinking
    setTimeout(async () => {
      const answer = answerQuestion(question, analysis, analysis.summary)
      const aiMsg = { role: 'assistant', content: answer }
      setMessages(prev => [...prev, aiMsg])
      setThinking(false)

      await supabase.from('chat_messages').insert({
        document_id: id,
        role: 'assistant',
        content: answer,
      })
    }, 800 + Math.random() * 600)
  }

  if (loading) return (
    <div className="chat-page">
      <div className="chat-loader"><Loader2 size={32} className="spin" /></div>
    </div>
  )

  if (!id) {
    return (
      <div className="chat-page">
        <div className="page-header">
          <h1>AI Legal Assistant</h1>
          <p>Select a document to start chatting with our AI</p>
        </div>
        {docs.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} />
            <h3>No analyzed documents</h3>
            <p>Upload and analyze a document first, then come back to chat about it.</p>
            <button className="btn-primary" onClick={() => navigate('/upload')}>Upload Document</button>
          </div>
        ) : (
          <div className="doc-select-grid">
            {docs.map(d => (
              <div key={d.id} className="doc-select-card" onClick={() => navigate(`/chat/${d.id}`)}>
                <FileText size={24} />
                <h3>{d.file_name}</h3>
                <p>{new Date(d.uploaded_at).toLocaleDateString()}</p>
                <span className="btn-text">Start Chat <MessageSquare size={14} /></span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="btn-text" onClick={() => navigate('/chat')}>
          <ArrowLeft size={16} /> All Documents
        </button>
        <div className="chat-doc-info">
          <FileText size={18} />
          <div>
            <h2>{doc?.file_name}</h2>
            <p>Risk Score: {doc?.risk_score}/100</p>
          </div>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              <div className="msg-avatar">
                {m.role === 'user' ? <User size={16} /> : <Brain size={16} />}
              </div>
              <div className="msg-bubble">
                <p className="msg-content">{m.content}</p>
              </div>
            </div>
          ))}
          {thinking && (
            <div className="chat-msg assistant">
              <div className="msg-avatar"><Brain size={16} /></div>
              <div className="msg-bubble thinking">
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
          <div className="suggested-questions">
            <p className="sq-title"><Sparkles size={14} /> Suggested Questions</p>
            <div className="sq-list">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i} className="sq-chip" onClick={() => handleSend(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="chat-input-bar">
          <input
            type="text"
            placeholder="Ask about this document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={thinking}
          />
          <button className="send-btn" onClick={() => handleSend()} disabled={thinking || !input.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
