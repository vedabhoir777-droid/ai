import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { FileText, Search, Trash2, Eye, Calendar } from 'lucide-react'
import DocumentCard from '../components/DocumentCard'
import Loader from '../components/Loader'

export default function History() {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    let result = documents
    if (search) {
      result = result.filter(d => d.file_name.toLowerCase().includes(search.toLowerCase()))
    }
    if (filter === 'high') result = result.filter(d => d.risk_score >= 70)
    if (filter === 'medium') result = result.filter(d => d.risk_score >= 40 && d.risk_score < 70)
    if (filter === 'low') result = result.filter(d => d.risk_score < 40)
    if (filter === 'completed') result = result.filter(d => d.status === 'completed')
    setFiltered(result)
  }, [search, filter, documents])

  const loadDocuments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false })
    setDocuments(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this document and its analysis?')) return
    const doc = documents.find(d => d.id === id)
    if (doc?.file_url) {
      await supabase.storage.from('documents').remove([doc.file_url])
    }
    await supabase.from('documents').delete().eq('id', id)
    loadDocuments()
  }

  if (loading) return <Loader message="Loading documents..." />

  return (
    <div className="history-page">
      <div className="page-header">
        <h1>Document History</h1>
        <p>View and manage all your analyzed documents</p>
      </div>

      <div className="history-controls">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-chips">
          {['all', 'high', 'medium', 'low', 'completed'].map(f => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FileText size={40} /></div>
          <h3>{documents.length === 0 ? 'No documents yet' : 'No matching documents'}</h3>
          <p>{documents.length === 0
            ? 'Upload your first legal document to get started.'
            : 'Try adjusting your search or filter.'}
          </p>
          {documents.length === 0 && (
            <button className="btn-primary" onClick={() => navigate('/upload')}>Upload Document</button>
          )}
        </div>
      ) : (
        <div className="doc-grid">
          {filtered.map(doc => (
            <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
