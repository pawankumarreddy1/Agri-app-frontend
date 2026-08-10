import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-ink overflow-x-hidden">
      {/* Full-bleed hero composition */}
      <header className="relative min-h-[100svh] flex flex-col">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/farm-hero.jpg"
            alt=""
            fill
            priority
            className="object-cover object-center ac-ken"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 ac-animate-in"
            style={{
              background:
                'linear-gradient(105deg, rgba(12,36,24,0.88) 0%, rgba(12,36,24,0.72) 42%, rgba(12,36,24,0.35) 100%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.12] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, #f5e6c8 0, transparent 40%), radial-gradient(circle at 80% 80%, #2f8f5b 0, transparent 35%)',
            }}
          />
        </div>

        <nav className="relative z-20 flex items-center justify-between gap-4 px-5 sm:px-8 py-5 max-w-7xl mx-auto w-full">
          <a href="#" className="flex items-center gap-2.5 group">
            <Image
              src="/agriconnect-logo.png"
              alt="AgriConnect"
              width={40}
              height={40}
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-md bg-white/10"
              priority
            />
            <span className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-white">
              AgriConnect
            </span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#buyers" className="hover:text-white transition-colors">Who buys</a>
            <a href="#roles" className="hover:text-white transition-colors">Get started</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <a
            href="#roles"
            className="text-sm font-semibold text-leaf-deep bg-white/95 hover:bg-white px-4 py-2 rounded-md transition-colors"
          >
            Open app
          </a>
        </nav>

        <div className="relative z-10 flex-1 flex items-center px-5 sm:px-8 pb-16 pt-6">
          <div className="max-w-7xl mx-auto w-full">
            <div className="max-w-2xl">
              <div className="ac-animate-up flex items-center gap-4 sm:gap-5 mb-6">
                <Image
                  src="/agriconnect-logo.png"
                  alt=""
                  width={72}
                  height={72}
                  className="w-14 h-14 sm:w-[4.5rem] sm:h-[4.5rem] object-contain rounded-xl bg-white/10 shadow-sm"
                  priority
                />
              </div>
              <p className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-semibold leading-[0.95] tracking-tight text-white ac-animate-up">
                AgriConnect
              </p>
              <h1 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-medium text-white/95 leading-snug max-w-xl ac-animate-up-delay">
                Bulk farm orders for hostels, PGs & big markets.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-white/75 max-w-md leading-relaxed ac-animate-up-delay">
                Farmers list produce by the sack, quintal, or ton. Hostels, PGs, messes, and wholesale markets bid for bulk supply with clear delivery dates.
              </p>
              <div className="mt-9 flex flex-wrap gap-3 ac-animate-up-delay-2">
                <a
                  href="#roles"
                  className="inline-flex items-center justify-center bg-gold text-ink font-semibold px-7 py-3.5 rounded-md text-base hover:brightness-110 transition-[filter,transform] hover:-translate-y-0.5"
                >
                  Order in bulk
                </a>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center border border-white/35 text-white font-medium px-7 py-3.5 rounded-md text-base hover:bg-white/10 transition-colors"
                >
                  See how it works
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-5 sm:px-8 pb-6">
          <div className="max-w-7xl mx-auto flex items-end justify-between gap-4 text-white/50 text-xs sm:text-sm">
            <span>Field → bulk kitchens & markets · India</span>
            <a href="#how" className="hover:text-white/80 transition-colors hidden sm:inline">
              Scroll for process
            </a>
          </div>
        </div>
      </header>

      {/* How it works — one job */}
      <section id="how" className="relative py-20 sm:py-28 px-5 sm:px-8">
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, #d8ebe0 0%, transparent 70%)',
          }}
        />
        <div className="max-w-5xl mx-auto">
          <p className="font-display text-sm text-leaf tracking-wide">How bulk supply works</p>
          <h2 className="font-display mt-2 text-3xl sm:text-4xl md:text-5xl font-semibold text-ink tracking-tight max-w-xl leading-[1.1]">
            From farm volume to institutional kitchen.
          </h2>

          <ol className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {[
              {
                n: '01',
                title: 'Farmers list bulk lots',
                body: 'Quantity, grade, unit (kg / quintal / ton / bags), starting bid, and delivery date when produce is ready.',
              },
              {
                n: '02',
                title: 'Hostels & markets bid',
                body: 'Bulk buyers compete for supply. Highest valid bid wins when the window closes—before delivery day.',
              },
              {
                n: '03',
                title: 'Confirm & receive volume',
                body: 'Winner pays advance, kitchen or market receives the full lot on the agreed date, admin settles fairly.',
              },
            ].map((step) => (
              <li key={step.n} className="relative">
                <span className="font-display text-5xl text-leaf/20 font-semibold leading-none tabular-nums">
                  {step.n}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-ink-muted leading-relaxed text-[15px]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features — product capabilities */}
      <section id="features" className="py-20 sm:py-28 px-5 sm:px-8 bg-[var(--bg)]">
        <div className="max-w-5xl mx-auto">
          <p className="font-display text-sm text-leaf tracking-wide">Features</p>
          <h2 className="font-display mt-2 text-3xl sm:text-4xl md:text-5xl font-semibold text-ink tracking-tight max-w-2xl leading-[1.1]">
            Everything you need for bulk farm trade.
          </h2>
          <p className="mt-4 text-ink-muted max-w-xl text-lg leading-relaxed">
            Delivery-date bidding, volume lots, advance payment, and fair close—built for farmers and institutional buyers.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
            {[
              {
                title: 'Bulk crop listings',
                body: 'Farmers post quantity, unit (kg / quintal / ton / bags), grade, photos, starting bid, and harvest date as full volume lots.',
              },
              {
                title: 'Mandatory delivery date',
                body: 'Every listing requires a delivery day with a minimum advance window—so hostels and markets can plan kitchens and logistics.',
              },
              {
                title: 'Competitive bidding ladder',
                body: 'Buyers raise the price in transparent steps. Each new bid must beat the current high by the minimum increment (default ₹1).',
              },
              {
                title: 'Live min next bid',
                body: 'Everyone sees the next valid price. Concurrent bids are checked safely on the server so collisions cannot cheat the ladder.',
              },
              {
                title: 'Auto-close before delivery',
                body: 'Bidding ends a set number of days before delivery (configurable), or admin closes early when the kitchen needs certainty.',
              },
              {
                title: 'Farmer GPS location',
                body: 'Growers capture current farm location with place name and coordinates—so buyers and admin can trust where produce originates.',
              },
              {
                title: 'Hostel, PG & market profiles',
                body: 'Bulk buyers register by type—hostel, PG, big market, wholesale, mess, or caterer—with business name and delivery address.',
              },
              {
                title: 'Filter by delivery window',
                body: 'Buyers search lots by place, date range, and status to stock next week’s mess or mandi—not random retail pickups.',
              },
              {
                title: 'Winner + advance payment',
                body: 'Admin selects the winner; buyer confirms with advance (Razorpay when configured). Sale totals track quantity × winning bid.',
              },
              {
                title: 'Delivery inspection & mismatch',
                body: 'After delivery, accept the lot or report quality/quantity mismatch. Admin can price-adjust, approve rejection, or dismiss—no fake “returns” on accepted goods.',
              },
              {
                title: 'Farmer sales & payouts',
                body: 'Farmers see won lots, commission, and payout status. Admin marks farmer paid after settlement.',
              },
              {
                title: 'Admin verification & audit',
                body: 'See who posted and who bid—name, phone, buyer type, warnings, registration date—to confirm real vs fake accounts. Full audit log and analytics.',
              },
              {
                title: 'In-app notifications',
                body: 'New bids, winner selection, advance requests, and delivery alerts keep farmers and bulk buyers in the loop.',
              },
              {
                title: 'Secure accounts',
                body: 'Phone + password login for farmers and bulk buyers, with forgot-password reset. Admin portal for operations only.',
              },
            ].map((item, i) => (
              <article
                key={item.title}
                className="border-t border-[var(--line)] py-7 group"
              >
                <div className="flex gap-4 items-start">
                  <span className="font-display text-sm tabular-nums text-leaf/70 font-semibold mt-0.5 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-ink group-hover:text-leaf transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[15px] text-ink-muted leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Who buys — bulk institutions */}
      <section id="buyers" className="py-20 sm:py-24 px-5 sm:px-8 bg-leaf-deep text-white">
        <div className="max-w-5xl mx-auto">
          <p className="font-display text-sm text-leaf-soft/80 tracking-wide">Built for volume buyers</p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl font-semibold leading-tight max-w-2xl">
            One platform for every place that needs produce in bulk—not retail bags for home.
          </h2>
          <ul className="mt-12 grid sm:grid-cols-2 gap-x-10 gap-y-8">
            {[
              {
                title: 'Hostels & PGs',
                body: 'Mess managers source weekly vegetables, rice, and staples at competitive bulk prices with fixed delivery dates.',
              },
              {
                title: 'College & working mens hostels',
                body: 'Plan large-volume kitchen stocks ahead. Bid once, stock for the week—less market runaround.',
              },
              {
                title: 'Big markets & wholesale',
                body: 'Mandi traders and large retailers lock farm-direct lots before peak demand, with transparent bidding.',
              },
              {
                title: 'Caterers & institutional mess',
                body: 'Canteens, factory kitchens, and event caterers secure quality produce in sacks and quintals.',
              },
            ].map((item) => (
              <li key={item.title} className="border-t border-white/15 pt-6">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-white/65 leading-relaxed">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why — single column */}
      <section className="py-20 sm:py-24 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-12 md:gap-16 items-start">
          <div className="md:col-span-5">
            <p className="font-display text-sm text-leaf tracking-wide">Why AgriConnect</p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl font-semibold leading-tight text-ink">
              Bulk deals with delivery dates—not last-minute retail chaos.
            </h2>
          </div>
          <ul className="md:col-span-7 space-y-8">
            {[
              {
                title: 'Volume-first listings',
                body: 'Farmers post real bulk quantity. You bid for the full lot—suited to hostel messes and wholesale floors.',
              },
              {
                title: 'Plan around delivery day',
                body: 'Know when the crop lands so cooks, vans, and cold storage can prepare—not scramble same-day.',
              },
              {
                title: 'Fair close & settlements',
                body: 'Admin finalizes winners, advance confirms the purchase, and payouts stay trackable for both sides.',
              },
            ].map((item) => (
              <li key={item.title} className="border-t border-[var(--line)] pt-6">
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-ink-muted leading-relaxed">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Get started */}
      <section id="roles" className="py-20 sm:py-28 px-5 sm:px-8 bg-leaf-soft/35">
        <div className="max-w-5xl mx-auto">
          <p className="font-display text-sm text-leaf tracking-wide">Get started</p>
          <h2 className="font-display mt-2 text-3xl sm:text-4xl md:text-5xl font-semibold text-ink tracking-tight">
            Farmers supply. Bulk buyers bid.
          </h2>
          <p className="mt-4 text-ink-muted max-w-lg text-lg">
            Hostels, PGs, and big-market buyers enter as bulk buyers. Growers list production volume.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <Link
              href="/login/farmer"
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-leaf to-leaf-bright text-white p-7 min-h-[220px] flex flex-col justify-between transition-transform hover:-translate-y-1"
            >
              <div>
                <p className="text-white/70 text-sm font-medium">For growers</p>
                <h3 className="font-display text-3xl font-semibold mt-2">Farmer</h3>
                <p className="mt-3 text-white/80 text-sm leading-relaxed">
                  List bulk harvests for hostel messes and wholesale buyers. Track bids and payouts.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                Enter portal
                <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
              </span>
            </Link>

            <Link
              href="/login/marketer"
              className="group relative overflow-hidden rounded-lg bg-ink text-white p-7 min-h-[220px] flex flex-col justify-between transition-transform hover:-translate-y-1"
            >
              <div>
                <p className="text-white/60 text-sm font-medium">Hostels · PGs · Markets</p>
                <h3 className="font-display text-3xl font-semibold mt-2">Bulk buyer</h3>
                <p className="mt-3 text-white/75 text-sm leading-relaxed">
                  Bid on volume lots by delivery date. Win supply for kitchens and trading floors.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold-soft">
                Enter portal
                <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
              </span>
            </Link>

            <Link
              href="/login/admin"
              className="group relative overflow-hidden rounded-lg border border-[var(--line)] bg-white text-ink p-7 min-h-[220px] flex flex-col justify-between transition-transform hover:-translate-y-1 hover:border-leaf/30"
            >
              <div>
                <p className="text-ink-muted text-sm font-medium">Operations</p>
                <h3 className="font-display text-3xl font-semibold mt-2">Admin</h3>
                <p className="mt-3 text-ink-muted text-sm leading-relaxed">
                  Verify farmers & bulk buyers, close bidding, settle advance and deliveries.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-leaf">
                Enter portal
                <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 sm:py-24 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <div>
            <p className="font-display text-sm text-leaf tracking-wide">Contact</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl font-semibold text-ink tracking-tight max-w-md">
              Onboarding a hostel chain or wholesale desk?
            </h2>
            <p className="mt-4 text-ink-muted max-w-sm">
              We help farmers and bulk buyers (hostels, PGs, markets) get set up for recurring volume orders.
            </p>
          </div>
          <div className="flex flex-col gap-4 text-[15px]">
            <a href="tel:+919481230859" className="font-semibold text-ink hover:text-leaf transition-colors">
              +91 94812 30859
            </a>
            <a
              href="mailto:pavankumarreddy635@gmail.com"
              className="text-ink-muted hover:text-leaf transition-colors break-all"
            >
              pavankumarreddy635@gmail.com
            </a>
            <a
              href="https://wa.me/919481230859"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit font-semibold text-leaf border-b border-leaf/40 pb-0.5 hover:border-leaf transition-colors"
            >
              Message on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] bg-[var(--bg)] px-5 sm:px-8 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="font-display text-lg font-semibold text-ink flex items-center gap-2">
            <Image src="/agriconnect-logo.png" alt="" width={28} height={28} className="w-7 h-7 object-contain" />
            AgriConnect
          </p>
          <p className="text-sm text-ink-muted">Bulk crops for hostels, PGs & big markets</p>
          <div className="flex gap-5 text-sm text-ink-muted">
            <a href="#how" className="hover:text-ink transition-colors">How it works</a>
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#roles" className="hover:text-ink transition-colors">Get started</a>
            <a href="#contact" className="hover:text-ink transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
