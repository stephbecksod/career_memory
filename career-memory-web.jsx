import { useState, useEffect, useRef } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#F5F0E8", card: "#FAF7F2", cardHover: "#F2EBE0",
  cardBorder: "rgba(173,156,142,0.18)", cardShadow: "0 1px 4px rgba(42,33,24,0.04)",
  moss: "#5C7A52", mossDeep: "#4A6642", mossGlow: "rgba(92,122,82,0.22)",
  mossFaint: "rgba(92,122,82,0.08)", mossBorder: "rgba(92,122,82,0.2)",
  amber: "#C9941A", amberFaint: "rgba(201,148,26,0.1)", amberBorder: "rgba(201,148,26,0.18)",
  umber: "#AD9C8E", walnut: "#2A2118", blush: "#D9BBB0", divider: "rgba(173,156,142,0.2)",
  danger: "#B05A40", dangerFaint: "rgba(176,90,64,0.08)", dangerBorder: "rgba(176,90,64,0.2)",
  sidebar: "#EDE8DF",
};
const STATUS = {
  active:    { label: "Active",    bg: C.mossFaint,             border: C.mossBorder,             color: C.moss  },
  completed: { label: "Completed", bg: "rgba(173,156,142,0.1)", border: "rgba(173,156,142,0.25)", color: C.umber },
};
const COMPANY_META = {
  "Acme Corp":               { role: "Senior Software Engineer", startDate: "Mar 2024", endDate: null,       isCurrent: true  },
  "Brightline Technologies": { role: "Software Engineer",        startDate: "Jun 2021", endDate: "Feb 2024", isCurrent: false },
};
const SYSTEM_TAGS = ["Leadership","Cross-functional","Shipped product","Cost reduction","Revenue impact","Process improvement","Mentorship","Communication","Problem solving","Data analysis","Project management","Stakeholder management"];

