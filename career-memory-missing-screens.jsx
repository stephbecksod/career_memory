import { useState } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:"#F5F0E8", card:"#FAF7F2", cardHover:"#F2EBE0",
  cardBorder:"rgba(173,156,142,0.18)", cardShadow:"0 1px 4px rgba(42,33,24,0.04)",
  moss:"#5C7A52", mossDeep:"#4A6642", mossGlow:"rgba(92,122,82,0.22)",
  mossFaint:"rgba(92,122,82,0.08)", mossBorder:"rgba(92,122,82,0.2)",
  amber:"#C9941A", amberFaint:"rgba(201,148,26,0.1)", amberBorder:"rgba(201,148,26,0.18)",
  umber:"#AD9C8E", walnut:"#2A2118", blush:"#D9BBB0", divider:"rgba(173,156,142,0.2)",
  danger:"#B05A40", dangerFaint:"rgba(176,90,64,0.08)", dangerBorder:"rgba(176,90,64,0.2)",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Back:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.walnut} strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  X:       ({ size=16, color=C.umber }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:   ({ color=C.moss, size=13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Chevron: ({ dir="right", color=C.umber, size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">{dir==="right"&&<polyline points="9 18 15 12 9 6"/>}{dir==="down"&&<polyline points="6 9 12 15 18 9"/>}{dir==="up"&&<polyline points="18 15 12 9 6 15"/>}</svg>,
  Eye:     ({ off }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.umber} strokeWidth="2" strokeLinecap="round">{off?<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}</svg>,
  Building:({ color=C.umber, size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1"/></svg>,
  Bell:    ({ color=C.umber, size=16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Sparkle: ({ color="rgba(255,255,255,0.85)", size=16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
  Mic:     ({ color="white", size=18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Plus:    ({ color=C.moss, size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash:   ({ color=C.danger }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  Edit:    ({ color=C.umber }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Globe:   ({ color=C.umber }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Toggle:  ({ on }) => (
    <div style={{ width:42, height:24, borderRadius:12, background:on?C.moss:C.blush, position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left:on?19:3, width:18, height:18, borderRadius:"50%", background:"white", transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  ),
  Google: () => <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
  Apple:  () => <svg width="17" height="17" viewBox="0 0 24 24" fill={C.walnut}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>,
};

// ─── Shared Components ────────────────────────────────────────────────────────
function StatusBar({ light }) {
  const col = light ? "rgba(255,255,255,0.9)" : C.walnut;
  return (
    <div style={{ height:44, padding:"0 26px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:500, color:col }}>9:41</span>
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill={col}><rect x="0" y="3" width="3" height="9" rx="0.5" opacity="0.4"/><rect x="4.5" y="2" width="3" height="10" rx="0.5" opacity="0.6"/><rect x="9" y="0.5" width="3" height="11.5" rx="0.5"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke={col} strokeOpacity="0.35"/><rect x="2" y="2" width="16" height="8" rx="2" fill={col}/><path d="M23 4v4a2 2 0 0 0 0-4z" fill={col} fillOpacity="0.4"/></svg>
      </div>
    </div>
  );
}

function SectionLabel({ children, style }) {
  return <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase", color:C.umber, ...style }}>{children}</div>;
}

function FieldLabel({ children, required }) {
  return (
    <label style={{ display:"block", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", color:C.umber, marginBottom:7 }}>
      {children}{required && <span style={{ color:C.danger, marginLeft:3 }}>*</span>}
    </label>
  );
}

function TextInput({ label, required, value, onChange, placeholder, type="text", hint, showToggle, onToggle, showPw }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div style={{ position:"relative" }}>
        <input type={showToggle?(showPw?"text":"password"):type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ width:"100%", background:C.card, border:`1.5px solid ${C.cardBorder}`, borderRadius:12, padding:"12px 16px", paddingRight:showToggle?44:16, fontFamily:"'DM Sans',sans-serif", fontSize:14.5, color:C.walnut, outline:"none", WebkitAppearance:"none" }} />
        {showToggle && (
          <button onClick={onToggle} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex" }}>
            <Icon.Eye off={showPw} />
          </button>
        )}
      </div>
      {hint && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.umber, marginTop:5, lineHeight:1.5 }}>{hint}</p>}
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled, style }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width:"100%", padding:"15px 0", borderRadius:14, border:"none", background:disabled?"rgba(173,156,142,0.3)":C.moss, color:"white", fontFamily:"'Nunito',sans-serif", fontSize:15, fontWeight:700, cursor:disabled?"not-allowed":"pointer", boxShadow:disabled?"none":`0 6px 22px ${C.mossGlow}`, transition:"all 0.15s", ...style }}>
      {children}
    </button>
  );
}

function ProgressDots({ total, current }) {
  return (
    <div style={{ display:"flex", gap:6, alignItems:"center", justifyContent:"center" }}>
      {Array.from({length:total}).map((_,i) => (
        <div key={i} style={{ width:i===current?20:6, height:6, borderRadius:3, background:i===current?C.moss:C.blush, transition:"all 0.3s" }} />
      ))}
    </div>
  );
}

function AISummaryCard({ text, label="AI Summary" }) {
  return (
    <div style={{ background:"linear-gradient(135deg, #4A6642 0%, #5C7A52 100%)", borderRadius:14, padding:"14px 16px", boxShadow:"0 4px 18px rgba(92,122,82,0.22)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-18, right:-18, width:70, height:70, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.5)", marginBottom:6 }}>{label}</div>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, lineHeight:1.65, color:"rgba(255,255,255,0.92)", fontWeight:300, position:"relative" }}>{text}</p>
    </div>
  );
}

// Pill chip selector for small options
function PillChip({ label, selected, onSelect, style }) {
  return (
    <button onClick={onSelect}
      style={{ padding:"7px 13px", borderRadius:20, border:`1.5px solid ${selected?C.moss:C.cardBorder}`, background:selected?C.moss:C.card, color:selected?"white":C.walnut, fontFamily:"'DM Sans',sans-serif", fontSize:12.5, fontWeight:selected?600:400, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap", ...style }}>
      {label}
    </button>
  );
}

// Native-style select
function NativeSelect({ label, required, value, onChange, options, placeholder, style }) {
  return (
    <div style={{ ...style }}>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <div style={{ position:"relative" }}>
        <select value={value} onChange={onChange}
          style={{ width:"100%", background:C.card, border:`1.5px solid ${C.cardBorder}`, borderRadius:12, padding:"12px 36px 12px 14px", fontFamily:"'DM Sans',sans-serif", fontSize:14, color:value?C.walnut:C.umber, outline:"none", WebkitAppearance:"none", cursor:"pointer", appearance:"none" }}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
        </select>
        <div style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
          <Icon.Chevron dir="down" color={C.umber} size={14} />
        </div>
      </div>
    </div>
  );
}

// Time selector: hour + minute + AM/PM
function TimePicker({ hour, minute, ampm, onHour, onMinute, onAmpm }) {
  const hours   = Array.from({length:12},(_,i)=>String(i+1));
  const minutes = ["00","05","10","15","20","25","30","35","40","45","50","55"];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 80px", gap:8 }}>
      <NativeSelect value={hour} onChange={e=>onHour(e.target.value)} options={hours} placeholder="Hour" />
      <NativeSelect value={minute} onChange={e=>onMinute(e.target.value)} options={minutes} placeholder="Min" />
      <NativeSelect value={ampm} onChange={e=>onAmpm(e.target.value)} options={["AM","PM"]} placeholder="—" />
    </div>
  );
}

const TIMEZONES = [
  { value:"America/Los_Angeles", label:"Pacific Time (PT)" },
  { value:"America/Denver",      label:"Mountain Time (MT)" },
  { value:"America/Chicago",     label:"Central Time (CT)" },
  { value:"America/New_York",    label:"Eastern Time (ET)" },
  { value:"America/Anchorage",   label:"Alaska Time (AKT)" },
  { value:"Pacific/Honolulu",    label:"Hawaii Time (HT)" },
  { value:"Europe/London",       label:"London (GMT/BST)" },
  { value:"Europe/Paris",        label:"Central Europe (CET)" },
  { value:"Asia/Tokyo",          label:"Japan (JST)" },
  { value:"Asia/Shanghai",       label:"China (CST)" },
  { value:"Australia/Sydney",    label:"Sydney (AEST)" },
];

// ─── SCREEN 1 — Onboarding: Welcome ──────────────────────────────────────────
function OnboardingWelcome({ onNext }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:`linear-gradient(160deg, #3A5232 0%, #4A6642 40%, #5C7A52 100%)`, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-80, right:-60, width:260, height:260, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
      <div style={{ position:"absolute", top:60, right:20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
      <div style={{ position:"absolute", bottom:-100, left:-60, width:300, height:300, borderRadius:"50%", background:"rgba(0,0,0,0.08)" }} />
      <StatusBar light />
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 32px" }}>
        <div style={{ width:72, height:72, borderRadius:22, background:"rgba(255,255,255,0.15)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:28, boxShadow:"0 8px 32px rgba(0,0,0,0.15)" }}>
          <Icon.Sparkle color="white" size={32} />
        </div>
        <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:34, fontWeight:800, color:"white", textAlign:"center", lineHeight:1.15, letterSpacing:"-0.5px", marginBottom:14 }}>Your career,<br/>finally remembered.</h1>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, color:"rgba(255,255,255,0.72)", textAlign:"center", lineHeight:1.65, fontWeight:300 }}>Capture what you accomplish as it happens. Use it when it counts — for reviews, resumes, and job searches.</p>
      </div>
      <div style={{ padding:"0 28px", marginBottom:28 }}>
        {[
          { icon:"🎤", text:"Voice-first capture — done in 60 seconds" },
          { icon:"✨", text:"AI turns your words into polished bullets" },
          { icon:"📋", text:"Resume-ready when you need it" },
        ].map((p,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:i<2?12:0 }}>
            <div style={{ width:36, height:36, borderRadius:11, background:"rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{p.icon}</div>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:"rgba(255,255,255,0.85)", lineHeight:1.4 }}>{p.text}</span>
          </div>
        ))}
      </div>
      <div style={{ padding:"0 24px 44px" }}>
        <button onClick={onNext} style={{ width:"100%", padding:"15px 0", borderRadius:14, border:"none", background:"white", color:C.mossDeep, fontFamily:"'Nunito',sans-serif", fontSize:16, fontWeight:800, cursor:"pointer", boxShadow:"0 8px 24px rgba(0,0,0,0.2)", marginBottom:12 }}>Get started</button>
        <button onClick={onNext} style={{ width:"100%", padding:"13px 0", borderRadius:14, border:"1.5px solid rgba(255,255,255,0.3)", background:"transparent", color:"rgba(255,255,255,0.9)", fontFamily:"'DM Sans',sans-serif", fontSize:14, cursor:"pointer" }}>I already have an account</button>
      </div>
    </div>
  );
}

// ─── SCREEN 2 — Onboarding: Name ─────────────────────────────────────────────
function OnboardingName({ onNext, onBack }) {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.bg }}>
      <StatusBar />
      <div style={{ padding:"8px 20px 0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><Icon.Back /></button>
        <ProgressDots total={4} current={0} />
        <div style={{ width:28 }} />
      </div>
      <div style={{ flex:1, padding:"32px 24px 0", overflowY:"auto", scrollbarWidth:"none" }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ width:48, height:48, borderRadius:15, background:C.mossFaint, border:`1.5px solid ${C.mossBorder}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18, fontSize:22 }}>👋</div>
          <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:26, fontWeight:800, color:C.walnut, lineHeight:1.2, marginBottom:8 }}>What should we call you?</h1>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.umber, lineHeight:1.6, fontWeight:300 }}>Your name will appear in your greeting and on any exports.</p>
        </div>
        <TextInput label="First name" required value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="e.g. Jordan" />
        <TextInput label="Last name" value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="e.g. Rivera" hint="Optional — used on resume exports." />
      </div>
      <div style={{ padding:"16px 24px 44px", borderTop:`1px solid ${C.divider}` }}>
        <PrimaryBtn onClick={onNext} disabled={!firstName.trim()}>Continue</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── SCREEN 3 — Onboarding: Company ──────────────────────────────────────────
function OnboardingCompany({ onNext, onBack }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.bg }}>
      <StatusBar />
      <div style={{ padding:"8px 20px 0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><Icon.Back /></button>
        <ProgressDots total={4} current={1} />
        <button onClick={onNext} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.umber }}>Skip</button>
      </div>
      <div style={{ flex:1, padding:"32px 24px 0", overflowY:"auto", scrollbarWidth:"none" }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ width:48, height:48, borderRadius:15, background:C.mossFaint, border:`1.5px solid ${C.mossBorder}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 }}>
            <Icon.Building color={C.moss} size={22} />
          </div>
          <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:26, fontWeight:800, color:C.walnut, lineHeight:1.2, marginBottom:8 }}>Where are you working?</h1>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.umber, lineHeight:1.6, fontWeight:300 }}>This gets attached to your achievements automatically. Skip if you're between roles — you can add this later.</p>
        </div>
        <TextInput label="Company" value={company} onChange={e=>setCompany(e.target.value)} placeholder="e.g. Acme Corp" />
        <TextInput label="Role title" value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Senior Product Manager" hint="This defaults onto new achievements and can be overridden per entry." />
      </div>
      <div style={{ padding:"16px 24px 44px", borderTop:`1px solid ${C.divider}` }}>
        <PrimaryBtn onClick={onNext}>Next</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── SCREEN 4 — Onboarding: Notifications ────────────────────────────────────
function OnboardingNotifications({ onNext, onBack }) {
  const [cadence, setCadence] = useState("weekly");
  const [day, setDay]         = useState("Fri");
  const [hour, setHour]       = useState("5");
  const [minute, setMinute]   = useState("00");
  const [ampm, setAmpm]       = useState("PM");
  const [tz, setTz]           = useState("America/Los_Angeles");

  const days     = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const cadences = [
    { id:"weekly",    label:"Weekly",    sub:"Once a week" },
    { id:"biweekly",  label:"Biweekly",  sub:"Every two weeks" },
    { id:"monthly",   label:"Monthly",   sub:"Once a month" },
  ];

  const tzLabel = TIMEZONES.find(t=>t.value===tz)?.label || tz;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.bg }}>
      <StatusBar />
      <div style={{ padding:"8px 20px 0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><Icon.Back /></button>
        <ProgressDots total={4} current={2} />
        <button onClick={onNext} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.umber }}>Skip</button>
      </div>

      <div style={{ flex:1, padding:"28px 24px 0", overflowY:"auto", scrollbarWidth:"none" }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ width:48, height:48, borderRadius:15, background:C.mossFaint, border:`1.5px solid ${C.mossBorder}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 }}>
            <Icon.Bell color={C.moss} size={22} />
          </div>
          <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:26, fontWeight:800, color:C.walnut, lineHeight:1.2, marginBottom:8 }}>When should we check in?</h1>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.umber, lineHeight:1.6, fontWeight:300 }}>A gentle nudge at the right time is how the habit sticks.</p>
        </div>

        {/* Cadence */}
        <SectionLabel style={{ marginBottom:8 }}>Cadence</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
          {cadences.map(c => (
            <button key={c.id} onClick={()=>setCadence(c.id)}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:cadence===c.id?C.mossFaint:C.card, border:`1.5px solid ${cadence===c.id?C.moss:C.cardBorder}`, borderRadius:13, padding:"12px 16px", cursor:"pointer", transition:"all 0.15s", textAlign:"left" }}>
              <div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:cadence===c.id?500:400, color:cadence===c.id?C.moss:C.walnut }}>{c.label}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber, marginTop:2 }}>{c.sub}</div>
              </div>
              <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${cadence===c.id?C.moss:C.cardBorder}`, background:cadence===c.id?C.moss:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {cadence===c.id && <div style={{ width:8, height:8, borderRadius:"50%", background:"white" }} />}
              </div>
            </button>
          ))}
        </div>

        {/* Day picker — all 7 days */}
        {(cadence==="weekly"||cadence==="biweekly") && (
          <>
            <SectionLabel style={{ marginBottom:8 }}>Day</SectionLabel>
            <div style={{ display:"flex", gap:5, marginBottom:20 }}>
              {days.map(d => (
                <button key={d} onClick={()=>setDay(d)}
                  style={{ flex:1, padding:"9px 2px", borderRadius:10, border:`1.5px solid ${day===d?C.moss:C.cardBorder}`, background:day===d?C.moss:C.card, color:day===d?"white":C.walnut, fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:day===d?600:400, cursor:"pointer", transition:"all 0.15s" }}>
                  {d}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Time */}
        <SectionLabel style={{ marginBottom:8 }}>Time</SectionLabel>
        <div style={{ marginBottom:16 }}>
          <TimePicker hour={hour} minute={minute} ampm={ampm} onHour={setHour} onMinute={setMinute} onAmpm={setAmpm} />
        </div>

        {/* Timezone */}
        <SectionLabel style={{ marginBottom:8 }}>Time zone</SectionLabel>
        <div style={{ marginBottom:20 }}>
          <NativeSelect value={tz} onChange={e=>setTz(e.target.value)} options={TIMEZONES.map(t=>({ value:t.value, label:t.label }))} />
        </div>

        {/* Push notification preview */}
        <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:13, padding:"13px 14px", marginBottom:8 }}>
          <SectionLabel style={{ marginBottom:8 }}>Preview</SectionLabel>
          <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg, ${C.mossDeep}, ${C.moss})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon.Sparkle color="white" size={13} />
            </div>
            <div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, color:C.walnut, marginBottom:2 }}>Career Memory · now</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.walnut, lineHeight:1.4 }}>What did you accomplish this week? 🎯</div>
            </div>
          </div>
        </div>

        {/* Summary line */}
        <div style={{ background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:11, padding:"10px 14px", marginBottom:8 }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.mossDeep, lineHeight:1.5 }}>
            Every {cadence==="weekly"?day:cadence==="biweekly"?`other ${day}`:"month"} at {hour}:{minute} {ampm} · {tzLabel}
          </p>
        </div>
      </div>

      <div style={{ padding:"16px 24px 44px", borderTop:`1px solid ${C.divider}` }}>
        <PrimaryBtn onClick={onNext}>Set reminder</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── SCREEN 5 — Onboarding: All Set ──────────────────────────────────────────
function OnboardingAllSet({ onNext }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.bg }}>
      <StatusBar />
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 28px" }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:`linear-gradient(135deg, ${C.mossDeep}, ${C.moss})`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:28, boxShadow:`0 12px 40px ${C.mossGlow}` }}>
          <Icon.Check color="white" size={32} />
        </div>
        <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:28, fontWeight:800, color:C.walnut, textAlign:"center", lineHeight:1.2, marginBottom:12 }}>You're all set, Steph!</h1>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, color:C.umber, textAlign:"center", lineHeight:1.7, fontWeight:300, marginBottom:32 }}>
          Your career memory is ready. Start logging — even a single sentence about something you did today is worth capturing.
        </p>
        <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { icon:"🎤", title:"Log an achievement", sub:"Voice or text, takes about a minute" },
            { icon:"✨", title:"AI does the work",   sub:"Synthesizes your words into polished bullets" },
            { icon:"📋", title:"Use it when it counts", sub:"Resume-ready in your Summary tab" },
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", gap:12, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:13, padding:"12px 14px", alignItems:"center" }}>
              <div style={{ width:36, height:36, borderRadius:11, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, color:C.walnut }}>{s.title}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber, marginTop:2 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:"16px 24px 44px" }}>
        <PrimaryBtn onClick={onNext}>Log my first achievement →</PrimaryBtn>
        <button onClick={onNext} style={{ width:"100%", marginTop:10, padding:"12px 0", background:"transparent", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.umber }}>Take me to the app first</button>
      </div>
    </div>
  );
}

