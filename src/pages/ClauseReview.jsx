import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { FileText, FileCheck, Search, ArrowRight, Lightbulb, Shield, AlertCircle } from 'lucide-react'
import Loader from '../components/Loader'

const CLAUSE_META = {
  payment: { label: 'Payment Terms', color: 'blue', icon: 'FileText' },
  termination: { label: 'Termination', color: 'red', icon: 'FileText' },
  confidentiality: { label: 'Confidentiality', color: 'purple', icon: 'FileText' },
  responsibility: { label: 'Responsibilities', color: 'green', icon: 'FileText' },
  penalty: { label: 'Penalty Conditions', color: 'orange', icon: 'FileText' },
  renewal: { label: 'Renewal Terms', color: 'teal', icon: 'FileText' },
  ip: { label: 'IP & Ownership', color: 'indigo', icon: 'FileText' },
  dispute: { label: 'Dispute Resolution', color: 'yellow', icon: 'FileText' },
}

export default function ClauseReview() {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: docs } = await supabase
      .from('documents')
      .select('*')
      .eq('status', 'completed')
      .order('uploaded_at', { ascending: false })
    setDocuments(docs || [])

    if (docs && docs.length > 0) {
      const ids = docs.map(d => d.id)
      const { data: results } = await supabase
        .from('analysis_results')
        .select('*')
        .in('document_id', ids)
        .order('created_at', { ascending: false })
      setAnalyses(results || [])
    }
    setLoading(false)
  }

  if (loading) return <Loader message="Loading clause review..." />

  // Build a flat list of all clauses across all documents
  const allClauses = []
  analyses.forEach(a => {
    const doc = documents.find(d => d.id === a.document_id)
    if (!doc || !a.clauses) return
    a.clauses.forEach(c => {
      allClauses.push({
        ...c,
        docName: doc.file_name,
        docId: doc.id,
        docDate: doc.uploaded_at,
        excerpt: c.excerpt || '',
      })
    })
  })

  const clauseTypes = [...new Set(allClauses.map(c => c.type))]

  let filtered = allClauses
  if (activeType !== 'all') filtered = filtered.filter(c => c.type === activeType)
  if (search) filtered = filtered.filter(c =>
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.excerpt.toLowerCase().includes(search.toLowerCase()) ||
    c.docName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="clause-review-page">
      <div className="page-header">
        <div>
          <h1>Clause Review</h1>
          <p>Review every detected clause across your documents with plain-English explanations</p>
        </div>
      </div>

      {allClauses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FileCheck size={40} /></div>
          <h3>No clauses detected yet</h3>
          <p>Upload and analyze a document to see clause-by-clause breakdowns here.</p>
          <button className="btn-primary" onClick={() => navigate('/upload')}>Upload Document</button>
        </div>
      ) : (
        <>
          <div className="clause-controls">
            <div className="search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search clauses or documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-chips">
              <button className={`filter-chip ${activeType === 'all' ? 'active' : ''}`} onClick={() => setActiveType('all')}>
                All ({allClauses.length})
              </button>
              {clauseTypes.map(t => {
                const meta = CLAUSE_META[t] || { label: t, color: 'blue' }
                const count = allClauses.filter(c => c.type === t).length
                return (
                  <button key={t} className={`filter-chip ${activeType === t ? 'active' : ''}`} onClick={() => setActiveType(t)}>
                    {meta.label} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-inline">
              <AlertCircle size={28} className="text-gray" />
              <p>No clauses match your search.</p>
            </div>
          ) : (
            <div className="clauses-review-grid">
              {filtered.map((c, i) => {
                const meta = CLAUSE_META[c.type] || { color: 'blue' }
                return (
                  <div key={i} className={`clause-review-card clause-${meta.color}`}>
                    <div className="clause-review-header">
                      <div className="clause-type-icon"><FileText size={16} /></div>
                      <h3>{c.label}</h3>
                      <span className="clause-match-count">{c.count} match{c.count > 1 ? 'es' : ''}</span>
                    </div>
                    <div className="clause-review-excerpt">
                      <p>"{c.excerpt}"</p>
                    </div>
                    <div className="clause-review-meta">
                      <div className="clause-doc-ref" onClick={() => navigate(`/analysis/${c.docId}`)}>
                        <FileText size={13} />
                        <span>{c.docName}</span>
                        <ArrowRight size={12} />
                      </div>
                      <span className="clause-date">{new Date(c.docDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
