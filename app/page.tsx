"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */

type FormState = { firstName: string; lastName: string; email: string };
type FieldKey = keyof FormState;
type FieldErrors = Partial<Record<FieldKey, string>>;
type TouchedFields = Partial<Record<FieldKey, boolean>>;
type SubmitStatus = "idle" | "loading" | "success" | "duplicate" | "error";
type ToastVariant = "success" | "info" | "error";
type ToastItem = { id: number; variant: ToastVariant; title: string; body?: string };

/* ─────────────────────────────────────────────────────────────────────────────
   Particle types
───────────────────────────────────────────────────────────────────────────── */

type Particle = {
  id: number;
  x: number;       // % of viewport width
  y: number;       // % of viewport height
  vx: number;      // velocity x
  vy: number;      // velocity y
  size: number;    // dot radius px
  opacity: number;
};

/* ─────────────────────────────────────────────────────────────────────────────
   Constants & validation
───────────────────────────────────────────────────────────────────────────── */

const INITIAL_FORM: FormState = { firstName: "", lastName: "", email: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE  = /^[A-Za-zÀ-ÿ'\- ]{2,40}$/;
const TOAST_TTL = 7000;

// Social proof — update this number as your real waitlist grows
const WAITLIST_COUNT = 124;

function validateField(key: FieldKey, value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Required";
  if ((key === "firstName" || key === "lastName") && !NAME_RE.test(v))
    return "Letters only, 2–40 characters";
  if (key === "email" && !EMAIL_RE.test(v))
    return "Enter a valid email address";
  return undefined;
}

function validateAll(form: FormState): FieldErrors {
  return {
    firstName: validateField("firstName", form.firstName),
    lastName:  validateField("lastName",  form.lastName),
    email:     validateField("email",     form.email),
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Particle canvas component
───────────────────────────────────────────────────────────────────────────── */

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const countRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PARTICLE_COUNT = 28;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialise particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.018,
      vy: (Math.random() - 0.5) * 0.018,
      size: Math.random() * 1.4 + 0.6,
      opacity: Math.random() * 0.35 + 0.1,
    }));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const pts = particlesRef.current;

      // Update positions
      pts.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        // Wrap around edges
        if (p.x < -1) p.x = 101;
        if (p.x > 101) p.x = -1;
        if (p.y < -1) p.y = 101;
        if (p.y > 101) p.y = -1;
      });

      // Draw connection lines between nearby particles
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const ax = pts[i].x / 100 * w;
          const ay = pts[i].y / 100 * h;
          const bx = pts[j].x / 100 * w;
          const by = pts[j].y / 100 * h;
          const dist = Math.hypot(ax - bx, ay - by);
          const maxDist = 160;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.09;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = `rgba(90,174,255,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw dots with crosshair survey marker
      pts.forEach(p => {
        const px = p.x / 100 * w;
        const py = p.y / 100 * h;
        const r  = p.size;
        const op = p.opacity;

        // Outer crosshair lines
        const arm = r * 3.5;
        ctx.beginPath();
        ctx.moveTo(px - arm, py); ctx.lineTo(px + arm, py);
        ctx.moveTo(px, py - arm); ctx.lineTo(px, py + arm);
        ctx.strokeStyle = `rgba(90,174,255,${op * 0.45})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Centre dot
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(90,174,255,${op})`;
        ctx.fill();

        // Outer ring
        ctx.beginPath();
        ctx.arc(px, py, r * 2.2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(90,174,255,${op * 0.25})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.65,
        pointerEvents: "none",
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Animated counter
───────────────────────────────────────────────────────────────────────────── */

function AnimatedCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef   = useRef<number>(0);
  const DURATION = 1800; // ms

  useEffect(() => {
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed  = ts - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    // Small delay so animation is visible after page load
    const id = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, 600);
    return () => {
      clearTimeout(id);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return <>{display.toLocaleString()}</>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────────── */

export default function WaitlistPage() {
  const [form,    setForm]    = useState<FormState>(INITIAL_FORM);
  const [errors,  setErrors]  = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [status,  setStatus]  = useState<SubmitStatus>("idle");
  const [toasts,  setToasts]  = useState<ToastItem[]>([]);
  const [ready,   setReady]   = useState(false);
  const [count,   setCount]   = useState(WAITLIST_COUNT);
  const toastCounter = useRef(0);

  useEffect(() => {
    const r = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(r);
  }, []);

  useEffect(() => {
    if (status === "success") {
      setCount(c => c + 1);
    }
  }, [status]);

  useEffect(() => {
    if (status === "success" || status === "duplicate") {
      const t = setTimeout(() => setStatus("idle"), 5000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const addToast = useCallback((variant: ToastVariant, title: string, body?: string) => {
    const id = ++toastCounter.current;
    setToasts(p => [...p, { id, variant, title, body }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), TOAST_TTL);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  const handleChange = useCallback((key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm(f => ({ ...f, [key]: value }));
    setTouched(t => ({ ...t, [key]: true }));
    setErrors(er => ({ ...er, [key]: validateField(key, value) }));
  }, []);

  const handleBlur = useCallback((key: FieldKey) => () => {
    setTouched(t => ({ ...t, [key]: true }));
    setErrors(er => ({ ...er, [key]: validateField(key, form[key]) }));
  }, [form]);

  const resetForm = () => { setForm(INITIAL_FORM); setTouched({}); setErrors({}); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const allErrors = validateAll(form);
    setErrors(allErrors);
    setTouched({ firstName: true, lastName: true, email: true });
    if (Object.values(allErrors).some(Boolean)) {
      addToast("error", "Incomplete submission", "Correct the highlighted fields and try again.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName:  form.lastName.trim(),
          email:     form.email.trim().toLowerCase(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setStatus("duplicate");
        addToast("info", "Already registered", "That email is already on the waitlist. We will be in touch soon.");
        resetForm(); return;
      }
      if (!res.ok) {
        setStatus("error");
        addToast("error", "Submission failed", data?.error ?? "An unexpected error occurred. Please try again.");
        return;
      }
      setStatus("success");
      addToast("success", "Request received", "You are on the list. Check your inbox for a confirmation email.");
      resetForm();
    } catch {
      setStatus("error");
      addToast("error", "Network error", "Could not reach the server. Check your connection and try again.");
    }
  };

  const isLoading = status === "loading";
  const isDone    = status === "success" || status === "duplicate";

  return (
    <>
      {/* ── Global styles ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #04070f;
          --surface:   rgba(255,255,255,0.032);
          --surface-2: rgba(255,255,255,0.054);
          --border:    rgba(255,255,255,0.08);
          --border-2:  rgba(255,255,255,0.15);

          --t1: #edf2ff;
          --t2: rgba(210,222,248,0.58);
          --t3: rgba(190,208,242,0.35);
          --t4: rgba(190,208,242,0.55);

          --blue:      #5aaeff;
          --blue-2:    #7ec8ff;
          --blue-dim:  rgba(90,174,255,0.15);

          --green:     #34c97b;
          --red:       #f06868;

          --font: 'Outfit', system-ui, sans-serif;
          --mono: 'DM Mono', monospace;

          --r-sm:  8px;
          --r-md:  13px;
          --r-lg:  18px;
          --r-xl:  22px;
        }

        html { height: 100%; }
        body {
          font-family: var(--font);
          background: var(--bg);
          color: var(--t1);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          min-height: 100%;
          overflow-x: hidden;
        }

        /* ── Float label ── */
        .fi {
          width: 100%; height: 100%;
          background: transparent;
          border: none; outline: none;
          color: var(--t1);
          font-family: var(--font);
          font-size: 14px;
          font-weight: 400;
          padding: 20px 14px 8px;
          caret-color: var(--blue);
        }
        .fi::placeholder { color: transparent; }
        .fi:disabled { cursor: not-allowed; opacity: 0.5; }

        .fl {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          font-family: var(--font);
          font-size: 14px;
          font-weight: 400;
          color: rgba(190,210,248,0.55);
          pointer-events: none;
          transition: top .18s ease, font-size .18s ease, color .18s ease, letter-spacing .18s ease;
          white-space: nowrap;
        }
        .fi:focus + .fl,
        .fi:not(:placeholder-shown) + .fl {
          top: 9px; transform: none;
          font-size: 10px; font-weight: 500;
          color: var(--blue);
          letter-spacing: .05em;
          text-transform: uppercase;
        }

        /* ── Keyframes ── */
        @keyframes fade-in    { from{opacity:0} to{opacity:1} }
        @keyframes rise       { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop        { 0%{opacity:0;transform:scale(.82)} 55%{opacity:1;transform:scale(1.06)} 100%{transform:scale(1)} }
        @keyframes spin       { to{transform:rotate(360deg)} }
        @keyframes ping       { 75%,100%{transform:scale(2.4);opacity:0} }
        @keyframes scan       { 0%{transform:translateY(-2px);opacity:0} 4%{opacity:1} 93%{opacity:.45} 100%{transform:translateY(100vh);opacity:0} }
        @keyframes shake      { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 50%{transform:translateX(5px)} 75%{transform:translateX(-3px)} }
        @keyframes toast-in   { from{opacity:0;transform:translateY(-14px) scale(.95)} to{opacity:1;transform:none} }
        @keyframes err-in     { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
        @keyframes counter-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes dot-pulse  { 0%,100%{opacity:.6} 50%{opacity:1} }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .name-grid    { grid-template-columns: 1fr !important; }
          .nav-tagline  { display: none !important; }
          .footer-right { display: none !important; }
          .hero-headline { font-size: clamp(2rem,9vw,2.8rem) !important; white-space: normal !important; }
          .hero-sub     { font-size: 13px !important; }
          .card-pad     { padding: 20px 16px 18px !important; }
          .page-pad     { padding-left: 18px !important; padding-right: 18px !important; }
          .nav-status-text { display: none !important; }
          /* ── Mobile top border — replaces status pill text ── */
          .mobile-accent-bar { display: block !important; }
        }
        @media (max-width: 400px) {
          .trust-line { flex-wrap: wrap; gap: 8px !important; justify-content: center; }
        }
      `}</style>

      {/* ── Outer shell ─────────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: "100svh",
        opacity: ready ? 1 : 0,
        animation: ready ? "fade-in .4s ease both" : "none",
      }}>

        {/* ══════════════════════════════════════════════════════
            MOBILE ACCENT BAR — 3px blue top border on small screens
            Hidden by default, shown via @media above
        ══════════════════════════════════════════════════════ */}
        <div className="mobile-accent-bar" style={{
          display: "none",  // overridden to block on mobile via CSS
          position: "fixed",
          top: 0, left: 0, right: 0,
          height: 3,
          background: "linear-gradient(90deg, transparent, var(--blue) 30%, var(--blue-2) 50%, var(--blue) 70%, transparent)",
          zIndex: 400,
          opacity: 0.85,
        }} />

        {/* ══════════════════════════════════════════════════════
            BACKGROUND
        ══════════════════════════════════════════════════════ */}
        <div aria-hidden style={{
          position: "fixed", inset: 0, zIndex: 0,
          pointerEvents: "none", overflow: "hidden",
        }}>
          {/* Base gradient */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg,#060c1a 0%,#04070f 52%,#030508 100%)",
          }} />

          {/* Fine grid */}
          <div style={{
            position: "absolute", inset: 0, opacity: .052,
            backgroundImage: `linear-gradient(rgba(80,140,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(80,140,255,.6) 1px,transparent 1px)`,
            backgroundSize: "28px 28px",
          }} />

          {/* Coarse grid */}
          <div style={{
            position: "absolute", inset: 0, opacity: .038,
            backgroundImage: `linear-gradient(rgba(80,140,255,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(80,140,255,.9) 1px,transparent 1px)`,
            backgroundSize: "140px 140px",
          }} />

          {/* Blueprint SVG lines */}
          <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:.05 }}
            viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <g fill="none" stroke="rgba(100,165,255,.9)" strokeWidth=".7">
              <rect x="100" y="70" width="1240" height="760"/>
              <line x1="100" y1="430" x2="720"  y2="430"/>
              <line x1="720" y1="70"  x2="720"  y2="830"/>
              <line x1="720" y1="570" x2="1340" y2="570"/>
              <line x1="1060" y1="70" x2="1060" y2="570"/>
              <rect x="180" y="130" width="460" height="220" strokeDasharray="7 5"/>
              <rect x="180" y="480" width="300" height="200" strokeDasharray="7 5"/>
              <rect x="790" y="130" width="200" height="360" strokeDasharray="7 5"/>
              <line x1="100" y1="40"  x2="1340" y2="40"  strokeDasharray="4 6" strokeOpacity=".5"/>
              <line x1="100" y1="33"  x2="100"  y2="47"/>
              <line x1="720" y1="33"  x2="720"  y2="47"/>
              <line x1="1340" y1="33" x2="1340" y2="47"/>
              <path d="M100 70 L124 70 M100 70 L100 94"/>
              <path d="M1340 70 L1316 70 M1340 70 L1340 94"/>
              <path d="M100 830 L124 830 M100 830 L100 806"/>
              <path d="M1340 830 L1316 830 M1340 830 L1340 806"/>
              <path d="M490 430 A70 70 0 0 1 560 500"/>
              <path d="M720 310 A70 70 0 0 0 790 380"/>
              <line x1="200" y1="510" x2="460" y2="510" strokeOpacity=".4"/>
              <line x1="200" y1="542" x2="460" y2="542" strokeOpacity=".4"/>
              <line x1="200" y1="574" x2="460" y2="574" strokeOpacity=".4"/>
              <circle cx="720" cy="430" r="5" strokeOpacity=".3"/>
            </g>
          </svg>

          {/* ── Particle canvas — drifting survey markers ── */}
          <ParticleCanvas />

          {/* Glows */}
          <div style={{
            position:"absolute", left:"50%", top:"44%",
            width:700, height:700,
            transform:"translate(-50%,-50%)", borderRadius:"50%",
            background:"radial-gradient(circle,rgba(50,110,255,0.09) 0%,transparent 66%)",
            filter:"blur(40px)",
          }}/>
          <div style={{
            position:"absolute", right:"-3%", top:"-2%",
            width:520, height:520, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(90,174,255,0.055) 0%,transparent 65%)",
            filter:"blur(55px)",
          }}/>

          {/* Vignette */}
          <div style={{
            position:"absolute", inset:0,
            background:"radial-gradient(ellipse at center,transparent 34%,rgba(0,0,0,0.78) 100%)",
          }}/>

          {/* Scan line */}
          <div style={{
            position:"absolute", left:0, right:0, top:0, height:1,
            background:"linear-gradient(90deg,transparent,rgba(90,174,255,0.25) 30%,rgba(90,174,255,0.4) 50%,rgba(90,174,255,0.25) 70%,transparent)",
            animation:"scan 16s linear infinite",
          }}/>
        </div>

        {/* ══════════════════════════════════════════════════════
            TOAST STACK
        ══════════════════════════════════════════════════════ */}
        <div aria-live="polite" style={{
          position:"fixed", top:24, left:"50%", transform:"translateX(-50%)",
          zIndex:300,
          display:"flex", flexDirection:"column", alignItems:"center", gap:10,
          width:"calc(100% - 32px)", maxWidth:480,
          pointerEvents:"none",
        }}>
          {toasts.map(t => <Toast key={t.id} item={t} onClose={() => removeToast(t.id)} />)}
        </div>

        {/* ══════════════════════════════════════════════════════
            NAV
        ══════════════════════════════════════════════════════ */}
        <header className="page-pad" style={{
          position:"relative", zIndex:10,
          width:"100%",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"24px 48px",
          animation:"rise .5s ease both",
        }}>
          {/* Left — Logo + wordmark */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {/*
              ── YOUR LOGO ──────────────────────────────────────────
              Logo file: /public/logo.png
              To swap: replace the <img> below with your own file.
              ────────────────────────────────────────────────────── */}
            <img
              src="/logo.png"
              alt="Crane Core Group"
              width={44}
              height={44}
              style={{ borderRadius: 10, objectFit: "contain", flexShrink: 0 }}
            />
            <div>
              <div style={{
                fontSize:17, fontWeight:700,
                letterSpacing:"-0.03em",
                color:"rgba(240,245,255,0.95)",
                lineHeight:1, fontFamily:"var(--font)",
              }}>
                Crane Core Group
              </div>
              <div className="nav-tagline" style={{
                fontFamily:"var(--mono)",
                fontSize:10, letterSpacing:"0.18em",
                textTransform:"uppercase",
                color:"var(--t3)",
                marginTop:5, lineHeight:1,
              }}>
                Construction Intelligence
              </div>
            </div>
          </div>

          {/* Right — Status pill */}
          <div style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"8px 16px", borderRadius:40,
            border:"1px solid rgba(255,255,255,0.09)",
            background:"rgba(255,255,255,0.03)",
            backdropFilter:"blur(16px)",
          }}>
            <span style={{ position:"relative", display:"flex", width:7, height:7 }}>
              <span style={{
                position:"absolute", inset:0, borderRadius:"50%",
                background:"var(--green)",
                animation:"ping 2.2s ease-out infinite", opacity:.55,
              }}/>
              <span style={{
                position:"relative", width:7, height:7,
                borderRadius:"50%", background:"var(--green)", display:"block",
              }}/>
            </span>
            <span className="nav-status-text" style={{
              fontFamily:"var(--mono)",
              fontSize:11, letterSpacing:"0.14em",
              textTransform:"uppercase", color:"var(--t3)", fontWeight:500,
            }}>
              Early access open
            </span>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════
            MAIN
        ══════════════════════════════════════════════════════ */}
        <main style={{
          position:"relative", zIndex:10,
          flex:1,
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"20px 20px 32px",
        }}>
          <div style={{
            width:"100%", maxWidth:520,
            display:"flex", flexDirection:"column", alignItems:"center",
          }}>

            {/* Category label */}
            <div style={{
              display:"flex", alignItems:"center", gap:12, marginBottom:22,
              animation:"rise .55s ease .06s both",
            }}>
              <div style={{ width:32, height:1, background:"linear-gradient(90deg,transparent,rgba(90,174,255,0.45))" }}/>
              <span style={{
                fontFamily:"var(--mono)", fontSize:11,
                letterSpacing:"0.24em", textTransform:"uppercase",
                color:"rgba(160,200,255,0.55)", fontWeight:500,
              }}>
                AI · Blueprint Intelligence
              </span>
              <div style={{ width:32, height:1, background:"linear-gradient(90deg,rgba(90,174,255,0.45),transparent)" }}/>
            </div>

            {/* Headline */}
            <h1 className="hero-headline" style={{
              margin:0, textAlign:"center",
              fontSize:"clamp(2.4rem,6vw,4rem)",
              fontWeight:700, letterSpacing:"-0.01em",
              lineHeight:1.06, whiteSpace:"nowrap",
              animation:"rise .6s ease .1s both",
            }}>
              <span style={{
                background:"linear-gradient(150deg,#edf2ff 0%,rgba(237,242,255,0.78) 55%,rgba(120,165,255,0.42) 100%)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              }}>
                Blueprints into{" "}
              </span>
              <span style={{
                background:"linear-gradient(145deg,#7ec8ff 0%,#5aaeff 50%,rgba(90,174,255,0.55) 100%)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              }}>
                Intelligence.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="hero-sub" style={{
              margin:"16px 0 0", textAlign:"center",
              fontSize:14.5, lineHeight:1.72,
              color:"var(--t2)", fontWeight:300, maxWidth:400,
              animation:"rise .6s ease .16s both",
            }}>
              AI systems that read architectural drawings, automate resource estimation,
              and accelerate decision-making across construction and infrastructure projects.
            </p>

            {/* Divider */}
            <div style={{
              width:"100%", margin:"26px 0", height:1,
              background:"linear-gradient(90deg,transparent,var(--border) 25%,var(--border) 75%,transparent)",
              animation:"rise .6s ease .2s both",
            }}/>

            {/* ── FORM ── */}
            <form noValidate onSubmit={handleSubmit} style={{
              width:"100%",
              animation:"rise .6s ease .24s both",
            }}>
              {/* Glass card */}
              <div className="card-pad" style={{
                background:"linear-gradient(158deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.012) 100%)",
                border:"1px solid rgba(255,255,255,0.09)",
                borderRadius:"var(--r-xl)",
                padding:"26px 26px 22px",
                boxShadow:"0 48px 96px -24px rgba(0,0,0,0.9),inset 0 1px 0 rgba(255,255,255,0.05)",
                backdropFilter:"blur(32px)",
              }}>
                {/* Card header */}
                <p style={{
                  fontFamily:"var(--mono)", fontSize:10,
                  letterSpacing:"0.22em", textTransform:"uppercase",
                  color:"var(--t3)", marginBottom:18, fontWeight:500,
                }}>
                  Request early access
                </p>

                {/* Name row */}
                <div className="name-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <Field id="firstName" label="First name"
                    value={form.firstName} onChange={handleChange("firstName")} onBlur={handleBlur("firstName")}
                    autoComplete="given-name" disabled={isLoading}
                    error={touched.firstName ? errors.firstName : undefined}/>
                  <Field id="lastName" label="Last name"
                    value={form.lastName} onChange={handleChange("lastName")} onBlur={handleBlur("lastName")}
                    autoComplete="family-name" disabled={isLoading}
                    error={touched.lastName ? errors.lastName : undefined}/>
                </div>

                {/* Email */}
                <div style={{ marginTop:12 }}>
                  <Field id="email" label="Work email" type="email"
                    value={form.email} onChange={handleChange("email")} onBlur={handleBlur("email")}
                    autoComplete="email" disabled={isLoading}
                    error={touched.email ? errors.email : undefined}/>
                </div>

                {/* Submit */}
                <SubmitButton isLoading={isLoading} isDone={isDone} status={status}/>
              </div>

              {/* ── Social proof counter ── */}
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"center",
                gap:8, marginTop:16,
                animation:"counter-in .6s ease .5s both",
              }}>
                {/* Facepile dots */}
                <div style={{ display:"flex", alignItems:"center" }}>
                  {["rgba(90,174,255,0.7)","rgba(52,201,123,0.7)","rgba(160,130,255,0.7)","rgba(240,180,80,0.7)"].map((color, i) => (
                    <div key={i} style={{
                      width:20, height:20, borderRadius:"50%",
                      background:`radial-gradient(circle at 35% 35%, ${color}, rgba(20,28,50,0.9))`,
                      border:"1.5px solid rgba(255,255,255,0.12)",
                      marginLeft: i === 0 ? 0 : -7,
                      position:"relative", zIndex: 4 - i,
                    }}/>
                  ))}
                </div>
                <p style={{
                  fontSize:12.5, color:"var(--t3)", fontWeight:400,
                  display:"flex", alignItems:"baseline", gap:4,
                }}>
                  <span style={{
                    fontFamily:"var(--mono)", fontSize:13,
                    fontWeight:500, color:"var(--t4)",
                    animation:"dot-pulse 3s ease-in-out infinite",
                  }}>
                    <AnimatedCounter target={count} />
                  </span>
                  <span>teams already on the waitlist</span>
                </p>
              </div>

              {/* Trust line */}
              <div className="trust-line" style={{
                display:"flex", alignItems:"center", justifyContent:"center",
                gap:12, marginTop:10, flexWrap:"wrap",
              }}>
                {[
                  { icon:<LockIcon/>, text:"Encrypted" },
                  null,
                  { icon:null, text:"No spam" },
                  null,
                  { icon:null, text:"Unsubscribe anytime" },
                ].map((item, i) =>
                  item === null
                    ? <div key={i} style={{ width:1, height:11, background:"var(--border)" }}/>
                    : <span key={i} style={{
                        display:"flex", alignItems:"center", gap:5,
                        fontSize:11.5, color:"var(--t3)", fontWeight:400,
                      }}>
                        {item.icon}{item.text}
                      </span>
                )}
              </div>
            </form>
          </div>
        </main>

        {/* ══════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════ */}
        <footer className="page-pad" style={{
          position:"relative", zIndex:10,
          width:"100%", padding:"14px 48px 22px",
          animation:"rise .5s ease .28s both",
        }}>
          <div style={{
            borderTop:"1px solid rgba(255,255,255,0.07)",
            paddingTop:14,
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <span style={{ fontSize:11.5, color:"var(--t3)" }}>
              © {new Date().getFullYear()} Crane Core Group
            </span>
            <span className="footer-right" style={{
              fontFamily:"var(--mono)", fontSize:10.5,
              color:"var(--t3)", letterSpacing:"0.08em",
            }}>
              Designing the future of infrastructure
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Submit button
───────────────────────────────────────────────────────────────────────────── */

function SubmitButton({ isLoading, isDone, status }: {
  isLoading: boolean; isDone: boolean; status: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const bg = isDone
    ? "linear-gradient(135deg,rgba(52,201,123,0.14),rgba(52,201,123,0.07))"
    : hovered
    ? "linear-gradient(135deg,#72ccff 0%,#52aaee 100%)"
    : "linear-gradient(135deg,#5aaeff 0%,#3d8de8 100%)";

  const shadow = isDone ? "none"
    : hovered ? "0 8px 36px -6px rgba(90,174,255,0.6)"
    : "0 4px 24px -6px rgba(90,174,255,0.38)";

  return (
    <button
      type="submit"
      disabled={isLoading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        marginTop:18, width:"100%", height:50,
        borderRadius:"var(--r-md)",
        border: isDone ? "1px solid rgba(52,201,123,0.3)" : "1px solid rgba(150,210,255,0.22)",
        cursor: isLoading ? "not-allowed" : "pointer",
        background: bg, color: isDone ? "var(--green)" : "#04070f",
        fontSize:14, fontWeight:600, fontFamily:"var(--font)",
        letterSpacing:"-0.01em",
        display:"flex", alignItems:"center", justifyContent:"center", gap:9,
        transition:"background .2s ease, box-shadow .2s ease, transform .1s ease",
        opacity: isLoading ? .7 : 1,
        boxShadow: shadow,
        transform: pressed ? "scale(0.985)" : hovered && !isLoading && !isDone ? "translateY(-1px)" : "none",
        position:"relative", overflow:"hidden",
      }}
    >
      {isLoading ? (
        <><SpinnerIcon/><span>Processing…</span></>
      ) : isDone ? (
        <span style={{ display:"flex", alignItems:"center", gap:8, animation:"pop .4s ease both" }}>
          <CheckIcon size={16}/>
          {status === "duplicate" ? "Already registered" : "Request received"}
        </span>
      ) : (
        <><span>Request early access</span><ArrowIcon/></>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Field
───────────────────────────────────────────────────────────────────────────── */

interface FieldProps {
  id: string; label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void; type?: string; autoComplete?: string;
  disabled?: boolean; error?: string;
}

function Field({ id, label, value, onChange, onBlur, type="text", autoComplete, disabled, error }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const isFilled = value.length > 0;
  const isValid  = isFilled && !error;
  const isError  = !!error;

  const borderColor = isError  ? "rgba(240,104,104,0.5)"
    : isValid  ? "rgba(52,201,123,0.35)"
    : focused  ? "rgba(90,174,255,0.45)"
    : "rgba(255,255,255,0.09)";

  const ring = isError  ? "0 0 0 3px rgba(240,104,104,0.11)"
    : isValid  ? "0 0 0 3px rgba(52,201,123,0.10)"
    : focused  ? "0 0 0 3px rgba(90,174,255,0.11)"
    : "none";

  return (
    <div style={{ animation: isError ? "shake .32s ease" : undefined }}>
      <div style={{
        position:"relative", height:52,
        borderRadius:"var(--r-md)",
        border:`1px solid ${borderColor}`,
        background: focused ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
        transition:"border-color .17s ease, box-shadow .17s ease, background .17s ease",
        boxShadow: ring,
        display:"flex", alignItems:"center",
      }}>
        <input
          id={id} name={id} type={type} value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          autoComplete={autoComplete} disabled={disabled}
          placeholder=" "
          aria-invalid={isError}
          aria-describedby={isError ? `${id}-err` : undefined}
          className="fi"
          style={{ paddingRight: (isValid || isError) ? 40 : 14 }}
        />
        <label htmlFor={id} className="fl">{label}</label>
        {isValid && (
          <span style={{
            position:"absolute", right:13, pointerEvents:"none",
            color:"var(--green)", display:"flex", alignItems:"center",
            animation:"pop .25s ease both",
          }}>
            <CheckIcon size={15}/>
          </span>
        )}
        {isError && (
          <span style={{
            position:"absolute", right:13, pointerEvents:"none",
            color:"var(--red)", display:"flex", alignItems:"center",
          }}>
            <XIcon/>
          </span>
        )}
      </div>
      {isError && (
        <p id={`${id}-err`} role="alert" style={{
          margin:"5px 0 0 2px", fontSize:11.5,
          color:"rgba(240,104,104,0.8)",
          animation:"err-in .2s ease both", lineHeight:1.4,
        }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Toast
───────────────────────────────────────────────────────────────────────────── */

function Toast({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const cfg = {
    success: {
      bg:"linear-gradient(135deg,rgba(10,28,20,0.98),rgba(8,22,16,0.98))",
      border:"rgba(52,201,123,0.25)", bar:"var(--green)",
      icon:<CheckIcon size={18}/>, ic:"var(--green)",
    },
    info: {
      bg:"linear-gradient(135deg,rgba(6,16,32,0.98),rgba(5,12,26,0.98))",
      border:"rgba(90,174,255,0.25)", bar:"var(--blue)",
      icon:<InfoIcon/>, ic:"var(--blue)",
    },
    error: {
      bg:"linear-gradient(135deg,rgba(28,8,8,0.98),rgba(22,6,6,0.98))",
      border:"rgba(240,104,104,0.25)", bar:"var(--red)",
      icon:<WarnIcon/>, ic:"var(--red)",
    },
  }[item.variant];

  return (
    <div role="alert" style={{
      pointerEvents:"all", width:"100%",
      display:"flex", alignItems:"flex-start", gap:14,
      padding:"16px 18px",
      borderRadius:"var(--r-lg)",
      border:`1px solid ${cfg.border}`,
      background:cfg.bg,
      backdropFilter:"blur(28px)",
      boxShadow:"0 24px 64px -12px rgba(0,0,0,0.88),0 0 0 1px rgba(255,255,255,0.04)",
      animation:"toast-in .35s cubic-bezier(.22,1,.36,1) both",
      position:"relative", overflow:"hidden",
    }}>
      <div style={{
        position:"absolute", left:0, top:0, bottom:0, width:3,
        background:cfg.bar, borderRadius:"4px 0 0 4px", opacity:.8,
      }}/>
      <span style={{
        marginTop:1, flexShrink:0, color:cfg.ic,
        display:"flex", alignItems:"center",
        width:32, height:32, borderRadius:8,
        background:`${cfg.ic}18`, justifyContent:"center",
      }}>
        {cfg.icon}
      </span>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{
          margin:0, fontSize:14.5, fontWeight:600,
          color:"var(--t1)", letterSpacing:"-0.015em", lineHeight:1.3,
        }}>
          {item.title}
        </p>
        {item.body && (
          <p style={{ margin:"5px 0 0", fontSize:13, color:"var(--t2)", lineHeight:1.55 }}>
            {item.body}
          </p>
        )}
      </div>
      <button onClick={onClose} aria-label="Dismiss" style={{
        flexShrink:0, width:28, height:28, borderRadius:7,
        border:"none", background:"rgba(255,255,255,0.06)",
        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
        color:"var(--t3)", transition:"background .14s ease, color .14s ease", marginTop:-2,
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color="var(--t1)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color="var(--t3)"; }}
      >
        <CloseIcon/>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Icons
───────────────────────────────────────────────────────────────────────────── */

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      style={{ animation:"spin .75s linear infinite", flexShrink:0 }} aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="rgba(4,7,15,0.18)" strokeWidth="2.5"/>
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
    </svg>
  );
}
function CheckIcon({ size=16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="2"/>
      <path d="M8 11V7a4 4 0 1 1 8 0v4"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>
      <path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  );
}