// ─── Initial Data ─────────────────────────────────────────────────────────────
const INITIAL_PROJECTS = [
  { id:"p1", name:"Q3 Infrastructure Overhaul", status:"active",    company:"Acme Corp",               isHighlight:true,  startDate:"2026-01-06", endDate:null,         summary:"Led a multi-team effort to modernize the core infrastructure stack, resulting in significantly faster build times, improved reliability, and a dramatically smoother onboarding experience for new engineers." },
  { id:"p2", name:"Mobile App Relaunch",         status:"completed", company:"Brightline Technologies", isHighlight:false, startDate:"2023-08-01", endDate:"2024-01-15", summary:"Core contributor to a full rebuild of the consumer mobile app, shipped to 120k users with a 4.7 App Store rating on launch day." },
];
const INITIAL_ENTRIES = [
  { id:"e1", date:"Feb 18, 2026", company:"Acme Corp", summary:"Wrapped up a high-impact week on the Q3 overhaul and ran onboarding improvements that cut ramp time significantly.",
    achievements:[
      { id:"a1", name:"Reduced engineer onboarding time by 40%",  summary:"Redesigned the onboarding runbook and automated environment setup, cutting new engineer ramp time from 5 days to 3.", isHighlight:true,  projectId:"p1", tags:["Process improvement","Leadership","Shipped product"],        star:{situation:"New engineers were taking 4–5 days to become productive.",task:"Own the onboarding experience end-to-end.",action:"Scripted 12 manual steps, wrote automation in Bash and Python, rewrote the guide.",result:"Ramp time dropped 40%. Used by 6 engineers with zero escalations."}, notes:[{q:"What did you accomplish?",a:"Finally shipped the onboarding overhaul. New engineers up in 3 days instead of 5."},{q:"What was the result?",a:"Six people through it in January, nobody needed hand-holding."}] },
      { id:"a2", name:"Migrated CI pipeline to GitHub Actions",    summary:"Replaced legacy Jenkins with GitHub Actions, reducing build times by 55% and eliminating flaky tests.", isHighlight:false, projectId:"p1", tags:["Shipped product","Process improvement"],                       star:{situation:"Jenkins was slow, flaky, maintained by one person who left.",task:"Migrate to modern CI without disrupting 4 active teams.",action:"Evaluated GHA, Buildkite, CircleCI. Migrated 14 pipelines with zero downtime.",result:"Build times 18 min → 8 min. Flaky tests 12% → 2%."}, notes:[{q:"What did you accomplish?",a:"Killed Jenkins and moved to GitHub Actions."}] },
      { id:"a3", name:"Ran cross-team infra planning session",      summary:"Facilitated a 2-hour session with leads from 4 teams to align on Q2 infrastructure priorities.", isHighlight:false, projectId:"p1", tags:["Leadership","Stakeholder management","Cross-functional"],       star:{situation:"Q2 priorities were unclear with competing requests.",task:"Facilitate a session producing a shared roadmap.",action:"Designed a workshop, facilitated, synthesized outputs.",result:"4 teams aligned on 6 priorities. Approved without escalation."}, notes:[{q:"What did you accomplish?",a:"Got all four team leads to agree on something."}] },
    ]},
  { id:"e2", date:"Feb 10, 2026", company:"Acme Corp", summary:"Addressed three critical findings from the Q4 security audit and completed overdue API documentation.",
    achievements:[
      { id:"a4", name:"Resolved 3 critical security audit findings", summary:"Led remediation of three high-severity findings including an exposed secret and two access control gaps.", isHighlight:true,  projectId:null, tags:["Problem solving","Shipped product","Stakeholder management"], star:{situation:"Audit surfaced 3 critical findings.",task:"Own remediation before re-audit in 3 weeks.",action:"Rotated the secret, scoped IAM roles, implemented rate limiting.",result:"All 3 findings closed 5 days early. Re-audit passed with zero carryover."}, notes:[{q:"What did you accomplish?",a:"Cleared all three critical audit items."}] },
      { id:"a5", name:"Authored complete API reference docs",          summary:"Wrote comprehensive API documentation covering 34 endpoints, examples, error codes, and auth flows.", isHighlight:false, projectId:null, tags:["Communication","Shipped product"],                           star:{situation:"The platform API had no docs.",task:"Write complete reference docs.",action:"Audited 34 endpoints, wrote in OpenAPI format, set up Mintlify.",result:"Support requests down 60%. Two new partners onboarded without engineering support."}, notes:[{q:"What did you accomplish?",a:"Documented the whole API. 34 endpoints."}] },
    ]},
  { id:"e3", date:"Jan 28, 2026", company:"Acme Corp", summary:"Presented the engineering roadmap to leadership and stepped into the interim team lead role.",
    achievements:[
      { id:"a6", name:"Delivered Q1 engineering roadmap to leadership", summary:"Built and presented the Q1 engineering roadmap to the exec team, securing buy-in for all 4 initiatives.", isHighlight:true,  projectId:null, tags:["Leadership","Stakeholder management","Communication"],      star:{situation:"Leadership needed a clear Q1 roadmap.",task:"Build a credible roadmap and get exec buy-in.",action:"Ran 3 planning sessions, synthesized a roadmap deck, presented with ROI framing.",result:"All 4 initiatives approved in first review."}, notes:[{q:"What did you accomplish?",a:"Got all four Q1 initiatives approved in one go."}] },
      { id:"a7", name:"Stepped into interim platform team lead role",   summary:"Took on interim lead responsibilities for the 6-person platform squad during a 3-month transition.", isHighlight:false, projectId:null, tags:["Leadership","Mentorship","Cross-functional"],                star:{situation:"Team lead departed suddenly.",task:"Keep the team stable and maintain delivery velocity.",action:"Ran weekly 1:1s, maintained sprint cadence, helped interview 4 candidates.",result:"Velocity maintained. No attrition. New lead onboarded in 10 weeks."}, notes:[{q:"What did you accomplish?",a:"Covered the team lead role for two and a half months."}] },
    ]},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month:"short", year:"numeric" });
}
function todayDisplay() { return new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }); }
function liveAchievementCount(projectId, entries) {
  return entries.flatMap(e => e.achievements).filter(a => a.projectId === projectId).length;
}
function buildResumeData(entries, projects) {
  const allAchs = entries.flatMap(e => e.achievements.map(a => ({ ...a, entryDate: e.date, company: e.company })));
  const companies = [...new Set(entries.map(e => e.company))];
  return companies.map(company => {
    const meta = COMPANY_META[company] ?? { role:"Engineer", startDate:"—", endDate:null, isCurrent:false };
    const companyAchs = allAchs.filter(a => a.company === company);
    const companyProjects = projects.filter(p => p.company === company);
    const projectSections = companyProjects.map(p => ({
      id:p.id, name:p.name, isHighlight:p.isHighlight, summary:p.summary,
      achievements: companyAchs.filter(a => a.projectId === p.id).map(a => a.summary),
    })).filter(p => p.achievements.length > 0);
    const usedInProject = new Set(companyProjects.flatMap(p => companyAchs.filter(a => a.projectId === p.id).map(a => a.id)));
    const standalone = companyAchs.filter(a => !usedInProject.has(a.id)).map(a => ({ id:a.id, text:a.summary, isHighlight:a.isHighlight }));
    return { id:company, company, ...meta, projects:projectSections, standaloneAchievements:standalone };
  });
}
function synthesizeFromInput({ headline, situation, action, result, metrics, skills }) {
  const words = headline.trim().split(/\s+/);
  const name = words.slice(0, 7).join(" ").replace(/[.!?,]$/, "");
  const parts = [headline, action, result].filter(Boolean);
  const summary = parts.join(". ").replace(/\.+/g, ".").trim();
  const tags = [];
  const h = (headline + action + result + skills).toLowerCase();
  if (h.match(/lead|facilitat|manag|direct/)) tags.push("Leadership");
  if (h.match(/launch|ship|deploy|deliver|build|creat/)) tags.push("Shipped product");
  if (h.match(/reduc|improv|optim|cut|fast|efficien/)) tags.push("Process improvement");
  if (h.match(/mentor|coach|train|teach/)) tags.push("Mentorship");
  if (h.match(/stakeholder|exec|present|roadmap/)) tags.push("Stakeholder management");
  if (h.match(/cross|team|collaborat/)) tags.push("Cross-functional");
  if (h.match(/data|analy|metric|insight/)) tags.push("Data analysis");
  if (metrics) tags.push("Revenue impact");
  if (tags.length === 0) tags.push("Problem solving");
  if (tags.length < 2) tags.push("Communication");
  return {
    name: name || "New achievement",
    summary: (summary || headline || "Achievement logged.") + (summary.endsWith(".") ? "" : "."),
    tags: [...new Set(tags)].slice(0, 3),
    star: { situation: situation || "", task: "", action: action || "", result: result || "" },
  };
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Back:     ({ color=C.walnut }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Filter:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.umber} strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>,
  Star:     ({ filled, size=13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={filled?C.amber:"none"} stroke={filled?C.amber:C.umber} strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Chevron:  ({ dir="right", color=C.umber, size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">{dir==="right"&&<polyline points="9 18 15 12 9 6"/>}{dir==="down"&&<polyline points="6 9 12 15 18 9"/>}{dir==="up"&&<polyline points="18 15 12 9 6 15"/>}</svg>,
  Building: ({ size=11 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.umber} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1"/></svg>,
  Folder:   ({ color=C.moss, size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Plus:     ({ color=C.umber, size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit:     ({ color=C.umber }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  X:        ({ size=16, color=C.umber }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:    ({ color=C.moss }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Save:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Mic:      ({ color="white", size=18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Copy:     ({ size=14, color=C.umber }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Export:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.umber} strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Sparkle:  ({ color="rgba(255,255,255,0.85)" }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
  Bell:     ({ color=C.umber }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Settings: ({ color=C.umber }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  User:     ({ color=C.umber }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Tag:      ({ color=C.umber }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  LogOut:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Home:     ({ active }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={active?C.moss:"none"} stroke={active?C.moss:C.umber} strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  DocIcon:  ({ active }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active?C.moss:C.umber} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  ListIcon: ({ active }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active?C.moss:C.umber} strokeWidth="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  FolderIcon:({ active }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={active?C.moss:"none"} stroke={active?C.moss:C.umber} strokeWidth="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Toggle:   ({ on }) => (
    <div style={{ width:40, height:22, borderRadius:11, background:on?C.moss:C.blush, position:"relative", transition:"background 0.2s", flexShrink:0, cursor:"pointer" }}>
      <div style={{ position:"absolute", top:3, left:on?18:3, width:16, height:16, borderRadius:"50%", background:"white", transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  ),
  Dot:      () => <div style={{ width:5, height:5, borderRadius:"50%", background:C.moss, flexShrink:0, marginTop:5 }} />,
};

// ─── Shared UI Components ─────────────────────────────────────────────────────
function SectionLabel({ children, style }) {
  return <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase", color:C.umber, ...style }}>{children}</div>;
}
function StatusBadge({ status }) {
  const s = STATUS[status];
  return <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:500, background:s.bg, border:`1px solid ${s.border}`, color:s.color, borderRadius:20, padding:"2px 9px", flexShrink:0 }}>{s.label}</span>;
}
function AISummaryCard({ text, label="AI Summary" }) {
  return (
    <div style={{ background:"linear-gradient(135deg, #4A6642 0%, #5C7A52 100%)", borderRadius:14, padding:"16px 18px", boxShadow:"0 4px 18px rgba(92,122,82,0.2)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-22, right:-22, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
      <div style={{ position:"absolute", bottom:-28, left:36, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.5)", marginBottom:7 }}>{label}</div>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, lineHeight:1.7, color:"rgba(255,255,255,0.92)", fontWeight:300, position:"relative" }}>{text}</p>
    </div>
  );
}
function CopyBtn() {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={e => { e.stopPropagation(); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      style={{ display:"flex", alignItems:"center", justifyContent:"center", background:copied?C.moss:C.card, border:`1px solid ${copied?C.moss:C.cardBorder}`, borderRadius:7, width:28, height:28, cursor:"pointer", transition:"all 0.18s", flexShrink:0 }}>
      {copied ? <Icon.Check color="white" /> : <Icon.Copy size={13} />}
    </button>
  );
}
function TagChip({ label, onRemove, moss }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:moss?C.mossFaint:"rgba(173,156,142,0.1)", border:`1px solid ${moss?C.mossBorder:"rgba(173,156,142,0.2)"}`, borderRadius:20, padding:"3px 10px 3px 11px", fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:moss?C.mossDeep:C.walnut, whiteSpace:"nowrap" }}>
      {label}
      {onRemove && <button onClick={onRemove} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:0, marginLeft:2 }}><Icon.X size={10} color={moss?C.mossDeep:C.umber} /></button>}
    </span>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, onNavigate, onOpenAddEntry, onOpenSettings }) {
  const navItems = [
    { id:"home",     label:"Home",     icon:(a) => <Icon.Home active={a} /> },
    { id:"summary",  label:"Summary",  icon:(a) => <Icon.DocIcon active={a} /> },
    { id:"entries",  label:"Entries",  icon:(a) => <Icon.ListIcon active={a} /> },
    { id:"projects", label:"Projects", icon:(a) => <Icon.FolderIcon active={a} /> },
  ];
  return (
    <div style={{ width:220, background:C.sidebar, borderRight:`1px solid ${C.divider}`, display:"flex", flexDirection:"column", flexShrink:0, height:"100vh", position:"sticky", top:0 }}>
      {/* Logo */}
      <div style={{ padding:"28px 22px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:9, background:`linear-gradient(135deg, ${C.mossDeep}, ${C.moss})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Icon.Sparkle color="rgba(255,255,255,0.9)" />
          </div>
          <div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:800, color:C.walnut, lineHeight:1.1 }}>Career Memory</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.umber, letterSpacing:"0.03em" }}>Your career record</div>
          </div>
        </div>
      </div>

      {/* Log CTA */}
      <div style={{ padding:"0 14px 20px" }}>
        <button onClick={onOpenAddEntry} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, background:C.moss, border:"none", borderRadius:11, padding:"10px 14px", cursor:"pointer", boxShadow:`0 4px 14px ${C.mossGlow}` }}>
          <Icon.Plus color="white" size={13} />
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:"white" }}>Log achievement</span>
        </button>
      </div>

      {/* Divider */}
      <div style={{ height:1, background:C.divider, margin:"0 14px 14px" }} />

      {/* Nav items */}
      <nav style={{ flex:1, padding:"0 10px", overflowY:"auto" }}>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:10, border:"none", background:isActive?C.mossFaint:"transparent", cursor:"pointer", marginBottom:2, transition:"background 0.12s" }}>
              {item.icon(isActive)}
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:isActive?500:400, color:isActive?C.moss:C.walnut }}>{item.label}</span>
              {isActive && <div style={{ marginLeft:"auto", width:5, height:5, borderRadius:"50%", background:C.moss }} />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${C.divider}`, padding:"14px 10px" }}>
        {/* Profile */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:10, marginBottom:4 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg, ${C.mossDeep}, ${C.moss})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, color:"white" }}>S</span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, fontWeight:500, color:C.walnut, lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Steph</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.umber, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Acme Corp</div>
          </div>
        </div>
        <button onClick={onOpenSettings}
          style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:10, border:"none", background:"transparent", cursor:"pointer", transition:"background 0.12s" }}
          onMouseEnter={e => e.currentTarget.style.background=C.cardBorder}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}>
          <Icon.Settings />
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.walnut }}>Settings</span>
        </button>
      </div>
    </div>
  );
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────
function HomeTab({ entries, projects, onNavigate, onNavigateToAchievement, onNavigateToProject, onOpenAddEntry }) {
  const allAchs = entries.flatMap(e => e.achievements);
  const highlights = [
    ...allAchs.filter(a => a.isHighlight).map(a => ({ ...a, type:"achievement" })),
    ...projects.filter(p => p.isHighlight).map(p => ({ ...p, type:"project" })),
  ];

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"clamp(24px, 4vw, 48px) clamp(20px, 5vw, 60px)" }}>
      {/* Greeting */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:500, letterSpacing:"0.12em", textTransform:"uppercase", color:C.umber, marginBottom:6 }}>Good morning</div>
        <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:"clamp(24px, 3vw, 34px)", fontWeight:800, color:C.walnut, letterSpacing:"-0.5px", lineHeight:1.1 }}>Welcome back, Steph</h1>
      </div>

      {/* Recent Focus — full width */}
      <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:16, padding:"20px 24px", marginBottom:24, boxShadow:C.cardShadow, borderLeft:`4px solid ${C.moss}` }}>
        <SectionLabel style={{ marginBottom:10 }}>Recent focus</SectionLabel>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, lineHeight:1.75, color:C.walnut, fontWeight:300 }}>You've had a high-impact few weeks — shipping the onboarding overhaul across the Q3 Infrastructure project, clearing critical security audit findings, and getting executive buy-in on the Q1 roadmap. Strong momentum on delivering work that compounds.</p>
      </div>

      {/* Log CTA — centered, compact */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
        <button onClick={onOpenAddEntry}
          style={{ display:"flex", alignItems:"center", gap:14, background:`linear-gradient(135deg, ${C.mossDeep} 0%, ${C.moss} 100%)`, border:"none", borderRadius:16, padding:"16px 32px", cursor:"pointer", boxShadow:`0 6px 22px ${C.mossGlow}`, transition:"transform 0.12s, box-shadow 0.12s" }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow=`0 10px 28px ${C.mossGlow}`; }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 6px 22px ${C.mossGlow}`; }}>
          <div style={{ width:38, height:38, borderRadius:"50%", background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Icon.Mic size={18} />
          </div>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:18, fontWeight:800, color:"white", lineHeight:1.1 }}>Log an achievement</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(255,255,255,0.65)", marginTop:3 }}>Voice or text · takes 2 minutes</div>
          </div>
        </button>
      </div>

      {/* Stats */}
      <div style={{ marginBottom:28 }}>
        <SectionLabel style={{ marginBottom:12 }}>Your progress</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
          {[
            { label:"Entries",      value:entries.length,   tab:"entries"  },
            { label:"Achievements", value:allAchs.length,   tab:"entries"  },
            { label:"Projects",     value:projects.length,  tab:"projects" },
          ].map(s => (
            <button key={s.label} onClick={() => onNavigate(s.tab)}
              style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:16, padding:"22px 16px", cursor:"pointer", textAlign:"center", boxShadow:C.cardShadow, transition:"background 0.12s" }}
              onMouseEnter={e => e.currentTarget.style.background=C.cardHover}
              onMouseLeave={e => e.currentTarget.style.background=C.card}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:"clamp(36px, 4vw, 48px)", fontWeight:800, color:C.walnut, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, marginTop:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>{s.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div>
        <SectionLabel style={{ marginBottom:12 }}>Highlights</SectionLabel>
        {highlights.length === 0 ? (
          <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:"24px", textAlign:"center" }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.umber, lineHeight:1.6 }}>Mark an achievement as a highlight and it'll appear here.</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {highlights.map(item => (
              <button key={item.id} onClick={() => item.type==="achievement" ? onNavigateToAchievement(item.id) : onNavigateToProject(item.id)}
                style={{ display:"flex", alignItems:"center", gap:12, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"13px 15px", cursor:"pointer", textAlign:"left", transition:"background 0.12s", width:"100%" }}
                onMouseEnter={e => e.currentTarget.style.background=C.cardHover}
                onMouseLeave={e => e.currentTarget.style.background=C.card}>
                <div style={{ width:32, height:32, borderRadius:9, background:C.amberFaint, border:`1px solid ${C.amberBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon.Star filled size={13} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:C.walnut, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.umber, marginTop:2, textTransform:"uppercase", letterSpacing:"0.06em" }}>{item.type}</div>
                </div>
                <Icon.Chevron dir="right" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Summary Tab ──────────────────────────────────────────────────────────────
function SummaryTab({ entries, projects }) {
  const [expandedRoles, setExpandedRoles] = useState({});
  const resumeData = buildResumeData(entries, projects);
  const toggleRole = id => setExpandedRoles(p => ({ ...p, [id]: !p[id] }));

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"clamp(24px, 4vw, 40px) clamp(20px, 5vw, 52px)" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:32 }}>
        <div>
          <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:28, fontWeight:800, color:C.walnut, letterSpacing:"-0.4px" }}>Summary</h1>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.umber, marginTop:4 }}>Your career story, ready to use.</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <CopyBtn />
          <button style={{ display:"flex", alignItems:"center", gap:6, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:8, padding:"6px 12px", cursor:"pointer" }}>
            <Icon.Export />
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber }}>Export</span>
            <Icon.Chevron dir="down" size={12} />
          </button>
        </div>
      </div>

      <div style={{ width:"100%" }}>
        {resumeData.map(role => {
          const collapsed = expandedRoles[role.id] === false;
          return (
            <div key={role.id} style={{ marginBottom:20, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:16, overflow:"hidden", boxShadow:C.cardShadow }}>
              {/* Role header */}
              <div style={{ borderTop:`3px solid ${role.isCurrent?C.moss:C.umber}`, padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:700, color:C.walnut }}>{role.company}</h2>
                    {role.isCurrent && <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:500, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, color:C.moss, borderRadius:20, padding:"1px 8px" }}>Current</span>}
                  </div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.umber, marginTop:3 }}>{role.role} · {role.startDate} — {role.endDate ?? "Present"}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <CopyBtn />
                  <button onClick={() => toggleRole(role.id)} style={{ background:"transparent", border:"none", cursor:"pointer", display:"flex", alignItems:"center", padding:4 }}>
                    <Icon.Chevron dir={collapsed?"down":"up"} />
                  </button>
                </div>
              </div>

              {!collapsed && (
                <div style={{ padding:"0 22px 20px" }}>
                  {/* Projects */}
                  {role.projects.map(proj => (
                    <div key={proj.id} style={{ marginBottom:18 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
                        <Icon.Folder color={proj.isHighlight?C.amber:C.moss} size={13} />
                        <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:700, color:C.walnut }}>{proj.name}</span>
                        {proj.isHighlight && <Icon.Star filled size={12} />}
                        <div style={{ marginLeft:"auto" }}><CopyBtn /></div>
                      </div>
                      <div style={{ marginBottom:12 }}><AISummaryCard text={proj.summary} /></div>
                      <div style={{ paddingLeft:8 }}>
                        {proj.achievements.map((ach, i) => (
                          <div key={i} style={{ display:"flex", gap:10, marginBottom:7, alignItems:"flex-start" }}>
                            {/* Fixed-width bullet container so text always starts at same x */}
                            <div style={{ width:16, flexShrink:0, display:"flex", alignItems:"flex-start", paddingTop:5 }}>
                              <Icon.Dot />
                            </div>
                            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, lineHeight:1.65, color:C.walnut, fontWeight:300, flex:1 }}>{ach}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* Standalone */}
                  {role.standaloneAchievements.length > 0 && (
                    <div>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                        <SectionLabel>Other achievements</SectionLabel>
                        <CopyBtn />
                      </div>
                      {role.standaloneAchievements.map(a => (
                        <div key={a.id} style={{ display:"flex", gap:10, marginBottom:7, alignItems:"flex-start" }}>
                          {/* Fixed-width icon container — keeps text left-edge identical for both dots and stars */}
                          <div style={{ width:16, flexShrink:0, display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:a.isHighlight?4:5 }}>
                            {a.isHighlight ? <Icon.Star filled size={11} /> : <Icon.Dot />}
                          </div>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, lineHeight:1.65, color:C.walnut, fontWeight:300, flex:1 }}>{a.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Inline Project Picker ────────────────────────────────────────────────────
function InlineProjectPicker({ projectId, projects, onSelect, onCreateNew, onViewProject, editMode }) {
  const [open, setOpen] = useState(false);
  const selected = projects.find(p => p.id === projectId);
  if (!editMode && selected) {
    return (
      <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:20, padding:"5px 12px" }}>
        <Icon.Folder color={C.moss} size={12} />
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.moss }}>{selected.name}</span>
      </div>
    );
  }
  return (
    <div style={{ position:"relative" }}>
      {selected ? (
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:20, padding:"5px 12px", cursor:"pointer" }} onClick={() => editMode && setOpen(o=>!o)}>
            <Icon.Folder color={C.moss} size={12} />
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.moss }}>{selected.name}</span>
          </div>
          {editMode && <button onClick={() => { onSelect(null); setOpen(false); }} style={{ background:"none", border:"none", cursor:"pointer" }}><Icon.X size={13} color={C.umber} /></button>}
        </div>
      ) : (
        <button onClick={() => setOpen(o=>!o)} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:`1px dashed ${C.cardBorder}`, borderRadius:20, padding:"5px 14px", cursor:"pointer" }}>
          <Icon.Plus color={C.umber} size={11} />
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber }}>Add to project</span>
        </button>
      )}
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, boxShadow:"0 8px 24px rgba(42,33,24,0.12)", zIndex:50, minWidth:240, overflow:"hidden" }}>
          {selected && <button onClick={() => { onSelect(null); setOpen(false); }} style={{ width:"100%", padding:"10px 14px", background:"transparent", border:"none", borderBottom:`1px solid ${C.divider}`, cursor:"pointer", textAlign:"left", fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.danger }}>Remove from project</button>}
          {projects.map(p => (
            <button key={p.id} onClick={() => { onSelect(p.id); setOpen(false); }}
              style={{ width:"100%", padding:"10px 14px", background:p.id===projectId?C.mossFaint:"transparent", border:"none", borderBottom:`1px solid ${C.divider}`, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
              <Icon.Folder color={p.id===projectId?C.moss:C.umber} size={12} />
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:p.id===projectId?C.moss:C.walnut, flex:1, textAlign:"left" }}>{p.name}</span>
              {p.id===projectId && <Icon.Check />}
            </button>
          ))}
          <button onClick={() => { setOpen(false); onCreateNew(); }}
            style={{ width:"100%", padding:"10px 14px", background:"transparent", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:20, height:20, borderRadius:"50%", background:C.mossFaint, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon.Plus color={C.moss} size={10} /></div>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.moss }}>New project…</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Achievement Detail Panel ─────────────────────────────────────────────────
function AchievementDetail({ achievement:a, projects, onBack, onUpdateAchievement, onNavigateToProject, breadcrumb="Entries" }) {
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(a.name);
  const [editSummary, setEditSummary] = useState(a.summary);
  const [editTags, setEditTags] = useState(a.tags);
  const [editProjectId, setEditProjectId] = useState(a.projectId);
  const [newTag, setNewTag] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);

  const handleSave = () => {
    onUpdateAchievement(a.id, { name:editName, summary:editSummary, tags:editTags, projectId:editProjectId });
    setEditMode(false);
  };
  const handleHighlight = () => onUpdateAchievement(a.id, { isHighlight:!a.isHighlight });

  const starFields = [
    { label:"Situation", key:"situation", color:"#5C7A52" },
    { label:"Task",      key:"task",      color:"#7A6B52" },
    { label:"Action",    key:"action",    color:"#527A6B" },
    { label:"Result",    key:"result",    color:"#7A5252" },
  ];

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"clamp(20px, 3vw, 40px) clamp(20px, 4vw, 52px)" }}>
      {/* Breadcrumb + actions */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:"none", cursor:"pointer", padding:0 }}>
          <Icon.Back />
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.umber }}>{breadcrumb}</span>
        </button>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={handleHighlight}
            style={{ display:"flex", alignItems:"center", gap:6, background:a.isHighlight?C.amberFaint:C.card, border:`1px solid ${a.isHighlight?C.amberBorder:C.cardBorder}`, borderRadius:9, padding:"7px 14px", cursor:"pointer", transition:"all 0.15s" }}>
            <Icon.Star filled={a.isHighlight} size={13} />
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:a.isHighlight?C.amber:C.umber }}>{a.isHighlight?"Highlighted":"Highlight"}</span>
          </button>
          {editMode
            ? <button onClick={handleSave} style={{ display:"flex", alignItems:"center", gap:6, background:C.moss, border:"none", borderRadius:9, padding:"7px 16px", cursor:"pointer" }}><Icon.Save /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:"white" }}>Save</span></button>
            : <button onClick={() => setEditMode(true)} style={{ display:"flex", alignItems:"center", gap:6, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:9, padding:"7px 14px", cursor:"pointer" }}><Icon.Edit /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.umber }}>Edit</span></button>
          }
        </div>
      </div>

      <div style={{ width:"100%" }}>
        {/* Name */}
        {editMode
          ? <input value={editName} onChange={e=>setEditName(e.target.value)} style={{ fontFamily:"'Nunito',sans-serif", fontSize:24, fontWeight:800, color:C.walnut, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:"10px 14px", width:"100%", marginBottom:6, outline:"none" }} />
          : <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:"clamp(20px, 2.5vw, 28px)", fontWeight:800, color:C.walnut, lineHeight:1.2, marginBottom:6 }}>{a.name}</h1>
        }
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.umber, marginBottom:20 }}>{a.entryDate || "—"}</div>

        {/* Summary — full width */}
        <div style={{ marginBottom:18 }}>
          <SectionLabel style={{ marginBottom:10 }}>Summary</SectionLabel>
          <AISummaryCard text={editMode ? editSummary : a.summary} />
          {editMode && <textarea value={editSummary} onChange={e=>setEditSummary(e.target.value)} rows={4} style={{ width:"100%", marginTop:10, background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:"10px 14px", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.walnut, resize:"vertical", lineHeight:1.65, outline:"none" }} />}
        </div>

        {/* Project — full width */}
        <div style={{ marginBottom:18 }}>
          <SectionLabel style={{ marginBottom:10 }}>Project</SectionLabel>
          <InlineProjectPicker projectId={editMode?editProjectId:a.projectId} projects={projects} onSelect={setEditProjectId} onCreateNew={()=>{}} onViewProject={onNavigateToProject} editMode={editMode} />
        </div>

        {/* STAR — each field full width stacked */}
        <div style={{ marginBottom:18 }}>
          <SectionLabel style={{ marginBottom:12 }}>STAR breakdown</SectionLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {starFields.map(f => (
              <div key={f.key} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:13, padding:"14px 18px", borderLeft:`3px solid ${f.color}`, boxShadow:C.cardShadow }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase", color:f.color, marginBottom:6 }}>{f.label}</div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, lineHeight:1.7, color:a.star[f.key]?C.walnut:C.umber, fontStyle:a.star[f.key]?"normal":"italic", fontWeight:300 }}>
                  {a.star[f.key] || "Not captured"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tags — full width */}
        <div style={{ marginBottom:18 }}>
          <SectionLabel style={{ marginBottom:10 }}>Tags</SectionLabel>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {(editMode?editTags:a.tags).map(t => (
              <TagChip key={t} label={t} moss onRemove={editMode?()=>setEditTags(p=>p.filter(x=>x!==t)):null} />
            ))}
            {editMode && (
              <>
                <input value={newTag} onChange={e=>setNewTag(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newTag.trim()){setEditTags(p=>[...p,newTag.trim()]);setNewTag("");}}} placeholder="Add tag…"
                  style={{ background:"transparent", border:`1px dashed ${C.cardBorder}`, borderRadius:20, padding:"3px 12px", fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.umber, width:100, outline:"none" }} />
                <div style={{ width:"100%", display:"flex", flexWrap:"wrap", gap:5, marginTop:4 }}>
                  {SYSTEM_TAGS.filter(t=>!editTags.includes(t)).slice(0,5).map(t => (
                    <button key={t} onClick={()=>setEditTags(p=>[...p,t])} style={{ background:"transparent", border:`1px dashed ${C.cardBorder}`, borderRadius:20, padding:"2px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, cursor:"pointer" }}>+ {t}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Your notes — full width, collapsible */}
        {a.notes?.length > 0 && (
          <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:13, overflow:"hidden" }}>
            <button onClick={() => setNotesOpen(o=>!o)} style={{ width:"100%", padding:"14px 18px", background:"transparent", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <SectionLabel>Your notes ({a.notes.length})</SectionLabel>
              <Icon.Chevron dir={notesOpen?"up":"down"} />
            </button>
            {notesOpen && (
              <div style={{ padding:"0 18px 16px", borderTop:`1px solid ${C.divider}` }}>
                {a.notes.map((n, i) => (
                  <div key={i} style={{ marginTop:14 }}>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:500, color:C.umber, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>{n.q}</div>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, lineHeight:1.7, color:C.walnut, fontWeight:300 }}>{n.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Entries Tab ──────────────────────────────────────────────────────────────
function EntriesTab({ entries, projects, onNavigateToProject, onUpdateAchievement, onCreateProject, onOpenAddEntry, targetAchievementId, onClearTargetAchievement }) {
  const [viewMode, setViewMode] = useState("byEntry");
  const [filterProject, setFilterProject] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [selectedAchievementId, setSelectedAchievementId] = useState(null);

  useEffect(() => {
    if (targetAchievementId) {
      setSelectedAchievementId(targetAchievementId);
      setSelectedEntryId(null);
      onClearTargetAchievement();
    }
  }, [targetAchievementId]);

  const allAchs = entries.flatMap(e => e.achievements.map(a => ({ ...a, entryDate: e.date })));
  const filteredEntries = filterProject === "all" ? entries : filterProject === "none" ? entries.map(e => ({ ...e, achievements: e.achievements.filter(a => !a.projectId) })).filter(e => e.achievements.length > 0) : entries.map(e => ({ ...e, achievements: e.achievements.filter(a => a.projectId === filterProject) })).filter(e => e.achievements.length > 0);
  const filteredAchs = filterProject === "all" ? allAchs : filterProject === "none" ? allAchs.filter(a => !a.projectId) : allAchs.filter(a => a.projectId === filterProject);
  const hasFilter = filterProject !== "all";

  const selectedAch = selectedAchievementId ? allAchs.find(a => a.id === selectedAchievementId) : null;
  const selectedEntry = selectedEntryId ? entries.find(e => e.id === selectedEntryId) : null;

  if (selectedAch) {
    return <AchievementDetail achievement={selectedAch} projects={projects} onBack={() => setSelectedAchievementId(null)} onUpdateAchievement={onUpdateAchievement} onNavigateToProject={onNavigateToProject} breadcrumb="Entries" />;
  }

  return (
    <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
      {/* List panel */}
      <div style={{ width: selectedEntry ? 340 : "100%", borderRight: selectedEntry ? `1px solid ${C.divider}` : "none", display:"flex", flexDirection:"column", overflow:"hidden", transition:"width 0.2s" }}>
        <div style={{ padding:"28px 28px 0", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:24, fontWeight:800, color:C.walnut, letterSpacing:"-0.4px" }}>Entries</h1>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setShowFilter(o=>!o)} style={{ display:"flex", alignItems:"center", gap:5, background:showFilter||hasFilter?C.mossFaint:C.card, border:`1px solid ${showFilter||hasFilter?C.moss:C.cardBorder}`, borderRadius:9, padding:"6px 12px", cursor:"pointer" }}>
                <Icon.Filter />
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:showFilter||hasFilter?C.moss:C.umber }}>Filter{hasFilter?" ●":""}</span>
              </button>
              <button onClick={onOpenAddEntry} style={{ display:"flex", alignItems:"center", gap:5, background:C.moss, border:"none", borderRadius:9, padding:"6px 13px", cursor:"pointer" }}>
                <Icon.Plus color="white" size={12} />
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"white" }}>Add new</span>
              </button>
            </div>
          </div>

          {/* Filter */}
          {showFilter && (
            <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"14px 16px", marginBottom:14 }}>
              <SectionLabel style={{ marginBottom:8 }}>Filter by project</SectionLabel>
              <select value={filterProject} onChange={e=>setFilterProject(e.target.value)} style={{ width:"100%", background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:8, padding:"7px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.walnut }}>
                <option value="all">All projects</option>
                <option value="none">No project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {hasFilter && <button onClick={() => setFilterProject("all")} style={{ marginTop:8, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.danger, padding:0 }}>Clear filter</button>}
            </div>
          )}

          {/* View toggle */}
          <div style={{ display:"flex", background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:3, marginBottom:16 }}>
            {[["byEntry","By Entry"],["byAchievement","By Achievement"]].map(([id,label]) => (
              <button key={id} onClick={() => { setViewMode(id); setSelectedEntryId(null); }}
                style={{ flex:1, padding:"6px 0", borderRadius:8, border:"none", background:viewMode===id?C.moss:"transparent", color:viewMode===id?"white":C.umber, fontFamily:"'DM Sans',sans-serif", fontSize:12, cursor:"pointer", transition:"all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"0 28px 20px" }}>
          {viewMode === "byEntry" ? filteredEntries.map(entry => (
            <div key={entry.id} onClick={() => setSelectedEntryId(entry.id === selectedEntryId ? null : entry.id)}
              style={{ background: entry.id===selectedEntryId?C.mossFaint:C.card, border:`1px solid ${entry.id===selectedEntryId?C.moss:C.cardBorder}`, borderRadius:14, padding:"14px 16px", marginBottom:9, cursor:"pointer", boxShadow:C.cardShadow, position:"relative", overflow:"hidden", transition:"all 0.12s" }}>
              <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:C.moss, opacity:0.4, borderRadius:"0 2px 2px 0" }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:15, fontWeight:700, color:C.walnut }}>{entry.date}</div>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}><Icon.Building /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber }}>{entry.company}</span></div>
              </div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.walnut, opacity:0.7, lineHeight:1.55, fontWeight:300, marginBottom:9 }}>{entry.summary}</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:20, padding:"3px 9px" }}>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.moss, fontWeight:500 }}>{entry.achievements.length} achievement{entry.achievements.length!==1?"s":""}</span>
                </div>
                <Icon.Chevron dir="right" />
              </div>
            </div>
          )) : filteredAchs.map(a => (
            <div key={a.id} onClick={() => setSelectedAchievementId(a.id)}
              style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:"13px 16px", marginBottom:9, cursor:"pointer", boxShadow:C.cardShadow, position:"relative", overflow:"hidden", transition:"background 0.12s" }}
              onMouseEnter={e => e.currentTarget.style.background=C.cardHover}
              onMouseLeave={e => e.currentTarget.style.background=C.card}>
              {a.isHighlight && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:C.amber, opacity:0.65 }} />}
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber }}>{a.entryDate}</span>
                {a.isHighlight && <Icon.Star filled size={12} />}
              </div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:13.5, fontWeight:600, color:C.walnut, lineHeight:1.3, marginBottom:5 }}>{a.name}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.walnut, opacity:0.7, lineHeight:1.55, fontWeight:300 }}>{a.summary}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Entry detail panel */}
      {selectedEntry && (
        <div style={{ flex:1, overflowY:"auto", padding:"28px 36px" }}>
          <button onClick={() => setSelectedEntryId(null)} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:"none", cursor:"pointer", marginBottom:20, padding:0 }}>
            <Icon.Back />
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.umber }}>Back</span>
          </button>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, marginBottom:4 }}>{selectedEntry.company}</div>
          <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:24, fontWeight:800, color:C.walnut, marginBottom:14 }}>{selectedEntry.date}</h2>
          <div style={{ marginBottom:20 }}><AISummaryCard text={selectedEntry.summary} /></div>
          <SectionLabel style={{ marginBottom:12 }}>{selectedEntry.achievements.length} achievement{selectedEntry.achievements.length!==1?"s":""}</SectionLabel>
          {selectedEntry.achievements.map(a => (
            <div key={a.id} onClick={() => setSelectedAchievementId(a.id)}
              style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:13, padding:"13px 16px", marginBottom:9, cursor:"pointer", position:"relative", overflow:"hidden", transition:"background 0.12s" }}
              onMouseEnter={e => e.currentTarget.style.background=C.cardHover}
              onMouseLeave={e => e.currentTarget.style.background=C.card}>
              {a.isHighlight && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:C.amber, opacity:0.65 }} />}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:5 }}>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:600, color:C.walnut, lineHeight:1.3, paddingLeft:a.isHighlight?8:0 }}>{a.name}</div>
                {a.isHighlight && <Icon.Star filled size={13} />}
              </div>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, lineHeight:1.6, color:C.walnut, opacity:0.7, fontWeight:300, paddingLeft:a.isHighlight?8:0 }}>{a.summary}</p>
              {a.tags.length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:9, paddingLeft:a.isHighlight?8:0 }}>
                  {a.tags.map(t => <TagChip key={t} label={t} moss />)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Projects Tab ─────────────────────────────────────────────────────────────
function ProjectsTab({ entries, projects, onCreate, onEdit, onDelete, targetProjectId, onClearTarget }) {
  const [filter, setFilter] = useState("all");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (targetProjectId) { setSelectedProjectId(targetProjectId); onClearTarget(); }
  }, [targetProjectId]);

  const filtered = filter === "all" ? projects : projects.filter(p => p.status === filter);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const ProjectCard = ({ project:p }) => {
    const count = liveAchievementCount(p.id, entries);
    return (
      <div onClick={() => setSelectedProjectId(p.id === selectedProjectId ? null : p.id)}
        style={{ background:p.id===selectedProjectId?C.mossFaint:C.card, border:`1px solid ${p.id===selectedProjectId?C.moss:C.cardBorder}`, borderRadius:14, padding:"16px 18px", marginBottom:9, cursor:"pointer", position:"relative", overflow:"hidden", transition:"all 0.12s" }}
        onMouseEnter={e => { if(p.id!==selectedProjectId) e.currentTarget.style.background=C.cardHover; }}
        onMouseLeave={e => { if(p.id!==selectedProjectId) e.currentTarget.style.background=C.card; }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:p.isHighlight?C.amber:C.moss, opacity:p.isHighlight?0.7:0.3, borderRadius:"14px 14px 0 0" }} />
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, flex:1, minWidth:0 }}>
            <Icon.Folder color={p.isHighlight?C.amber:C.moss} size={14} />
            <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:700, color:C.walnut, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</span>
            {p.isHighlight && <Icon.Star filled size={12} />}
          </div>
          <StatusBadge status={p.status} />
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}><Icon.Building /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber }}>{p.company}</span></div>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber }}>{fmtDate(p.startDate)}{p.endDate?` — ${fmtDate(p.endDate)}`:" — Present"}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:20, padding:"3px 10px", width:"fit-content" }}>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.moss, fontWeight:500 }}>{count} achievement{count!==1?"s":""}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
      {/* List */}
      <div style={{ width:selectedProject?360:"100%", borderRight:selectedProject?`1px solid ${C.divider}`:"none", display:"flex", flexDirection:"column", overflow:"hidden", transition:"width 0.2s", maxWidth:selectedProject?360:9999 }}>
        <div style={{ padding:"28px 28px 0", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:24, fontWeight:800, color:C.walnut, letterSpacing:"-0.4px" }}>Projects</h1>
            <button onClick={() => setShowCreateModal(true)} style={{ display:"flex", alignItems:"center", gap:6, background:C.moss, border:"none", borderRadius:9, padding:"7px 14px", cursor:"pointer" }}>
              <Icon.Plus color="white" size={12} />
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"white" }}>New project</span>
            </button>
          </div>
          <div style={{ display:"flex", gap:6, marginBottom:16 }}>
            {["all","active","completed"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding:"5px 14px", borderRadius:20, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:filter===f?500:400, background:filter===f?C.moss:C.card, color:filter===f?"white":C.umber, border:`1px solid ${filter===f?C.moss:C.cardBorder}`, transition:"all 0.15s" }}>
                {f==="all"?"All":STATUS[f].label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"0 28px 20px" }}>
          {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      </div>

      {/* Project detail */}
      {selectedProject && (
        <div style={{ flex:1, overflowY:"auto", padding:"28px 36px" }}>
          <button onClick={() => setSelectedProjectId(null)} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:"none", cursor:"pointer", marginBottom:20, padding:0 }}>
            <Icon.Back />
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.umber }}>Projects</span>
          </button>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <Icon.Folder color={selectedProject.isHighlight?C.amber:C.moss} size={16} />
                <StatusBadge status={selectedProject.status} />
              </div>
              <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:22, fontWeight:800, color:C.walnut, lineHeight:1.2 }}>{selectedProject.name}</h2>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.umber, marginTop:5 }}>{selectedProject.company} · {fmtDate(selectedProject.startDate)}{selectedProject.endDate?` — ${fmtDate(selectedProject.endDate)}`:" — Present"}</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => onEdit(selectedProject.id, { isHighlight:!selectedProject.isHighlight })}
                style={{ display:"flex", alignItems:"center", gap:6, background:selectedProject.isHighlight?C.amberFaint:C.card, border:`1px solid ${selectedProject.isHighlight?C.amberBorder:C.cardBorder}`, borderRadius:9, padding:"7px 14px", cursor:"pointer" }}>
                <Icon.Star filled={selectedProject.isHighlight} size={13} />
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:selectedProject.isHighlight?C.amber:C.umber }}>{selectedProject.isHighlight?"Highlighted":"Highlight"}</span>
              </button>
              <button onClick={() => setShowEditModal(true)} style={{ display:"flex", alignItems:"center", gap:6, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:9, padding:"7px 12px", cursor:"pointer" }}><Icon.Edit /></button>
              <button onClick={() => setShowDeleteConfirm(true)} style={{ display:"flex", alignItems:"center", gap:6, background:C.dangerFaint, border:`1px solid ${C.dangerBorder}`, borderRadius:9, padding:"7px 12px", cursor:"pointer" }}><Icon.Trash /></button>
            </div>
          </div>
          <div style={{ marginBottom:22 }}><AISummaryCard text={selectedProject.summary || "No summary yet — add achievements to this project to generate one."} /></div>
          <SectionLabel style={{ marginBottom:12 }}>{liveAchievementCount(selectedProject.id,entries)} achievements</SectionLabel>
          {entries.flatMap(e => e.achievements.filter(a => a.projectId === selectedProject.id).map(a => ({ ...a, entryDate: e.date }))).map(a => (
            <div key={a.id} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:13, padding:"13px 16px", marginBottom:9, position:"relative", overflow:"hidden" }}>
              {a.isHighlight && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:C.amber, opacity:0.65 }} />}
              <div style={{ display:"flex", justify:"space-between", alignItems:"flex-start", gap:8 }}>
                <div style={{ flex:1, paddingLeft:a.isHighlight?8:0 }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:13.5, fontWeight:600, color:C.walnut, marginBottom:4 }}>{a.name}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.walnut, opacity:0.7, lineHeight:1.55, fontWeight:300 }}>{a.summary}</div>
                </div>
                {a.isHighlight && <Icon.Star filled size={13} />}
              </div>
            </div>
          ))}
          {liveAchievementCount(selectedProject.id,entries)===0&&<div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.umber, textAlign:"center", padding:"28px 0" }}>No achievements linked to this project yet.</div>}
        </div>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(42,33,24,0.5)", backdropFilter:"blur(4px)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:C.card, borderRadius:18, padding:"28px 32px", maxWidth:380, width:"90%", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
            <h3 style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:700, color:C.walnut, marginBottom:10 }}>Delete project?</h3>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, lineHeight:1.6, color:C.umber, marginBottom:22 }}>This will remove the project. Achievements linked to it won't be deleted, they'll just lose the project association.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex:1, padding:"10px 0", borderRadius:10, border:`1px solid ${C.cardBorder}`, background:C.card, fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={() => { onDelete(selectedProject.id); setSelectedProjectId(null); setShowDeleteConfirm(false); }} style={{ flex:1, padding:"10px 0", borderRadius:10, border:"none", background:C.danger, color:"white", fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Entry Modal ──────────────────────────────────────────────────────────
const STAR_Q_DEFS = [
  { key:"situation", label:"What was the situation or challenge?" },
  { key:"action",    label:"What did you specifically do?" },
  { key:"result",    label:"What was the result or impact?" },
  { key:"metrics",   label:"Any numbers or data to support this?" },
  { key:"skills",    label:"What skills did this highlight?" },
];
const PROC_STEPS = ["Reading your entry…","Identifying achievements…","Building your synthesis…","Finalizing…"];

function AddEntryModal({ projects, onSave, onClose, onCreateProject }) {
  const [step, setStep] = useState("input");
  const [headline, setHeadline] = useState("");
  const [situation, setSituation] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const [metrics, setMetrics] = useState("");
  const [skills, setSkills] = useState("");
  const [projectId, setProjectId] = useState(null);
  const [expandedQ, setExpandedQ] = useState(null);
  const [procIdx, setProcIdx] = useState(0);
  const [editName, setEditName] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editTags, setEditTags] = useState([]);
  const [editProjectId, setEditProjectId] = useState(null);
  const [newTag, setNewTag] = useState("");
  const timerRef = useRef(null);

  const STAR_Qs = [
    { key:"situation", label:"What was the situation or challenge?", val:situation, set:setSituation },
    { key:"action",    label:"What did you specifically do?",        val:action,    set:setAction },
    { key:"result",    label:"What was the result or impact?",       val:result,    set:setResult },
    { key:"metrics",   label:"Any numbers or data?",                 val:metrics,   set:setMetrics },
    { key:"skills",    label:"What skills did this highlight?",      val:skills,    set:setSkills },
  ];

  const canSynthesize = headline.trim().length > 3;

  const handleSynthesize = () => {
    setStep("processing");
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setProcIdx(i);
      if (i >= PROC_STEPS.length - 1) {
        clearInterval(timerRef.current);
        setTimeout(() => {
          const s = synthesizeFromInput({ headline, situation, action, result, metrics, skills });
          setEditName(s.name); setEditSummary(s.summary); setEditTags(s.tags);
          setEditProjectId(projectId);
          setStep("review");
        }, 500);
      }
    }, 600);
  };

  const handleDone = () => {
    const newEntry = {
      id:`e${Date.now()}`, date:todayDisplay(), company:"Acme Corp", summary:editSummary,
      achievements:[{ id:`a${Date.now()}`, name:editName, summary:editSummary, isHighlight:false, projectId:editProjectId, tags:editTags,
        star:{ situation, task:"", action, result },
        notes:[...(headline?[{q:"What did you accomplish?",a:headline}]:[]),...(situation?[{q:"What was the situation?",a:situation}]:[]),...(action?[{q:"What did you do?",a:action}]:[]),...(result?[{q:"What was the result?",a:result}]:[])],
      }],
    };
    onSave(newEntry); onClose();
  };
  const handleAddAnother = () => {
    setStep("input"); setHeadline(""); setSituation(""); setAction(""); setResult(""); setMetrics(""); setSkills(""); setProjectId(null); setExpandedQ(null); setProcIdx(0);
  };

  const ta = { width:"100%", background:"transparent", border:"none", padding:0, fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.walnut, resize:"none", lineHeight:1.7, outline:"none" };
  const lbl = { fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", color:C.umber, marginBottom:6, display:"block" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(42,33,24,0.45)", backdropFilter:"blur(6px)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div style={{ background:C.bg, borderRadius:20, width:"100%", maxWidth:600, maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 30px 80px rgba(0,0,0,0.3)", overflow:"hidden" }}>

        {/* Input step */}
        {step === "input" && (
          <>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"22px 26px 16px", flexShrink:0 }}>
              <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:700, color:C.walnut }}>New entry</h2>
              <button onClick={onClose} style={{ width:32, height:32, borderRadius:9, background:C.card, border:`1px solid ${C.cardBorder}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Icon.X size={15} /></button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"0 26px" }}>
              {/* Main */}
              <div style={{ background:C.card, borderRadius:14, padding:"16px 18px", marginBottom:14, border:`1px solid ${C.cardBorder}` }}>
                <label style={lbl}>What did you accomplish?</label>
                <textarea value={headline} onChange={e=>setHeadline(e.target.value)} rows={4} placeholder="Describe what you worked on and why it mattered — in your own words." style={ta} />
                <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8 }}>
                  <button style={{ width:34, height:34, borderRadius:"50%", background:C.moss, border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Icon.Mic size={15} /></button>
                </div>
              </div>
              {/* STAR questions */}
              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                  <SectionLabel>Add more detail</SectionLabel>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.blush }}>optional</span>
                </div>
                {STAR_Qs.map(q => (
                  <div key={q.key} style={{ background:C.card, border:`1px solid ${expandedQ===q.key?C.moss:C.cardBorder}`, borderRadius:10, marginBottom:5, overflow:"hidden", transition:"border-color 0.15s" }}>
                    <button onClick={() => setExpandedQ(expandedQ===q.key?null:q.key)} style={{ width:"100%", padding:"9px 14px", background:"transparent", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:q.val?C.walnut:C.umber, textAlign:"left" }}>{q.label}</span>
                      <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                        {q.val && <div style={{ width:6, height:6, borderRadius:"50%", background:C.moss }} />}
                        <Icon.Chevron dir={expandedQ===q.key?"up":"down"} color={expandedQ===q.key?C.moss:C.umber} />
                      </div>
                    </button>
                    {expandedQ===q.key && (
                      <div style={{ padding:"0 14px 12px" }}>
                        <textarea value={q.val} onChange={e=>q.set(e.target.value)} rows={3} placeholder="Type your answer…" style={{ width:"100%", background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:8, padding:"9px 12px", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.walnut, resize:"none", lineHeight:1.65, outline:"none" }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Project */}
              <div style={{ marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                  <SectionLabel>Project</SectionLabel>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.blush }}>optional</span>
                </div>
                <InlineProjectPicker projectId={projectId} projects={projects} editMode={true} onSelect={setProjectId} onCreateNew={()=>{}} onViewProject={()=>{}} />
              </div>
            </div>
            <div style={{ padding:"16px 26px 22px", flexShrink:0, borderTop:`1px solid ${C.divider}` }}>
              <button onClick={handleSynthesize} disabled={!canSynthesize}
                style={{ width:"100%", padding:"14px 0", borderRadius:13, border:"none", background:canSynthesize?C.moss:C.cardBorder, color:"white", fontFamily:"'Nunito',sans-serif", fontSize:15, fontWeight:700, cursor:canSynthesize?"pointer":"not-allowed", boxShadow:canSynthesize?`0 6px 20px ${C.mossGlow}`:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.2s" }}>
                <Icon.Sparkle />{canSynthesize?"Synthesize":"Write something above to continue"}
              </button>
            </div>
          </>
        )}

        {/* Processing step */}
        {step === "processing" && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 40px" }}>
            <div style={{ position:"relative", width:72, height:72, marginBottom:26 }}>
              <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:`linear-gradient(135deg, ${C.mossDeep}, ${C.moss})`, boxShadow:`0 8px 28px ${C.mossGlow}`, animation:"pulse 1.4s ease-in-out infinite" }} />
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon.Sparkle /></div>
            </div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:600, color:C.walnut, marginBottom:8 }}>Processing your entry</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.umber, textAlign:"center" }}>{PROC_STEPS[procIdx]}</div>
            <div style={{ display:"flex", gap:8, marginTop:22 }}>
              {PROC_STEPS.map((_,i) => <div key={i} style={{ width:i<=procIdx?18:7, height:7, borderRadius:4, background:i<=procIdx?C.moss:C.cardBorder, transition:"all 0.3s" }} />)}
            </div>
            <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:0.85} }`}</style>
          </div>
        )}

        {/* Review step */}
        {step === "review" && (
          <>
            <div style={{ padding:"22px 26px 14px", flexShrink:0 }}>
              <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:700, color:C.walnut }}>Review your achievement</h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.umber, marginTop:3 }}>Edit anything before saving</p>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"0 26px" }}>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Achievement name</label>
                <input value={editName} onChange={e=>setEditName(e.target.value)} style={{ width:"100%", fontFamily:"'Nunito',sans-serif", fontSize:16, fontWeight:700, color:C.walnut, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:"10px 14px", outline:"none" }} />
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Summary</label>
                <AISummaryCard text={editSummary} />
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Tags</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {editTags.map(t => <TagChip key={t} label={t} moss onRemove={() => setEditTags(p=>p.filter(x=>x!==t))} />)}
                  <input value={newTag} onChange={e=>setNewTag(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newTag.trim()){setEditTags(p=>[...p,newTag.trim()]);setNewTag("");}}} placeholder="Add tag…" style={{ background:"transparent", border:`1px dashed ${C.cardBorder}`, borderRadius:20, padding:"3px 12px", fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.umber, width:100, outline:"none" }} />
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8 }}>
                  {SYSTEM_TAGS.filter(t=>!editTags.includes(t)).slice(0,5).map(t => (
                    <button key={t} onClick={()=>setEditTags(p=>[...p,t])} style={{ background:"transparent", border:`1px dashed ${C.cardBorder}`, borderRadius:20, padding:"2px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, cursor:"pointer" }}>+ {t}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={lbl}>Project</label>
                <InlineProjectPicker projectId={editProjectId} projects={projects} editMode={true} onSelect={setEditProjectId} onCreateNew={()=>{}} onViewProject={()=>{}} />
              </div>
            </div>
            <div style={{ padding:"14px 26px 22px", flexShrink:0, borderTop:`1px solid ${C.divider}`, display:"flex", gap:10 }}>
              <button onClick={handleAddAnother} style={{ flex:1, padding:"12px 0", borderRadius:12, border:`1px solid ${C.cardBorder}`, background:C.card, color:C.walnut, fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer" }}>+ Add another</button>
              <button onClick={handleDone} style={{ flex:2, padding:"12px 0", borderRadius:12, border:"none", background:C.moss, color:"white", fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 14px ${C.mossGlow}` }}>Save & done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({ onClose }) {
  const [section, setSection] = useState("main");
  const [synthFormat, setSynthFormat] = useState("all");
  const [theme, setTheme] = useState("system");
  const [notifSound, setNotifSound] = useState(true);
  const [audioRetention, setAudioRetention] = useState(30);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const sectionItems = [
    { id:"profile",       label:"Profile",          icon:<Icon.User /> },
    { id:"notifications", label:"Notifications",    icon:<Icon.Bell /> },
    { id:"preferences",   label:"Preferences",      icon:<Icon.Settings /> },
    { id:"tags",          label:"Tags",             icon:<Icon.Tag /> },
    { id:"companies",     label:"Company history",  icon:<Icon.Building size={16} /> },
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(42,33,24,0.45)", backdropFilter:"blur(6px)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div style={{ background:C.bg, borderRadius:20, width:"100%", maxWidth:680, maxHeight:"88vh", display:"flex", flexDirection:"column", boxShadow:"0 30px 80px rgba(0,0,0,0.3)", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"22px 28px 18px", flexShrink:0, borderBottom:`1px solid ${C.divider}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {section !== "main" && <button onClick={() => setSection("main")} style={{ background:"transparent", border:"none", cursor:"pointer", display:"flex", alignItems:"center", padding:0, marginRight:4 }}><Icon.Back /></button>}
            <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:700, color:C.walnut }}>
              {section === "main" ? "Settings" : sectionItems.find(s=>s.id===section)?.label ?? section}
            </h2>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:9, background:C.card, border:`1px solid ${C.cardBorder}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Icon.X size={15} /></button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"20px 28px 28px" }}>
          {section === "main" && (
            <>
              {/* Profile card */}
              <div onClick={() => setSection("profile")} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:"16px 18px", marginBottom:20, cursor:"pointer", display:"flex", alignItems:"center", gap:14, transition:"background 0.12s" }}
                onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card}>
                <div style={{ width:46, height:46, borderRadius:"50%", background:`linear-gradient(135deg, ${C.mossDeep}, ${C.moss})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:700, color:"white" }}>S</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:15, fontWeight:700, color:C.walnut }}>Steph</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.umber }}>steph@example.com</div>
                  <div style={{ display:"flex", gap:6, marginTop:5 }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, color:C.moss, borderRadius:20, padding:"1px 9px" }}>Acme Corp · Senior Software Engineer</span>
                  </div>
                </div>
                <Icon.Chevron dir="right" />
              </div>

              {/* App section */}
              <SectionLabel style={{ marginBottom:8 }}>App</SectionLabel>
              <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, overflow:"hidden", marginBottom:20 }}>
                {sectionItems.filter(s => s.id!=="profile").map((s, i, arr) => (
                  <button key={s.id} onClick={() => setSection(s.id)}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"13px 18px", background:"transparent", border:"none", borderBottom:i<arr.length-1?`1px solid ${C.divider}`:"none", cursor:"pointer", transition:"background 0.12s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{ color:C.umber, display:"flex", alignItems:"center" }}>{s.icon}</div>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.walnut, flex:1, textAlign:"left" }}>{s.label}</span>
                    <Icon.Chevron dir="right" />
                  </button>
                ))}
              </div>

              {/* Account */}
              <SectionLabel style={{ marginBottom:8 }}>Account</SectionLabel>
              <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, overflow:"hidden", marginBottom:16 }}>
                <button style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"13px 18px", background:"transparent", border:"none", borderBottom:`1px solid ${C.divider}`, cursor:"pointer" }}>
                  <Icon.LogOut />
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.danger }}>Sign out</span>
                </button>
              </div>
              <button onClick={() => setShowDeleteConfirm(true)} style={{ width:"100%", padding:"12px 0", borderRadius:12, border:`1px solid ${C.dangerBorder}`, background:C.dangerFaint, color:C.danger, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, cursor:"pointer" }}>Delete account</button>
            </>
          )}

          {section === "profile" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:8 }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg, ${C.mossDeep}, ${C.moss})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                    <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:30, fontWeight:700, color:"white" }}>S</span>
                  </div>
                  <button style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.moss }}>Change photo</button>
                </div>
              </div>
              {[["First name","Steph"],["Last name",""],["Email","steph@example.com"],["Default role title","Senior Software Engineer"]].map(([label,val]) => (
                <div key={label}>
                  <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", color:C.umber, display:"block", marginBottom:6 }}>{label}</label>
                  <input defaultValue={val} style={{ width:"100%", background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:9, padding:"10px 14px", fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.walnut, outline:"none" }} />
                </div>
              ))}
              <button style={{ padding:"12px 0", borderRadius:12, border:"none", background:C.moss, color:"white", fontFamily:"'DM Sans',sans-serif", fontSize:13.5, cursor:"pointer" }}>Save changes</button>
            </div>
          )}

          {section === "preferences" && (
            <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
              <div>
                <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", color:C.umber, display:"block", marginBottom:10 }}>Synthesis format</label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[["paragraph","Paragraph"],["bullets","Bullets"],["star","STAR only"],["all","All three"]].map(([id,label]) => (
                    <button key={id} onClick={() => setSynthFormat(id)} style={{ padding:"10px 14px", borderRadius:10, border:`1px solid ${synthFormat===id?C.moss:C.cardBorder}`, background:synthFormat===id?C.mossFaint:C.card, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:synthFormat===id?C.moss:C.walnut, textAlign:"left" }}>{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", color:C.umber, display:"block", marginBottom:10 }}>Theme</label>
                <div style={{ display:"flex", gap:8 }}>
                  {[["light","Light"],["dark","Dark"],["system","System"]].map(([id,label]) => (
                    <button key={id} onClick={() => setTheme(id)} style={{ flex:1, padding:"9px 0", borderRadius:10, border:`1px solid ${theme===id?C.moss:C.cardBorder}`, background:theme===id?C.mossFaint:C.card, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:theme===id?C.moss:C.walnut }}>{label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.walnut }}>Notification sound</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber, marginTop:2 }}>Play a sound with push notifications</div>
                </div>
                <div onClick={() => setNotifSound(o=>!o)}><Icon.Toggle on={notifSound} /></div>
              </div>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.walnut }}>Audio retention</div>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:600, color:C.moss }}>{audioRetention} days</span>
                </div>
                <input type="range" min={7} max={90} step={7} value={audioRetention} onChange={e=>setAudioRetention(+e.target.value)} style={{ width:"100%", accentColor:C.moss }} />
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.umber, marginTop:8, lineHeight:1.5 }}>Transcribed text is always kept. Audio files are deleted after this period.</p>
              </div>
              <button style={{ padding:"12px 0", borderRadius:12, border:"none", background:C.moss, color:"white", fontFamily:"'DM Sans',sans-serif", fontSize:13.5, cursor:"pointer" }}>Save preferences</button>
            </div>
          )}

          {section === "tags" && (
            <div>
              <SectionLabel style={{ marginBottom:10 }}>System tags</SectionLabel>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:22 }}>
                {SYSTEM_TAGS.map(t => <TagChip key={t} label={t} />)}
              </div>
              <SectionLabel style={{ marginBottom:10 }}>Your custom tags</SectionLabel>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.umber }}>No custom tags yet.</span>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input placeholder="New tag…" style={{ flex:1, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:9, padding:"9px 14px", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.walnut, outline:"none" }} />
                <button style={{ padding:"9px 18px", borderRadius:9, border:"none", background:C.moss, color:"white", fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer" }}>Add</button>
              </div>
            </div>
          )}

          {section === "notifications" && (
            <div>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.umber, lineHeight:1.65, marginBottom:20 }}>Each schedule fires independently. Add as many as you like.</p>
              {[{label:"Weekly wins", cadence:"Every Monday at 5:00 PM", on:true},{label:"Quarterly review", cadence:"1st of Jan, Apr, Jul, Oct at 9:00 AM", on:true}].map((s,i) => (
                <div key={i} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"14px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, color:C.walnut, marginBottom:3 }}>{s.label}</div>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber }}>{s.cadence}</div>
                  </div>
                  <Icon.Toggle on={s.on} />
                </div>
              ))}
              <button style={{ width:"100%", padding:"11px 0", borderRadius:11, border:`1px dashed ${C.mossBorder}`, background:C.mossFaint, color:C.moss, fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer", marginTop:6 }}>+ Add schedule</button>
            </div>
          )}

          {section === "companies" && (
            <div>
              {Object.entries(COMPANY_META).map(([name, meta]) => (
                <div key={name} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"14px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, color:C.walnut }}>{name}</span>
                      {meta.isCurrent && <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, color:C.moss, borderRadius:20, padding:"1px 7px" }}>Current</span>}
                    </div>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber }}>{meta.role} · {meta.startDate} — {meta.endDate??"Present"}</div>
                  </div>
                  <button style={{ background:"transparent", border:"none", cursor:"pointer" }}><Icon.Edit /></button>
                </div>
              ))}
              <button style={{ width:"100%", padding:"11px 0", borderRadius:11, border:`1px dashed ${C.mossBorder}`, background:C.mossFaint, color:C.moss, fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer", marginTop:4 }}>+ Add company</button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(42,33,24,0.6)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:C.card, borderRadius:18, padding:"28px 32px", maxWidth:380, width:"90%", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:700, color:C.walnut, marginBottom:10 }}>Delete your account?</h3>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, lineHeight:1.65, color:C.umber, marginBottom:22 }}>All your entries, achievements, and projects will be permanently deleted. This cannot be undone.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex:1, padding:"11px 0", borderRadius:10, border:`1px solid ${C.cardBorder}`, background:C.card, fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button style={{ flex:1, padding:"11px 0", borderRadius:10, border:"none", background:C.danger, color:"white", fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab]                                     = useState("home");
  const [projects, setProjects]                           = useState(INITIAL_PROJECTS);
  const [entries, setEntries]                             = useState(INITIAL_ENTRIES);
  const [targetProjectId, setTargetProjectId]             = useState(null);
  const [targetAchievementId, setTargetAchievementId]     = useState(null);
  const [showAddEntry, setShowAddEntry]                   = useState(false);
  const [showSettings, setShowSettings]                   = useState(false);

  const handleNavigateToProject     = id => { setTargetProjectId(id); setTab("projects"); };
  const handleNavigateToAchievement = id => { setTargetAchievementId(id); setTab("entries"); };
  const handleCreateProject         = data => { const id=`p${Date.now()}`; setProjects(prev=>[{id,...data,company:"Acme Corp",isHighlight:false,summary:""},...prev]); return id; };
  const handleEditProject           = (id, updates) => setProjects(prev=>prev.map(p=>p.id===id?{...p,...updates}:p));
  const handleDeleteProject         = id => { setProjects(prev=>prev.filter(p=>p.id!==id)); setEntries(prev=>prev.map(e=>({...e,achievements:e.achievements.map(a=>a.projectId===id?{...a,projectId:null}:a)}))); };
  const handleUpdateAchievement     = (achId, updates) => setEntries(prev=>prev.map(e=>({...e,achievements:e.achievements.map(a=>a.id===achId?{...a,...updates}:a)})));
  const handleSaveEntry             = newEntry => setEntries(prev=>[newEntry,...prev]);

  const shared = { entries, projects, onNavigate:setTab };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:${C.bg}; min-height:100vh; }
        button, input, select, textarea { outline:none; font-family:inherit; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(173,156,142,0.3); border-radius:3px; }
        input[type=range] { cursor:pointer; }
      `}</style>

      <div style={{ display:"flex", height:"100vh", background:C.bg, overflow:"hidden" }}>
        <Sidebar activeTab={tab} onNavigate={setTab} onOpenAddEntry={() => setShowAddEntry(true)} onOpenSettings={() => setShowSettings(true)} />

        <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {tab==="home"     && <HomeTab     {...shared} onNavigateToProject={handleNavigateToProject} onNavigateToAchievement={handleNavigateToAchievement} onOpenAddEntry={() => setShowAddEntry(true)} />}
          {tab==="summary"  && <SummaryTab  {...shared} />}
          {tab==="entries"  && <EntriesTab  {...shared} onNavigateToProject={handleNavigateToProject} onUpdateAchievement={handleUpdateAchievement} onCreateProject={handleCreateProject} onOpenAddEntry={() => setShowAddEntry(true)} targetAchievementId={targetAchievementId} onClearTargetAchievement={() => setTargetAchievementId(null)} />}
          {tab==="projects" && <ProjectsTab {...shared} onCreate={handleCreateProject} onEdit={handleEditProject} onDelete={handleDeleteProject} targetProjectId={targetProjectId} onClearTarget={() => setTargetProjectId(null)} />}
        </main>

        {showAddEntry && <AddEntryModal projects={projects} onSave={handleSaveEntry} onClose={() => setShowAddEntry(false)} onCreateProject={handleCreateProject} />}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </div>
    </>
  );
}
