'use client'

import { useState, useEffect, useRef } from 'react'
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
  originalQuantity?: number
  remainingQuantity?: number
  unit?: string
  grade?: string
  startingBid?: number
  unitPrice?: number
  rate?: string
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
  hubName?: string
  hubAddress?: string
  hubCity?: string
  buyerFulfillment?: string
  farmerDropOff?: string
  deliveryStatus?: string
  mismatch?: { reported?: boolean; adminDecision?: string; reason?: string }
}

const API = getApiBase()
const getId = (x: any) => x?._id || x?.id || ''

function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function farmerRate(p: Product) {
  if (p.unitPrice != null) return Number(p.unitPrice)
  if (p.startingBid != null) return Number(p.startingBid)
  const n = parseFloat(String(p.rate || ''))
  return Number.isNaN(n) ? 0 : n
}

export default function MarketersPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [wins, setWins] = useState<Product[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [buyError, setBuyError] = useState('')
  const [buyQty, setBuyQty] = useState('')
  const [buying, setBuying] = useState(false)
  const [tab, setTab] = useState<'browse' | 'wins'>('browse')
  const [q, setQ] = useState('')
  const [location, setLocation] = useState('')
  const [deliveryFrom, setDeliveryFrom] = useState('')
  const [deliveryTo, setDeliveryTo] = useState('')
  const [status, setStatus] = useState('listed')
  const [msg, setMsg] = useState('')
  const [popup, setPopup] = useState<{
    type: 'success' | 'error' | 'wait'
    title: string
    text: string
    retryId?: string
  } | null>(null)
  const [mismatchReason, setMismatchReason] = useState('')
  const prevPayRef = useRef<Record<string, string>>({})

  const showPopup = (type: 'success' | 'error' | 'wait', title: string, text: string, retryId?: string) => {
    setPopup({ type, title, text, retryId })
    if (type !== 'error' || !retryId) {
      setTimeout(() => setPopup(null), type === 'wait' ? 4000 : 3500)
    }
  }

  useEffect(() => {
    const user = getUser()
    if (!user || !localStorage.getItem('token')) { router.push('/login/marketer'); return }
    if (user.role !== 'marketer') {
      router.push('/login/marketer')
      return
    }
    fetchAll()
    const t = setInterval(fetchAll, 10000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!getUser()) return
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

      const [p, w] = await Promise.all([
        apiJson<Product[]>(`/api/products?${params}`),
        apiJson<Product[]>('/api/marketer/wins'),
      ])
      const nextWins = Array.isArray(w) ? w : []
      for (const order of nextWins) {
        const id = getId(order)
        const prev = prevPayRef.current[id]
        const now = order.advancePaymentStatus || ''
        if (prev && prev !== now) {
          if (now === 'paid') showPopup('success', 'Order confirmed', `"${order.name}" — admin received your advance. Delivery will start.`)
          if (now === 'failed') showPopup('error', 'Payment not successful', `Admin did not confirm advance for "${order.name}". Please retry.`, id)
          if (now === 'pending_admin') showPopup('wait', 'Waiting for payment confirmation', `Advance for "${order.name}" is with admin. We will confirm once payment is received.`)
        }
        prevPayRef.current[id] = now
      }
      setProducts(Array.isArray(p) ? p : [])
      setWins(nextWins)
    } catch (err: any) {
      if (err?.status === 401) { clearSession(); router.push('/login/marketer') }
    }
  }

  const openDetail = (product: Product) => {
    setSelected(product)
    setBuyError('')
    const initial = Number(product.remainingQuantity ?? product.quantity ?? 0)
    setBuyQty(String(Math.max(1, Math.floor(initial) || 1)))
  }

  const handleBuy = async (product: Product) => {
    setBuyError('')
    const session = getUser()
    if (!session || session.role !== 'marketer') {
      setBuyError('Please login as a bulk buyer (hostel / PG / market), not farmer or admin.')
      return
    }
    setBuying(true)
    const rawQty = String(buyQty || product.remainingQuantity || product.quantity || 0)
    const qty = product.unit === 'bags' ? parseInt(rawQty, 10) : parseFloat(rawQty)
    if (!Number.isFinite(qty) || qty <= 0) {
      setBuying(false)
      setBuyError('Enter a valid quantity')
      return
    }
    const maxQty = Number(product.remainingQuantity ?? product.quantity ?? 0)
    if (qty > maxQty) {
      setBuying(false)
      setBuyError(`Only ${maxQty} ${product.unit} available`)
      return
    }
    const res = await apiFetch(`/api/products/${getId(product)}/buy`, { method: 'POST', body: JSON.stringify({ quantity: qty }) })
    const data = await res.json().catch(() => ({}))
    setBuying(false)
    if (!res.ok) {
      setBuyError(data.error || 'Could not buy this lot')
      if (data?.remainingQuantity != null && selected) {
        const nextQty = String(data.remainingQuantity)
        setBuyQty(nextQty)
        setSelected({
          ...selected,
          remainingQuantity: Number(data.remainingQuantity),
          quantity: Number(data.remainingQuantity),
        })
      }
      return
    }
    setMsg(`Reserved ${data.quantityBought ?? qty} ${product.unit} at ₹${data.price ?? farmerRate(product)}/${product.unit}. Pay advance in My orders.`)
    setSelected(null)
    setTab('wins')
    await fetchAll()
    setTimeout(() => setMsg(''), 4000)
  }

  const addQty = (delta: number) => {
    if (!selected) return
    const maxQty = Math.max(1, Math.floor(Number(selected.remainingQuantity ?? selected.quantity ?? 1)))
    const current = Math.max(1, parseInt(String(buyQty || '1'), 10) || 1)
    const next = Math.min(maxQty, Math.max(1, current + delta))
    setBuyQty(String(next))
  }

  const setQuickQty = (qty: number) => {
    if (!selected) return
    const maxQty = Math.max(1, Math.floor(Number(selected.remainingQuantity ?? selected.quantity ?? 1)))
    const next = Math.min(maxQty, Math.max(1, qty))
    setBuyQty(String(next))
  }

  const confirmPurchase = async (w: Product) => {
    const res = await apiFetch(`/api/sales/${getId(w)}/confirm-purchase`, { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { showPopup('error', 'Payment failed', data.error || 'Failed to confirm purchase'); return }

    if (data.simulate) {
      const v = await apiFetch('/api/payments/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({ orderId: data.orderId, simulate: true }),
      })
      const vd = await v.json().catch(() => ({}))
      if (!v.ok) showPopup('error', 'Payment failed', vd.error || 'Payment verification failed')
      else {
        showPopup('wait', 'Waiting for payment confirmation', `Advance ₹${data.amount} submitted. Admin will confirm receipt.`)
        fetchAll()
      }
      return
    }

    if (!(window as any).Razorpay) {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://checkout.razorpay.com/v1/checkout.js'
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('Failed to load Razorpay'))
        document.body.appendChild(s)
      }).catch(() => showPopup('error', 'Payment failed', 'Could not load Razorpay checkout'))
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
        if (!v.ok) showPopup('error', 'Payment failed', vd.error || 'Payment verification failed')
        else {
          showPopup('wait', 'Waiting for payment confirmation', `Advance for "${w.name}" submitted. Admin will confirm receipt.`)
          fetchAll()
        }
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
    if (!mismatchReason.trim()) { showPopup('error', 'Mismatch', 'Enter mismatch reason'); return }
    const res = await apiFetch(`/api/products/${getId(w)}/report-mismatch-json`, {
      method: 'POST',
      body: JSON.stringify({ reason: mismatchReason }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) showPopup('error', 'Mismatch', data.error || 'Failed to report mismatch')
    else { setMismatchReason(''); showPopup('success', 'Mismatch reported', 'Admin will review this lot.'); fetchAll() }
  }

  const rejectDelivery = async (w: Product) => {
    const res = await apiFetch(`/api/products/${getId(w)}/reject-delivery`, {
      method: 'POST',
      body: JSON.stringify({ reason: mismatchReason || 'Rejected after approved mismatch' }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) showPopup('error', 'Delivery', data.error || 'Delivery rejection failed')
    else { showPopup('success', 'Delivery rejected', 'This lot was rejected.'); fetchAll() }
  }

  const canBuy = (p: Product) => {
    const openStatus = ['LISTED', 'BIDDING_OPEN', 'SCHEDULED', 'PARTIALLY_SOLD'].includes(p.status || '')
    const available = Number(p.remainingQuantity ?? p.quantity ?? 0) > 0
    return openStatus && available && !p.soldToId
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {popup && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4">
          <div className={`bg-white max-w-sm w-full rounded-xl p-6 shadow-xl border ${
            popup.type === 'success' ? 'border-green-200' : popup.type === 'wait' ? 'border-amber-200' : 'border-red-200'
          }`}>
            <p className={`text-lg font-bold ${
              popup.type === 'success' ? 'text-green-700' : popup.type === 'wait' ? 'text-amber-700' : 'text-red-700'
            }`}>{popup.title}</p>
            <p className="text-sm text-gray-600 mt-2">{popup.text}</p>
            <div className="flex gap-2 mt-5">
              {popup.retryId && (
                <button
                  type="button"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold"
                  onClick={() => {
                    const order = wins.find(x => getId(x) === popup.retryId)
                    setPopup(null)
                    if (order) confirmPurchase(order)
                  }}
                >
                  Retry payment
                </button>
              )}
              <button type="button" onClick={() => setPopup(null)} className="flex-1 bg-gray-500 text-white py-2 rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Bulk buyer dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Hostels · PGs · Markets — order at the farmer’s rate. AgriConnect delivers from Hyderabad.</p>
        </div>
        <div className="flex gap-2 items-center">
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
              <option value="listed">For sale</option>
              <option value="all">All</option>
            </select>
            <div>
              <label className="text-xs text-gray-500">Hub drop-off from</label>
              <input type="date" value={deliveryFrom} onChange={e => setDeliveryFrom(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Hub drop-off to</label>
              <input type="date" value={deliveryTo} onChange={e => setDeliveryTo(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <button onClick={fetchAll} className="p-2 bg-blue-600 text-white rounded font-semibold">Refresh lots</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => {
              const pid = getId(product)
              const price = farmerRate(product)
              const open = canBuy(product)
              return (
                <div key={pid} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between mb-1">
                    <h3 className="text-lg font-bold">{product.name}</h3>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{open ? 'For sale' : product.status}</span>
                  </div>
                  <p className="text-base font-semibold text-blue-900">Hub date {fmtDate(product.deliveryDate)}</p>
                  <p className="text-sm text-gray-600">Farm origin: {product.location}</p>
                  <p className="text-xs text-blue-800 mt-1">{product.buyerFulfillment || 'Distributed from AgriConnect Hyderabad office to your hostel'}</p>
                  <p className="text-sm">
                    Available {product.remainingQuantity ?? product.quantity} {product.unit}
                    {(product.originalQuantity ?? product.quantity) !== (product.remainingQuantity ?? product.quantity)
                      ? ` · Posted ${product.originalQuantity ?? product.quantity} ${product.unit}`
                      : ''}
                    {' · '}Grade {product.grade || '—'}
                  </p>
                  <p className="text-lg font-bold text-green-800 mt-2">₹{price}/{product.unit}</p>
                  <p className="text-xs text-gray-500">Farmer’s fixed rate · Listed until {fmtDate(product.biddingEndAt)}</p>
                  {(product.photos || []).slice(0, 1).map((photo, i) => (
                    <img key={i} src={`${API}${photo}`} alt="Crop" className="w-full h-28 object-cover rounded mt-2" />
                  ))}
                  {open && (
                    <button onClick={() => openDetail(product)} className="w-full mt-3 bg-blue-600 text-white py-2 rounded text-sm font-semibold">
                      Buy at this rate
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
          {wins.length === 0 && <p className="text-gray-500">No purchases yet.</p>}
          {wins.map(w => (
            <div key={getId(w)} className="bg-white border rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-lg">{w.name}</h3>
                  <p className="text-sm">From Hyderabad hub {fmtDate(w.deliveryDate)} · {w.status}</p>
                  <p className="text-sm text-gray-600">Count: {w.quantity} {w.unit}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-700">₹{w.totalSaleValue ?? w.soldAmount}</p>
                  <p className="text-xs">@ ₹{w.soldBidAmount}/{w.unit}</p>
                </div>
              </div>
              <p className="text-sm">
                Advance ₹{w.advanceAmount} ({
                  w.advancePaymentStatus === 'pending_admin' ? 'awaiting admin confirmation'
                    : w.advancePaymentStatus === 'failed' ? 'not received — retry'
                    : w.advancePaymentStatus
                }) · Balance ₹{w.balanceAmount}
              </p>
              {w.status === 'ADVANCE_PAYMENT_PENDING' && w.advancePaymentStatus === 'pending' && (
                <button onClick={() => confirmPurchase(w)} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold">
                  Confirm purchase & pay advance
                </button>
              )}
              {w.status === 'ADVANCE_PAYMENT_PENDING' && w.advancePaymentStatus === 'pending_admin' && (
                <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  Waiting for payment confirmation
                </p>
              )}
              {w.status === 'ADVANCE_PAYMENT_PENDING' && w.advancePaymentStatus === 'failed' && (
                <button onClick={() => confirmPurchase(w)} className="bg-orange-600 text-white px-4 py-2 rounded text-sm font-semibold">
                  Retry payment
                </button>
              )}
              {['DELIVERY_PENDING', 'RECEIVED_AT_HUB', 'DISTRIBUTED_TO_BUYER', 'SALE_CONFIRMED', 'DELIVERED_FOR_INSPECTION', 'PRICE_ADJUSTED'].includes(w.status || '') && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => markForInspection(w)} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">Mark for inspection</button>
                  <button onClick={() => acceptDelivery(w)} className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">Accept delivery</button>
                </div>
              )}
              {['DELIVERY_PENDING', 'RECEIVED_AT_HUB', 'DISTRIBUTED_TO_BUYER', 'DELIVERED_FOR_INSPECTION'].includes(w.status || '') && (
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
            <p className="text-green-800 font-semibold mb-2">Hub drop-off: {fmtDate(selected.deliveryDate)}</p>
            <p className="text-sm text-gray-600 mb-2">{selected.description}</p>
            <p className="text-sm">Farm origin: {selected.location} · {selected.quantity} {selected.unit} · Grade {selected.grade || '—'}</p>
            <p className="text-sm text-blue-800 mt-1">{selected.buyerFulfillment || 'AgriConnect distributes from Hyderabad to your hostel / market'}</p>
            <div className="bg-green-50 border border-green-100 rounded p-3 my-3 text-sm space-y-1">
              <p>Farmer rate: <strong className="text-lg">₹{farmerRate(selected)}</strong> / {selected.unit}</p>
              <p>Available now: <strong>{selected.remainingQuantity ?? selected.quantity} {selected.unit}</strong></p>
              <p>Order total: <strong>₹{(farmerRate(selected) * Number(buyQty || 0)).toFixed(2)}</strong></p>
              <p>Listed until: <strong>{fmtDate(selected.biddingEndAt)}</strong></p>
              <p className="text-xs text-gray-600">You pay this rate. No bidding.</p>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Quantity to buy ({selected.unit})</label>
              <input
                type="number"
                min={selected.unit === 'bags' ? 1 : 0.01}
                step={selected.unit === 'bags' ? 1 : 0.01}
                value={buyQty}
                onChange={e => setBuyQty(e.target.value)}
                className="w-full p-2 border rounded"
              />
              {selected.unit === 'bags' && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {[2, 3, 4, 5, 10].map(n => (
                    <button
                      key={`set-${n}`}
                      type="button"
                      onClick={() => setQuickQty(n)}
                      className="px-3 py-1 rounded bg-blue-50 text-blue-700 text-sm border border-blue-200"
                    >
                      {n} bags
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => addQty(-1)}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm border"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => addQty(1)}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm border"
                  >
                    +1
                  </button>
                </div>
              )}
            </div>
            {buyError && <p className="text-red-500 text-sm mb-2">{buyError}</p>}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleBuy(selected)}
                disabled={buying}
                className="flex-1 bg-green-600 text-white py-2 rounded font-semibold disabled:opacity-40">
                {buying ? 'Buying…' : 'Buy this lot'}
              </button>
              <button onClick={() => setSelected(null)} className="flex-1 bg-gray-500 text-white py-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
