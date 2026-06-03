import { useState } from 'react'

export default function AddSiteModal({ onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    controllerName: '',
    controllerPhone: '',
    totalExpected: '',
    totalTools: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      name: '',
      location: '',
      controllerName: '',
      controllerPhone: '',
      totalExpected: '',
      totalTools: ''
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Mjengo Site</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Site Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Mukuru Mjengo Site"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Nairobi"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                name="controllerName"
                placeholder="Site controller name"
                value={formData.controllerName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Your Phone</label>
              <input
                type="tel"
                name="controllerPhone"
                placeholder="+254712345678"
                value={formData.controllerPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expected Workers</label>
              <input
                type="number"
                name="totalExpected"
                placeholder="e.g. 20"
                value={formData.totalExpected}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Total Tools</label>
              <input
                type="number"
                name="totalTools"
                placeholder="e.g. 5"
                value={formData.totalTools}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}