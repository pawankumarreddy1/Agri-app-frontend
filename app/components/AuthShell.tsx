import Image from 'next/image'
import Link from 'next/link'

type AuthShellProps = {
  role: 'farmer' | 'marketer' | 'admin'
  title: string
  subtitle: string
  children: React.ReactNode
}

const ROLE_META: Record<
  AuthShellProps['role'],
  { eyebrow: string; accent: string; accentSoft: string; ctaClass: string }
> = {
  farmer: {
    eyebrow: 'Farmer account',
    accent: 'bg-leaf',
    accentSoft: 'bg-leaf-soft/70',
    ctaClass:
      'w-full bg-leaf hover:bg-leaf-bright text-white py-3.5 rounded-md font-semibold text-[15px] transition-colors disabled:opacity-50',
  },
  marketer: {
    eyebrow: 'Bulk buyer · Hostels · PGs · Markets',
    accent: 'bg-ink',
    accentSoft: 'bg-[#e8ece9]',
    ctaClass:
      'w-full bg-ink hover:bg-[#1f3328] text-white py-3.5 rounded-md font-semibold text-[15px] transition-colors disabled:opacity-50',
  },
  admin: {
    eyebrow: 'Admin access',
    accent: 'bg-[#3d4f45]',
    accentSoft: 'bg-[#eef1ef]',
    ctaClass:
      'w-full bg-[#3d4f45] hover:bg-[#2c3a33] text-white py-3.5 rounded-md font-semibold text-[15px] transition-colors disabled:opacity-50',
  },
}

export default function AuthShell({ role, title, subtitle, children }: AuthShellProps) {
  const meta = ROLE_META[role]

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 sm:py-14 overflow-hidden">
      {/* Distinct field of view — not landing photo hero */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(165deg, #f7f9f6 0%, #eef3ee 40%, #e4ebe5 100%)',
        }}
      />
      {/* Contour / plot-line pattern */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              -12deg,
              transparent,
              transparent 48px,
              rgba(27, 107, 69, 0.05) 48px,
              rgba(27, 107, 69, 0.05) 49px
            ),
            repeating-linear-gradient(
              78deg,
              transparent,
              transparent 72px,
              rgba(20, 36, 28, 0.04) 72px,
              rgba(20, 36, 28, 0.04) 73px
            )
          `,
        }}
      />
      {/* Soft focal glow — abstract, not image-based */}
      <div
        className="absolute top-[-20%] right-[-10%] w-[55vw] max-w-[640px] h-[55vw] max-h-[640px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(196,138,26,0.12) 0%, transparent 68%)',
        }}
      />
      <div
        className="absolute bottom-[-15%] left-[-8%] w-[45vw] max-w-[520px] h-[45vw] max-h-[520px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(27,107,69,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Compact brand chip — not landing nav */}
        <div className="flex items-center justify-between mb-6 px-1">
          <Link href="/" className="inline-flex items-center gap-2 text-ink hover:opacity-80 transition-opacity">
            <Image
              src="/agriconnect-logo.png"
              alt="AgriConnect"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
              priority
            />
            <span className="font-display text-[15px] font-semibold tracking-tight">
              AgriConnect
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-medium text-ink-muted hover:text-ink transition-colors"
          >
            Home
          </Link>
        </div>

        {/* Form surface — focused auth card */}
        <div className="relative bg-white rounded-xl border border-[var(--line)] overflow-hidden shadow-[0_18px_50px_-28px_rgba(12,36,24,0.35)]">
          <div className={`h-1.5 w-full ${meta.accent}`} />

          <div className="px-6 sm:px-8 pt-7 pb-8">
            <p className={`inline-block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted px-2 py-1 rounded ${meta.accentSoft}`}>
              {meta.eyebrow}
            </p>
            <h1 className="font-display mt-4 text-[1.65rem] sm:text-[1.85rem] font-semibold text-ink leading-tight tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              {subtitle}
            </p>

            <div className="mt-7">{children}</div>
          </div>
        </div>

        <p className="mt-6 text-center text-[12px] text-ink-muted/80">
          Secure portal · Phone-verified access where required
        </p>
      </div>
    </div>
  )
}

export function AuthField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export const authInputClass =
  'w-full px-3.5 py-3 rounded-md border border-[var(--line)] bg-[#fbfcfb] text-ink placeholder:text-ink-muted/45 focus:outline-none focus:bg-white focus:border-leaf focus:ring-2 focus:ring-leaf/12 transition-[box-shadow,background-color,border-color] text-[15px]'

export const authBtnPrimary =
  'w-full bg-leaf hover:bg-leaf-bright text-white py-3.5 rounded-md font-semibold text-[15px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

export const authBtnGold =
  'w-full bg-ink hover:bg-[#1f3328] text-white py-3.5 rounded-md font-semibold text-[15px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

export const authSegment = 'flex bg-[#f0f3f1] p-1 rounded-md mb-6'

export function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-[5px] text-sm font-semibold transition-all ${
        active ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null
  return (
    <p className="text-sm text-red-800 bg-red-50 border border-red-100/80 px-3 py-2.5 rounded-md">
      {message}
    </p>
  )
}

/** Role-aware primary button class */
export function roleCtaClass(role: AuthShellProps['role']) {
  return ROLE_META[role].ctaClass
}
