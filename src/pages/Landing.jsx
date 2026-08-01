import { FileText, Sparkles, FileCheck, AlertTriangle, MessageSquare, Brain, Shield, Clock, Search, ArrowRight, CheckCircle, Zap, ScanLine, Layers, TrendingUp, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  { icon: Brain, title: 'AI Contract Analysis', desc: 'Advanced AI algorithms analyze your contracts to extract key information and identify important clauses automatically.' },
  { icon: AlertTriangle, title: 'Risk Detection', desc: 'Detect risky clauses, unusual terms, and potential legal pitfalls before you sign any agreement.' },
  { icon: FileCheck, title: 'Clause Extraction', desc: 'Automatically identify and extract payment terms, termination clauses, confidentiality agreements, and more.' },
  { icon: FileText, title: 'Document Summarization', desc: 'Get clear, concise summaries of lengthy legal documents in seconds, highlighting what matters most.' },
  { icon: MessageSquare, title: 'AI Legal Assistant', desc: 'Chat with our AI assistant to ask questions about your documents and get instant, contextual answers.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your documents are encrypted and stored securely. Only you can access your uploaded files.' },
]

const stats = [
  { value: '10K+', label: 'Documents Analyzed' },
  { value: '95%', label: 'Risk Detection Accuracy' },
  { value: '50+', label: 'Clause Types Detected' },
  { value: '<5s', label: 'Average Analysis Time' },
]

const steps = [
  { icon: FileText, title: 'Upload Document', desc: 'Drag and drop your PDF or DOCX file — no formatting required.' },
  { icon: ScanLine, title: 'AI Analysis', desc: 'Our engine extracts text, detects clauses, and scores risk automatically.' },
  { icon: CheckCircle, title: 'Review Insights', desc: 'Get summaries, risk analysis, and recommendations in seconds.' },
  { icon: MessageSquare, title: 'Ask Questions', desc: 'Chat with AI to understand any clause, obligation, or penalty.' },
]

export default function Landing() {
  return (
    <div className="landing">
      <section className="hero hero-split">
        <div className="hero-grid-bg" />
        <div className="hero-bg-glow" />
        <div className="hero-split-content">
          {/* Left: Text */}
          <div className="hero-left">
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>AI-Powered Legal Document Intelligence</span>
            </div>
            <h1 className="hero-title">
              Understand Your Contracts <span className="gradient-hero-text">With AI</span>
            </h1>
            <p className="hero-subtitle">
              Analyze legal documents, identify risks, and simplify complex agreements instantly.
              Our AI-powered platform helps you make informed decisions with confidence.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn-primary-lg">
                <FileText size={18} />
                Analyze Document
              </Link>
              <Link to="/signup" className="btn-outline-lg">
                Get Started
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="hero-trust">
              <div className="trust-item">
                <CheckCircle size={16} className="text-green" />
                <span>No credit card required</span>
              </div>
              <div className="trust-item">
                <Lock size={16} className="text-blue" />
                <span>Bank-grade encryption</span>
              </div>
              <div className="trust-item">
                <Zap size={16} className="text-teal" />
                <span>Results in seconds</span>
              </div>
            </div>
          </div>

          {/* Right: Image with overlay cards */}
          <div className="hero-right">
            <div className="hero-image-wrap">
              <img
                src="https://images.pexels.com/photos/7821202/pexels-photo-7821202.jpeg?auto=compress&cs=tinysrgb&w=900"
                alt="Legal document analysis with AI"
                className="hero-image"
              />
              <div className="hero-image-glow" />

              {/* Floating analysis card */}
              <div className="hero-overlay-card overlay-top">
                <div className="overlay-card-header">
                  <div className="overlay-icon blue"><Brain size={16} /></div>
                  <span className="overlay-label">AI Analysis Complete</span>
                </div>
                <div className="overlay-body">
                  <div className="overlay-row">
                    <span>Risk Score</span>
                    <span className="overlay-value text-orange">42/100</span>
                  </div>
                  <div className="overlay-bar-track">
                    <div className="overlay-bar-fill" style={{ width: '42%', background: 'var(--warning)' }} />
                  </div>
                  <div className="overlay-row">
                    <span>Clauses Found</span>
                    <span className="overlay-value text-blue">8</span>
                  </div>
                  <div className="overlay-row">
                    <span>Status</span>
                    <span className="overlay-value text-green">Medium Risk</span>
                  </div>
                </div>
              </div>

              {/* Floating risk card */}
              <div className="hero-overlay-card overlay-bottom">
                <div className="overlay-card-header">
                  <div className="overlay-icon orange"><AlertTriangle size={16} /></div>
                  <span className="overlay-label">Risk Detected</span>
                </div>
                <div className="overlay-body">
                  <p className="overlay-risk-text">Auto-renewal clause found — 30-day cancellation notice required.</p>
                </div>
              </div>

              {/* Floating chat bubble */}
              <div className="hero-overlay-chat">
                <div className="overlay-chat-icon"><MessageSquare size={14} /></div>
                <span>"What are my payment obligations?"</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section" id="stats">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-value gradient-text">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-header">
          <div className="section-badge"><Layers size={14} /> Features</div>
          <h2>Everything You Need to Understand Legal Documents</h2>
          <p>Our comprehensive suite of AI tools helps you analyze, understand, and navigate complex legal agreements with ease.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">
                <f.icon size={24} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="features-section" id="how-it-works" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <div className="section-badge"><Zap size={14} /> How It Works</div>
          <h2>From Upload to Insight in 4 Simple Steps</h2>
          <p>Our streamlined process gets you from raw document to actionable insights in seconds.</p>
        </div>
        <div className="features-grid">
          {steps.map((s, i) => (
            <div key={i} className="feature-card">
              <div className="step-number">{i + 1}</div>
              <div className="feature-icon" style={{ marginTop: 0 }}>
                <s.icon size={24} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section" id="cta">
        <div className="cta-box">
          <Clock size={32} />
          <h2>Ready to Analyze Your First Document?</h2>
          <p>Join thousands of professionals using LexAI to understand their contracts faster.</p>
          <Link to="/signup" className="btn-primary-lg">
            Get Started Free
            <Sparkles size={18} />
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-brand">
          <Brain size={20} />
          <span>LexAI</span>
        </div>
        <p>AI Contract & Legal Document Analyzer. For informational purposes only — not legal advice.</p>
      </footer>
    </div>
  )
}
