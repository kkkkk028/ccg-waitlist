// "use client";
// import Image from "next/image";
// import { useEffect, useRef, useState } from "react";

// type FormState = { firstName: string; lastName: string; email: string };
// type FieldErrors = Partial<Record<keyof FormState, string>>;
// type Status = "idle" | "loading" | "success" | "already" | "error";
// type ToastTone = "success" | "info" | "error";
// type Toast = { id: number; tone: ToastTone; title: string; description?: string };

// const initialForm: FormState = { firstName: "", lastName: "", email: "" };
// const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const NAME_RE = /^[A-Za-zÀ-ÿ' -]{2,40}$/;

// export default function Home() {
//   const [form, setForm] = useState<FormState>(initialForm);
//   const [errors, setErrors] = useState<FieldErrors>({});
//   const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
//   const [status, setStatus] = useState<Status>("idle");
//   const [toasts, setToasts] = useState<Toast[]>([]);
//   const toastIdRef = useRef(0);

//   const pushToast = (tone: ToastTone, title: string, description?: string) => {
//     const id = ++toastIdRef.current;
//     setToasts((t) => [...t, { id, tone, title, description }]);
//     window.setTimeout(() => {
//       setToasts((t) => t.filter((x) => x.id !== id));
//     }, 5000);
//   };

//   const dismissToast = (id: number) =>
//     setToasts((t) => t.filter((x) => x.id !== id));

//   const validateField = (key: keyof FormState, value: string): string | undefined => {
//     const v = value.trim();
//     if (!v) return "Required";
//     if (key === "email" && !EMAIL_RE.test(v)) return "Enter a valid email";
//     if ((key === "firstName" || key === "lastName") && !NAME_RE.test(v))
//       return "2–40 letters only";
//     return undefined;
//   };

//   const validateAll = (data: FormState): FieldErrors => ({
//     firstName: validateField("firstName", data.firstName),
//     lastName: validateField("lastName", data.lastName),
//     email: validateField("email", data.email),
//   });

//   const update =
//     (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
//       const value = e.target.value;
//       setForm((f) => ({ ...f, [key]: value }));
//       if (touched[key]) {
//         setErrors((er) => ({ ...er, [key]: validateField(key, value) }));
//       }
//     };

//   const handleBlur = (key: keyof FormState) => () => {
//     setTouched((t) => ({ ...t, [key]: true }));
//     setErrors((er) => ({ ...er, [key]: validateField(key, form[key]) }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const allErrors = validateAll(form);
//     setTouched({ firstName: true, lastName: true, email: true });
//     setErrors(allErrors);
//     const hasErrors = Object.values(allErrors).some(Boolean);
//     if (hasErrors) {
//       pushToast("error", "Please fix the highlighted fields", "Check the form and try again.");
//       return;
//     }

//     setStatus("loading");

//     try {
//       const res = await fetch("/api/waitlist", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           firstName: form.firstName.trim(),
//           lastName: form.lastName.trim(),
//           email: form.email.trim().toLowerCase(),
//         }),
//       });
//       const data = await res.json().catch(() => ({}));

//       if (res.status === 409) {
//         setStatus("already");
//         pushToast(
//           "info",
//           "You're already on the list ✨",
//           "Sit tight — we'll reach out as access opens up.",
//         );
//         setForm(initialForm);
//         setTouched({});
//         setErrors({});
//         return;
//       }
//       if (!res.ok) {
//         setStatus("error");
//         pushToast("error", "Something went wrong", data.error || "Please try again in a moment.");
//         return;
//       }

//       setStatus("success");
//       pushToast(
//         "success",
//         "You're in! 🎉",
//         "Welcome aboard. Check your inbox for early-access updates.",
//       );
//       setForm(initialForm);
//       setTouched({});
//       setErrors({});
//     } catch {
//       setStatus("error");
//       pushToast("error", "Network error", "We couldn't reach the server. Try again.");
//     }
//   };

//   // Reset visual "done" state after a moment so users can submit another email
//   useEffect(() => {
//     if (status === "success" || status === "already") {
//       const t = window.setTimeout(() => setStatus("idle"), 3500);
//       return () => window.clearTimeout(t);
//     }
//   }, [status]);

//   const loading = status === "loading";
//   const done = status === "success" || status === "already";