// ─── SCREEN 6 — Onboarding: First Entry ──────────────────────────────────────
function OnboardingFirstEntry({ onNext }) {
  const [text, setText] = useState("");
  const canSubmit = text.trim().length > 3;

  const prompts = [
    "Something I shipped or delivered recently",
    "A problem I solved this week",
    "A project I made meaningful progress on",
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.bg }}>
      <StatusBar />
      <div style={{ padding:"8px 20px 0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ width:28 }} />
        <ProgressDots total={4} current={3} />
        <button onClick={onNext} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.umber }}>Skip</button>
      </div>

      <div style={{ flex:1, padding:"28px 24px 0", overflowY:"auto", scrollbarWidth:"none" }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ width:48, height:48, borderRadius:15, background:`linear-gradient(135deg, ${C.mossDeep}, ${C.moss})`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18, boxShadow:`0 6px 20px ${C.mossGlow}` }}>
            <Icon.Sparkle color="white" size={20} />
          </div>
          <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:24, fontWeight:800, color:C.walnut, lineHeight:1.2, marginBottom:8 }}>What's something you did recently?</h1>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.umber, lineHeight:1.65, fontWeight:300 }}>Don't overthink it. A sentence or two is plenty — we'll shape it into something great.</p>
        </div>

        {/* Input area */}
        <div style={{ background:C.card, border:`1.5px solid ${canSubmit?C.moss:C.cardBorder}`, borderRadius:16, padding:"14px 16px", marginBottom:16, transition:"border-color 0.2s" }}>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={5} placeholder="e.g. I finished migrating our auth service to the new provider, unblocking three other engineers who were waiting on it."
            style={{ width:"100%", background:"transparent", border:"none", fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.walnut, resize:"none", lineHeight:1.7, outline:"none" }} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6 }}>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber }}>{text.length>0 ? `${text.length} chars` : "Tap the mic to speak instead"}</span>
            <button style={{ width:34, height:34, borderRadius:"50%", background:C.moss, border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:`0 3px 10px ${C.mossGlow}` }}>
              <Icon.Mic size={15} />
            </button>
          </div>
        </div>

        {/* Idea prompts — visual callout only, not interactive */}
        <div style={{ background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:13, padding:"12px 14px", marginBottom:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
            <Icon.Sparkle color={C.moss} size={12} />
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", color:C.moss }}>Need ideas?</span>
          </div>
          {prompts.map((p,i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:i<prompts.length-1?7:0 }}>
              <div style={{ width:4, height:4, borderRadius:"50%", background:C.moss, marginTop:6, flexShrink:0, opacity:0.6 }} />
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.mossDeep, lineHeight:1.5, fontWeight:300 }}>{p}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"16px 24px 44px", borderTop:`1px solid ${C.divider}` }}>
        <PrimaryBtn onClick={onNext} disabled={!canSubmit}>Synthesize →</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── SCREEN 7 — Auth: Sign In ─────────────────────────────────────────────────
