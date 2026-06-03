import { useRouter } from 'next/router'

export default function SiteCard({ site }) {
  const router = useRouter()

  return (
    <div 
      className="site-card" 
      onClick={() => router.push(`/site/${site.id}`)}
      style={{ cursor: 'pointer' }}
    >
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

      <div className="site-card-footer">
        <span className="view-link">View Dashboard →</span>
      </div>
    </div>
  )
}