//   return (
//     <main className="relative flex h-[100svh] flex-col overflow-hidden bg-[#070a14] text-white antialiased">
//       {/* ===== Background ===== */}
//       <div className="pointer-events-none absolute inset-0 -z-10">
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(56,110,255,0.22),transparent_60%)]" />
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_120%,rgba(120,90,255,0.15),transparent_70%)]" />
//         <div className="absolute inset-0 bg-gradient-to-b from-[#060a18] via-[#070b1a] to-[#04060f]" />
//         <div
//           className="absolute inset-0 opacity-[0.22] animate-[gridDrift_30s_linear_infinite]"
//           style={{
//             backgroundImage:
//               "linear-gradient(rgba(120,170,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(120,170,255,0.22) 1px, transparent 1px)",
//             backgroundSize: "32px 32px",
//             maskImage: "radial-gradient(ellipse at center, black 35%, transparent 85%)",
//             WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 85%)",
//           }}
//         />
//         <div
//           className="absolute inset-0 opacity-[0.14] animate-[gridDriftSlow_60s_linear_infinite]"
//           style={{
//             backgroundImage:
//               "linear-gradient(rgba(180,210,255,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(180,210,255,0.45) 1px, transparent 1px)",
//             backgroundSize: "160px 160px",
//             maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
//             WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
//           }}
//         />
//         <svg
//           className="absolute inset-0 h-full w-full opacity-[0.18]"
//           viewBox="0 0 1200 800"
//           preserveAspectRatio="xMidYMid slice"
//           aria-hidden
//         >
//           <defs>
//             <linearGradient id="bp" x1="0" x2="1" y1="0" y2="1">
//               <stop offset="0%" stopColor="rgba(140,180,255,0.9)" />
//               <stop offset="100%" stopColor="rgba(140,180,255,0.2)" />
//             </linearGradient>
//           </defs>
//           <g fill="none" stroke="url(#bp)" strokeWidth="1" className="animate-[bpDraw_6s_ease-out_both]">
//             <rect x="180" y="160" width="840" height="480" rx="2" />
//             <line x1="180" y1="380" x2="640" y2="380" />
//             <line x1="640" y1="160" x2="640" y2="640" />
//             <line x1="640" y1="500" x2="1020" y2="500" />
//             <line x1="820" y1="160" x2="820" y2="500" />
//             <path d="M 360 380 A 40 40 0 0 1 400 420" />
//             <path d="M 640 240 A 40 40 0 0 0 680 280" />
//             <path d="M 820 500 A 40 40 0 0 1 860 540" />
//             <line x1="180" y1="130" x2="1020" y2="130" strokeDasharray="4 6" />
//             <line x1="180" y1="125" x2="180" y2="135" />
//             <line x1="1020" y1="125" x2="1020" y2="135" />
//             <line x1="1050" y1="160" x2="1050" y2="640" strokeDasharray="4 6" />
//           </g>
//         </svg>
//         <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.18),transparent_70%)] blur-2xl animate-[floatGlow_14s_ease-in-out_infinite]" />
//         <div className="absolute right-[-8%] top-[8%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.14),transparent_70%)] blur-3xl animate-[floatGlow_18s_ease-in-out_infinite_reverse]" />
//         <div className="absolute left-[-8%] bottom-[-10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.12),transparent_70%)] blur-3xl animate-[floatGlow_22s_ease-in-out_infinite]" />
//         <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/40 to-transparent animate-[scanY_8s_linear_infinite]" />
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.85)_100%)]" />
//       </div>

//       {/* ===== Toast layer ===== */}
//       <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:top-6">
//         {toasts.map((t) => (
//           <ToastCard key={t.id} toast={t} onClose={() => dismissToast(t.id)} />
//         ))}
//       </div>

//       {/* ===== Nav ===== */}
//       <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
//         <div className="flex items-center gap-2.5">
//           <a href="/" className="flex items-center gap-2.5">
//             {/* logo here */
//             <Image
//               src="/logo.png"
//               alt="Crane Core Group"
//               width={28}
//               height={28}
//               className="rounded-md"
//             />}
//             <span className="text-sm font-semibold tracking-tight text-white/90"></span>
//           </a>
//           <span className="text-sm font-semibold tracking-tight text-white/90">
//             Crane Core Group
//           </span>
//         </div>
//         <span className="hidden text-[11px] uppercase tracking-[0.18em] text-white/45 sm:block">
//           AI · Construction Intelligence
//         </span>
//       </header>

