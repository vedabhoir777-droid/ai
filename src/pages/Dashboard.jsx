import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { FileText, AlertTriangle, CheckCircle, Clock, ArrowRight, Upload, TrendingUp, Shield, Activity, ChevronRight, Brain } from 'lucide-react'
import DocumentCard from '../components/DocumentCard'
import Loader from '../components/Loader'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, risks: 0, safe: 0, recent: 0, avgRisk: 0, critical: 0 })

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(10)

    if (!error && data) {
      setDocuments(data)
      const total = data.length
      const risks = data.filter(d => d.risk_score >= 40).length
      const safe = data.filter(d => d.risk_score < 40 && d.status === 'completed').length
      const recent = data.filter(d => {
        const diff = Date.now() - new Date(d.uploaded_at).getTime()
        return diff < 7 * 24 * 60 * 60 * 1000
      }).length
      const completed = data.filter(d => d.status === 'completed')
      const avgRisk = completed.length > 0 ? Math.round(completed.reduce((a, d) => a + (d.risk_score || 0), 0) / completed.length) : 0
      const critical = data.filter(d => d.risk_score >= 70).length
      setStats({ total, risks, safe, recent, avgRisk, critical })
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this document and its analysis?')) return
    await supabase.from('documents').delete().eq('id', id)
    loadDocuments()
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'

  const statCards = [
    { label: 'Total Documents', value: stats.total, icon: FileText, color: 'blue', sub: `${stats.recent} this week` },
    { label: 'Risks Detected', value: stats.risks, icon: AlertTriangle, color: 'orange', sub: `${stats.critical} critical` },
    { label: 'Safe Documents', value: stats.safe, icon: CheckCircle, color: 'green', sub: 'Low risk' },
    { label: 'Avg Risk Score', value: `${stats.avgRisk}`, icon: TrendingUp, color: 'purple', sub: 'across all docs' },
  ]

  // Risk distribution for chart
  const riskBuckets = [
    { label: 'Low (0-39)', count: documents.filter(d => d.risk_score < 40).length, color: 'var(--success)' },
    { label: 'Medium (40-69)', count: documents.filter(d => d.risk_score >= 40 && d.risk_score < 70).length, color: 'var(--warning)' },
    { label: 'High (70-100)', count: documents.filter(d => d.risk_score >= 70).length, color: 'var(--danger)' },
  ]
  const maxBucket = Math.max(...riskBuckets.map(b => b.count), 1)

  // Weekly uploads mock chart
  const weeklyData = [
    { day: 'Mon', value: 2 },
    { day: 'Tue', value: 5 },
    { day: 'Wed', value: 3 },
    { day: 'Thu', value: 7 },
    { day: 'Fri', value: 4 },
    { day: 'Sat', value: 1 },
    { day: 'Sun', value: 2 },
  ]
  const maxWeekly = Math.max(...weeklyData.map(d => d.value), 1)

  if (loading) return <Loader message="Loading your dashboard..." />

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Welcome back, {userName}</h1>
          <p>Here's an overview of your document analysis activity</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/upload')}>
          <Upload size={16} />
          Upload Document
        </button>
      </div>

      <div className="stats-grid-dashboard">
        {statCards.map((s, i) => (
          <div key={i} className={`stat-card-dash stat-${s.color}`}>
            <div className="stat-icon-wrap">
              <s.icon size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-value-dash">{s.value}</div>
              <div className="stat-label-dash">{s.label}</div>
              <div className="stat-sub-dash">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-charts-row">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Weekly Uploads</h3>
              <p className="chart-subtitle">Documents analyzed per day</p>
            </div>
            <div className="chart-trend">
              <TrendingUp size={16} className="text-green" />
              <span className="text-green">+12%</span>
            </div>
          </div>
          <div className="bar-chart">
            {weeklyData.map((d, i) => (
              <div key={i} className="bar-col">
                <div className="bar-wrap">
                  <div
                    className="bar-fill"
                    style={{ height: `${(d.value / maxWeekly) * 100}%` }}
                  />
                </div>
                <span className="bar-label">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Risk Distribution</h3>
              <p className="chart-subtitle">By risk severity level</p>
            </div>
            <Shield size={18} className="text-blue" />
          </div>
          <div className="risk-dist-list">
            {riskBuckets.map((b, i) => (
              <div key={i} className="risk-dist-row">
                <div className="risk-dist-info">
                  <span className="risk-dist-dot" style={{ background: b.color }} />
                  <span className="risk-dist-label">{b.label}</span>
                </div>
                <div className="risk-dist-bar-wrap">
                  <div className="risk-dist-bar" style={{ width: `${(b.count / maxBucket) * 100}%`, background: b.color }} />
                </div>
                <span className="risk-dist-count">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header-row">
          <h2>Recent Documents</h2>
          <button className="btn-text" onClick={() => navigate('/history')}>
            View All <ArrowRight size={14} />
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FileText size={40} /></div>
            <h3>No documents yet</h3>
            <p>Upload your first legal document to get AI-powered analysis and insights.</p>
            <button className="btn-primary" onClick={() => navigate('/upload')}>
              <Upload size={16} />
              Upload Your First Document
            </button>
          </div>
        ) : (
          <div className="doc-grid">
            {documents.map(doc => (
              <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-activity">
        <div className="section-header-row">
          <h2>Recent Activity</h2>
          <Activity size={18} className="text-gray" />
        </div>
        <div className="activity-list">
          {documents.slice(0, 4).map((doc, i) => (
            <div key={i} className="activity-item" onClick={() => navigate(`/analysis/${doc.id}`)}>
              <div className={`activity-icon ${doc.risk_score >= 70 ? 'red' : doc.risk_score >= 40 ? 'orange' : 'green'}`}>
                <FileText size={16} />
              </div>
              <div className="activity-body">
                <p><b>{doc.file_name}</b> was analyzed</p>
                <span>{new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · Risk: {doc.risk_score}/100</span>
              </div>
              <ChevronRight size={16} className="text-gray" />
            </div>
          ))}
          {documents.length === 0 && (
            <p className="activity-empty">No recent activity yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
