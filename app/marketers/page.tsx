'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch, apiJson, clearSession, getApiBase, getUser } from '../lib/api'

interface Product {
  id?: string
  _id?: string
  name: string
  description: string
  photos: string[]
  location: string
  farmerId: string
  quantity?: number
  unit?: string
  grade?: string
  startingBid?: number
  currentHighestBid?: number | null
  minNextBid?: number
  deliveryDate?: string
  biddingEndAt?: string
  status?: string
  soldToId?: string
  soldTo?: string
  soldAmount?: number
  soldBidAmount?: number
  totalSaleValue?: number
  advanceAmount?: number
  balanceAmount?: number
  advancePaymentStatus?: string
  deliveryStatus?: string
  mismatch?: { reported?: boolean; adminDecision?: string; reason?: string }
}

interface Bid { id?: string; _id?: string; productId: string; amount: number; marketerId: string; marketerName: string }
interface Notification { id: string; title: string; message: string; read: boolean }

const API = getApiBase()
const getId = (x: any) => x?._id || x?.id || ''

function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MarketersPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [wins, setWins] = useState<Product[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [detailBids, setDetailBids] = useState<Bid[]>([])
  const [bidAmount, setBidAmount] = useState('')
  const [bidError, setBidError] = useState('')
  const [marketerId, setMarketerId] = useState('')
  const [showNotifs, setShowNotifs] = useState(false)
  const [tab, setTab] = useState<'browse' | 'wins'>('browse')
  const [q, setQ] = useState('')
  const [location, setLocation] = useState('')
  const [deliveryFrom, setDeliveryFrom] = useState('')
  const [deliveryTo, setDeliveryTo] = useState('')
  const [status, setStatus] = useState('bidding')
  const [msg, setMsg] = useState('')
  const [mismatchReason, setMismatchReason] = useState('')

  useEffect(() => {
    const user = getUser()
    if (!user || !localStorage.getItem('token')) { router.push('/login/marketer'); return }
    setMarketerId(String(user.id || ''))
    fetchAll()
    const t = setInterval(fetchAll, 10000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!marketerId) return
    fetchAll()
  }, [q, location, deliveryFrom, deliveryTo, status])

  const fetchAll = async () => {
    try {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (q) params.set('q', q)
      if (location) params.set('location', location)
      if (deliveryFrom) params.set('deliveryFrom', deliveryFrom)
      if (deliveryTo) params.set('deliveryTo', deliveryTo)

      const [p, b, w, n] = await Promise.all([
        apiJson<Product[]>(`/api/products?${params}`),
        apiJson<Bid[]>('/api/bids'),
        apiJson<Product[]>('/api/marketer/wins'),
        apiJson<Notification[]>('/api/notifications'),
      ])
      setProducts(Array.isArray(p) ? p : [])
      setBids(Array.isArray(b) ? b : [])
      setWins(Array.isArray(w) ? w : [])
      setNotifications(Array.isArray(n) ? n : [])
    } catch (err: any) {
      if (err?.status === 401) { clearSession(); router.push('/login/marketer') }
    }
  }

  const getTopBid = (pid: string) =>
    bids.filter(b => b.productId === pid).sort((a, b) => b.amount - a.amount)[0]

  const getMyBid = (pid: string) =>
    bids.filter(b => b.productId === pid && b.marketerId === marketerId).sort((a, b) => b.amount - a.amount)[0]

  const openDetail = async (product: Product) => {
    setSelected(product)
    setBidError('')
    const min = product.minNextBid ?? product.startingBid ?? 0
    const mine = getMyBid(getId(product))
    setBidAmount(mine ? String(mine.amount) : String(min))
    try {
      const d = await apiJson<any>(`/api/products/${getId(product)}`)
      setDetailBids(Array.isArray(d.bids) ? d.bids : [])
      if (d.minNextBid != null) setSelected({ ...product, ...d })
    } catch { setDetailBids([]) }
  }

  const handleBid = async () => {
    if (!selected) return
    const amount = parseFloat(bidAmount)
    const min = selected.minNextBid ?? minNext(selected)
    if (Number.isNaN(amount) || amount < min) {
      setBidError(`Your bid must be at least ₹${min}`)
      return
    }
    setBidError('')
    const res = await apiFetch(`/api/products/${getId(selected)}/bids`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setBidError(data.error || 'Bid failed')
      if (data.minNextBid) setBidAmount(String(data.minNextBid))
      return
    }
    setMsg(`Bid of ₹${amount} placed successfully`)
    setSelected(null)
    await fetchAll()
    setTimeout(() => setMsg(''), 3000)
  }

  const minNext = (p: Product) => {
    if (p.minNextBid != null) return p.minNextBid
    if (p.currentHighestBid != null) return p.currentHighestBid + 1
    return p.startingBid || 0
  }

  const confirmPurchase = async (w: Product) => {
    const res = await apiFetch(`/api/sales/${getId(w)}/confirm-purchase`, { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { alert(data.error || 'Failed'); return }

    if (data.simulate) {
      if (!confirm(`Pay advance ₹${data.amount} now? (Dev mode — Razorpay keys not set)`)) return
      const v = await apiFetch('/api/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ orderId: data.orderId, simulate: true }),
      })
      const vd = await v.json().catch(() => ({}))
      if (!v.ok) alert(vd.error || 'Verify failed')
      else { alert('Advance payment confirmed'); fetchAll() }
      return
    }

    // Real Razorpay Checkout if available
    if (!(window as any).Razorpay) {
      // load script
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://checkout.razorpay.com/v1/checkout.js'
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('Failed to load Razorpay'))
        document.body.appendChild(s)
      }).catch(() => alert('Could not load Razorpay checkout'))
    }
    if (!(window as any).Razorpay) return

    const options = {
      key: data.key,
      amount: data.amountPaise,
      currency: data.currency || 'INR',
      name: 'AgriConnect',
      description: `Advance for ${w.name}`,
      order_id: data.orderId,
      handler: async (response: any) => {
        const v = await apiFetch('/api/payments/razorpay/verify', {
          method: 'POST',
          body: JSON.stringify({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }),
        })
        const vd = await v.json().catch(() => ({}))
        if (!v.ok) alert(vd.error || 'Payment verification failed')
        else { alert('Advance payment verified'); fetchAll() }
      },
    }
    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  }

  const markForInspection = async (w: Product) => {
    await apiFetch(`/api/products/${getId(w)}/delivery-status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'for_inspection' }),
    })
    fetchAll()
  }

  const acceptDelivery = async (w: Product) => {
    await apiFetch(`/api/products/${getId(w)}/delivery-status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'accepted' }),
    })
    fetchAll()
  }

  const reportMismatch = async (w: Product) => {
    if (!mismatchReason.trim()) { alert('Enter mismatch reason'); return }
    const res = await apiFetch(`/api/products/${getId(w)}/report-mismatch-json`, {
      method: 'POST',
      body: JSON.stringify({ reason: mismatchReason }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) alert(data.error || 'Failed')
    else { setMismatchReason(''); alert('Mismatch reported'); fetchAll() }
  }

  const rejectDelivery = async (w: Product) => {
    const res = await apiFetch(`/api/products/${getId(w)}/reject-delivery`, {
      method: 'POST',
      body: JSON.stringify({ reason: mismatchReason || 'Rejected after approved mismatch' }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) alert(data.error || 'Rejected')
    else fetchAll()
  }

  const unread = notifications.filter(n => !n.read).length
  const canBid = (p: Product) => p.status === 'BIDDING_OPEN'

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Bulk buyer dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Hostels · PGs · Big markets — bid on farm volume lots</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <button onClick={() => setShowNotifs(v => !v)} className="relative bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm">
              Alerts
              {unread > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{unread}</span>}
            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-20 max-h-96 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`p-3 border-b text-sm ${n.read ? '' : 'bg-blue-50'}`}>
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-gray-600">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => { clearSession(); router.push('/') }} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </div>
      </div>

      {msg && <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg">{msg}</div>}

      <div className="flex bg-gray-100 rounded-xl p-1 mb-4 w-fit">
        <button onClick={() => setTab('browse')} className={`px-5 py-2 rounded-lg text-sm font-semibold ${tab === 'browse' ? 'bg-white shadow text-blue-700' : 'text-gray-500'}`}>Bulk lots</button>
        <button onClick={() => setTab('wins')} className={`px-5 py-2 rounded-lg text-sm font-semibold ${tab === 'wins' ? 'bg-white shadow text-blue-700' : 'text-gray-500'}`}>My orders ({wins.length})</button>
      </div>

      {tab === 'browse' && (
        <>
          <div className="bg-white border rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search crop..." className="p-2 border rounded" />
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="p-2 border rounded" />
            <select value={status} onChange={e => setStatus(e.target.value)} className="p-2 border rounded bg-white">
              <option value="bidding">Open for bidding</option>
              <option value="available">Available / closed</option>
              <option value="all">All</option>
            </select>
            <div>
              <label className="text-xs text-gray-500">Delivery from</label>
              <input type="date" value={deliveryFrom} onChange={e => setDeliveryFrom(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Delivery to</label>
              <input type="date" value={deliveryTo} onChange={e => setDeliveryTo(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <button onClick={fetchAll} className="p-2 bg-blue-600 text-white rounded font-semibold">Refresh live bids</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => {
              const pid = getId(product)
              const top = product.currentHighestBid ?? getTopBid(pid)?.amount
              const mine = getMyBid(pid)
              const open = canBid(product)
              return (
                <div key={pid} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between mb-1">
                    <h3 className="text-lg font-bold">{product.name}</h3>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{product.status}</span>
                  </div>
                  <p className="text-base font-semibold text-blue-900">Delivery {fmtDate(product.deliveryDate)}</p>
                  <p className="text-sm text-gray-600">📍 {product.location}</p>
                  <p className="text-sm">{product.quantity} {product.unit} · Grade {product.grade || '—'}</p>
                  <p className="text-sm mt-1">Start ₹{product.startingBid}/{product.unit}</p>
                  <p className="text-sm text-orange-600 font-medium">Highest ₹{top ?? '—'} · Min next ₹{minNext(product)}</p>
                  {mine && <p className="text-sm text-green-600">Your bid: ₹{mine.amount}</p>}
                  <p className="text-xs text-gray-500">Closes {fmtDate(product.biddingEndAt)}</p>
                  {(product.photos || []).slice(0, 1).map((photo, i) => (
                    <img key={i} src={`${API}${photo}`} alt="Crop" className="w-full h-28 object-cover rounded mt-2" />
                  ))}
                  {open && (
                    <button onClick={() => openDetail(product)} className="w-full mt-3 bg-blue-600 text-white py-2 rounded text-sm font-semibold">
                      {mine ? 'Raise bid' : 'Bid now'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'wins' && (
        <div className="space-y-4">
          {wins.length === 0 && <p className="text-gray-500">No wins yet.</p>}
          {wins.map(w => (
            <div key={getId(w)} className="bg-white border rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-lg">{w.name}</h3>
                  <p className="text-sm">Delivery {fmtDate(w.deliveryDate)} · {w.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-700">₹{w.totalSaleValue ?? w.soldAmount}</p>
                  <p className="text-xs">@ ₹{w.soldBidAmount}/{w.unit}</p>
                </div>
              </div>
              <p className="text-sm">Advance ₹{w.advanceAmount} ({w.advancePaymentStatus}) · Balance ₹{w.balanceAmount}</p>
              {w.status === 'ADVANCE_PAYMENT_PENDING' && (
                <button onClick={() => confirmPurchase(w)} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold">
                  Confirm purchase & pay advance
                </button>
              )}
              {['DELIVERY_PENDING', 'SALE_CONFIRMED', 'DELIVERED_FOR_INSPECTION', 'PRICE_ADJUSTED'].includes(w.status || '') && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => markForInspection(w)} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">Mark for inspection</button>
                  <button onClick={() => acceptDelivery(w)} className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">Accept delivery</button>
                </div>
              )}
              {['DELIVERY_PENDING', 'DELIVERED_FOR_INSPECTION'].includes(w.status || '') && (
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs text-gray-500 mb-1">Quality/quantity mismatch only — not a normal return</p>
                  <input value={mismatchReason} onChange={e => setMismatchReason(e.target.value)} placeholder="Describe mismatch…" className="w-full p-2 border rounded text-sm mb-2" />
                  <div className="flex gap-2">
                    <button onClick={() => reportMismatch(w)} className="bg-orange-500 text-white px-3 py-1 rounded text-sm">Report mismatch</button>
                    {(w.status === 'REJECTION_APPROVED' || w.mismatch?.adminDecision === 'rejection_approved') && (
                      <button onClick={() => rejectDelivery(w)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Reject delivery</button>
                    )}
                  </div>
                </div>
              )}
              {w.status === 'REJECTION_APPROVED' && (
                <button onClick={() => rejectDelivery(w)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Confirm reject delivery</button>
              )}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-screen overflow-y-auto p-6">
            <h3 className="text-2xl font-bold mb-1">{selected.name}</h3>
            <p className="text-green-800 font-semibold mb-2">Delivery: {fmtDate(selected.deliveryDate)}</p>
            <p className="text-sm text-gray-600 mb-2">{selected.description}</p>
            <p className="text-sm">📍 {selected.location} · {selected.quantity} {selected.unit} · Grade {selected.grade || '—'}</p>
            <div className="bg-gray-50 rounded p-3 my-3 text-sm space-y-1">
              <p>Starting bid: <strong>₹{selected.startingBid}</strong> / {selected.unit}</p>
              <p>Current highest: <strong className="text-orange-600">₹{selected.currentHighestBid ?? '—'}</strong></p>
              <p>Minimum next bid: <strong className="text-blue-700">₹{minNext(selected)}</strong></p>
              <p>Your bid: <strong className="text-green-700">₹{getMyBid(getId(selected))?.amount ?? '—'}</strong></p>
              <p>Bidding closes: <strong>{fmtDate(selected.biddingEndAt)}</strong></p>
            </div>
            <h4 className="font-semibold text-sm mb-2">Bid history</h4>
            <div className="max-h-32 overflow-y-auto mb-3 space-y-1">
              {(detailBids.length ? detailBids : bids.filter(b => b.productId === getId(selected))).map((b, i) => (
                <div key={getId(b) || i} className="flex justify-between text-sm bg-gray-50 px-2 py-1 rounded">
                  <span>{b.marketerName}</span>
                  <span className="font-semibold">₹{b.amount}</span>
                </div>
              ))}
            </div>
            <label className="block text-sm font-medium mb-1">Your bid amount (₹)</label>
            <input type="number" step="0.01" value={bidAmount}
              onChange={e => { setBidAmount(e.target.value); setBidError('') }}
              className="w-full p-2 border rounded mb-1"
              min={minNext(selected)} />
            {bidError && <p className="text-red-500 text-sm mb-2">{bidError}</p>}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleBid}
                disabled={parseFloat(bidAmount) < minNext(selected)}
                className="flex-1 bg-green-600 text-white py-2 rounded font-semibold disabled:opacity-40">
                Place bid
              </button>
              <button onClick={() => setSelected(null)} className="flex-1 bg-gray-500 text-white py-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