//       {/* ===== Hero + form ===== */}
//       <section className="relative z-10 flex flex-1 items-center justify-center px-5">
//         <div className="flex w-full max-w-xl flex-col items-center">
//           <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-white/70 backdrop-blur-md animate-[fadeUp_0.7s_ease-out_both]">
//             <span className="relative flex h-1.5 w-1.5">
//               <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
//               <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
//             </span>
//             Now accepting early access
//           </div>

//           <h1 className="whitespace-nowrap text-center text-[clamp(2rem,7vw,4.5rem)] font-semibold leading-[1.02] tracking-tight animate-[fadeUp_0.8s_ease-out_0.05s_both]">
//             <span className="bg-gradient-to-b from-white via-white to-white/55 bg-clip-text text-transparent">
//               Crane Core Group
//             </span>
//           </h1>
//           <p className="mt-3 text-center text-base font-medium text-white/75 sm:text-lg animate-[fadeUp_0.8s_ease-out_0.15s_both]">
//             Blueprints in. Intelligence out.
//           </p>
//           <p className="mt-2 max-w-md text-center text-[13px] leading-relaxed text-white/55 sm:text-sm animate-[fadeUp_0.8s_ease-out_0.25s_both]">
//             AI that reads construction blueprints and floor plans — automating
//             planning, estimation, and execution for modern infrastructure teams.
//           </p>

//           {/* Form card */}
//           <form
//             noValidate
//             onSubmit={handleSubmit}
//             className="mt-6 w-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6 animate-[fadeUp_0.8s_ease-out_0.35s_both]"
//           >
//             <div className="mb-3 flex items-center justify-between">
//               <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
//                 Request access
//               </span>
//               <span className="text-[11px] text-white/35">Step 1 of 1</span>
//             </div>

//             <div className="grid gap-3 sm:grid-cols-2">
//               <Field
//                 id="firstName"
//                 label="First name"
//                 value={form.firstName}
//                 onChange={update("firstName")}
//                 onBlur={handleBlur("firstName")}
//                 autoComplete="given-name"
//                 disabled={loading}
//                 error={touched.firstName ? errors.firstName : undefined}
//                 icon={<UserIcon />}
//               />
//               <Field
//                 id="lastName"
//                 label="Last name"
//                 value={form.lastName}
//                 onChange={update("lastName")}
//                 onBlur={handleBlur("lastName")}
//                 autoComplete="family-name"
//                 disabled={loading}
//                 error={touched.lastName ? errors.lastName : undefined}
//                 icon={<UserIcon />}
//               />
//             </div>
//             <div className="mt-3">
//               <Field
//                 id="email"
//                 type="email"
//                 label="Work email"
//                 value={form.email}
//                 onChange={update("email")}
//                 onBlur={handleBlur("email")}
//                 autoComplete="email"
//                 disabled={loading}
//                 error={touched.email ? errors.email : undefined}
//                 icon={<MailIcon />}
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative mt-5 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-white text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_15px_50px_-10px_rgba(255,255,255,0.55)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-90"
//             >
//               <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
//               <span className="pointer-events-none absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-400/0 via-white/30 to-indigo-400/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60" />
//               <span className="relative z-10 flex items-center gap-2">
//                 {loading ? (
//                   <>
//                     <Spinner />
//                     <span className="animate-[pulseText_1.4s_ease-in-out_infinite]">
//                       Securing your spot…
//                     </span>
//                   </>
//                 ) : done ? (
//                   <span className="flex items-center gap-2 animate-[popIn_0.4s_ease-out_both]">
//                     <Check />
//                     {status === "already" ? "Already on the list" : "You're in"}
//                   </span>
//                 ) : (
//                   <>
//                     Join the waitlist
//                     <Arrow />
//                   </>
//                 )}
//               </span>
//             </button>

//             <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-white/40">
//               <span className="flex items-center gap-1">
//                 <LockIcon /> Encrypted
//               </span>
//               <span className="h-3 w-px bg-white/10" />
//               <span>No spam · Unsubscribe anytime</span>
//             </div>
//           </form>
//         </div>
//       </section>

//       <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 py-3">
//         <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-white/40">
//           <span>© {new Date().getFullYear()} Crane Core Group</span>
//           <span className="hidden sm:block">Designing the future of building.</span>
//         </div>
//       </footer>

