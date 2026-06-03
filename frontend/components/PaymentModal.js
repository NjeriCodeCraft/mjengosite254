import { useState } from 'react'

export default function PaymentModal({ site, onClose, onSubmit }) {
  const [step, setStep] = useState('confirm')
  const [processing, setProcessing] = useState(false)

  // Mock workers who checked in and out
  const mockWorkers = [
    { id: 1, name: 'Simo', hours: 8, rate: 500, payment: 4000 },
    { id: 2, name: 'James', hours: 7.5, rate: 500, payment: 3750 },
    { id: 3, name: 'Mary', hours: 8, rate: 500, payment: 4000 },
    { id: 4, name: 'Peter', hours: 6, rate: 500, payment: 3000 },
  ]

  const totalPayment = mockWorkers.reduce((sum, w) => sum + w.payment, 0)

  const handlePay = async () => {
    setProcessing(true)
    setStep('processing')
    
    setTimeout(() => {
      setStep('success')
      setProcessing(false)
    }, 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💰 Pay Workers</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {step === 'confirm' && (
          <div className="payment-content">
            <div className="payment-info">
              <p><strong>Site:</strong> {site.name}</p>
              <p><strong>Workers to pay:</strong> {mockWorkers.length}</p>
            </div>

            <div className="workers-list">
              <h3>Workers (Checked In & Out)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Hours</th>
                    <th>Rate (Ksh/hr)</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {mockWorkers.map(w => (
                    <tr key={w.id}>
                      <td>{w.name}</td>
                      <td>{w.hours}h</td>
                      <td>Ksh {w.rate}</td>
                      <td className="payment-amount">Ksh {w.payment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="payment-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>Ksh {totalPayment}</span>
              </div>
              <div className="summary-row highlight">
                <span><strong>Total to Send:</strong></span>
                <span><strong>Ksh {totalPayment}</strong></span>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                onClick={handlePay}
              >
                Send via M-Pesa
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="payment-processing">
            <div className="spinner"></div>
            <p>Sending payments to M-Pesa...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="payment-success">
            <div className="success-icon">✅</div>
            <h3>Payments Sent!</h3>
            <p>Ksh {totalPayment} sent to {mockWorkers.length} workers</p>
            <p className="success-detail">
              M-Pesa notifications have been sent to all workers
            </p>
            <button 
              className="btn-primary"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}