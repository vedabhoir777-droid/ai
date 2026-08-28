import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import { analyzeDocument } from '../lib/analysisEngine'
import { UploadCloud, FileText, X, CheckCircle, AlertCircle, Loader2, Brain } from 'lucide-react'

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

export default function Upload() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const inputRef = useRef(null)

  const handleFile = useCallback((f) => {
    setError('')
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!validTypes.includes(f.type) && !f.name.match(/\.(pdf|docx|txt)$/i)) {
      setError('Please upload a PDF, DOCX, or TXT file.')
      return
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('File size must be under 20MB.')
      return
    }
    setFile(f)
  }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleChange = (e) => {
    const f = e.target.files[0]
    if (f) handleFile(f)
  }

  const extractText = async (f) => {
    setStatusMsg('Extracting text from document...')
    let text = ''

    if (f.type === 'application/pdf' || f.name.endsWith('.pdf')) {
      const arrayBuffer = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map(item => item.str).join(' ') + ' '
      }
    } else if (f.name.endsWith('.docx') || f.type.includes('wordprocessingml')) {
      const arrayBuffer = await f.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      text = result.value
    } else {
      text = await f.text()
    }

    return text.trim()
  }

  const handleUpload = async () => {
    if (!file || !user) return
    setUploading(true)
    setError('')
    setProgress(0)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

      setStatusMsg('Uploading document...')
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded / e.total) * 50))
          },
        })

      if (uploadError) throw uploadError
      setProgress(55)

      setStatusMsg('Saving document metadata...')
      const { data: docRecord, error: dbError } = await supabase
        .from('documents')
        .insert({
          file_name: file.name,
          file_url: fileName,
          file_size: file.size,
          file_type: fileExt,
          status: 'analyzing',
        })
        .select()
        .single()

      if (dbError) throw dbError
      setProgress(65)

      setStatusMsg('Extracting text and running AI analysis...')
      const extractedText = await extractText(file)
      setProgress(80)

      setStatusMsg('Generating AI insights...')
      const analysis = analyzeDocument(extractedText)
      setProgress(90)

      setStatusMsg('Saving analysis results...')
      const { error: analysisError } = await supabase
        .from('analysis_results')
        .insert({
          document_id: docRecord.id,
          summary: analysis.summary,
          key_points: analysis.keyPoints,
          clauses: analysis.clauses,
          risks: analysis.risks,
          recommendations: analysis.recommendations,
        })

      if (analysisError) throw analysisError

      await supabase
        .from('documents')
        .update({ status: 'completed', risk_score: analysis.riskScore })
        .eq('id', docRecord.id)

      setProgress(100)
      setStatusMsg('Analysis complete!')
      setTimeout(() => navigate(`/analysis/${docRecord.id}`), 800)
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
      setUploading(false)
      setProgress(0)
      setStatusMsg('')
    }
  }

  return (
    <div className="upload-page">
      <div className="page-header">
        <h1>Upload Document</h1>
        <p>Upload a legal document for AI-powered analysis</p>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {!uploading ? (
        <>
          <div
            className={`dropzone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => !file && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            {!file ? (
              <div className="dropzone-content">
                <div className="dropzone-icon">
                  <UploadCloud size={40} />
                </div>
                <h3>Drag & drop your document here</h3>
                <p>or click to browse files</p>
                <div className="supported-formats">
                  <span className="format-tag">PDF</span>
                  <span className="format-tag">DOCX</span>
                  <span className="format-tag">TXT</span>
                </div>
                <p className="size-hint">Maximum file size: 20MB</p>
              </div>
            ) : (
              <div className="file-preview">
                <div className="file-icon"><FileText size={28} /></div>
                <div className="file-info">
                  <h3>{file.name}</h3>
                  <p>{(file.size / 1024).toFixed(1)} KB · {file.type || 'Unknown type'}</p>
                </div>
                <button className="remove-btn" onClick={(e) => { e.stopPropagation(); setFile(null) }}>
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {file && (
            <div className="upload-actions">
              <button className="btn-primary-lg" onClick={handleUpload}>
                <Brain size={18} />
                Analyze with AI
              </button>
              <button className="btn-outline-lg" onClick={() => setFile(null)}>
                Cancel
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="upload-progress-card">
          <div className="progress-icon">
            {progress < 100 ? <Loader2 size={36} className="spin" /> : <CheckCircle size={36} className="text-green" />}
          </div>
          <h3>{statusMsg}</h3>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-pct">{progress}%</p>
          <div className="progress-steps">
            <div className={`step ${progress >= 10 ? 'done' : ''}`}>
              <div className="step-dot" />
              <span>Uploading</span>
            </div>
            <div className={`step ${progress >= 55 ? 'done' : ''}`}>
              <div className="step-dot" />
              <span>Saving</span>
            </div>
            <div className={`step ${progress >= 65 ? 'done' : ''}`}>
              <div className="step-dot" />
              <span>Extracting</span>
            </div>
            <div className={`step ${progress >= 80 ? 'done' : ''}`}>
              <div className="step-dot" />
              <span>Analyzing</span>
            </div>
            <div className={`step ${progress >= 100 ? 'done' : ''}`}>
              <div className="step-dot" />
              <span>Complete</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