//       <style jsx global>{`
//         @keyframes fadeUp { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: translateY(0);} }
//         @keyframes popIn { 0%{opacity:0;transform:scale(.85);}60%{opacity:1;transform:scale(1.06);}100%{transform:scale(1);} }
//         @keyframes pulseText { 0%,100%{opacity:.65;}50%{opacity:1;} }
//         @keyframes floatGlow { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.9;}50%{transform:translate(-50%,-55%) scale(1.08);opacity:1;} }
//         @keyframes gridDrift { 0%{background-position:0 0,0 0;}100%{background-position:32px 32px,32px 32px;} }
//         @keyframes gridDriftSlow { 0%{background-position:0 0,0 0;}100%{background-position:-160px 160px,-160px 160px;} }
//         @keyframes scanY { 0%{transform:translateY(0);opacity:0;}10%{opacity:1;}90%{opacity:1;}100%{transform:translateY(100vh);opacity:0;} }
//         @keyframes bpDraw { from{stroke-dasharray:2400;stroke-dashoffset:2400;} to{stroke-dasharray:2400;stroke-dashoffset:0;} }
//         @keyframes toastIn { from{opacity:0;transform:translateY(-12px) scale(.96);} to{opacity:1;transform:translateY(0) scale(1);} }
//         @keyframes shake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-3px);} 75%{transform:translateX(3px);} }
//       `}</style>
//     </main>
//   );
// }

// /* ---------- Field ---------- */

// function Field({
//   id, label, value, onChange, onBlur, type = "text", autoComplete, disabled, error, icon,
// }: {
//   id: string; label: string; value: string;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   onBlur?: () => void;
//   type?: string; autoComplete?: string; disabled?: boolean;
//   error?: string; icon?: React.ReactNode;
// }) {
//   const filled = value.length > 0;
//   const valid = filled && !error;

//   return (
//     <div className={`group relative ${error ? "animate-[shake_0.35s_ease-in-out]" : ""}`}>
//       <div
//         className={[
//           "relative flex h-12 w-full items-center rounded-xl border bg-white/[0.02] transition-all duration-200",
//           "focus-within:bg-white/[0.05] focus-within:ring-2",
//           error
//             ? "border-red-400/60 focus-within:ring-red-400/25"
//             : valid
//             ? "border-emerald-400/40 focus-within:ring-emerald-400/20 focus-within:border-emerald-400/60"
//             : "border-white/10 focus-within:border-white/30 focus-within:ring-white/15",
//           disabled ? "opacity-70" : "",
//         ].join(" ")}
//       >
//         {icon && (
//           <span
//             className={[
//               "ml-3 flex h-5 w-5 shrink-0 items-center justify-center transition-colors",
//               error ? "text-red-400/80" : valid ? "text-emerald-300/80" : "text-white/35 group-focus-within:text-white/70",
//             ].join(" ")}
//           >
//             {icon}
//           </span>
//         )}
//         <input
//           id={id}
//           name={id}
//           type={type}
//           value={value}
//           onChange={onChange}
//           onBlur={onBlur}
//           autoComplete={autoComplete}
//           disabled={disabled}
//           aria-invalid={!!error}
//           aria-describedby={error ? `${id}-error` : undefined}
//           placeholder=" "
//           className="peer h-full w-full bg-transparent px-3 pt-3.5 pb-1 text-sm text-white outline-none placeholder-transparent disabled:cursor-not-allowed"
//         />
//         <label
//           htmlFor={id}
//           className={[
//             "pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm transition-all duration-200",
//             icon ? "left-10" : "left-3",
//             "text-white/40",
//             "peer-focus:top-3 peer-focus:text-[10px] peer-focus:text-white/75",
//             "peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-white/75",
//           ].join(" ")}
//         >
//           {label}
//         </label>
//         {valid && (
//           <span className="mr-3 flex h-5 w-5 items-center justify-center text-emerald-300 animate-[popIn_0.3s_ease-out_both]">
//             <Check />
//           </span>
//         )}
//       </div>
//       {error && (
//         <p
//           id={`${id}-error`}
//           className="mt-1 pl-1 text-[11px] text-red-400/90 animate-[fadeUp_0.2s_ease-out_both]"
//         >
//           {error}
//         </p>
//       )}
//     </div>
//   );
// }

// /* ---------- Toast ---------- */