function SignIn({ onNext, onSwitch }) {
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [showPw, setShowPw] = useState(false);
  const canSubmit = email.includes("@") && pw.length >= 6;
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.bg }}>
      <StatusBar />
      <div style={{ flex:1, padding:"24px 24px 0", overflowY:"auto", scrollbarWidth:"none" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:36 }}>
          <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg, ${C.mossDeep}, ${C.moss})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon.Sparkle color="white" size={16} />
          </div>
          <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:800, color:C.walnut }}>Career Memory</span>
        </div>
        <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:28, fontWeight:800, color:C.walnut, marginBottom:6 }}>Welcome back</h1>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.umber, marginBottom:28, fontWeight:300 }}>Sign in to continue to your account.</p>
        <TextInput label="Email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" />
        <TextInput label="Password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Your password" showToggle onToggle={()=>setShowPw(o=>!o)} showPw={showPw} />
        <div style={{ textAlign:"right", marginTop:-6, marginBottom:20 }}>
          <button style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.moss }}>Forgot password?</button>
        </div>
        <PrimaryBtn onClick={onNext} disabled={!canSubmit} style={{ marginBottom:16 }}>Sign in</PrimaryBtn>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          <div style={{ flex:1, height:1, background:C.divider }} />
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber }}>or continue with</span>
          <div style={{ flex:1, height:1, background:C.divider }} />
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:C.card, border:`1.5px solid ${C.cardBorder}`, borderRadius:12, padding:"12px 0", cursor:"pointer" }}>
            <Icon.Google /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.walnut }}>Google</span>
          </button>
          <button style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:C.card, border:`1.5px solid ${C.cardBorder}`, borderRadius:12, padding:"12px 0", cursor:"pointer" }}>
            <Icon.Apple /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.walnut }}>Apple</span>
          </button>
        </div>
      </div>
      <div style={{ padding:"16px 24px 44px", textAlign:"center" }}>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.umber }}>Don't have an account? </span>
        <button onClick={onSwitch} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.moss, fontWeight:500 }}>Sign up</button>
      </div>
    </div>
  );
}

