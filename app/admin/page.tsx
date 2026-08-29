'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch, apiJson, clearSession, getUser } from '../lib/api'

interface UserParty {
  id: string
  name: string
  phone: string
  role?: string
  verified?: boolean
  warnings?: number
  registeredAt?: string
  mobile?: string
  profile?: {
    village?: string
    mandal?: string
    district?: string
    state?: string
    address?: string
    businessName?: string
    contactPerson?: string
    farmSize?: string
    cropsGrown?: string
    preferredCrops?: string
    gst?: string
    buyerType?: string
    latitude?: number | null
    longitude?: number | null
    lastLocationLabel?: string
  }
  activity?: { listings?: number; wins?: number; bids?: number }
}

interface Product {
  id?: string
  _id?: string
  name: string
  description?: string
  rate?: string
  startingBid?: number
  unitPrice?: number
  bidCount?: number
  photos?: string[]
  location: string
  latitude?: number
  longitude?: number
  farmerId: string
  mobile?: string
  quantity?: number
  originalQuantity?: number
  remainingQuantity?: number
  unit?: string
  grade?: string
  deliveryDate?: string
  biddingEndAt?: string
  status?: string
  soldTo?: string
  soldToId?: string
  soldAmount?: number
  soldBidAmount?: number
  totalSaleValue?: number
  advanceAmount?: number
  balanceAmount?: number
  commission?: number
  farmerPayout?: number
  advancePaymentStatus?: string
  farmerPayoutStatus?: string
  deliveryStatus?: string
  mismatch?: any
  originalSoldPrice?: number
  revisedSoldPrice?: number
  hubName?: string
  hubAddress?: string
  hubCity?: string
  hubReceivedAt?: string
  hubDistributedAt?: string
  farmerDropOff?: string
  farmer?: UserParty | null
  buyer?: UserParty | null
  farmerName?: string
  farmerPhone?: string
  buyerName?: string
  buyerPhone?: string
}

interface Farmer extends UserParty { mobile?: string }
interface Bid {
  id?: string
  _id?: string
  productId: string
  amount: number
  marketerId: string
  marketerName: string
  marketerPhone?: string
  marketer?: UserParty | null
}
interface Summary {
  totalRevenue: string; totalCommission: string; totalFarmerPayout: string
  pendingMarketerPayments: number; pendingFarmerPayouts: number; commissionRate: number
}
interface Analytics {
  totalCrops: number; soldCrops: number; unsoldCrops: number; activeListings?: number
  totalBids: number; farmers: number; marketers: number; conversionRate: number
  totalRevenue: string; totalCommission: string
  topLocations: { location: string; count: number }[]
}

const getId = (x: any) => x?._id || x?.id || ''
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const fmtDateTime = (d?: string) => d ? new Date(d).toLocaleString('en-IN') : '—'

function partyLocation(p?: UserParty | null) {
  if (!p?.profile) return ''
  const parts = [
    p.profile.lastLocationLabel,
    p.profile.village,
    p.profile.mandal,
    p.profile.district,
    p.profile.state,
    p.profile.address,
  ].filter(Boolean)
  return Array.from(new Set(parts)).join(' · ') || '—'
}