// function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
//   const tone = toast.tone;
//   const styles =
//     tone === "success"
//       ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-50"
//       : tone === "info"
//       ? "border-sky-400/30 bg-sky-500/10 text-sky-50"
//       : "border-red-400/30 bg-red-500/10 text-red-50";
//   const Icon = tone === "error" ? AlertIcon : Check;
//   const accent =
//     tone === "success" ? "text-emerald-300" : tone === "info" ? "text-sky-300" : "text-red-300";

//   return (
//     <div
//       role="status"
//       aria-live="polite"
//       className={[
//         "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl",
//         styles,
//         "animate-[toastIn_0.35s_cubic-bezier(0.22,1,0.36,1)_both]",
//       ].join(" ")}
//     >
//       <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center ${accent}`}>
//         <Icon />
//       </span>
//       <div className="flex-1">
//         <p className="text-sm font-semibold leading-snug">{toast.title}</p>
//         {toast.description && (
//           <p className="mt-0.5 text-xs leading-snug text-white/70">{toast.description}</p>
//         )}
//       </div>
//       <button
//         type="button"
//         onClick={onClose}
//         aria-label="Dismiss"
//         className="ml-1 -mr-1 -mt-1 rounded-md p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
//       >
//         <CloseIcon />
//       </button>
//     </div>
//   );
// }

// /* ---------- Icons ---------- */

// function Spinner() {
//   return (
//     <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
//       <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
//       <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
//     </svg>
//   );
// }
// function Arrow() {
//   return (
//     <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
//       viewBox="0 0 24 24" fill="none" stroke="currentColor"
//       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
//       <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
//     </svg>
//   );
// }
// function Check() {
//   return (
//     <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
//       strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
//       <path d="M20 6 9 17l-5-5" />
//     </svg>
//   );
// }
// function UserIcon() {
//   return (
//     <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
//       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
//       <path d="M20 21a8 8 0 1 0-16 0" /><circle cx="12" cy="7" r="4" />
//     </svg>
//   );
// }
// function MailIcon() {
//   return (
//     <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
//       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
//       <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
//     </svg>
//   );
// }
// function LockIcon() {
//   return (
//     <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"
//       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
//       <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 1 1 8 0v4" />
//     </svg>
//   );
// }
// function AlertIcon() {
//   return (
//     <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
//       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
//       <path d="M12 9v4" /><path d="M12 17h.01" />
//       <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
//     </svg>
//   );
// }
// function CloseIcon() {
//   return (
//     <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
//       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
//       <path d="M18 6 6 18" /><path d="m6 6 12 12" />
//     </svg>
//   );
// }


// CLAUDE PERSONAL ACCOUNT 
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
   Constants & validation
───────────────────────────────────────────────────────────────────────────── */