// ─── SCREEN 8 — Auth: Sign Up ─────────────────────────────────────────────────
function SignUp({ onNext, onSwitch }) {
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [showPw, setShowPw] = useState(false);
  const pwStrength = pw.length===0?null:pw.length<8?"weak":pw.match(/[A-Z]/)&&pw.match(/[0-9]/)?"strong":"ok";
  const canSubmit = email.includes("@") && pw.length >= 8;
  const strengthColor = { weak:C.danger, ok:C.amber, strong:C.moss }[pwStrength]||"transparent";
  const strengthLabel = { weak:"Too short", ok:"Moderate", strong:"Strong" }[pwStrength]||"";
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.bg }}>
      <StatusBar />
      <div style={{ flex:1, padding:"24px 24px 0", overflowY:"auto", scrollbarWidth:"none" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32 }}>
          <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg, ${C.mossDeep}, ${C.moss})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon.Sparkle color="white" size={16} />
          </div>
          <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:800, color:C.walnut }}>Career Memory</span>
        </div>
        <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:28, fontWeight:800, color:C.walnut, marginBottom:6 }}>Create your account</h1>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.umber, marginBottom:24, fontWeight:300 }}>Free to start. No credit card needed.</p>
        <TextInput label="Email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" />
        {/* Password with strength */}
        <div style={{ marginBottom:20 }}>
          <FieldLabel>Password</FieldLabel>
          <div style={{ position:"relative" }}>
            <input type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} placeholder="At least 8 characters"
              style={{ width:"100%", background:C.card, border:`1.5px solid ${C.cardBorder}`, borderRadius:12, padding:"12px 44px 12px 16px", fontFamily:"'DM Sans',sans-serif", fontSize:14.5, color:C.walnut, outline:"none", WebkitAppearance:"none" }} />
            <button onClick={()=>setShowPw(o=>!o)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer" }}><Icon.Eye off={showPw} /></button>
          </div>
          {pw.length>0 && (
            <div style={{ marginTop:8 }}>
              <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                {[1,2,3].map(i=>(
                  <div key={i} style={{ flex:1, height:3, borderRadius:2, background:(pwStrength==="weak"&&i<=1)||(pwStrength==="ok"&&i<=2)||(pwStrength==="strong")?strengthColor:C.cardBorder, transition:"background 0.2s" }} />
                ))}
              </div>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:strengthColor }}>{strengthLabel}</span>
            </div>
          )}
        </div>
        <PrimaryBtn onClick={onNext} disabled={!canSubmit} style={{ marginBottom:16 }}>Create account</PrimaryBtn>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          <div style={{ flex:1, height:1, background:C.divider }} />
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber }}>or sign up with</span>
          <div style={{ flex:1, height:1, background:C.divider }} />
        </div>
        <div style={{ display:"flex", gap:10, marginBottom:14 }}>
          <button style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:C.card, border:`1.5px solid ${C.cardBorder}`, borderRadius:12, padding:"12px 0", cursor:"pointer" }}>
            <Icon.Google /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.walnut }}>Google</span>
          </button>
          <button style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:C.card, border:`1.5px solid ${C.cardBorder}`, borderRadius:12, padding:"12px 0", cursor:"pointer" }}>
            <Icon.Apple /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.walnut }}>Apple</span>
          </button>
        </div>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.umber, textAlign:"center", lineHeight:1.55 }}>
          By continuing you agree to our <span style={{ color:C.moss, cursor:"pointer" }}>Terms</span> and <span style={{ color:C.moss, cursor:"pointer" }}>Privacy Policy</span>.
        </p>
      </div>
      <div style={{ padding:"12px 24px 44px", textAlign:"center" }}>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.umber }}>Already have an account? </span>
        <button onClick={onSwitch} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.moss, fontWeight:500 }}>Sign in</button>
      </div>
    </div>
  );
}

