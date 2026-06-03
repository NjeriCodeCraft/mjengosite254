import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import SiteCard from '../components/SiteCard'
import KPICard from '../components/KPICard'
import AddSiteModal from '../components/AddSiteModal'
import PaymentModal from '../components/PaymentModal'

const API_URL = 'http://localhost:5000/api'

export default function Dashboard() {
  const router = useRouter()
  const { user, logout, loading: authLoading } = useAuth()
  const [sites, setSites] = useState([])
  const [showAddSite, setShowAddSite] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedSite, setSelectedSite] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      loadSites()
    }
  }, [user, authLoading, router])

  const loadSites = async () => {
    const sites = localStorage.getItem('mjengoSites') || '[]'
    setSites(JSON.parse(sites))
  }

  const handleAddSite = async (siteData) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/sites/register`, siteData)
      
      const newSite = {
        id: response.data.siteId,
        ...siteData,
        ussdCode: response.data.ussdCode,
        ussdNumber: response.data.ussdNumber,
        createdAt: new Date().toISOString(),
        checkedIn: 0,
        checkedOut: 0,
        incidents: 0
      }

      const updatedSites = [...sites, newSite]
      setSites(updatedSites)
      localStorage.setItem('mjengoSites', JSON.stringify(updatedSites))
      
      setShowAddSite(false)
    } catch (error) {
      console.error('Error adding site:', error)
      alert('Failed to add site')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (authLoading) return <div className="loading">Loading...</div>
  if (!user) return null

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🏗️ MjengoSite</h1>
          <p>Welcome, {user.name}! 👋</p>
        </div>
        <div className="header-right">
          <button 
            className="btn-add-site"
            onClick={() => setShowAddSite(true)}
          >
            + Add Mjengo Site
          </button>
          <button 
            className="btn-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {sites.length === 0 ? (
          <div className="empty-state">
            <h2>No sites yet</h2>
            <p>Click the button above to add your first mjengo site!</p>
          </div>
        ) : (
          <>
            <div className="kpis-section">
              <h2>Overall KPIs</h2>
              <div className="kpis-grid">
                <KPICard 
                  label="Total Expected Workers"
                  value={sites.reduce((sum, s) => sum + (parseInt(s.totalExpected) || 0), 0)}
                  icon="👥"
                />
                <KPICard 
                  label="Checked In Today"
                  value={sites.reduce((sum, s) => sum + (s.checkedIn || 0), 0)}
                  icon="✅"
                />
                <KPICard 
                  label="Checked Out Today"
                  value={sites.reduce((sum, s) => sum + (s.checkedOut || 0), 0)}
                  icon="🚪"
                />
                <KPICard 
                  label="Incidents Reported"
                  value={sites.reduce((sum, s) => sum + (s.incidents || 0), 0)}
                  icon="🚨"
                />
              </div>
            </div>

            <div className="sites-section">
              <h2>Your Mjengo Sites</h2>
              <div className="sites-grid">
                {sites.map(site => (
                  <div 
                    key={site.id}
                    className="site-card-clickable"
                    onClick={() => setSelectedSite(site)}
                  >
                    <SiteCard 
                      site={site}
                      onPayment={() => {
                        setSelectedSite(site)
                        setShowPayment(true)
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {showAddSite && (
        <AddSiteModal
          onClose={() => setShowAddSite(false)}
          onSubmit={handleAddSite}
          loading={loading}
        />
      )}

      {showPayment && selectedSite && (
        <PaymentModal
          site={selectedSite}
          onClose={() => setShowPayment(false)}
          onSubmit={() => {
            alert(`✅ Payment requests sent!`)
            setShowPayment(false)
          }}
        />
      )}
    </div>
  )
}