const INITIAL_FORM: FormState = { firstName: "", lastName: "", email: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE  = /^[A-Za-zÀ-ÿ'\- ]{2,40}$/;
const TOAST_TTL = 7000;

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
   Page
───────────────────────────────────────────────────────────────────────────── */

export default function WaitlistPage() {
  const [form,    setForm]    = useState<FormState>(INITIAL_FORM);
  const [errors,  setErrors]  = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [status,  setStatus]  = useState<SubmitStatus>("idle");
  const [toasts,  setToasts]  = useState<ToastItem[]>([]);
  const [ready,   setReady]   = useState(false);
  const counter = useRef(0);

  useEffect(() => {
    const r = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(r);
  }, []);

  useEffect(() => {
    if (status === "success" || status === "duplicate") {
      const t = setTimeout(() => setStatus("idle"), 5000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const addToast = useCallback((variant: ToastVariant, title: string, body?: string) => {
    const id = ++counter.current;
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
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:            #04070f;
          --surface:       rgba(255,255,255,0.032);
          --surface-2:     rgba(255,255,255,0.054);
          --border:        rgba(255,255,255,0.08);
          --border-2:      rgba(255,255,255,0.15);

          --t1: #edf2ff;
          --t2: rgba(210,222,248,0.58);
          --t3: rgba(190,208,242,0.35);
          --t4: rgba(190,208,242,0.55);

          --blue:      #5aaeff;
          --blue-2:    #7ec8ff;
          --blue-dim:  rgba(90,174,255,0.15);
          --blue-glow: rgba(90,174,255,0.09);

          --green:     #34c97b;
          --green-dim: rgba(52,201,123,0.14);
          --red:       #f06868;
          --red-dim:   rgba(240,104,104,0.12);

          --font:  'Sora', system-ui, sans-serif;
          --mono:  'DM Mono', monospace;

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
          /* ── FIXED: much more visible placeholder ── */
          color: rgba(190,210,248,0.55);
          pointer-events: none;
          transition: top .18s ease, font-size .18s ease, color .18s ease, letter-spacing .18s ease;
          white-space: nowrap;
        }
        .fi:focus + .fl,
        .fi:not(:placeholder-shown) + .fl {
          top: 9px; transform: none;
          font-size: 10px;
          font-weight: 500;
          color: var(--blue);
          letter-spacing: .05em;
          text-transform: uppercase;
        }

        /* ── Keyframes ── */
        @keyframes fade-in  { from{opacity:0} to{opacity:1} }
        @keyframes rise     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop      { 0%{opacity:0;transform:scale(.82)} 55%{opacity:1;transform:scale(1.06)} 100%{transform:scale(1)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes ping     { 75%,100%{transform:scale(2.4);opacity:0} }
        @keyframes scan     { 0%{transform:translateY(-2px);opacity:0} 4%{opacity:1} 93%{opacity:.45} 100%{transform:translateY(100vh);opacity:0} }
        @keyframes shake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 50%{transform:translateX(5px)} 75%{transform:translateX(-3px)} }
        @keyframes toast-in { from{opacity:0;transform:translateY(-14px) scale(.95)} to{opacity:1;transform:none} }
        @keyframes err-in   { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
        @keyframes slide-in { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:none} }

        /* ── Responsive helpers ── */
        @media (max-width: 600px) {
          .name-grid { grid-template-columns: 1fr !important; }
          .nav-tagline { display: none !important; }
          .footer-right { display: none !important; }
          .hero-headline { font-size: clamp(2rem, 9vw, 2.8rem) !important; white-space: normal !important; }
          .hero-sub { font-size: 13px !important; }
          .card-pad { padding: 20px 16px 18px !important; }
          .page-pad { padding-left: 18px !important; padding-right: 18px !important; }
          .nav-status-text { display: none !important; }
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
            BACKGROUND
        ══════════════════════════════════════════════════════ */}
        <div aria-hidden style={{
          position: "fixed", inset: 0, zIndex: 0,
          pointerEvents: "none", overflow: "hidden",
        }}>
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
          {/* Blueprint SVG */}
          <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:.055 }}
            viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <g fill="none" stroke="rgba(100,165,255,.9)" strokeWidth=".7">
              <rect x="100" y="70" width="1240" height="760"/>
              <line x1="100" y1="430" x2="720" y2="430"/>
              <line x1="720" y1="70"  x2="720" y2="830"/>
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
          {/* Scan */}
          <div style={{
            position:"absolute", left:0, right:0, top:0, height:1,
            background:"linear-gradient(90deg,transparent,rgba(90,174,255,0.25) 30%,rgba(90,174,255,0.4) 50%,rgba(90,174,255,0.25) 70%,transparent)",
            animation:"scan 16s linear infinite",
          }}/>
        </div>

        {/* ══════════════════════════════════════════════════════
            TOAST — bigger, centred, impossible to miss
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
          {/* ── Left: Logo + Wordmark ── */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {/*
              ════════════════════════════════════════════════════
              YOUR LOGO IMAGE — HOW TO USE YOUR OWN LOGO:
              1. Place your logo file inside the /public folder
                 Example: /public/logo.png  or  /public/logo.svg
              2. Replace the <CraneLogo /> component below with:
                 <img src="/logo.png" alt="Crane Core Group" width={44} height={44}
                   style={{ borderRadius: 10, objectFit:"contain" }} />
              3. Adjust width/height to match your logo's dimensions
              ════════════════════════════════════════════════════
            */}
            <CraneLogo />

            <div>
              {/* Company name — bigger, Sora font */}
              <div style={{
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "rgba(240,245,255,0.95)",
                lineHeight: 1,
                fontFamily: "var(--font)",
              }}>
                Crane Core Group
              </div>
              <div className="nav-tagline" style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--t3)",
                marginTop: 5,
                lineHeight: 1,
              }}>
                Construction Intelligence
              </div>
            </div>
          </div>

          {/* ── Right: Status pill — bigger ── */}
          <div style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"8px 16px",
            borderRadius:40,
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
                position:"relative", width:7, height:7, borderRadius:"50%",
                background:"var(--green)", display:"block",
              }}/>
            </span>
            <span className="nav-status-text" style={{
              fontFamily:"var(--mono)",
              fontSize:11, letterSpacing:"0.14em",
              textTransform:"uppercase", color:"var(--t3)",
              fontWeight: 500,
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

            {/* Category label — bigger */}
            <div style={{
              display:"flex", alignItems:"center", gap:12, marginBottom:22,
              animation:"rise .55s ease .06s both",
            }}>
              <div style={{ width:32, height:1, background:"linear-gradient(90deg,transparent,rgba(90,174,255,0.45))" }}/>
              <span style={{
                fontFamily:"var(--mono)",
                fontSize: 11,
                letterSpacing:"0.24em",
                textTransform:"uppercase",
                color:"rgba(160,200,255,0.55)",
                fontWeight: 500,
              }}>
                AI · Blueprint Intelligence
              </span>
              <div style={{ width:32, height:1, background:"linear-gradient(90deg,rgba(90,174,255,0.45),transparent)" }}/>
            </div>

            {/* Headline — single line */}
            <h1 className="hero-headline" style={{
              margin:0, textAlign:"center",
              fontSize:"clamp(2.2rem,5.5vw,3.6rem)",
              fontWeight:700,
              letterSpacing:"-0.04em",
              lineHeight:1.06,
              whiteSpace:"nowrap",
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

            {/* Sub */}
            <p className="hero-sub" style={{
              margin:"16px 0 0", textAlign:"center",
              fontSize:14.5, lineHeight:1.72,
              color:"var(--t2)", fontWeight:300,
              maxWidth:400,
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

                {/* Card header — NO step counter */}
                <p style={{
                  fontFamily:"var(--mono)",
                  fontSize:10, letterSpacing:"0.22em",
                  textTransform:"uppercase", color:"var(--t3)",
                  marginBottom:18, fontWeight:500,
                }}>
                  Request early access
                </p>

                {/* Name row */}
                <div className="name-grid" style={{
                  display:"grid",
                  gridTemplateColumns:"1fr 1fr",
                  gap:12,
                }}>
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

              {/* Trust line */}
              <div className="trust-line" style={{
                display:"flex", alignItems:"center", justifyContent:"center",
                gap:12, marginTop:14, flexWrap:"wrap",
              }}>
                {[
                  { icon:<LockIcon/>, text:"Encrypted" },
                  null,
                  { icon:null, text:"No spam" },
                  null,
                  { icon:null, text:"Unsubscribe anytime" },
                ].map((item,i) =>
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
          width:"100%",
          padding:"14px 48px 22px",
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
              fontFamily:"var(--mono)",
              fontSize:10.5, color:"var(--t3)", letterSpacing:"0.08em",
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
        background: bg,
        color: isDone ? "var(--green)" : "#04070f",
        fontSize:14, fontWeight:600,
        fontFamily:"var(--font)",
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
    : isValid   ? "rgba(52,201,123,0.35)"
    : focused   ? "rgba(90,174,255,0.45)"
    : "rgba(255,255,255,0.09)";

  const ring = isError  ? "0 0 0 3px rgba(240,104,104,0.11)"
    : isValid   ? "0 0 0 3px rgba(52,201,123,0.10)"
    : focused   ? "0 0 0 3px rgba(90,174,255,0.11)"
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
   Toast — large, centred, impossible to miss
───────────────────────────────────────────────────────────────────────────── */

function Toast({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const cfg = {
    success: {
      bg:"linear-gradient(135deg,rgba(10,28,20,0.98),rgba(8,22,16,0.98))",
      border:"rgba(52,201,123,0.25)",
      bar:"var(--green)",
      icon:<CheckIcon size={18}/>, ic:"var(--green)",
    },
    info: {
      bg:"linear-gradient(135deg,rgba(6,16,32,0.98),rgba(5,12,26,0.98))",
      border:"rgba(90,174,255,0.25)",
      bar:"var(--blue)",
      icon:<InfoIcon/>, ic:"var(--blue)",
    },
    error: {
      bg:"linear-gradient(135deg,rgba(28,8,8,0.98),rgba(22,6,6,0.98))",
      border:"rgba(240,104,104,0.25)",
      bar:"var(--red)",
      icon:<WarnIcon/>, ic:"var(--red)",
    },
  }[item.variant];

  return (
    <div role="alert" style={{
      pointerEvents:"all",
      width:"100%",
      display:"flex", alignItems:"flex-start", gap:14,
      padding:"16px 18px",
      borderRadius:"var(--r-lg)",
      border:`1px solid ${cfg.border}`,
      background: cfg.bg,
      backdropFilter:"blur(28px)",
      boxShadow:`0 24px 64px -12px rgba(0,0,0,0.88), 0 0 0 1px rgba(255,255,255,0.04)`,
      animation:"toast-in .35s cubic-bezier(.22,1,.36,1) both",
      position:"relative",
      overflow:"hidden",
    }}>
      {/* Colour bar on left edge */}
      <div style={{
        position:"absolute", left:0, top:0, bottom:0, width:3,
        background:cfg.bar, borderRadius:"4px 0 0 4px", opacity:.8,
      }}/>

      {/* Icon */}
      <span style={{
        marginTop:1, flexShrink:0,
        color:cfg.ic, display:"flex", alignItems:"center",
        width:32, height:32, borderRadius:8,
        background:`${cfg.ic}18`,
        justifyContent:"center",
      }}>
        {cfg.icon}
      </span>

      {/* Text */}
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{
          margin:0, fontSize:14.5, fontWeight:600,
          color:"var(--t1)", letterSpacing:"-0.015em", lineHeight:1.3,
        }}>
          {item.title}
        </p>
        {item.body && (
          <p style={{
            margin:"5px 0 0", fontSize:13,
            color:"var(--t2)", lineHeight:1.55,
          }}>
            {item.body}
          </p>
        )}
      </div>

      {/* Close */}
      <button onClick={onClose} aria-label="Dismiss"
        style={{
          flexShrink:0, width:28, height:28,
          borderRadius:7, border:"none",
          background:"rgba(255,255,255,0.06)",
          cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"var(--t3)", transition:"background .14s ease, color .14s ease",
          marginTop:-2,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.12)";
          (e.currentTarget as HTMLButtonElement).style.color="var(--t1)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.06)";
          (e.currentTarget as HTMLButtonElement).style.color="var(--t3)";
        }}
      >
        <CloseIcon/>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Logo mark
   ─────────────────────────────────────────────────────────────────────────────
   TO USE YOUR OWN LOGO IMAGE:
   Replace this entire <CraneLogo /> component usage in the nav with:
     <img src="/logo.png" alt="Crane Core Group"
       width={48} height={48} style={{ borderRadius:10, objectFit:"contain" }} />
   Your logo file goes in the /public folder of your project.
───────────────────────────────────────────────────────────────────────────── */

function CraneLogo() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none"
      aria-label="Crane Core Group logo" style={{ flexShrink:0 }}>
      <rect x=".5" y=".5" width="43" height="43" rx="9.5" stroke="rgba(255,255,255,0.1)"/>
      <rect x="1"  y="1"  width="42" height="42" rx="9"   fill="rgba(255,255,255,0.025)"/>
      {/* Mast */}
      <line x1="14" y1="34" x2="14" y2="12" stroke="rgba(237,242,255,0.88)" strokeWidth="2" strokeLinecap="round"/>
      {/* Jib */}
      <line x1="14" y1="12" x2="33" y2="12" stroke="rgba(237,242,255,0.88)" strokeWidth="2" strokeLinecap="round"/>
      {/* Counter-jib */}
      <line x1="14" y1="12" x2="9"  y2="12" stroke="rgba(237,242,255,0.38)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Pendant */}
      <line x1="33" y1="12" x2="33" y2="19" stroke="rgba(237,242,255,0.88)" strokeWidth="2" strokeLinecap="round"/>
      {/* Hook */}
      <path d="M33 19 Q33 23.5 29.5 23.5" stroke="rgba(237,242,255,0.88)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Base */}
      <line x1="9.5" y1="34" x2="18.5" y2="34" stroke="rgba(237,242,255,0.88)" strokeWidth="2" strokeLinecap="round"/>
      {/* Hoist cable */}
      <line x1="25" y1="12" x2="25" y2="29" stroke="rgba(237,242,255,0.22)" strokeWidth="1" strokeDasharray="3 2.5"/>
      {/* Blue trolley dot */}
      <circle cx="33" cy="12" r="2.2" fill="rgba(90,174,255,0.95)"/>
    </svg>
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