function PartyCard({
  title,
  party,
  fallbackName,
  fallbackPhone,
  accent = 'green',
}: {
  title: string
  party?: UserParty | null
  fallbackName?: string
  fallbackPhone?: string
  accent?: 'green' | 'blue' | 'orange'
}) {
  const colors = {
    green: 'border-green-200 bg-green-50',
    blue: 'border-blue-200 bg-blue-50',
    orange: 'border-orange-200 bg-orange-50',
  }[accent]
  if (!party && !fallbackName && !fallbackPhone) {
    return (
      <div className={`rounded-lg border p-3 text-sm ${colors}`}>
        <p className="font-semibold text-gray-800 mb-1">{title}</p>
        <p className="text-gray-500">Not assigned yet</p>
      </div>
    )
  }
  const name = party?.name || fallbackName || '—'
  const phone = party?.phone || party?.mobile || fallbackPhone || '—'
  return (
    <div className={`rounded-lg border p-3 text-sm ${colors}`}>
      <div className="flex justify-between items-start gap-2 mb-2">
        <p className="font-semibold text-gray-900">{title}</p>
        {party && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${party.verified ? 'bg-green-200 text-green-900' : 'bg-yellow-200 text-yellow-900'}`}>
            {party.verified ? 'Verified account' : 'Unverified'}
          </span>
        )}
      </div>
      <p className="text-base font-bold text-gray-900">{name}</p>
      <p className="mt-1">
        <span className="text-gray-500">Phone:</span>{' '}
        <a href={`tel:${phone}`} className="font-semibold text-blue-700 underline">{phone}</a>
      </p>
      {party?.warnings != null && party.warnings > 0 && (
        <p className="mt-1 text-red-700 font-medium">Warnings: {party.warnings}</p>
      )}
      {party?.registeredAt && (
        <p className="mt-1 text-gray-600"><span className="text-gray-500">Registered:</span> {fmtDateTime(party.registeredAt)}</p>
      )}
      {party && (
        <p className="mt-1 text-gray-600"><span className="text-gray-500">Location:</span> {partyLocation(party)}</p>
      )}
      {party?.profile?.businessName && (
        <p className="mt-1 text-gray-600"><span className="text-gray-500">Business:</span> {party.profile.businessName}</p>
      )}
      {party?.profile?.buyerType && (
        <p className="mt-1 text-gray-600">
          <span className="text-gray-500">Buyer type:</span>{' '}
          {String(party.profile.buyerType).replace(/_/g, ' ')}
        </p>
      )}
      {party?.profile?.contactPerson && (
        <p className="mt-1 text-gray-600"><span className="text-gray-500">Contact person:</span> {party.profile.contactPerson}</p>
      )}
      {party?.profile?.farmSize && (
        <p className="mt-1 text-gray-600"><span className="text-gray-500">Farm size:</span> {party.profile.farmSize}</p>
      )}
      {party?.profile?.gst && (
        <p className="mt-1 text-gray-600"><span className="text-gray-500">GST:</span> {party.profile.gst}</p>
      )}
      {party?.profile?.latitude != null && party?.profile?.longitude != null && (
        <p className="mt-1 text-xs text-gray-500">
          Profile GPS: {Number(party.profile.latitude).toFixed(5)}, {Number(party.profile.longitude).toFixed(5)}
          {' · '}
          <a
            className="text-blue-700 underline"
            href={`https://www.google.com/maps?q=${party.profile.latitude},${party.profile.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            Map
          </a>
        </p>
      )}
      {party?.id && (
        <p className="mt-1 text-[11px] text-gray-400 break-all">User ID: {party.id}</p>
      )}
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [marketers, setMarketers] = useState<UserParty[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [pending, setPending] = useState<any>(null)
  const [audit, setAudit] = useState<any[]>([])
  const [config, setConfig] = useState<any>(null)
  const [tab, setTab] = useState<'crops' | 'listed' | 'payments' | 'delivery' | 'users' | 'analytics' | 'settings'>('crops')
  const [search, setSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')

  useEffect(() => {
    if (!getUser() || !localStorage.getItem('token')) { router.push('/login/admin'); return }
    fetchAll()
    const t = setInterval(fetchAll, 15000)
    return () => clearInterval(t)
  }, [])

  const fetchAll = async () => {
    try {
      const params = search ? `?q=${encodeURIComponent(search)}` : '?status=all'
      const [p, f, m, s, a, pend, aud, c] = await Promise.all([
        apiJson<Product[]>(`/api/products${params}`),
        apiJson<Farmer[]>('/api/farmers'),
        apiJson<UserParty[]>('/api/marketers'),
        apiJson<Summary>('/api/payments/summary'),
        apiJson<Analytics>('/api/admin/analytics'),
        apiJson('/api/admin/pending-actions'),
        apiJson('/api/admin/audit'),
        apiJson('/api/config'),
      ])
      setProducts(Array.isArray(p) ? p : [])
      setFarmers(Array.isArray(f) ? f : [])
      setMarketers(Array.isArray(m) ? m : [])
      if (s && !(s as any).error) setSummary(s)
      if (a && !(a as any).error) setAnalytics(a)
      setPending(pend)
      setAudit(Array.isArray(aud) ? aud : [])
      setConfig(c)
    } catch (err: any) {
      if (err?.status === 401) { clearSession(); router.push('/login/admin') }
    }
  }

  useEffect(() => {
    if (!getUser()) return
    const t = setTimeout(fetchAll, 300)
    return () => clearTimeout(t)
  }, [search])

  const openProduct = async (product: Product) => {
    setSelected(product)
    try {
      const d = await apiJson<any>(`/api/products/${getId(product)}`)
      setSelected({ ...product, ...d })
    } catch { /* keep selected */ }
  }

  const closeListing = async (product: Product) => {
    const reason = prompt('Reason for closing this listing?') || 'Admin closed listing'
    const res = await apiFetch(`/api/products/${getId(product)}/close-listing`, {
      method: 'POST', body: JSON.stringify({ reason }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) alert(data.error || 'Failed')
    else { fetchAll(); setSelected(null) }
  }

  const cancelSale = async (product: Product) => {
    const reason = prompt('Cancellation reason? Lot will be listed again at the farmer rate.')
    if (reason === null) return
    await apiFetch(`/api/products/${getId(product)}/cancel-sale`, { method: 'POST', body: JSON.stringify({ reason }) })
    fetchAll(); setSelected(null)
  }

  const offerNext = async (product: Product) => {
    if (!confirm('List this crop again at the farmer’s rate?')) return
    const res = await apiFetch(`/api/products/${getId(product)}/offer-next-bidder`, { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) alert(data.error || 'Failed')
    else fetchAll()
  }

  const resolveMismatch = async (product: Product, decision: string) => {
    let revisedPrice
    const notes = prompt('Admin notes') || ''
    if (decision === 'price_adjust') {
      const input = prompt('Revised price per unit (₹)', String(product.soldBidAmount || ''))
      if (input == null) return
      revisedPrice = input
    }
    const res = await apiFetch(`/api/products/${getId(product)}/resolve-mismatch`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes, revisedPrice }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) alert(data.error || 'Failed')
    else fetchAll()
  }

  const saveConfig = async () => {
    if (!config) return
    const res = await apiFetch('/api/admin/config', {
      method: 'PATCH',
      body: JSON.stringify({
        minAdvanceDays: config.minAdvanceDays,
        biddingCloseDaysBeforeDelivery: config.biddingCloseDaysBeforeDelivery,
        advancePaymentPercent: config.advancePaymentPercent,
        advancePaymentDeadlineHours: config.advancePaymentDeadlineHours,
        hubName: config.hubName,
        hubAddress: config.hubAddress,
        hubCity: config.hubCity,
        hubPhone: config.hubPhone,
      }),
    })
    if (res.ok) alert('Settings saved')
    else alert('Save failed')
  }

  const deliveryItems = products.filter(p =>
    ['DELIVERY_PENDING', 'RECEIVED_AT_HUB', 'DISTRIBUTED_TO_BUYER', 'DELIVERED_FOR_INSPECTION', 'MISMATCH_REPORTED', 'ADMIN_REVIEW', 'PRICE_ADJUSTED', 'REJECTION_APPROVED'].includes(p.status || '')
  )
  const listedItems = products.filter(p =>
    ['LISTED', 'PARTIALLY_SOLD', 'BIDDING_OPEN', 'SCHEDULED', 'BIDDING_CLOSED'].includes(p.status || '')
  )

  const q = userSearch.trim().toLowerCase()
  const filteredFarmers = farmers.filter(f =>
    !q || [f.name, f.phone, f.mobile, partyLocation(f)].join(' ').toLowerCase().includes(q)
  )
  const filteredMarketers = marketers.filter(m =>
    !q || [m.name, m.phone, m.mobile, partyLocation(m)].join(' ').toLowerCase().includes(q)
  )

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-purple-700">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Hyderabad hub · collect from hostels · commission · settle farmers</p>
        </div>
        <button onClick={() => { clearSession(); router.push('/') }} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">₹{summary.totalRevenue}</p>
            <p className="text-xs text-blue-500 mt-1">Total GMV</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700">₹{summary.totalCommission}</p>
            <p className="text-xs text-green-500 mt-1">Commission ({summary.commissionRate}%)</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-700">{summary.pendingMarketerPayments}</p>
            <p className="text-xs text-orange-500 mt-1">Pending payments</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-700">{summary.pendingFarmerPayouts}</p>
            <p className="text-xs text-purple-500 mt-1">Pending payouts</p>
          </div>
        </div>
      )}

      {pending && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-sm">
          <strong>Pending:</strong> closing soon {pending.closingSoon?.length || 0} · unsold closed {pending.listedAwaitingBuy?.length || pending.bidClosedAwaitingSale?.length || 0} · advance {pending.advancePending?.length || 0} · mismatches {pending.mismatches?.length || 0}
        </div>
      )}

      <div className="flex bg-gray-100 rounded-xl p-1 mb-6 w-full flex-wrap gap-1">
        {([
          ['crops', 'All Crops'],
          ['listed', 'For sale'],
          ['payments', 'Payments'],
          ['delivery', 'Hyderabad hub'],
          ['users', 'People'],
          ['analytics', 'Analytics'],
          ['settings', 'Settings'],
        ] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === k ? 'bg-white shadow text-purple-700' : 'text-gray-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'crops' && (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search crops…" className="w-full md:w-96 p-2 border rounded-lg mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(product => (
              <div key={getId(product)} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between">
                  <h3 className="font-bold">{product.name}</h3>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{product.status}</span>
                </div>
                <p className="text-sm font-medium text-green-800">Hub drop-off {fmtDate(product.deliveryDate)}</p>
                <p className="text-sm">
                  📍 {product.location} · Available {product.remainingQuantity ?? product.quantity} {product.unit}
                  {(product.originalQuantity ?? product.quantity) !== (product.remainingQuantity ?? product.quantity)
                    ? ` · Posted ${product.originalQuantity ?? product.quantity} ${product.unit}`
                    : ''}
                </p>
                {product.latitude != null && product.longitude != null && (
                  <p className="text-xs text-gray-500">
                    Crop GPS: {Number(product.latitude).toFixed(5)}, {Number(product.longitude).toFixed(5)}
                    {' · '}
                    <a className="text-blue-700 underline" href={`https://www.google.com/maps?q=${product.latitude},${product.longitude}`} target="_blank" rel="noreferrer">Map</a>
                  </p>
                )}
                <p className="text-sm mt-1">Farmer rate: ₹{product.unitPrice ?? product.startingBid ?? product.rate}/{product.unit}</p>

                <div className="mt-3 space-y-2 text-xs border-t pt-2">
                  <p>
                    <span className="font-semibold text-green-800">Farmer (seller):</span>{' '}
                    {product.farmer?.name || product.farmerName || '—'}
                    {' · '}
                    <a className="text-blue-700 underline" href={`tel:${product.farmer?.phone || product.farmerPhone || product.mobile || ''}`}>
                      {product.farmer?.phone || product.farmerPhone || product.mobile || '—'}
                    </a>
                    {(product.farmer?.warnings || 0) > 0 && (
                      <span className="ml-1 text-red-600 font-semibold">⚠ {product.farmer?.warnings}</span>
                    )}
                  </p>
                  <p>
                    <span className="font-semibold text-blue-800">
                      {product.soldToId ? 'Buyer (marketer):' : 'Buyer:'}
                    </span>{' '}
                    {product.buyer?.name || product.buyerName || product.soldTo || '—'}
                    {' · '}
                    <a className="text-blue-700 underline" href={`tel:${product.buyer?.phone || product.buyerPhone || ''}`}>
                      {product.buyer?.phone || product.buyerPhone || '—'}
                    </a>
                  </p>
                </div>

                <button onClick={() => openProduct(product)} className="mt-3 w-full bg-purple-500 text-white py-1.5 rounded text-sm">
                  Verify & manage
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'listed' && (
        <div className="space-y-3">
          {listedItems.map(p => (
            <div key={getId(p)} className="bg-white border rounded-xl p-4 flex flex-wrap justify-between gap-3 items-center">
              <div>
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-sm">Hub {fmtDate(p.deliveryDate)} · Listed until {fmtDate(p.biddingEndAt)} · {p.status}</p>
                <p className="text-sm text-green-700 font-semibold">Farmer rate ₹{p.unitPrice ?? p.startingBid ?? p.rate}/{p.unit}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Seller: {p.farmer?.name || p.farmerName || '—'} ({p.farmer?.phone || p.farmerPhone || p.mobile || '—'})
                  {p.soldToId ? ` · Buyer: ${p.buyer?.name || p.soldTo}` : ' · Not purchased yet'}
                </p>
              </div>
              <div className="flex gap-2">
                {['LISTED', 'BIDDING_OPEN', 'SCHEDULED'].includes(p.status || '') && (
                  <button onClick={() => closeListing(p)} className="bg-orange-500 text-white px-3 py-2 rounded text-sm">Close listing</button>
                )}
                <button onClick={() => openProduct(p)} className="bg-gray-100 px-3 py-2 rounded text-sm">Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'payments' && (
        <div className="space-y-3">
          {products.filter(p => p.soldToId).map(p => (
            <div key={getId(p)} className="bg-white border rounded-xl p-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold">{p.name}</h3>
                  <p className="text-sm">Buyer (hostel): {p.soldTo || p.buyer?.name} · Total ₹{p.totalSaleValue ?? p.soldAmount}</p>
                </div>
                <span className="text-xs font-semibold">{p.status}</span>
              </div>
              <div className="grid md:grid-cols-2 gap-2 mt-2">
                <PartyCard title="Farmer (seller)" party={p.farmer} fallbackName={p.farmerName} fallbackPhone={p.farmerPhone || p.mobile} accent="green" />
                <PartyCard title="Marketer (buyer)" party={p.buyer} fallbackName={p.buyerName || p.soldTo} fallbackPhone={p.buyerPhone} accent="blue" />
              </div>
              <p className="text-sm mt-2">Advance ₹{p.advanceAmount} ({p.advancePaymentStatus}) · Balance ₹{p.balanceAmount}</p>
              <p className="text-sm">Commission ₹{p.commission} · Farmer settlement ₹{p.farmerPayout} ({p.farmerPayoutStatus})</p>
              {p.originalSoldPrice && p.revisedSoldPrice && (
                <p className="text-xs text-orange-700">Price adjusted: ₹{p.originalSoldPrice} → ₹{p.revisedSoldPrice}/{p.unit}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {['pending', 'pending_admin'].includes(p.advancePaymentStatus || '') && p.status === 'ADVANCE_PAYMENT_PENDING' && (
                  <>
                    <button onClick={() => apiFetch(`/api/products/${getId(p)}/confirm-advance`, { method: 'PATCH' }).then(r => r.json().then(d => { if (!r.ok) alert(d.error); fetchAll() }))}
                      className="bg-green-600 text-white text-xs px-3 py-1.5 rounded">Receive payment</button>
                    <button onClick={() => apiFetch(`/api/products/${getId(p)}/reject-advance`, { method: 'PATCH' }).then(r => r.json().then(d => { if (!r.ok) alert(d.error); fetchAll() }))}
                      className="bg-red-600 text-white text-xs px-3 py-1.5 rounded">Payment not received</button>
                  </>
                )}
                <button onClick={() => apiFetch(`/api/products/${getId(p)}/marketer-paid`, { method: 'PATCH' }).then(fetchAll)}
                  className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded">Collect hostel payment</button>
                <button onClick={() => apiFetch(`/api/products/${getId(p)}/farmer-paid`, { method: 'PATCH' }).then(r => r.json().then(d => { if (!r.ok) alert(d.error); fetchAll() }))}
                  className="bg-purple-600 text-white text-xs px-3 py-1.5 rounded">Settle farmer (after commission)</button>
                <button onClick={() => cancelSale(p)} className="border border-red-300 text-red-600 text-xs px-3 py-1.5 rounded">Cancel sale</button>
                {(p.status === 'BIDDER_DEFAULTED' || p.advancePaymentStatus === 'expired') && (
                  <button onClick={() => offerNext(p)} className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded">Relist at farmer rate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'delivery' && (
        <div className="space-y-3">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-sm text-purple-900">
            Farmers drop lots at <strong>{config?.hubName || 'AgriConnect Hyderabad Hub'}</strong>
            {config?.hubAddress ? ` — ${config.hubAddress}` : ''}. Receive here, distribute to ordered hostels, collect money, then settle farmers after commission.
          </div>
          {deliveryItems.length === 0 && <p className="text-gray-500">No hub intake or distribution in progress.</p>}
          {deliveryItems.map(p => (
            <div key={getId(p)} className="bg-white border rounded-xl p-4">
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-sm">Hub drop-off {fmtDate(p.deliveryDate)} · {p.status} · {p.deliveryStatus}</p>
              {p.hubReceivedAt && <p className="text-xs text-green-700">Received at hub: {fmtDateTime(p.hubReceivedAt)}</p>}
              {p.hubDistributedAt && <p className="text-xs text-blue-700">Distributed: {fmtDateTime(p.hubDistributedAt)}</p>}
              <div className="grid md:grid-cols-2 gap-2 mt-2">
                <PartyCard title="Farmer (drop-off)" party={p.farmer} fallbackPhone={p.mobile} accent="green" />
                <PartyCard title="Hostel / buyer" party={p.buyer} fallbackName={p.soldTo} accent="blue" />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {['DELIVERY_PENDING', 'SALE_CONFIRMED'].includes(p.status || '') && (
                  <button
                    onClick={() => apiFetch(`/api/products/${getId(p)}/receive-at-hub`, { method: 'POST' }).then(r => r.json().then(d => { if (!r.ok) alert(d.error); fetchAll() }))}
                    className="bg-green-600 text-white text-xs px-3 py-1.5 rounded"
                  >
                    Received at Hyderabad office
                  </button>
                )}
                {p.status === 'RECEIVED_AT_HUB' && (
                  <button
                    onClick={() => apiFetch(`/api/products/${getId(p)}/distribute`, { method: 'POST' }).then(r => r.json().then(d => { if (!r.ok) alert(d.error); fetchAll() }))}
                    className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded"
                  >
                    Distribute to hostel
                  </button>
                )}
                {['DISTRIBUTED_TO_BUYER', 'RECEIVED_AT_HUB'].includes(p.status || '') && (
                  <button
                    onClick={() => apiFetch(`/api/products/${getId(p)}/farmer-paid`, { method: 'PATCH' }).then(r => r.json().then(d => { if (!r.ok) alert(d.error); fetchAll() }))}
                    className="bg-purple-600 text-white text-xs px-3 py-1.5 rounded"
                  >
                    Settle farmer
                  </button>
                )}
              </div>
              {p.mismatch?.reported && (
                <div className="bg-orange-50 border border-orange-200 rounded p-2 mt-2 text-sm">
                  <p><strong>Mismatch:</strong> {p.mismatch.reason}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button onClick={() => resolveMismatch(p, 'price_adjust')} className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Price adjust</button>
                    <button onClick={() => resolveMismatch(p, 'rejection_approved')} className="bg-red-600 text-white text-xs px-2 py-1 rounded">Approve reject</button>
                    <button onClick={() => resolveMismatch(p, 'dismiss')} className="bg-gray-500 text-white text-xs px-2 py-1 rounded">Dismiss</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-6">
          <input
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            placeholder="Search farmer or marketer by name, phone, place…"
            className="w-full md:w-96 p-2 border rounded-lg"
          />
          <div>
            <h2 className="text-lg font-bold text-green-800 mb-2">Farmers ({filteredFarmers.length})</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {filteredFarmers.map(f => (
                <PartyCard key={f.id} title="Farmer account" party={f} accent="green" />
              ))}
              {filteredFarmers.length === 0 && <p className="text-sm text-gray-500">No farmers found.</p>}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-800 mb-2">Marketers ({filteredMarketers.length})</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {filteredMarketers.map(m => (
                <PartyCard key={m.id} title="Marketer account" party={m} accent="blue" />
              ))}
              {filteredMarketers.length === 0 && <p className="text-sm text-gray-500">No marketers found.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === 'analytics' && analytics && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['Crops', analytics.totalCrops], ['Active', analytics.activeListings || 0],
              ['Sold', analytics.soldCrops], ['Unsold', analytics.unsoldCrops],
              ['Purchases', analytics.soldCrops], ['Farmers', analytics.farmers],
              ['Marketers', analytics.marketers], ['Conversion', `${analytics.conversionRate}%`],
            ].map(([l, v]) => (
              <div key={String(l)} className="bg-white border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">{v}</p>
                <p className="text-xs text-gray-500">{l}</p>
              </div>
            ))}
          </div>
          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-semibold mb-2">Audit log (latest)</h3>
            <div className="max-h-64 overflow-y-auto space-y-1 text-xs">
              {audit.map(a => (
                <div key={a.id || a._id} className="flex justify-between border-b py-1">
                  <span>{a.action} · {a.actorRole}</span>
                  <span className="text-gray-400">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'settings' && config && (
        <div className="bg-white border rounded-xl p-5 max-w-lg space-y-3">
          <h3 className="font-semibold text-lg mb-2">Marketplace & Hyderabad hub</h3>
          {[
            ['minAdvanceDays', 'Minimum advance days before hub drop-off'],
            ['biddingCloseDaysBeforeDelivery', 'Stop selling (days before drop-off)'],
            ['advancePaymentPercent', 'Advance payment %'],
            ['advancePaymentDeadlineHours', 'Advance payment deadline (hours)'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-sm font-medium">{label}</label>
              <input type="number" className="w-full p-2 border rounded mt-1"
                value={config[key] ?? ''}
                onChange={e => setConfig({ ...config, [key]: e.target.value })} />
            </div>
          ))}
          {[
            ['hubName', 'Hub name'],
            ['hubAddress', 'Hyderabad office address'],
            ['hubCity', 'City'],
            ['hubPhone', 'Hub phone'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-sm font-medium">{label}</label>
              <input className="w-full p-2 border rounded mt-1"
                value={config[key] ?? ''}
                onChange={e => setConfig({ ...config, [key]: e.target.value })} />
            </div>
          ))}
          <p className="text-xs text-gray-500">Razorpay: {config.razorpayEnabled ? 'configured' : 'not configured (dev simulate payment will be used)'}</p>
          <button onClick={saveConfig} className="bg-purple-600 text-white px-4 py-2 rounded font-semibold">Save settings</button>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-bold">{selected.name}</h3>
            <p className="text-sm text-green-800 font-semibold">Hub drop-off {fmtDate(selected.deliveryDate)} · Listed until {fmtDate(selected.biddingEndAt)}</p>
            <p className="text-sm mt-1">Status: {selected.status} · Farmer rate ₹{selected.unitPrice ?? selected.startingBid ?? selected.rate}/{selected.unit} · Contact: {selected.mobile || '—'}</p>
            <p className="text-sm">Farm origin: {selected.location || '—'}</p>
            <p className="text-sm text-purple-800 mt-1">{selected.farmerDropOff || `Deliver to ${selected.hubName || 'AgriConnect Hyderabad Hub'}`}</p>
            {selected.latitude != null && selected.longitude != null && (
              <p className="text-xs text-gray-600">
                Crop GPS: {Number(selected.latitude).toFixed(5)}, {Number(selected.longitude).toFixed(5)}{' '}
                <a className="text-blue-700 underline" href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`} target="_blank" rel="noreferrer">Open map</a>
              </p>
            )}

            <h4 className="font-semibold mt-4 mb-2">Verify parties (real vs fake)</h4>
            <div className="grid gap-2">
              <PartyCard
                title="Farmer who posted crop"
                party={selected.farmer}
                fallbackName={selected.farmerName}
                fallbackPhone={selected.farmerPhone || selected.mobile}
                accent="green"
              />
              <PartyCard
                title={selected.soldToId ? 'Marketer who bought crop' : 'Buyer (none yet)'}
                party={selected.buyer}
                fallbackName={selected.buyerName || selected.soldTo}
                fallbackPhone={selected.buyerPhone}
                accent="blue"
              />
            </div>

            <div className="space-y-2 mt-4">
              {['LISTED', 'BIDDING_OPEN', 'SCHEDULED'].includes(selected.status || '') && (
                <button onClick={() => closeListing(selected)} className="w-full bg-orange-500 text-white py-2 rounded">Close listing</button>
              )}
              {['DELIVERY_PENDING', 'SALE_CONFIRMED'].includes(selected.status || '') && (
                <button onClick={() => apiFetch(`/api/products/${getId(selected)}/receive-at-hub`, { method: 'POST' }).then(r => r.json().then(d => { if (!r.ok) alert(d.error); else { setSelected(null); fetchAll() } }))}
                  className="w-full bg-green-600 text-white py-2 rounded">Received at Hyderabad office</button>
              )}
              {selected.status === 'RECEIVED_AT_HUB' && (
                <button onClick={() => apiFetch(`/api/products/${getId(selected)}/distribute`, { method: 'POST' }).then(r => r.json().then(d => { if (!r.ok) alert(d.error); else { setSelected(null); fetchAll() } }))}
                  className="w-full bg-blue-600 text-white py-2 rounded">Distribute to hostel</button>
              )}
              {(selected.status === 'ADVANCE_PAYMENT_PENDING' || ['pending', 'pending_admin'].includes(selected.advancePaymentStatus || '')) && selected.soldToId && (
                <>
                  <button
                    onClick={() => apiFetch(`/api/products/${getId(selected)}/confirm-advance`, { method: 'PATCH' }).then(r => r.json().then(d => { if (!r.ok) alert(d.error); else { setSelected(null); fetchAll() } }))}
                    className="w-full bg-green-600 text-white py-2 rounded"
                  >
                    Receive payment
                  </button>
                  <button
                    onClick={() => apiFetch(`/api/products/${getId(selected)}/reject-advance`, { method: 'PATCH' }).then(r => r.json().then(d => { if (!r.ok) alert(d.error); else { setSelected(null); fetchAll() } }))}
                    className="w-full bg-red-600 text-white py-2 rounded"
                  >
                    Payment not received
                  </button>
                </>
              )}
              {selected.soldToId && (
                <button onClick={() => cancelSale(selected)} className="w-full border border-red-300 text-red-600 py-2 rounded">Cancel sale (relist)</button>
              )}
              <button onClick={() => setSelected(null)} className="w-full bg-gray-500 text-white py-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
