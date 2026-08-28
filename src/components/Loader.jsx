import { Brain } from 'lucide-react'

export default function Loader({ message = 'Loading...' }) {
  return (
    <div className="loader-overlay">
      <div className="loader-box">
        <div className="loader-icon">
          <Brain size={32} />
          <div className="loader-ring" />
        </div>
        <p className="loader-msg">{message}</p>
      </div>
    </div>
  )
}

export function InlineLoader({ message = 'Processing...' }) {
  return (
    <div className="inline-loader">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  )
}
