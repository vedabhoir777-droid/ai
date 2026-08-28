import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Shield, AlertTriangle, CheckCircle, TrendingUp, ArrowRight, FileText, Loader2 } from 'lucide-react'
import Loader from '../components/Loader'

export default function RiskAnalysis() {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('status', 'completed')
      .order('uploaded_at', { ascending: false })
    setDocuments(data || [])
    setLoading(false)
  }

  if (loading) return <Loader message="Loading risk analysis..." />

  const all = documents
  const high = documents.filter(d => d.risk_score >= 70)
  const medium = documents.filter(d => d.risk_score >= 40 && d.risk_score < 70)
  const low = documents.filter(d => d.risk_score < 40)
  const avg = documents.length > 0 ? Math.round(documents.reduce((a, d) => a + (d.risk_score || 0), 0) / documents.length) : 0

  const filtered = filter === 'all' ? documents
    : filter === 'high' ? high
    : filter === 'medium' ? medium
    : low

  const summaryCards = [
    { label: 'Overall Risk Score', value: `${avg}`, sub: '/100 average', icon: TrendingUp, color: avg >= 70 ? 'red' : avg >= 40 ? 'orange' : 'green' },
    { label: 'Critical Risks', value: high.length, sub: 'score 70+', icon: AlertTriangle, color: 'red' },
    { label: 'Medium Risks', value: medium.length, sub: 'score 40-69', icon: Shield, color: 'orange' },
    { label: 'Low Risk', value: low.length, sub: 'score 0-39', icon: CheckCircle, color: 'green' },
  ]

  return (
    <div className="risk-page">
      <div className="page-header">
        <div>
          <h1>Risk Analysis</h1>
          <p>Monitor and manage risk across all your analyzed documents</p>
        </div>
      </div>

      <div className="stats-grid-dashboard">
        {summaryCards.map((s, i) => (
          <div key={i} className={`stat-card-dash stat-${s.color}`}>
            <div className="stat-icon-wrap"><s.icon size={22} /></div>
            <div className="stat-info">
              <div className="stat-value-dash">{s.value}</div>
              <div className="stat-label-dash">{s.label}</div>
              <div className="stat-sub-dash">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="risk-timeline-card">
        <div className="chart-header">
          <div>
            <h3>Risk Timeline</h3>
            <p className="chart-subtitle">Risk scores across recent documents</p>
          </div>
          <Shield size={18} className="text-blue" />
        </div>
        {documents.length === 0 ? (
          <p className="activity-empty">No documents analyzed yet.</p>
        ) : (
          <div className="risk-timeline">
            {documents.slice(0, 8).map((doc, i) => {
              const level = doc.risk_score >= 70 ? 'high' : doc.risk_score >= 40 ? 'medium' : 'low'
              const color = level === 'high' ? 'var(--danger)' : level === 'medium' ? 'var(--warning)' : 'var(--success)'
              return (
                <div key={i} className="timeline-row" onClick={() => navigate(`/analysis/${doc.id}`)}>
                  <div className="timeline-dot" style={{ background: color }} />
                  <div className="timeline-body">
                    <div className="timeline-top">
                      <span className="timeline-name">{doc.file_name}</span>
                      <span className={`timeline-score tag-${level}`}>{doc.risk_score}/100</span>
                    </div>
                    <div className="risk-bar-track-sm">
                      <div className="risk-bar-fill-sm" style={{ width: `${doc.risk_score}%`, background: color }} />
                    </div>
                    <span className="timeline-date">{new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header-row">
          <h2>Risk Cards</h2>
          <div className="filter-chips">
            {['all', 'high', 'medium', 'low'].map(f => (
              <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Shield size={40} /></div>
            <h3>No documents found</h3>
            <p>{documents.length === 0 ? 'Upload and analyze a document to see risk insights.' : 'No documents match this filter.'}</p>
            {documents.length === 0 && (
              <button className="btn-primary" onClick={() => navigate('/upload')}>Upload Document</button>
            )}
          </div>
        ) : (
          <div className="risk-cards-grid">
            {filtered.map(doc => {
              const level = doc.risk_score >= 70 ? 'high' : doc.risk_score >= 40 ? 'medium' : 'low'
              const color = level === 'high' ? 'red' : level === 'medium' ? 'orange' : 'green'
              return (
                <div key={doc.id} className={`risk-card-dash risk-card-${color}`} onClick={() => navigate(`/analysis/${doc.id}`)}>
                  <div className="risk-card-top">
                    <div className="doc-icon"><FileText size={18} /></div>
                    <span className={`risk-badge risk-${color}`}>{level.toUpperCase()}</span>
                  </div>
                  <h3 className="risk-card-name" title={doc.file_name}>{doc.file_name}</h3>
                  <div className="risk-card-score-row">
                    <span className="risk-card-score">{doc.risk_score}<span>/100</span></span>
                    <div className="risk-bar-track">
                      <div className={`risk-bar-fill risk-fill-${color}`} style={{ width: `${doc.risk_score}%` }} />
                    </div>
                  </div>
                  <div className="risk-card-footer">
                    <span>{new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span className="btn-text">Details <ArrowRight size={12} /></span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
