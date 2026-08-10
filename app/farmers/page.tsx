'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch, apiJson, clearSession, getApiBase, getUser } from '../lib/api'

interface Product {
  id?: string
  name: string
  description: string
  rate?: string
  startingBid?: number
  currentHighestBid?: number | null
  minNextBid?: number
  bidCount?: number
  photos: string[]
  location: string
  latitude?: number
  longitude?: number
  farmerId: string
  mobile: string
  quantity?: number
  unit?: string
  grade?: string
  harvestDate?: string
  deliveryDate?: string
  biddingEndAt?: string
  status?: string
  soldTo?: string
  soldAmount?: number
  soldBidAmount?: number
  commission?: number
  farmerPayout?: number
  farmerPayoutStatus?: string
  totalSaleValue?: number
}

interface Notification { id: string; title: string; message: string; read: boolean }

const API = getApiBase()

function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function addDaysISO(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export default function FarmersPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'listings' | 'sales'>('listings')
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Product[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [config, setConfig] = useState({ minAdvanceDays: 7, bidIncrement: 1 })
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startingBid, setStartingBid] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [location, setLocation] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationStatus, setLocationStatus] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [mobile, setMobile] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('kg')
  const [grade, setGrade] = useState('')
  const [harvestDate, setHarvestDate] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const farmerIdRef = useRef('')
  const [farmerId, setFarmerId] = useState('')

  useEffect(() => {
    const user = getUser()
    if (!user || !localStorage.getItem('token')) { router.push('/login/farmer'); return }
    farmerIdRef.current = String(user.id || '')
    setFarmerId(farmerIdRef.current)
    if (user.phone && !mobile) setMobile(String(user.phone))
    fetchAll()
    // Prefill last saved farm location if any
    apiJson<any>('/api/me').then(me => {
      const p = me?.profile
      if (p?.lastLocationLabel && !location) setLocation(p.lastLocationLabel)
      if (p?.latitude != null) setLatitude(Number(p.latitude))
      if (p?.longitude != null) setLongitude(Number(p.longitude))
    }).catch(() => { /* ignore */ })
    // Ask for current GPS when dashboard opens
    captureCurrentLocation({ silent: true })
    const t = setInterval(fetchAll, 12000)
    return () => clearInterval(t)
  }, [])

  const captureCurrentLocation = (opts?: { silent?: boolean }) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      if (!opts?.silent) setLocationStatus('Location is not supported on this device/browser.')
      return
    }
    setLocationLoading(true)
    if (!opts?.silent) setLocationStatus('Getting your location…')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setLatitude(lat)
        setLongitude(lng)
        try {
          const data = await apiJson<{ location: string; latitude: number; longitude: number }>(
            `/api/geo/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
          )
          if (data?.location) setLocation(data.location)
          else setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
          setLocationStatus('Current location captured.')
        } catch {
          setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
          setLocationStatus('GPS captured (place name unavailable).')
        } finally {
          setLocationLoading(false)
        }
      },
      (err) => {
        setLocationLoading(false)
        const msg =
          err.code === 1
            ? 'Location permission denied. Allow location access in the browser, then try again.'
            : err.code === 2
              ? 'Location unavailable. Check GPS / network and try again.'
              : 'Location request timed out. Try again.'
        if (!opts?.silent) setLocationStatus(msg)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    )
  }

  const fetchAll = async () => {
    try {
      const [p, s, n, c] = await Promise.all([
        apiJson<Product[]>('/api/products'),
        apiJson<Product[]>('/api/farmer/sales'),
        apiJson<Notification[]>('/api/notifications'),
        apiJson<any>('/api/config'),
      ])
      setProducts(Array.isArray(p) ? p : [])
      setSales(Array.isArray(s) ? s : [])
      setNotifications(Array.isArray(n) ? n : [])
      if (c) setConfig({ minAdvanceDays: c.minAdvanceDays || 7, bidIncrement: c.bidIncrement || 1 })
    } catch (err: any) {
      if (err?.status === 401) { clearSession(); router.push('/login/farmer') }
    }
  }

  const resetForm = () => {
    setEditingProduct(null)
    setName(''); setDescription(''); setStartingBid(''); setDeliveryDate('')
    setLocation(''); setLatitude(null); setLongitude(null); setLocationStatus('')
    setMobile(''); setQuantity(''); setUnit('kg')
    setGrade(''); setHarvestDate(''); setPhotos([])
    const user = getUser()
    if (user?.phone) setMobile(String(user.phone))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('startingBid', startingBid)
    formData.append('deliveryDate', deliveryDate)
    formData.append('location', location)
    if (latitude != null) formData.append('latitude', String(latitude))
    if (longitude != null) formData.append('longitude', String(longitude))
    formData.append('mobile', mobile)
    formData.append('quantity', quantity)
    formData.append('unit', unit)
    formData.append('grade', grade)
    formData.append('harvestDate', harvestDate)
    formData.append('farmerId', farmerIdRef.current)
    photos.forEach(photo => formData.append('photos', photo))

    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
    const method = editingProduct ? 'PUT' : 'POST'
    try {
      const res = await apiFetch(url, { method, body: formData })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setErrorMsg(data.error || 'Error saving crop'); return }
      setSuccessMsg(editingProduct ? 'Crop updated!' : 'Crop published for bidding!')
      resetForm()
      await fetchAll()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch {
      setErrorMsg('Network error — is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    if (product.bidCount && product.bidCount > 0) {
      alert('After bids start you cannot change delivery date, quantity or starting bid.')
    }
    setEditingProduct(product)
    setName(product.name)
    setDescription(product.description || '')
    setStartingBid(String(product.startingBid ?? product.rate ?? ''))
    setDeliveryDate(product.deliveryDate ? product.deliveryDate.slice(0, 10) : '')
    setLocation(product.location || '')
    setLatitude(product.latitude != null ? Number(product.latitude) : null)
    setLongitude(product.longitude != null ? Number(product.longitude) : null)
    setLocationStatus('')
    setMobile(product.mobile || '')
    setQuantity(String(product.quantity ?? ''))
    setUnit(product.unit || 'kg')
    setGrade(product.grade || '')
    setHarvestDate(product.harvestDate || '')
    setTab('listings')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"?`)) return
    const res = await apiFetch(`/api/products/${product.id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) alert(data.error || 'Delete failed')
    else fetchAll()
  }

  const myProducts = products.filter(p => String(p.farmerId) === farmerId)
  const unread = notifications.filter(n => !n.read).length
  const minDelivery = addDaysISO(config.minAdvanceDays)

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h1 className="text-3xl font-bold text-green-700">Farmer Dashboard</h1>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <button onClick={() => setShowNotifs(v => !v)} className="relative bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg text-sm">
              Notifications
              {unread > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{unread}</span>}
            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-20 max-h-96 overflow-y-auto">
                <div className="flex justify-between p-3 border-b">
                  <span className="font-semibold text-sm">Updates</span>
                  <button onClick={() => apiFetch('/api/notifications/read-all', { method: 'POST' }).then(fetchAll)} className="text-xs text-green-600">Mark all read</button>
                </div>
                {notifications.length === 0 && <p className="p-3 text-sm text-gray-400">No notifications</p>}
                {notifications.map(n => (
                  <div key={n.id} className={`p-3 border-b text-sm ${n.read ? '' : 'bg-green-50'}`}>
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

      <div className="flex bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button onClick={() => setTab('listings')} className={`px-5 py-2 rounded-lg text-sm font-semibold ${tab === 'listings' ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}>Listings</button>
        <button onClick={() => setTab('sales')} className={`px-5 py-2 rounded-lg text-sm font-semibold ${tab === 'sales' ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}>Sales ({sales.length})</button>
      </div>

      {successMsg && <div className="mb-4 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg">✅ {successMsg}</div>}
      {errorMsg && <div className="mb-4 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg">{errorMsg}</div>}

      {tab === 'listings' && (
        <>
          <form onSubmit={handleSubmit} className="mb-8 bg-green-50 border border-green-200 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">{editingProduct ? 'Edit bulk crop lot' : 'Post bulk crop lot'}</h2>
            <p className="text-sm text-gray-600 mb-4">
              List volume for hostels, PGs & wholesale markets. Delivery must be at least <strong>{config.minAdvanceDays} days</strong> out (earliest: {minDelivery}). Buyers bid in ₹{config.bidIncrement}+ steps from your starting bid per unit.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Crop Name *</label>
                <input className="w-full p-2 border rounded" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Starting Bid (₹ / unit) *</label>
                <input type="number" step="0.01" min="0.01" className="w-full p-2 border rounded" value={startingBid} onChange={e => setStartingBid(e.target.value)} required />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Delivery Date *</label>
                <input type="date" className="w-full p-2 border rounded" value={deliveryDate} min={minDelivery} onChange={e => setDeliveryDate(e.target.value)} required />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Quantity *</label>
                <input type="number" min="0.01" step="0.01" className="w-full p-2 border rounded" value={quantity} onChange={e => setQuantity(e.target.value)} required />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Unit *</label>
                <select className="w-full p-2 border rounded bg-white" value={unit} onChange={e => setUnit(e.target.value)}>
                  <option value="kg">kg</option>
                  <option value="quintal">quintal</option>
                  <option value="ton">ton</option>
                  <option value="bags">bags</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Grade / Quality</label>
                <input className="w-full p-2 border rounded" value={grade} onChange={e => setGrade(e.target.value)} placeholder="A / B / Premium" />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Harvest / Availability Date</label>
                <input type="date" className="w-full p-2 border rounded" value={harvestDate} onChange={e => setHarvestDate(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium">Farm location *</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    className="w-full p-2 border rounded"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    required
                    placeholder="Use GPS or type village / district"
                  />
                  <button
                    type="button"
                    onClick={() => captureCurrentLocation()}
                    disabled={locationLoading}
                    className="shrink-0 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap"
                  >
                    {locationLoading ? 'Locating…' : 'Use current location'}
                  </button>
                </div>
                {latitude != null && longitude != null && (
                  <p className="mt-1 text-xs text-gray-500">
                    GPS: {latitude.toFixed(5)}, {longitude.toFixed(5)}
                  </p>
                )}
                {locationStatus && (
                  <p className={`mt-1 text-xs ${locationStatus.includes('denied') || locationStatus.includes('unavailable') || locationStatus.includes('timed') ? 'text-red-600' : 'text-green-700'}`}>
                    {locationStatus}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Mobile *</label>
                <input className="w-full p-2 border rounded" value={mobile} onChange={e => setMobile(e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium">Description</label>
                <textarea className="w-full p-2 border rounded" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium">Photos</label>
                <input type="file" multiple accept="image/*" className="w-full p-2 border rounded bg-white" onChange={e => setPhotos(Array.from(e.target.files || []))} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                {loading ? 'Saving...' : editingProduct ? 'Update Crop' : 'Publish Listing'}
              </button>
              {editingProduct && <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>}
            </div>
          </form>

          <h2 className="text-xl font-semibold mb-4">Your Crops ({myProducts.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProducts.map(p => (
              <div key={p.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">{p.status || '—'}</span>
                </div>
                <p className="text-sm font-medium text-green-800">Delivery: {fmtDate(p.deliveryDate)}</p>
                <p className="text-sm">Qty: {p.quantity} {p.unit} · Grade: {p.grade || '—'}</p>
                <p className="text-sm">Start ₹{p.startingBid ?? p.rate}/{p.unit} · High ₹{p.currentHighestBid ?? '—'} · Bids: {p.bidCount || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Closes: {fmtDate(p.biddingEndAt)}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(p.photos || []).map((photo, i) => (
                    <img key={i} src={`${API}${photo}`} alt="Crop" className="w-16 h-16 object-cover rounded" />
                  ))}
                </div>
                {['BIDDING_OPEN', 'SCHEDULED', 'DRAFT'].includes(p.status || '') && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleEdit(p)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                    <button onClick={() => handleDelete(p)} className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm">Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'sales' && (
        <div className="space-y-4">
          {sales.length === 0 && <p className="text-gray-500">No sold crops yet.</p>}
          {sales.map(s => (
            <div key={s.id} className="bg-white border rounded-xl p-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-lg">{s.name}</h3>
                  <p className="text-sm text-gray-500">Sold to {s.soldTo} · Delivery {fmtDate(s.deliveryDate)}</p>
                </div>
                <span className="font-bold text-green-700">₹{s.totalSaleValue ?? s.soldAmount}</span>
              </div>
              <p className="text-sm mt-2">@ ₹{s.soldBidAmount}/{s.unit} · Payout ₹{s.farmerPayout} · {s.farmerPayoutStatus || 'pending'}</p>
              <p className="text-xs text-gray-500 mt-1">Status: {s.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
