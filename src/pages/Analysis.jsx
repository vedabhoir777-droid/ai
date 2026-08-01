import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { analyzeDocument } from '../lib/analysisEngine'
import { FileText, AlertTriangle, CheckCircle, Brain, Lightbulb, MessageSquare, ArrowLeft, Loader2, Shield, TrendingUp } from 'lucide-react'
import Loader from '../components/Loader'

export default function Analysis() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('summary')

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    const { data: docData } = await supabase.from('documents').select('*').eq('id', id).single()
    if (!docData) { setLoading(false); return }
    setDoc(docData)

    const { data: analysisData } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('document_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (analysisData) {
      setAnalysis(analysisData)
    } else if (docData.status === 'completed') {
      // Fallback: generate analysis on the fly if not stored
      setAnalysis(null)
    }
    setLoading(false)
  }

  if (loading) return <Loader message="Loading analysis..." />
  if (!doc) return (
    <div className="empty-state">
      <AlertTriangle size={40} />
      <h3>Document not found</h3>
      <button className="btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  )

  if (doc.status !== 'completed') return (
    <div className="empty-state">
      <Loader2 size={36} className="spin" />
      <h3>Analysis in progress...</h3>
      <p>Your document is still being analyzed. Please check back shortly.</p>
      <button className="btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  )

  if (!analysis) return (
    <div className="empty-state">
      <AlertTriangle size={40} />
      <h3>Analysis unavailable</h3>
      <p>We couldn't load the analysis for this document.</p>
      <button className="btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  )

  const riskLevel = doc.risk_score >= 70 ? 'high' : doc.risk_score >= 40 ? 'medium' : 'low'
  const riskColor = riskLevel === 'high' ? 'red' : riskLevel === 'medium' ? 'orange' : 'green'
  const clauses = analysis.clauses || []
  const risks = analysis.risks || []
  const keyPoints = analysis.key_points || []
  const recommendations = analysis.recommendations || []

  const tabs = [
    { id: 'summary', label: 'AI Summary', icon: Brain },
    { id: 'clauses', label: 'Clauses', icon: FileText },
    { id: 'risks', label: 'Risk Analysis', icon: Shield },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
  ]

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <button className="btn-text" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="analysis-title-row">
          <div className="doc-icon-lg"><FileText size={24} /></div>
          <div>
            <h1>{doc.file_name}</h1>
            <p>Uploaded {new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <div className="risk-overview">
        <div className={`risk-score-card risk-${riskColor}`}>
          <div className="risk-score-label">Overall Risk Score</div>
          <div className="risk-score-value">{doc.risk_score}<span>/100</span></div>
          <div className="risk-level-tag">{riskLevel.toUpperCase()} RISK</div>
          <div className="risk-bar-large">
            <div className={`risk-bar-fill-large fill-${riskColor}`} style={{ width: `${doc.risk_score}%` }} />
          </div>
        </div>
        <div className="risk-stats-grid">
          <div className="risk-stat">
            <FileText size={20} />
            <div>
              <div className="risk-stat-val">{clauses.length}</div>
              <div className="risk-stat-lbl">Clauses Detected</div>
            </div>
          </div>
          <div className="risk-stat">
            <AlertTriangle size={20} />
            <div>
              <div className="risk-stat-val">{risks.length}</div>
              <div className="risk-stat-lbl">Risks Found</div>
            </div>
          </div>
          <div className="risk-stat">
            <CheckCircle size={20} />
            <div>
              <div className="risk-stat-val">{keyPoints.length}</div>
              <div className="risk-stat-lbl">Key Points</div>
            </div>
          </div>
          <div className="risk-stat">
            <Lightbulb size={20} />
            <div>
              <div className="risk-stat-val">{recommendations.length}</div>
              <div className="risk-stat-lbl">Recommendations</div>
            </div>
          </div>
        </div>
      </div>

      <div className="analysis-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="analysis-content">
        {activeTab === 'summary' && (
          <div className="tab-content">
            <div className="content-card">
              <h2><Brain size={20} /> AI Summary</h2>
              <p className="summary-text">{analysis.summary}</p>
            </div>
            <div className="content-card">
              <h2><CheckCircle size={20} /> Key Points</h2>
              <ul className="key-points-list">
                {keyPoints.map((p, i) => (
                  <li key={i}><CheckCircle size={16} className="text-green" /> {p}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'clauses' && (
          <div className="tab-content">
            {clauses.length === 0 ? (
              <div className="empty-inline">No specific clauses detected in this document.</div>
            ) : (
              <div className="clauses-grid">
                {clauses.map((c, i) => (
                  <div key={i} className={`clause-card clause-${c.color}`}>
                    <div className="clause-header">
                      <h3>{c.label}</h3>
                      <span className="clause-count">{c.count} match{c.count > 1 ? 'es' : ''}</span>
                    </div>
                    <p className="clause-excerpt">"{c.excerpt}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="tab-content">
            {risks.length === 0 ? (
              <div className="empty-inline">
                <CheckCircle size={32} className="text-green" />
                <p>No significant risks detected. This document appears relatively standard.</p>
              </div>
            ) : (
              <div className="risks-list">
                {risks.map((r, i) => (
                  <div key={i} className={`risk-item risk-${r.level}`}>
                    <div className="risk-item-icon">
                      {r.level === 'high' ? <AlertTriangle size={20} /> : r.level === 'medium' ? <AlertTriangle size={20} /> : <Shield size={20} />}
                    </div>
                    <div className="risk-item-body">
                      <div className="risk-item-header">
                        <h3>{r.title}</h3>
                        <span className={`risk-tag tag-${r.level}`}>{r.level.toUpperCase()}</span>
                      </div>
                      <p>{r.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="tab-content">
            <div className="content-card">
              <h2><Lightbulb size={20} /> Recommendations</h2>
              <ul className="rec-list">
                {recommendations.map((r, i) => (
                  <li key={i}>
                    <span className="rec-num">{i + 1}</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="chat-cta">
              <MessageSquare size={24} />
              <h3>Have questions about this document?</h3>
              <p>Chat with our AI assistant to get instant answers about clauses, risks, and obligations.</p>
              <button className="btn-primary" onClick={() => navigate(`/chat/${doc.id}`)}>
                <MessageSquare size={16} />
                Ask AI Assistant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