// ─── SCREEN 9 — Notification Schedules List ──────────────────────────────────
function NotificationScheduleList({ onAdd, onEdit, onClose }) {
  const [schedules, setSchedules] = useState([
    { id:"s1", label:"Weekly wins",     cadence:"weekly",  day:"Friday",     time:"5:00 PM", tz:"Pacific Time", active:true  },
    { id:"s2", label:"Quarterly review", cadence:"quarterly", month:"Jan",   time:"9:00 AM", tz:"Pacific Time", active:false },
  ]);
  const toggle = id => setSchedules(p => p.map(s => s.id===id ? {...s, active:!s.active} : s));
  const remove = id => setSchedules(p => p.filter(s => s.id!==id));
  const [confirmDelete, setConfirmDelete] = useState(null);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.bg }}>
      <StatusBar />
      <div style={{ padding:"4px 20px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, borderBottom:`1px solid ${C.divider}` }}>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><Icon.Back /></button>
        <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:700, color:C.walnut }}>Notifications</h2>
        <button onClick={onAdd} style={{ display:"flex", alignItems:"center", gap:5, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:9, padding:"6px 12px", cursor:"pointer" }}>
          <Icon.Plus color={C.moss} size={12} />
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.moss, fontWeight:500 }}>Add</span>
        </button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px 20px", scrollbarWidth:"none" }}>
        {schedules.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 24px" }}>
            <div style={{ fontSize:36, marginBottom:14 }}>🔔</div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.umber, lineHeight:1.6 }}>No schedules yet. Add one to start getting reminders.</p>
          </div>
        ) : (
          <>
            <SectionLabel style={{ marginBottom:10 }}>Your schedules</SectionLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
              {schedules.map(s => (
                <div key={s.id}>
                  <div style={{ background:C.card, border:`1px solid ${s.active?C.mossBorder:C.cardBorder}`, borderRadius:14, padding:"14px 16px", boxShadow:C.cardShadow, opacity:s.active?1:0.65, transition:"all 0.15s" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:14.5, fontWeight:700, color:C.walnut, marginBottom:3 }}>{s.label || s.cadence}</div>
                        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber }}>
                          {s.cadence==="weekly"   && `Every ${s.day} · ${s.time}`}
                          {s.cadence==="biweekly" && `Every other ${s.day} · ${s.time}`}
                          {s.cadence==="monthly"  && `Monthly · ${s.time}`}
                          {s.cadence==="quarterly"&& `Quarterly · starts ${s.month} · ${s.time}`}
                        </div>
                        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, marginTop:2, opacity:0.7 }}>{s.tz}</div>
                      </div>
                      {/* Active toggle */}
                      <div onClick={()=>toggle(s.id)} style={{ cursor:"pointer", marginLeft:12, marginTop:2 }}>
                        <Icon.Toggle on={s.active} />
                      </div>
                    </div>
                    {/* Actions */}
                    <div style={{ display:"flex", gap:8, paddingTop:10, borderTop:`1px solid ${C.divider}` }}>
                      <button onClick={()=>onEdit(s.id)}
                        style={{ display:"flex", alignItems:"center", gap:5, background:"transparent", border:`1px solid ${C.cardBorder}`, borderRadius:8, padding:"6px 13px", cursor:"pointer" }}>
                        <Icon.Edit color={C.umber} /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber }}>Edit</span>
                      </button>
                      <button onClick={()=>setConfirmDelete(s.id)}
                        style={{ display:"flex", alignItems:"center", gap:5, background:"transparent", border:`1px solid ${C.dangerBorder}`, borderRadius:8, padding:"6px 13px", cursor:"pointer" }}>
                        <Icon.Trash /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.danger }}>Delete</span>
                      </button>
                    </div>
                  </div>
                  {/* Inline delete confirm */}
                  {confirmDelete===s.id && (
                    <div style={{ background:C.dangerFaint, border:`1px solid ${C.dangerBorder}`, borderRadius:12, padding:"12px 14px", marginTop:6 }}>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.danger, marginBottom:12, lineHeight:1.5 }}>Delete "{s.label}"? This can't be undone.</p>
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={()=>setConfirmDelete(null)} style={{ flex:1, padding:"9px 0", borderRadius:9, border:`1px solid ${C.cardBorder}`, background:C.card, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.walnut, cursor:"pointer" }}>Cancel</button>
                        <button onClick={()=>{ remove(s.id); setConfirmDelete(null); }} style={{ flex:1, padding:"9px 0", borderRadius:9, border:"none", background:C.danger, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"white", cursor:"pointer" }}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Info note */}
        <div style={{ background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:12, padding:"12px 14px", marginTop:20 }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.mossDeep, lineHeight:1.6 }}>
            💡 You can have multiple schedules running at once — e.g. a weekly check-in and a quarterly review.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN 10 — Notification Schedule Editor ────────────────────────────────
