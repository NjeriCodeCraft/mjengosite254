import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import SiteCard from '../components/SiteCard'
import KPICard from '../components/KPICard'
import AddSiteModal from '../components/AddSiteModal'

const API_URL = 'https://mjengosite254.onrender.com/api'

export default function Dashboard() {
  const router = useRouter()
  const { user, logout, loading: authLoading } = useAuth()
  const [sites, setSites] = useState([])
  const [showAddSite, setShowAddSite] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      loadSites()
    }
  }, [user, authLoading, router])

  const loadSites = async () => {
    const savedSites = JSON.parse(localStorage.getItem('mjengoSites') || '[]')

    // Fetch real KPIs for each site from DB
    const sitesWithStats = await Promise.all(
      savedSites.map(async (site) => {
        try {
          const [attendanceRes, incidentsRes] = await Promise.all([
            axios.get(`${API_URL}/attendance/site/${site.id}/today`),
            axios.get(`${API_URL}/attendance/incidents/${site.id}`)
          ])
          const attendance = attendanceRes.data
          return {
            ...site,
            checkedIn: attendance.filter(a => a.check_in_time && !a.check_out_time).length,
            checkedOut: attendance.filter(a => a.check_out_time).length,
            incidents: incidentsRes.data.length
          }
        } catch {
          return site
        }
      })
    )
    setSites(sitesWithStats)
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

  // Overall KPIs summed across all sites
  const totalExpected = sites.reduce((sum, s) => sum + (parseInt(s.totalExpected) || 0), 0)
  const totalCheckedIn = sites.reduce((sum, s) => sum + (s.checkedIn || 0), 0)
  const totalCheckedOut = sites.reduce((sum, s) => sum + (s.checkedOut || 0), 0)
  const totalIncidents = sites.reduce((sum, s) => sum + (s.incidents || 0), 0)

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
            {/* Overall KPIs */}
            <div className="kpis-section">
              <h2>Overall KPIs</h2>
              <div className="kpis-grid">
                <KPICard
                  label="Total Expected Workers"
                  value={totalExpected}
                  icon="👥"
                />
                <KPICard
                  label="Checked In Today"
                  value={totalCheckedIn}
                  icon="✅"
                />
                <KPICard
                  label="Checked Out Today"
                  value={totalCheckedOut}
                  icon="🚪"
                />
                <KPICard
                  label="Incidents Reported"
                  value={totalIncidents}
                  icon="🚨"
                />
              </div>
            </div>

            {/* Site Cards */}
            <div className="sites-section">
              <h2>Your Mjengo Sites</h2>
              <div className="sites-grid">
                {sites.map(site => (
                  <SiteCard
                    key={site.id}
                    site={site}
                  />
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
    </div>
  )
}