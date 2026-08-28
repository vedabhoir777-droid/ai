import { useNavigate } from 'react-router-dom'
import { FileText, Calendar, AlertTriangle, CheckCircle, Clock, Eye, Trash2 } from 'lucide-react'

const riskColors = { low: 'green', medium: 'orange', high: 'red' }
const statusIcons = {
  completed: <CheckCircle size={14} className="text-green" />,
  analyzing: <Clock size={14} className="text-blue" />,
  pending: <Clock size={14} className="text-gray" />,
  error: <AlertTriangle size={14} className="text-red" />,
}

export default function DocumentCard({ doc, onDelete }) {
  const navigate = useNavigate()
  const riskLevel = doc.risk_score >= 70 ? 'high' : doc.risk_score >= 40 ? 'medium' : 'low'
  const dateStr = new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="doc-card">
      <div className="doc-card-header">
        <div className="doc-icon">
          <FileText size={20} />
        </div>
        <div className="doc-meta">
          <h3 className="doc-name" title={doc.file_name}>{doc.file_name}</h3>
          <div className="doc-date">
            <Calendar size={12} />
            <span>{dateStr}</span>
          </div>
        </div>
        <div className={`risk-badge risk-${riskColors[riskLevel]}`}>
          {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
        </div>
      </div>

      <div className="doc-card-body">
        <div className="doc-stats">
          <div className="stat-row">
            <span className="stat-label">Risk Score</span>
            <div className="risk-score-bar">
              <div className="risk-bar-track">
                <div
                  className={`risk-bar-fill risk-fill-${riskColors[riskLevel]}`}
                  style={{ width: `${doc.risk_score}%` }}
                />
              </div>
              <span className={`score-num text-${riskColors[riskLevel]}`}>{doc.risk_score}/100</span>
            </div>
          </div>
          <div className="stat-row">
            <span className="stat-label">Status</span>
            <div className="status-badge">
              {statusIcons[doc.status]}
              <span>{doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="doc-card-actions">
        <button
          className="btn-outline-sm"
          onClick={() => navigate(`/analysis/${doc.id}`)}
          disabled={doc.status !== 'completed'}
        >
          <Eye size={14} />
          View Analysis
        </button>
        <button
          className="btn-danger-sm"
          onClick={() => onDelete && onDelete(doc.id)}
          title="Delete document"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