function NotificationScheduleEditor({ onClose, editing=false }) {
  const [label,   setLabel]   = useState(editing?"Weekly wins":"");
  const [cadence, setCadence] = useState(editing?"weekly":"weekly");
  const [preview, setPreview] = useState("What did you accomplish this week? 🎯");
  const [customPreview, setCustomPreview] = useState(false);

  // Weekly/biweekly
  const [weekDay, setWeekDay] = useState(editing?"Fri":"Fri");
  // Monthly mode
  const [monthMode, setMonthMode] = useState("occurrence"); // "occurrence" or "date"
  const [occurrence, setOccurrence] = useState("1st");
  const [occDay, setOccDay]         = useState("Mon");
  const [specificDate, setSpecificDate] = useState("1st");
  // Quarterly
  const [qMonth, setQMonth]         = useState("1st");
  // Time
  const [hour, setHour]     = useState(editing?"5":"5");
  const [minute, setMinute] = useState(editing?"00":"00");
  const [ampm, setAmpm]     = useState(editing?"PM":"PM");
  const [tz, setTz]         = useState("America/Los_Angeles");

  const allDays       = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const occurrences   = ["1st","2nd","3rd","4th"];
  const specificDates = ["1st","15th","Last"];
  const qMonths       = ["1st month","2nd month","3rd month"];

  const scheduleSummary = () => {
    const t = `${hour}:${minute} ${ampm}`;
    const tzShort = TIMEZONES.find(z=>z.value===tz)?.label || tz;
    if (cadence==="weekly")   return `Every ${allDays.find(d=>d===weekDay)} at ${t} · ${tzShort}`;
    if (cadence==="biweekly") return `Every other ${allDays.find(d=>d===weekDay)} at ${t} · ${tzShort}`;
    if (cadence==="monthly")  {
      if (monthMode==="occurrence") return `${occurrence} ${occDay} of each month at ${t} · ${tzShort}`;
      return `${specificDate} of each month at ${t} · ${tzShort}`;
    }
    if (cadence==="quarterly") {
      const m = qMonth;
      if (monthMode==="occurrence") return `${occurrence} ${occDay} of the ${m} of each quarter at ${t} · ${tzShort}`;
      return `${specificDate} of the ${m} of each quarter at ${t} · ${tzShort}`;
    }
    return "";
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.bg }}>
      <StatusBar />
      <div style={{ padding:"4px 20px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, borderBottom:`1px solid ${C.divider}` }}>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><Icon.X size={18} /></button>
        <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:700, color:C.walnut }}>{editing?"Edit schedule":"New schedule"}</h2>
        <button onClick={onClose} style={{ background:C.moss, border:"none", borderRadius:9, padding:"7px 14px", cursor:"pointer" }}>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"white", fontWeight:500 }}>Save</span>
        </button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"20px 20px 0", scrollbarWidth:"none" }}>
        {/* Label */}
        <TextInput label="Label" value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g. Weekly wins, Quarterly review" />

        {/* Cadence pills */}
        <SectionLabel style={{ marginBottom:8 }}>Cadence</SectionLabel>
        <div style={{ display:"flex", gap:7, marginBottom:20, flexWrap:"nowrap" }}>
          {["weekly","biweekly","monthly","quarterly"].map(c => (
            <PillChip key={c} label={c.charAt(0).toUpperCase()+c.slice(1)} selected={cadence===c} onSelect={()=>setCadence(c)} style={{ flex:1, textAlign:"center", padding:"8px 4px" }} />
          ))}
        </div>

        {/* Day of week (weekly / biweekly) */}
        {(cadence==="weekly"||cadence==="biweekly") && (
          <>
            <SectionLabel style={{ marginBottom:8 }}>Day of week</SectionLabel>
            <div style={{ display:"flex", gap:5, marginBottom:20 }}>
              {allDays.map(d => (
                <button key={d} onClick={()=>setWeekDay(d)}
                  style={{ flex:1, padding:"9px 2px", borderRadius:10, border:`1.5px solid ${weekDay===d?C.moss:C.cardBorder}`, background:weekDay===d?C.moss:C.card, color:weekDay===d?"white":C.walnut, fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:weekDay===d?600:400, cursor:"pointer", transition:"all 0.15s" }}>
                  {d}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Quarterly: pick which month in quarter first */}
        {cadence==="quarterly" && (
          <>
            <SectionLabel style={{ marginBottom:8 }}>Month in quarter</SectionLabel>
            <div style={{ display:"flex", gap:8, marginBottom:20 }}>
              {qMonths.map(m => (
                <PillChip key={m} label={m} selected={qMonth===m} onSelect={()=>setQMonth(m)} style={{ flex:1, textAlign:"center" }} />
              ))}
            </div>
          </>
        )}

        {/* Monthly / Quarterly: day selection */}
        {(cadence==="monthly"||cadence==="quarterly") && (
          <>
            <SectionLabel style={{ marginBottom:8 }}>Day selection</SectionLabel>
            {/* Mode toggle */}
            <div style={{ display:"flex", background:C.cardBorder, borderRadius:12, padding:3, marginBottom:14 }}>
              {[
                { id:"occurrence", label:"Day of week" },
                { id:"date",       label:"Specific date" },
              ].map(m => (
                <button key={m.id} onClick={()=>setMonthMode(m.id)}
                  style={{ flex:1, padding:"8px 0", borderRadius:9, border:"none", background:monthMode===m.id?C.card:"transparent", color:monthMode===m.id?C.walnut:C.umber, fontFamily:"'DM Sans',sans-serif", fontSize:12.5, fontWeight:monthMode===m.id?500:400, cursor:"pointer", transition:"all 0.15s", boxShadow:monthMode===m.id?C.cardShadow:"none" }}>
                  {m.label}
                </button>
              ))}
            </div>

            {monthMode==="occurrence" && (
              <div style={{ marginBottom:20 }}>
                {/* Occurrence row */}
                <div style={{ marginBottom:8 }}>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, marginBottom:6 }}>Which occurrence</div>
                  <div style={{ display:"flex", gap:7 }}>
                    {occurrences.map(o => (
                      <PillChip key={o} label={o} selected={occurrence===o} onSelect={()=>setOccurrence(o)} style={{ flex:1, textAlign:"center" }} />
                    ))}
                  </div>
                </div>
                {/* Day row */}
                <div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, marginBottom:6 }}>Day of week</div>
                  <div style={{ display:"flex", gap:5 }}>
                    {allDays.map(d => (
                      <button key={d} onClick={()=>setOccDay(d)}
                        style={{ flex:1, padding:"9px 2px", borderRadius:10, border:`1.5px solid ${occDay===d?C.moss:C.cardBorder}`, background:occDay===d?C.moss:C.card, color:occDay===d?"white":C.walnut, fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:occDay===d?600:400, cursor:"pointer", transition:"all 0.15s" }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Preview pill */}
                <div style={{ marginTop:10, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:9, padding:"7px 12px", display:"inline-block" }}>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.mossDeep }}>{occurrence} {occDay} of {cadence==="quarterly"?qMonth.replace(" month"," month of quarter"):"each month"}</span>
                </div>
              </div>
            )}

            {monthMode==="date" && (
              <div style={{ display:"flex", gap:8, marginBottom:20 }}>
                {specificDates.map(d => (
                  <PillChip key={d} label={d} selected={specificDate===d} onSelect={()=>setSpecificDate(d)} style={{ flex:1, textAlign:"center" }} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Time */}
        <SectionLabel style={{ marginBottom:8 }}>Time</SectionLabel>
        <div style={{ marginBottom:16 }}>
          <TimePicker hour={hour} minute={minute} ampm={ampm} onHour={setHour} onMinute={setMinute} onAmpm={setAmpm} />
        </div>

        {/* Timezone */}
        <SectionLabel style={{ marginBottom:8 }}>Time zone</SectionLabel>
        <div style={{ marginBottom:18 }}>
          <NativeSelect value={tz} onChange={e=>setTz(e.target.value)} options={TIMEZONES.map(t=>({ value:t.value, label:t.label }))} />
        </div>

        {/* Notification preview */}
        <SectionLabel style={{ marginBottom:8 }}>Notification message</SectionLabel>
        <div style={{ background:C.card, border:`1px solid ${customPreview?C.moss:C.cardBorder}`, borderRadius:13, padding:"12px 14px", marginBottom:8 }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:customPreview?12:0 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg, ${C.mossDeep}, ${C.moss})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon.Sparkle color="white" size={13} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, color:C.walnut, marginBottom:2 }}>Career Memory · now</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.walnut, lineHeight:1.4 }}>{preview}</div>
            </div>
          </div>
          {customPreview && (
            <textarea value={preview} onChange={e=>setPreview(e.target.value)} rows={2}
              style={{ width:"100%", background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:9, padding:"9px 12px", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.walnut, resize:"none", outline:"none", lineHeight:1.55 }} />
          )}
        </div>
        <button onClick={()=>setCustomPreview(o=>!o)} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.moss, marginBottom:18, padding:0 }}>
          {customPreview?"Use default message":"Customize message"}
        </button>

        {/* Schedule summary */}
        <div style={{ background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:12, padding:"12px 14px", marginBottom:24 }}>
          <SectionLabel style={{ marginBottom:5 }}>Schedule summary</SectionLabel>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.mossDeep, lineHeight:1.55 }}>{scheduleSummary()}</p>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN 11 — Company List ─────────────────────────────────────────────────
