import { useState } from 'react'

export default function SiteCard({ site, onPayment }) {
  const [copied, setCopied] = useState(false)

  const copyUSSD = () => {
    navigator.clipboard.writeText(site.ussdNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="site-card">
      <div className="site-header">
        <h3>{site.name}</h3>
        <span className="location">📍 {site.location}</span>
      </div>

      <div className="site-details">
        <div className="detail">
          <span className="label">Expected Workers</span>
          <span className="value">{site.totalExpected}</span>
        </div>
        <div className="detail">
          <span className="label">Tools Deployed</span>
          <span className="value">{site.totalTools || 0}</span>
        </div>
      </div>

      <div className="ussd-section">
        <label>USSD Code for Workers</label>
        <div className="ussd-box">
          <code>{site.ussdNumber}</code>
          <button 
            className="btn-copy"
            onClick={copyUSSD}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <p className="ussd-hint">Workers dial this to check in/out</p>
      </div>

      <div className="site-stats">
        <div className="stat">
          <span className="icon">✅</span>
          <div>
            <p className="stat-label">Checked In</p>
            <p className="stat-value">{site.checkedIn || 0}</p>
          </div>
        </div>
        <div className="stat">
          <span className="icon">🚪</span>
          <div>
            <p className="stat-label">Checked Out</p>
            <p className="stat-value">{site.checkedOut || 0}</p>
          </div>
        </div>
        <div className="stat">
          <span className="icon">🚨</span>
          <div>
            <p className="stat-label">Incidents</p>
            <p className="stat-value">{site.incidents || 0}</p>
          </div>
        </div>
      </div>

      <button 
        className="btn-pay"
        onClick={onPayment}
      >
        💰 Pay Workers
      </button>
    </div>
  )
}