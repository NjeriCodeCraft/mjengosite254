import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import KPICard from '../../components/KPICard'
import PaymentModal from '../../components/PaymentModal'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

export default function SiteDashboard() {
  const router = useRouter()
  const { siteId } = router.query
  const { user, authLoading } = useAuth()
  const [site, setSite] = useState(null)
  const [workers, setWorkers] = useState([])
  const [attendance, setAttendance] = useState([])
  const [incidents, setIncidents] = useState([])
  const [showPayment, setShowPayment] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading])

  useEffect(() => {
    if (!siteId) return
    const sites = JSON.parse(localStorage.getItem('mjengoSites') || '[]')
    const found = sites.find(s => s.id === siteId)
    if (!found) { router.push('/dashboard'); return }
    setSite(found)
    fetchSiteData(siteId)
  }, [siteId])

  const fetchSiteData = async (id) => {
    setLoading(true)
    try {
      const [workersRes, attendanceRes, incidentsRes] = await Promise.all([
        axios.get(`${API_URL}/workers/site/${id}`),
        axios.get(`${API_URL}/attendance/site/${id}/today`),
        axios.get(`${API_URL}/attendance/incidents/${id}`)
      ])
      setWorkers(workersRes.data)
      setAttendance(attendanceRes.data)
      setIncidents(incidentsRes.data)
    } catch (err) {
      console.error('Failed to fetch site data:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkedInToday = attendance.filter(a => a.check_in_time && !a.check_out_time).length
  const checkedOutToday = attendance.filter(a => a.check_out_time).length
  const checkedInWorkers = attendance.filter(a => a.check_in_time)

  if (!site) return <div className="loading">Loading site...</div>

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => router.push('/dashboard')}>
            ← All Sites
          </button>
          <div>
            <h1>🏗️ {site.name}</h1>
            <p>📍 {site.location}</p>
          </div>
        </div>
        <div className="header-right">
          <span className="controller-badge">👷 {site.controllerName}</span>
          <button
            className="btn-add-site"
            onClick={() => setShowPayment(true)}
            disabled={checkedInWorkers.length === 0}
          >
            💰 Pay Workers {checkedInWorkers.length > 0 ? `(${checkedInWorkers.length})` : ''}
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* KPIs */}
        <div className="kpis-section">
          <div className="kpis-grid">
            <KPICard label="Expected Workers" value={site.totalExpected} icon="👥" />
            <KPICard label="Checked In Today" value={checkedInToday} icon="✅" />
            <KPICard label="Checked Out Today" value={checkedOutToday} icon="🚪" />
            <KPICard label="Incidents" value={incidents.length} icon="🚨" />
          </div>
        </div>

        {/* Main content + Incidents sidebar */}
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', alignItems: 'flex-start' }}>
          
          {/* Left — Attendance + Workers */}
          <div style={{ flex: 1 }}>
            {/* USSD Code */}
            <div className="ussd-section" style={{ marginBottom: '2rem' }}>
              <h2>USSD Code</h2>
              <div className="ussd-box" style={{ maxWidth: '400px' }}>
                <code>{site.ussdNumber}</code>
                <button className="btn-copy" onClick={() => navigator.clipboard.writeText(site.ussdNumber)}>
                  Copy
                </button>
              </div>
              <p className="ussd-hint">Workers dial this to check in/out</p>
            </div>

            {/* Today's Attendance */}
            <div className="sites-section">
              <h2>Today's Attendance</h2>
              {loading ? (
                <p style={{ color: '#888' }}>Loading...</p>
              ) : attendance.length === 0 ? (
                <p style={{ color: '#888' }}>No check-ins yet today.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>Worker</th>
                      <th style={{ padding: '0.75rem' }}>Phone</th>
                      <th style={{ padding: '0.75rem' }}>Check In</th>
                      <th style={{ padding: '0.75rem' }}>Check Out</th>
                      <th style={{ padding: '0.75rem' }}>Hours</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.75rem' }}>{a.name}</td>
                        <td style={{ padding: '0.75rem' }}>{a.phone}</td>
                        <td style={{ padding: '0.75rem' }}>
                          {new Date(a.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {a.check_out_time ? new Date(a.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {a.hours_worked ? `${parseFloat(a.hours_worked).toFixed(2)} hrs` : '—'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {a.check_out_time
                            ? <span style={{ color: 'gray' }}>Checked Out</span>
                            : <span style={{ color: 'green', fontWeight: 'bold' }}>On Site</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* All Workers */}
            <div className="sites-section" style={{ marginTop: '2rem' }}>
              <h2>All Workers ({workers.length})</h2>
              {workers.length === 0 ? (
                <p style={{ color: '#888' }}>Workers auto-register when they check in via USSD.</p>
              ) : (
                <div className="sites-grid">
                  {workers.map(w => (
                    <div key={w.id} style={{
                      background: '#f9f9f9', border: '1px solid #eee',
                      borderRadius: '8px', padding: '1rem'
                    }}>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>👷 {w.name}</p>
                      <p style={{ color: '#666', margin: '0.25rem 0 0' }}>📞 {w.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Incidents Sidebar */}
          <div style={{
            width: '320px', flexShrink: 0,
            background: '#fff', border: '1px solid #eee',
            borderRadius: '12px', padding: '1.5rem'
          }}>
            <h2 style={{ marginTop: 0 }}>
              🚨 Incidents
              {incidents.length > 0 && (
                <span style={{
                  marginLeft: '8px', background: '#dc2626', color: 'white',
                  borderRadius: '999px', padding: '2px 8px', fontSize: '0.8rem'
                }}>
                  {incidents.length}
                </span>
              )}
            </h2>

            {incidents.length === 0 ? (
              <p style={{ color: '#888', fontSize: '0.9rem' }}>No incidents reported today.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {incidents.map(i => (
                  <div key={i.id} style={{
                    background: i.incident_type === 'accident' ? '#fff5f5' : '#fffbeb',
                    border: `1px solid ${i.incident_type === 'accident' ? '#fecaca' : '#fde68a'}`,
                    borderRadius: '8px', padding: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{
                        background: i.incident_type === 'accident' ? '#dc2626' : '#d97706',
                        color: 'white', padding: '2px 8px',
                        borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'
                      }}>
                        {i.incident_type?.toUpperCase() || 'GENERAL'}
                      </span>
                      <span style={{ color: '#999', fontSize: '0.75rem' }}>
                        {new Date(i.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit', minute: '2-digit', hour12: true
                        })}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#333' }}>
                      {i.description || 'No description provided.'}
                    </p>
                    {i.reporter_name && (
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#666' }}>
                        👤 {i.reporter_name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          site={site}
          workers={checkedInWorkers}
          onClose={() => setShowPayment(false)}
          onSubmit={() => {
            alert(`✅ Payment confirmations sent to ${checkedInWorkers.length} workers!`)
            setShowPayment(false)
          }}
        />
      )}
    </div>
  )
}