function CompanyList({ onAdd, onEdit, onClose }) {
  const [companies, setCompanies] = useState([
    { id:"c1", name:"Acme Corp",               role:"Senior Software Engineer", startDate:"Mar 2024", endDate:null,         isCurrent:true  },
    { id:"c2", name:"Brightline Technologies", role:"Software Engineer",        startDate:"Jun 2021", endDate:"Feb 2024",   isCurrent:false },
    { id:"c3", name:"Nova Labs",               role:"Junior Developer",         startDate:"Sep 2019", endDate:"May 2021",   isCurrent:false },
  ]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const remove = id => setCompanies(p=>p.filter(c=>c.id!==id));

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.bg }}>
      <StatusBar />
      <div style={{ padding:"4px 20px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, borderBottom:`1px solid ${C.divider}` }}>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><Icon.Back /></button>
        <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:700, color:C.walnut }}>Companies</h2>
        <button onClick={onAdd} style={{ display:"flex", alignItems:"center", gap:5, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:9, padding:"6px 12px", cursor:"pointer" }}>
          <Icon.Plus color={C.moss} size={12} />
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.moss, fontWeight:500 }}>Add</span>
        </button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px 20px", scrollbarWidth:"none" }}>
        <SectionLabel style={{ marginBottom:10 }}>Your companies</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {companies.map(c => (
            <div key={c.id}>
              <div style={{ background:C.card, border:`1px solid ${c.isCurrent?C.mossBorder:C.cardBorder}`, borderRadius:14, padding:"14px 16px", boxShadow:C.cardShadow, position:"relative", overflow:"hidden" }}>
                {/* Top accent */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:c.isCurrent?C.moss:C.blush, opacity:c.isCurrent?0.7:0.4, borderRadius:"14px 14px 0 0" }} />
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:4 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:15, fontWeight:700, color:C.walnut }}>{c.name}</div>
                      {c.isCurrent && <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, color:C.moss, borderRadius:20, padding:"1px 8px" }}>Current</span>}
                    </div>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.walnut, marginTop:2 }}>{c.role}</div>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.umber, marginTop:3 }}>
                      {c.startDate} — {c.endDate || "Present"}
                    </div>
                  </div>
                  <button onClick={()=>onEdit(c.id)}
                    style={{ display:"flex", alignItems:"center", gap:5, background:"transparent", border:`1px solid ${C.cardBorder}`, borderRadius:8, padding:"5px 10px", cursor:"pointer", flexShrink:0 }}>
                    <Icon.Edit color={C.umber} />
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber }}>Edit</span>
                  </button>
                </div>

                {/* Delete */}
                <div style={{ paddingTop:10, borderTop:`1px solid ${C.divider}`, marginTop:8 }}>
                  <button onClick={()=>setConfirmDelete(c.id)}
                    style={{ display:"flex", alignItems:"center", gap:5, background:"transparent", border:`1px solid ${C.dangerBorder}`, borderRadius:8, padding:"5px 10px", cursor:"pointer" }}>
                    <Icon.Trash />
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.danger }}>Remove</span>
                  </button>
                </div>
              </div>

              {/* Inline delete confirm */}
              {confirmDelete===c.id && (
                <div style={{ background:C.dangerFaint, border:`1px solid ${C.dangerBorder}`, borderRadius:12, padding:"12px 14px", marginTop:6 }}>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.danger, marginBottom:12, lineHeight:1.5 }}>Remove "{c.name}"? Your achievements won't be deleted.</p>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=>setConfirmDelete(null)} style={{ flex:1, padding:"9px 0", borderRadius:9, border:`1px solid ${C.cardBorder}`, background:C.card, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.walnut, cursor:"pointer" }}>Cancel</button>
                    <button onClick={()=>{ remove(c.id); setConfirmDelete(null); }} style={{ flex:1, padding:"9px 0", borderRadius:9, border:"none", background:C.danger, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"white", cursor:"pointer" }}>Remove</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber, lineHeight:1.6, marginTop:16, textAlign:"center" }}>
          Achievements are linked to companies at the time of logging. Removing a company won't affect your existing entries.
        </p>
      </div>
    </div>
  );
}

// ─── SCREEN 12 — Company Add / Edit Form ─────────────────────────────────────
function CompanyForm({ onClose, editing=false }) {
  const [name,      setName]      = useState(editing?"Acme Corp":"");
  const [role,      setRole]      = useState(editing?"Senior Software Engineer":"");
  const [startMo,   setStartMo]   = useState(editing?"Mar":"");
  const [startYr,   setStartYr]   = useState(editing?"2024":"");
  const [isCurrent, setIsCurrent] = useState(editing?true:false);
  const [endMo,     setEndMo]     = useState("");
  const [endYr,     setEndYr]     = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const canSave = name.trim() && role.trim() && startMo && startYr;

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const years  = Array.from({length:15},(_,i)=>String(2025-i));

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:C.bg }}>
      <StatusBar />
      <div style={{ padding:"4px 20px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, borderBottom:`1px solid ${C.divider}` }}>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><Icon.X size={18} /></button>
        <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:700, color:C.walnut }}>{editing?"Edit company":"Add company"}</h2>
        <button onClick={onClose} disabled={!canSave}
          style={{ background:canSave?C.moss:"transparent", border:canSave?"none":`1px solid ${C.cardBorder}`, borderRadius:9, padding:"7px 14px", cursor:canSave?"pointer":"not-allowed" }}>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:canSave?"white":C.umber, fontWeight:500 }}>Save</span>
        </button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"20px 20px 0", scrollbarWidth:"none" }}>
        <TextInput label="Company name" required value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Acme Corp" />
        <TextInput label="Role title" required value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Senior Product Manager" hint="Used as the default role on new achievements." />

        {/* Start date */}
        <SectionLabel style={{ marginBottom:8 }}>Start date <span style={{ color:C.danger }}>*</span></SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
          <NativeSelect value={startMo} onChange={e=>setStartMo(e.target.value)} options={months} placeholder="Month" />
          <NativeSelect value={startYr} onChange={e=>setStartYr(e.target.value)} options={years.map(y=>({ value:y, label:y }))} placeholder="Year" />
        </div>

        {/* Current toggle */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:13, padding:"13px 16px", marginBottom:18 }}>
          <div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.walnut }}>Current employer</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.umber, marginTop:1 }}>Marks this as your active role</div>
          </div>
          <div onClick={()=>setIsCurrent(o=>!o)} style={{ cursor:"pointer" }}>
            <Icon.Toggle on={isCurrent} />
          </div>
        </div>

        {/* End date — only if not current */}
        {!isCurrent && (
          <>
            <SectionLabel style={{ marginBottom:8 }}>End date</SectionLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
              <NativeSelect value={endMo} onChange={e=>setEndMo(e.target.value)} options={months} placeholder="Month" />
              <NativeSelect value={endYr} onChange={e=>setEndYr(e.target.value)} options={years.map(y=>({ value:y, label:y }))} placeholder="Year" />
            </div>
          </>
        )}

        {/* Delete (edit only) */}
        {editing && !showDeleteConfirm && (
          <button onClick={()=>setShowDeleteConfirm(true)}
            style={{ width:"100%", padding:"13px 0", borderRadius:13, border:`1px solid ${C.dangerBorder}`, background:C.dangerFaint, cursor:"pointer", marginBottom:28, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <Icon.Trash />
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.danger }}>Remove company</span>
          </button>
        )}
        {showDeleteConfirm && (
          <div style={{ background:C.dangerFaint, border:`1px solid ${C.dangerBorder}`, borderRadius:13, padding:"16px", marginBottom:28 }}>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.danger, lineHeight:1.55, marginBottom:14 }}>This will remove the company. Achievements linked to it won't be deleted.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowDeleteConfirm(false)} style={{ flex:1, padding:"10px 0", borderRadius:10, border:`1px solid ${C.cardBorder}`, background:C.card, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.walnut, cursor:"pointer" }}>Cancel</button>
              <button onClick={onClose} style={{ flex:1, padding:"10px 0", borderRadius:10, border:"none", background:C.danger, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"white", cursor:"pointer" }}>Remove</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NAVIGATOR ────────────────────────────────────────────────────────────────
const SCREENS = [
  { id:"ob-welcome",          label:"1 · Welcome splash",              group:"Onboarding" },
  { id:"ob-name",             label:"2 · Your name",                   group:"Onboarding" },
  { id:"ob-company",          label:"3 · Company setup",               group:"Onboarding" },
  { id:"ob-notifs",           label:"4 · Notification setup",          group:"Onboarding" },
  { id:"ob-allset",           label:"5 · All set",                     group:"Onboarding" },
  { id:"ob-firstentry",       label:"6 · First entry prompt",          group:"Onboarding" },
  { id:"auth-signin",         label:"Sign in",                         group:"Auth" },
  { id:"auth-signup",         label:"Sign up",                         group:"Auth" },
  { id:"notif-list",          label:"Notification schedules list",     group:"Settings" },
  { id:"notif-editor-new",    label:"New notification schedule",       group:"Settings" },
  { id:"notif-editor-edit",   label:"Edit notification schedule",      group:"Settings" },
  { id:"company-list",        label:"Companies list",                  group:"Settings" },
  { id:"company-add",         label:"Add company",                     group:"Settings" },
  { id:"company-edit",        label:"Edit company",                    group:"Settings" },
];

export default function App() {
  const [screen, setScreen] = useState("ob-welcome");
  const [showPicker, setShowPicker] = useState(false);
  const [authMode, setAuthMode] = useState("signin");

  const advance = () => {
    const idx = SCREENS.findIndex(s=>s.id===screen);
    if (idx < SCREENS.length-1) setScreen(SCREENS[idx+1].id);
  };

  const groups = [...new Set(SCREENS.map(s=>s.group))];

  const renderScreen = () => {
    switch(screen) {
      case "ob-welcome":        return <OnboardingWelcome onNext={advance} />;
      case "ob-name":           return <OnboardingName onNext={advance} onBack={()=>setScreen("ob-welcome")} />;
      case "ob-company":        return <OnboardingCompany onNext={advance} onBack={()=>setScreen("ob-name")} />;
      case "ob-notifs":         return <OnboardingNotifications onNext={advance} onBack={()=>setScreen("ob-company")} />;
      case "ob-allset":         return <OnboardingAllSet onNext={advance} />;
      case "ob-firstentry":     return <OnboardingFirstEntry onNext={advance} />;
      case "auth-signin":       return <SignIn onNext={advance} onSwitch={()=>setScreen("auth-signup")} />;
      case "auth-signup":       return <SignUp onNext={advance} onSwitch={()=>setScreen("auth-signin")} />;
      case "notif-list":        return <NotificationScheduleList onAdd={()=>setScreen("notif-editor-new")} onEdit={()=>setScreen("notif-editor-edit")} onClose={advance} />;
      case "notif-editor-new":  return <NotificationScheduleEditor onClose={()=>setScreen("notif-list")} editing={false} />;
      case "notif-editor-edit": return <NotificationScheduleEditor onClose={()=>setScreen("notif-list")} editing={true} />;
      case "company-list":      return <CompanyList onAdd={()=>setScreen("company-add")} onEdit={()=>setScreen("company-edit")} onClose={advance} />;
      case "company-add":       return <CompanyForm onClose={()=>setScreen("company-list")} editing={false} />;
      case "company-edit":      return <CompanyForm onClose={()=>setScreen("company-list")} editing={true} />;
      default:                  return <OnboardingWelcome onNext={advance} />;
    }
  };

  const currentScreen = SCREENS.find(s=>s.id===screen);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#1a1410; display:flex; align-items:center; justify-content:center; min-height:100vh; }
        button, input, select, textarea { outline:none; font-family:inherit; }
        ::-webkit-scrollbar { display:none; }
        select option { color:#2A2118; background:#FAF7F2; }
        input::placeholder, textarea::placeholder { color:#AD9C8E; }
        select { color: inherit; }
      `}</style>

      <div style={{ background:"#1a1410", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
          {/* Phone frame */}
          <div style={{ width:390, height:"min(780px, calc(100vh - 140px))", background:C.bg, borderRadius:44, overflow:"hidden", position:"relative", display:"flex", flexDirection:"column", boxShadow:"0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)" }}>
            {renderScreen()}
          </div>

          {/* Controls */}
          <div style={{ display:"flex", alignItems:"center", gap:10, position:"relative" }}>
            <button onClick={()=>{ const idx=SCREENS.findIndex(s=>s.id===screen); if(idx>0) setScreen(SCREENS[idx-1].id); }}
              style={{ padding:"8px 14px", borderRadius:8, background:"rgba(255,255,255,0.08)", border:"none", color:"rgba(255,255,255,0.5)", fontFamily:"'DM Sans',sans-serif", fontSize:12, cursor:"pointer" }}>← Prev</button>

            <button onClick={()=>setShowPicker(o=>!o)}
              style={{ padding:"8px 16px", borderRadius:8, background:showPicker?"rgba(92,122,82,0.3)":"rgba(255,255,255,0.08)", border:`1px solid ${showPicker?"rgba(92,122,82,0.5)":"rgba(255,255,255,0.1)"}`, color:"rgba(255,255,255,0.75)", fontFamily:"'DM Sans',sans-serif", fontSize:12, cursor:"pointer", maxWidth:240, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {currentScreen?.label || "Select screen"} ▾
            </button>

            <button onClick={()=>{ const idx=SCREENS.findIndex(s=>s.id===screen); if(idx<SCREENS.length-1) setScreen(SCREENS[idx+1].id); }}
              style={{ padding:"8px 14px", borderRadius:8, background:"rgba(255,255,255,0.08)", border:"none", color:"rgba(255,255,255,0.5)", fontFamily:"'DM Sans',sans-serif", fontSize:12, cursor:"pointer" }}>Next →</button>

            {/* Picker dropdown */}
            {showPicker && (
              <div style={{ position:"absolute", bottom:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)", background:"#242018", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:"8px", width:320, maxHeight:380, overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.5)", zIndex:99 }}>
                {groups.map(group => (
                  <div key={group}>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:500, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", padding:"8px 10px 4px" }}>{group}</div>
                    {SCREENS.filter(s=>s.group===group).map(s => (
                      <button key={s.id} onClick={()=>{ setScreen(s.id); setShowPicker(false); }}
                        style={{ width:"100%", textAlign:"left", padding:"8px 10px", borderRadius:8, background:screen===s.id?"rgba(92,122,82,0.25)":"transparent", border:"none", color:screen===s.id?"rgba(92,122,82,1)":"rgba(255,255,255,0.65)", fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer" }}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
