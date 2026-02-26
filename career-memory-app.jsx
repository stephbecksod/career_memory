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
  { id:"p1", name:"Q3 Infrastructure Overhaul", status:"active",    company:"Acme Corp",            isHighlight:true,  startDate:"2026-01-06", endDate:null,         summary:"Led a multi-team effort to modernize the core infrastructure stack, resulting in significantly faster build times, improved reliability, and a dramatically smoother onboarding experience for new engineers." },
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
function todayISO() { return new Date().toISOString().split("T")[0]; }
function todayDisplay() { return new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }); }
function parseEntryDate(str) { return new Date(str); }
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
// Naive synthesis from user input
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
  Back:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.walnut} strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Filter:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.umber} strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>,
  Star:      ({ filled, size=13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={filled?C.amber:"none"} stroke={filled?C.amber:C.umber} strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Chevron:   ({ dir="right", color=C.umber }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">{dir==="right"&&<polyline points="9 18 15 12 9 6"/>}{dir==="down"&&<polyline points="6 9 12 15 18 9"/>}{dir==="up"&&<polyline points="18 15 12 9 6 15"/>}</svg>,
  Building:  () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.umber} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1"/></svg>,
  Folder:    ({ color=C.moss, size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Plus:      ({ color=C.umber, size=12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit:      ({ color=C.umber }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  X:         ({ size=16, color=C.umber }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:     ({ color=C.moss }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Save:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Mic:       ({ color="white", size=18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Copy:      ({ size=14, color=C.umber }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Export:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.umber} strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Dot:       () => <div style={{ width:5, height:5, borderRadius:"50%", background:C.moss, flexShrink:0, marginTop:6 }} />,
  Sparkle:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
  Bell:      ({ color=C.umber }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Settings:  ({ color=C.umber }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  User:      ({ color=C.umber }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Tag:       ({ color=C.umber }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  LogOut:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Moon:      ({ color=C.umber }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Toggle:    ({ on }) => (
    <div style={{ width:42, height:24, borderRadius:12, background:on?C.moss:C.blush, position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left:on?19:3, width:18, height:18, borderRadius:"50%", background:"white", transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  ),
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
function StatusBar() {
  return (
    <div style={{ height:44, padding:"0 26px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:500, color:C.walnut }}>9:41</span>
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill={C.walnut}><rect x="0" y="3" width="3" height="9" rx="0.5" opacity="0.4"/><rect x="4.5" y="2" width="3" height="10" rx="0.5" opacity="0.6"/><rect x="9" y="0.5" width="3" height="11.5" rx="0.5"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke={C.walnut} strokeOpacity="0.35"/><rect x="2" y="2" width="16" height="8" rx="2" fill={C.walnut}/><path d="M23 4v4a2 2 0 0 0 0-4z" fill={C.walnut} fillOpacity="0.4"/></svg>
      </div>
    </div>
  );
}
function BottomNav({ active, onNavigate }) {
  const tabs = [
    { id:"home",     label:"Home",     icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill={a?C.moss:"none"} stroke={a?C.moss:C.umber} strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id:"summary",  label:"Summary",  icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?C.moss:C.umber} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { id:"entries",  label:"Entries",  icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?C.moss:C.umber} strokeWidth="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
    { id:"projects", label:"Projects", icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill={a?C.moss:"none"} stroke={a?C.moss:C.umber} strokeWidth="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
  ];
  return (
    <div style={{ height:72, background:"rgba(245,240,232,0.92)", backdropFilter:"blur(14px)", borderTop:`1px solid ${C.divider}`, display:"flex", alignItems:"flex-start", paddingTop:8, flexShrink:0 }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <div key={t.id} onClick={() => onNavigate(t.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer", padding:"4px 0" }}>
            {t.icon(isActive)}
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:isActive?C.moss:C.umber }}>{t.label}</span>
            {isActive && <div style={{ width:4, height:4, borderRadius:"50%", background:C.moss }} />}
          </div>
        );
      })}
    </div>
  );
}
function SectionLabel({ children, style }) {
  return <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase", color:C.umber, ...style }}>{children}</div>;
}
function StatusBadge({ status }) {
  const s = STATUS[status];
  return <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:500, background:s.bg, border:`1px solid ${s.border}`, color:s.color, borderRadius:20, padding:"2px 8px", flexShrink:0 }}>{s.label}</span>;
}
function AISummaryCard({ text, label="AI Summary" }) {
  return (
    <div style={{ background:"linear-gradient(135deg, #4A6642 0%, #5C7A52 100%)", borderRadius:14, padding:"14px 16px", boxShadow:"0 4px 18px rgba(92,122,82,0.22)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-18, right:-18, width:70, height:70, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
      <div style={{ position:"absolute", bottom:-24, left:30, width:90, height:90, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.5)", marginBottom:6 }}>{label}</div>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, lineHeight:1.65, color:"rgba(255,255,255,0.92)", fontWeight:300, position:"relative" }}>{text}</p>
    </div>
  );
}
function CopyBtn() {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={e => { e.stopPropagation(); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      style={{ display:"flex", alignItems:"center", justifyContent:"center", background:copied?C.moss:C.card, border:`1px solid ${copied?C.moss:C.cardBorder}`, borderRadius:7, width:27, height:27, cursor:"pointer", transition:"all 0.18s", flexShrink:0 }}>
      {copied ? <Icon.Check color="white" /> : <Icon.Copy size={12} />}
    </button>
  );
}

// ─── Achievement Card ─────────────────────────────────────────────────────────
function AchievementCard({ achievement:a, projects, onClick }) {
  const [hovered, setHovered] = useState(false);
  const project = projects?.find(p => p.id === a.projectId);
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background:hovered?C.cardHover:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:"13px 15px", marginBottom:9, cursor:"pointer", boxShadow:C.cardShadow, position:"relative", overflow:"hidden", transition:"background 0.12s" }}>
      {a.isHighlight && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:C.amber, opacity:0.65, borderRadius:"0 2px 2px 0" }} />}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber }}>{a.entryDate}</span>
        {a.isHighlight && <Icon.Star filled size={12} />}
      </div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:13.5, fontWeight:600, color:C.walnut, lineHeight:1.3, marginBottom:5 }}>{a.name}</div>
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.walnut, opacity:0.7, lineHeight:1.55, fontWeight:300, marginBottom:project?9:0 }}>{a.summary}</div>
      {project
        ? <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:20, padding:"3px 9px" }}>
              <Icon.Folder color={C.moss} size={11} /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.moss }}>{project.name}</span>
            </div>
            <Icon.Chevron dir="right" />
          </div>
        : <div style={{ display:"flex", justifyContent:"flex-end" }}><Icon.Chevron dir="right" /></div>
      }
    </div>
  );
}

// ─── Entry Card ───────────────────────────────────────────────────────────────
function EntryCard({ entry, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background:hovered?C.cardHover:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:14, padding:"14px 15px", marginBottom:9, cursor:"pointer", boxShadow:C.cardShadow, position:"relative", overflow:"hidden", transition:"background 0.12s" }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:C.moss, opacity:0.35, borderRadius:"0 2px 2px 0" }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:16, fontWeight:700, color:C.walnut }}>{entry.date}</div>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}><Icon.Building /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber }}>{entry.company}</span></div>
      </div>
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.walnut, opacity:0.7, lineHeight:1.55, fontWeight:300, marginBottom:9 }}>{entry.summary}</div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:20, padding:"3px 9px" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.moss} strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.moss, fontWeight:500 }}>{entry.achievements.length} achievement{entry.achievements.length!==1?"s":""}</span>
        </div>
        <Icon.Chevron dir="right" />
      </div>
    </div>
  );
}

// ─── Project List Card ────────────────────────────────────────────────────────
function ProjectListCard({ project:p, achievementCount, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background:hovered?C.cardHover:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:16, padding:"15px 17px", marginBottom:9, cursor:"pointer", boxShadow:C.cardShadow, position:"relative", overflow:"hidden", transition:"background 0.12s" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:p.isHighlight?C.amber:C.moss, opacity:p.isHighlight?0.7:0.3, borderRadius:"16px 16px 0 0" }} />
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:9 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, flex:1, minWidth:0 }}>
          <Icon.Folder color={p.isHighlight?C.amber:C.moss} size={14} />
          <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:700, color:C.walnut }}>{p.name}</span>
          {p.isHighlight && <Icon.Star filled size={12} />}
        </div>
        <StatusBadge status={p.status} />
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:11 }}>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}><Icon.Building /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber }}>{p.company}</span></div>
        <span style={{ width:3, height:3, borderRadius:"50%", background:C.umber, opacity:0.4 }} />
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber }}>{fmtDate(p.startDate)}{p.endDate?` — ${fmtDate(p.endDate)}`:" — Present"}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:20, padding:"3px 9px" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.moss} strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.moss, fontWeight:500 }}>{achievementCount} achievement{achievementCount!==1?"s":""}</span>
        </div>
        <Icon.Chevron dir="right" />
      </div>
    </div>
  );
}

// ─── Inline Project Picker ────────────────────────────────────────────────────
function InlineProjectPicker({ projectId, projects, onSelect, onCreateNew, onViewProject, editMode }) {
  const [open, setOpen] = useState(false);
  const activeProjects = projects.filter(p => p.status==="active");
  const selected = projects.find(p => p.id === projectId);
  if (selected && !open) return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <button onClick={() => onViewProject(selected.id)} style={{ display:"inline-flex", alignItems:"center", gap:6, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:20, padding:"5px 12px 5px 10px", cursor:"pointer" }}>
        <Icon.Folder color={C.moss} size={12} />
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.moss, fontWeight:500 }}>{selected.name}</span>
        <Icon.Chevron dir="right" color={C.moss} />
      </button>
      {editMode && <button onClick={() => setOpen(true)} style={{ width:26, height:26, borderRadius:8, background:C.card, border:`1px solid ${C.cardBorder}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Icon.Edit /></button>}
    </div>
  );
  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ display:"inline-flex", alignItems:"center", gap:5, background:"transparent", border:`1px dashed ${C.cardBorder}`, borderRadius:20, padding:"5px 11px", cursor:"pointer" }}>
      <Icon.Plus color={C.umber} size={11} /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber }}>Add to project</span>
    </button>
  );
  return (
    <div style={{ background:C.card, border:`1px solid ${C.moss}`, borderRadius:12, overflow:"hidden", boxShadow:"0 6px 24px rgba(42,33,24,0.12)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 13px 7px", borderBottom:`1px solid ${C.divider}` }}>
        <SectionLabel>Select project</SectionLabel>
        <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex" }}><Icon.X size={13} /></button>
      </div>
      {projectId && <div onClick={() => { onSelect(null); setOpen(false); }} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 13px", cursor:"pointer", borderBottom:`1px solid ${C.divider}` }} onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><Icon.X size={12} color={C.umber} /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.umber }}>Remove from project</span></div>}
      {activeProjects.map(p => (
        <div key={p.id} onClick={() => { onSelect(p.id); setOpen(false); }} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, padding:"8px 13px", cursor:"pointer", borderBottom:`1px solid ${C.divider}`, background:projectId===p.id?C.mossFaint:"transparent" }} onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=projectId===p.id?C.mossFaint:"transparent"}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}><Icon.Folder color={C.moss} size={12} /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.walnut }}>{p.name}</span></div>
          {projectId===p.id && <Icon.Check />}
        </div>
      ))}
      <div onClick={() => { setOpen(false); onCreateNew(); }} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 13px", cursor:"pointer" }} onMouseEnter={e=>e.currentTarget.style.background=C.mossFaint} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <div style={{ width:20, height:20, borderRadius:6, background:C.moss, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon.Plus color="white" size={11} /></div>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.moss, fontWeight:500 }}>New project…</span>
      </div>
    </div>
  );
}

// ─── Project Sheet ────────────────────────────────────────────────────────────
function ProjectSheet({ project, onSave, onDelete, onClose }) {
  const isNew = !project;
  const [name, setName] = useState(project?.name ?? "");
  const [startDate, setStartDate] = useState(project?.startDate ?? todayISO());
  const [endDate, setEndDate] = useState(project?.endDate ?? "");
  const [status, setStatus] = useState(project?.status ?? "active");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const handleStatusChange = s => { setStatus(s); if (s==="completed"&&!endDate) setEndDate(todayISO()); if (s==="active") setEndDate(""); };
  const inp = { width:"100%", background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:"9px 12px", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.walnut, colorScheme:"light" };
  const lbl = { fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", color:C.umber, marginBottom:5, display:"block" };
  return (
    <>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(42,33,24,0.4)", zIndex:40, backdropFilter:"blur(3px)" }} />
      <div style={isNew?{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"calc(100% - 40px)",zIndex:50,background:C.card,borderRadius:22,boxShadow:"0 20px 60px rgba(42,33,24,0.25)",padding:"0 0 22px"}:{position:"absolute",bottom:0,left:0,right:0,zIndex:50,background:C.card,borderRadius:"22px 22px 0 0",boxShadow:"0 -8px 40px rgba(42,33,24,0.15)",padding:"0 0 28px"}}>
        {!isNew && <div style={{ display:"flex", justifyContent:"center", padding:"10px 0 3px" }}><div style={{ width:34, height:4, borderRadius:2, background:C.blush }} /></div>}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:isNew?"18px 20px 14px":"10px 20px 16px" }}>
          <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:700, color:C.walnut }}>{isNew?"New project":"Edit project"}</h2>
          <button onClick={onClose} style={{ background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:8, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Icon.X size={15} /></button>
        </div>
        <div style={{ padding:"0 20px", display:"flex", flexDirection:"column", gap:14 }}>
          <div><label style={lbl}>Project name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Q3 Infrastructure Overhaul" style={inp} /></div>
          {!isNew && (
            <div>
              <label style={lbl}>Status</label>
              <div style={{ display:"flex", gap:8 }}>
                {["active","completed"].map(s=><button key={s} onClick={()=>handleStatusChange(s)} style={{ flex:1, padding:"8px 0", borderRadius:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12.5, fontWeight:status===s?500:400, background:status===s?(s==="active"?C.moss:C.card):C.bg, border:`1px solid ${status===s?(s==="active"?C.moss:C.cardBorder):C.cardBorder}`, color:status===s?(s==="active"?"white":C.walnut):C.umber, transition:"all 0.15s" }}>{STATUS[s].label}</button>)}
              </div>
            </div>
          )}
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}><label style={lbl}>Start date</label><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={inp} /></div>
            <div style={{ flex:1 }}><label style={{ ...lbl, color:status==="active"?C.blush:C.umber }}>End date</label><input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} disabled={status==="active"} style={{ ...inp, opacity:status==="active"?0.4:1 }} /></div>
          </div>
          <button onClick={()=>name.trim()&&onSave({name:name.trim(),startDate,endDate:endDate||null,status})} style={{ width:"100%", padding:"12px 0", borderRadius:13, border:"none", background:name.trim()?C.moss:C.cardBorder, color:"white", fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:700, cursor:name.trim()?"pointer":"not-allowed", boxShadow:name.trim()?`0 4px 14px ${C.mossGlow}`:"none", transition:"all 0.15s" }}>
            {isNew?"Create project":"Save changes"}
          </button>
          {!isNew&&(!showDeleteConfirm
            ?<button onClick={()=>setShowDeleteConfirm(true)} style={{ width:"100%", padding:"9px 0", borderRadius:11, border:`1px solid ${C.dangerBorder}`, background:C.dangerFaint, color:C.danger, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><Icon.Trash />Delete project</button>
            :<div style={{ background:C.dangerFaint, border:`1px solid ${C.dangerBorder}`, borderRadius:11, padding:"12px 14px" }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.walnut, lineHeight:1.5, marginBottom:10, textAlign:"center" }}>Delete this project? Achievements won't be affected.</p>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setShowDeleteConfirm(false)} style={{ flex:1, padding:"8px 0", borderRadius:9, border:`1px solid ${C.cardBorder}`, background:C.card, color:C.umber, fontFamily:"'DM Sans',sans-serif", fontSize:12.5, cursor:"pointer" }}>Cancel</button>
                <button onClick={onDelete} style={{ flex:1, padding:"8px 0", borderRadius:9, border:"none", background:C.danger, color:"white", fontFamily:"'DM Sans',sans-serif", fontSize:12.5, fontWeight:500, cursor:"pointer" }}>Yes, delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Achievement Detail ───────────────────────────────────────────────────────
function AchievementDetail({ achievementId, entries, breadcrumb, projects, onBack, onUpdateAchievement, onCreateProject, onNavigate, onNavigateToProject }) {
  const liveEntry = entries.find(e=>e.achievements.some(a=>a.id===achievementId));
  const liveA = liveEntry?.achievements.find(a=>a.id===achievementId);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editStar, setEditStar] = useState({});
  const [editTags, setEditTags] = useState([]);
  const [notesOpen, setNotesOpen] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  if (!liveA) return null;
  const starFields = [{key:"situation",label:"Situation"},{key:"task",label:"Task"},{key:"action",label:"Action"},{key:"result",label:"Result"}];
  const startEdit = ()=>{ setEditName(liveA.name); setEditSummary(liveA.summary); setEditStar({...liveA.star}); setEditTags([...liveA.tags]); setEditing(true); };
  const saveEdit = ()=>{ onUpdateAchievement(achievementId,{name:editName,summary:editSummary,star:editStar,tags:editTags}); setEditing(false); };
  const handleCreateProject = data=>{ const newId=onCreateProject(data); onUpdateAchievement(achievementId,{projectId:newId}); setShowNewProject(false); };
  const ta = { width:"100%", background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:9, padding:"8px 11px", fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.walnut, resize:"vertical", lineHeight:1.6 };
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", position:"relative" }}>
      <StatusBar />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px 10px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={onBack} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:9, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Icon.Back /></button>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber }}>{breadcrumb}</span>
        </div>
        <div style={{ display:"flex", gap:7 }}>
          <button onClick={()=>onUpdateAchievement(achievementId,{isHighlight:!liveA.isHighlight})} style={{ display:"flex", alignItems:"center", gap:5, background:liveA.isHighlight?C.amberFaint:C.card, border:`1px solid ${liveA.isHighlight?C.amberBorder:C.cardBorder}`, borderRadius:9, padding:"5px 10px", cursor:"pointer" }}>
            <Icon.Star filled={liveA.isHighlight} size={13} />
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:liveA.isHighlight?C.amber:C.umber, fontWeight:500 }}>{liveA.isHighlight?"Highlighted":"Highlight"}</span>
          </button>
          {editing
            ?<button onClick={saveEdit} style={{ display:"flex", alignItems:"center", gap:5, background:C.moss, border:"none", borderRadius:9, padding:"5px 12px", cursor:"pointer" }}><Icon.Save /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"white", fontWeight:500 }}>Save</span></button>
            :<button onClick={startEdit} style={{ width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:9, cursor:"pointer" }}><Icon.Edit /></button>
          }
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"0 20px 14px", scrollbarWidth:"none" }}>
        {editing?<input value={editName} onChange={e=>setEditName(e.target.value)} style={{ width:"100%", fontFamily:"'Nunito',sans-serif", fontSize:19, fontWeight:700, color:C.walnut, background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:9, padding:"7px 11px", marginBottom:4 }} />
          :<h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:19, fontWeight:700, color:C.walnut, lineHeight:1.25, letterSpacing:"-0.3px", marginBottom:4 }}>{liveA.name}</h1>}
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, marginBottom:16 }}>{liveEntry?.date}</div>
        <SectionLabel style={{ marginBottom:7 }}>Summary</SectionLabel>
        {editing?<textarea value={editSummary} onChange={e=>setEditSummary(e.target.value)} rows={3} style={{ ...ta, marginBottom:16 }} />
          :<div style={{ marginBottom:16 }}><AISummaryCard text={liveA.summary} /></div>}
        <SectionLabel style={{ marginBottom:7 }}>Project</SectionLabel>
        <div style={{ marginBottom:16 }}>
          <InlineProjectPicker projectId={liveA.projectId} projects={projects} editMode={editing}
            onSelect={projId=>onUpdateAchievement(achievementId,{projectId:projId})}
            onCreateNew={()=>setShowNewProject(true)} onViewProject={onNavigateToProject} />
        </div>
        <SectionLabel style={{ marginBottom:8 }}>STAR Breakdown</SectionLabel>
        <div style={{ marginBottom:14 }}>
          {starFields.map(({key,label},i)=>(
            <div key={key} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"11px 14px", marginBottom:7, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:C.moss, opacity:[0.7,0.5,0.55,0.75][i], borderRadius:"0 2px 2px 0" }} />
              <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, fontWeight:700, color:C.moss, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:4 }}>{label}</div>
              {editing?<textarea value={editStar[key]??""} onChange={e=>setEditStar(prev=>({...prev,[key]:e.target.value}))} rows={2} style={ta} />
                :<p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, lineHeight:1.6, color:C.walnut, fontWeight:300 }}>{liveA.star[key]||<span style={{color:C.umber,fontStyle:"italic"}}>Not captured</span>}</p>}
            </div>
          ))}
        </div>
        <SectionLabel style={{ marginBottom:7 }}>Tags</SectionLabel>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
          {(editing?editTags:liveA.tags).map(t=>(
            <span key={t} style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:20, padding:"3px 8px 3px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.mossDeep }}>
              {t}{editing&&<button onClick={()=>setEditTags(p=>p.filter(x=>x!==t))} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:0 }}><Icon.X size={11} color={C.mossDeep} /></button>}
            </span>
          ))}
          {!editing&&<span style={{ display:"inline-flex", alignItems:"center", gap:4, background:"transparent", border:`1px dashed ${C.cardBorder}`, borderRadius:20, padding:"3px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, cursor:"pointer" }}><Icon.Plus size={10} />Add tag</span>}
        </div>
        <button onClick={()=>setNotesOpen(!notesOpen)} style={{ width:"100%", background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:notesOpen?"12px 12px 0 0":12, padding:"11px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.umber} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, fontWeight:500, color:C.walnut }}>Your notes</span>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber }}>({liveA.notes.length})</span>
          </div>
          <Icon.Chevron dir={notesOpen?"up":"down"} />
        </button>
        {notesOpen&&(
          <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderTop:"none", borderRadius:"0 0 12px 12px", padding:"4px 14px 12px" }}>
            <div style={{ height:1, background:C.divider, marginBottom:10 }} />
            {liveA.notes.map((n,i)=>(
              <div key={i} style={{ marginBottom:i<liveA.notes.length-1?12:0 }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, marginBottom:3 }}>{n.q}</div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.walnut, lineHeight:1.6, fontWeight:300 }}>{n.a}</p>
                {i<liveA.notes.length-1&&<div style={{ height:1, background:C.divider, marginTop:10 }} />}
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav active="entries" onNavigate={onNavigate} />
      {showNewProject&&<ProjectSheet project={null} onSave={handleCreateProject} onClose={()=>setShowNewProject(false)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD ENTRY PAGE (full-screen overlay)
// ═══════════════════════════════════════════════════════════════════════════════
function AddEntryPage({ projects, onSave, onClose, onCreateProject }) {
  const [step, setStep]               = useState("input"); // input | processing | review
  const [headline, setHeadline]       = useState("");
  const [situation, setSituation]     = useState("");
  const [action, setAction]           = useState("");
  const [result, setResult]           = useState("");
  const [metrics, setMetrics]         = useState("");
  const [skills, setSkills]           = useState("");
  const [projectId, setProjectId]     = useState(null);
  const [expandedQ, setExpandedQ]     = useState(null);
  const [procIdx, setProcIdx]         = useState(0);
  const [synthesized, setSynthesized] = useState(null);
  const [editName, setEditName]       = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editTags, setEditTags]       = useState([]);
  const [editProjectId, setEditProjectId] = useState(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newTag, setNewTag]           = useState("");
  const timerRef = useRef(null);

  const PROC_STEPS = ["Reading your entry…","Identifying achievements…","Building your synthesis…","Finalizing…"];
  const STAR_Qs = [
    { key:"situation", label:"What was the situation or challenge?",  val:situation, set:setSituation },
    { key:"action",    label:"What did you specifically do?",          val:action,    set:setAction    },
    { key:"result",    label:"What was the result or impact?",         val:result,    set:setResult    },
    { key:"metrics",   label:"Any numbers or data to support this?",   val:metrics,   set:setMetrics   },
    { key:"skills",    label:"What skills did this highlight?",        val:skills,    set:setSkills    },
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
          setSynthesized(s);
          setEditName(s.name);
          setEditSummary(s.summary);
          setEditTags(s.tags);
          setEditProjectId(projectId);
          setStep("review");
        }, 500);
      }
    }, 650);
  };

  const handleDone = () => {
    const newEntry = {
      id: `e${Date.now()}`,
      date: todayDisplay(),
      company: "Acme Corp",
      summary: editSummary,
      achievements: [{
        id: `a${Date.now()}`,
        name: editName,
        summary: editSummary,
        isHighlight: false,
        projectId: editProjectId,
        tags: editTags,
        star: { situation, task: "", action, result },
        notes: [
          ...(headline   ? [{ q:"What did you accomplish?", a:headline }] : []),
          ...(situation  ? [{ q:"What was the situation?",  a:situation }] : []),
          ...(action     ? [{ q:"What did you do?",         a:action }] : []),
          ...(result     ? [{ q:"What was the result?",     a:result }] : []),
        ],
      }],
    };
    onSave(newEntry);
    onClose();
  };

  const handleAddAnother = () => {
    setStep("input"); setHeadline(""); setSituation(""); setAction(""); setResult(""); setMetrics(""); setSkills(""); setProjectId(null); setExpandedQ(null); setProcIdx(0);
  };

  const ta = { width:"100%", background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:"10px 13px", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.walnut, resize:"none", lineHeight:1.7 };
  const lbl = { fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", color:C.umber, marginBottom:5, display:"block" };

  return (
    <div style={{ position:"absolute", inset:0, background:C.bg, zIndex:100, display:"flex", flexDirection:"column" }}>
      <StatusBar />

      {/* ── Step: Input ── */}
      {step === "input" && (
        <>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 18px 12px", flexShrink:0 }}>
            <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:700, color:C.walnut }}>New entry</h1>
            <button onClick={onClose} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:9, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Icon.X size={15} /></button>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:"0 18px", scrollbarWidth:"none" }}>
            {/* Main input */}
            <div style={{ background:C.card, borderRadius:16, padding:"16px", marginBottom:12, border:`1px solid ${C.cardBorder}`, boxShadow:C.cardShadow }}>
              <label style={lbl}>What did you accomplish?</label>
              <textarea value={headline} onChange={e=>setHeadline(e.target.value)} rows={4}
                placeholder="Describe what you worked on and why it mattered — in your own words."
                style={{ ...ta, background:"transparent", border:"none", padding:0, fontSize:14, lineHeight:1.65 }} />
              <div style={{ display:"flex", justifyContent:"flex-end", marginTop:6 }}>
                <button style={{ width:36, height:36, borderRadius:"50%", background:C.moss, border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:`0 3px 10px ${C.mossGlow}` }}>
                  <Icon.Mic size={16} />
                </button>
              </div>
            </div>

            {/* Optional STAR questions */}
            <div style={{ marginBottom:12 }}>
              <SectionLabel style={{ marginBottom:8 }}>Add more detail <span style={{ fontSize:9, color:C.blush, fontStyle:"normal", letterSpacing:"0", textTransform:"none" }}>optional</span></SectionLabel>
              {STAR_Qs.map(q => (
                <div key={q.key} style={{ background:C.card, border:`1px solid ${expandedQ===q.key?C.moss:C.cardBorder}`, borderRadius:11, marginBottom:6, overflow:"hidden", transition:"border-color 0.15s" }}>
                  <button onClick={() => setExpandedQ(expandedQ===q.key?null:q.key)}
                    style={{ width:"100%", padding:"10px 14px", background:"transparent", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:q.val?C.walnut:C.umber, textAlign:"left", lineHeight:1.4 }}>{q.label}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                      {q.val && <div style={{ width:6, height:6, borderRadius:"50%", background:C.moss }} />}
                      <Icon.Chevron dir={expandedQ===q.key?"up":"down"} color={expandedQ===q.key?C.moss:C.umber} />
                    </div>
                  </button>
                  {expandedQ===q.key && (
                    <div style={{ padding:"0 14px 12px" }}>
                      <textarea value={q.val} onChange={e=>q.set(e.target.value)} rows={3} placeholder="Type your answer…" style={ta} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Project selector */}
            <div style={{ marginBottom:16 }}>
              <SectionLabel style={{ marginBottom:8 }}>Project <span style={{ fontSize:9, color:C.blush, fontStyle:"normal", letterSpacing:"0", textTransform:"none" }}>optional</span></SectionLabel>
              <InlineProjectPicker projectId={projectId} projects={projects} editMode={false}
                onSelect={setProjectId} onCreateNew={()=>setShowNewProject(true)} onViewProject={()=>{}} />
            </div>
          </div>

          {/* Sticky synthesize button */}
          <div style={{ padding:"12px 18px 16px", flexShrink:0, borderTop:`1px solid ${C.divider}`, background:C.bg }}>
            <button onClick={handleSynthesize} disabled={!canSynthesize}
              style={{ width:"100%", padding:"14px 0", borderRadius:14, border:"none", background:canSynthesize?C.moss:C.cardBorder, color:"white", fontFamily:"'Nunito',sans-serif", fontSize:15, fontWeight:700, cursor:canSynthesize?"pointer":"not-allowed", boxShadow:canSynthesize?`0 6px 22px ${C.mossGlow}`:"none", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <Icon.Sparkle />
              Synthesize
            </button>
            {!canSynthesize && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, textAlign:"center", marginTop:6 }}>Write something above to continue</p>}
          </div>
        </>
      )}

      {/* ── Step: Processing ── */}
      {step === "processing" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 30px" }}>
          {/* Animated orb */}
          <div style={{ position:"relative", width:80, height:80, marginBottom:28 }}>
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:`linear-gradient(135deg, ${C.mossDeep}, ${C.moss})`, boxShadow:`0 8px 32px ${C.mossGlow}`, animation:"pulse 1.4s ease-in-out infinite" }} />
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon.Sparkle />
            </div>
          </div>
          <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:0.85} }`}</style>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:600, color:C.walnut, marginBottom:10 }}>Processing your entry</div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.umber, lineHeight:1.6, textAlign:"center", minHeight:40 }}>{PROC_STEPS[procIdx]}</div>
          {/* Step dots */}
          <div style={{ display:"flex", gap:8, marginTop:24 }}>
            {PROC_STEPS.map((_,i)=>(
              <div key={i} style={{ width:i<=procIdx?20:8, height:8, borderRadius:4, background:i<=procIdx?C.moss:C.cardBorder, transition:"all 0.3s" }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Step: Review ── */}
      {step === "review" && (
        <>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 18px 12px", flexShrink:0 }}>
            <div>
              <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:18, fontWeight:700, color:C.walnut }}>Review your achievement</h1>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber, marginTop:2 }}>Edit anything before saving</p>
            </div>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:"0 18px", scrollbarWidth:"none" }}>
            {/* Name */}
            <div style={{ marginBottom:14 }}>
              <label style={{ ...lbl, marginBottom:6 }}>Achievement name</label>
              <input value={editName} onChange={e=>setEditName(e.target.value)}
                style={{ width:"100%", fontFamily:"'Nunito',sans-serif", fontSize:15, fontWeight:700, color:C.walnut, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:11, padding:"10px 13px" }} />
            </div>

            {/* AI summary */}
            <div style={{ marginBottom:14 }}>
              <label style={{ ...lbl, marginBottom:7 }}>Summary</label>
              <AISummaryCard text={editSummary} />
              <button onClick={()=>{}} style={{ marginTop:6, background:"transparent", border:"none", fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, cursor:"pointer", padding:0, display:"flex", alignItems:"center", gap:4 }}><Icon.Edit color={C.umber} />Edit summary</button>
            </div>

            {/* Tags */}
            <div style={{ marginBottom:14 }}>
              <label style={{ ...lbl, marginBottom:7 }}>Tags</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {editTags.map(t=>(
                  <span key={t} style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:20, padding:"3px 8px 3px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.mossDeep }}>
                    {t}<button onClick={()=>setEditTags(p=>p.filter(x=>x!==t))} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:0 }}><Icon.X size={11} color={C.mossDeep} /></button>
                  </span>
                ))}
                <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                  <input value={newTag} onChange={e=>setNewTag(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newTag.trim()){setEditTags(p=>[...p,newTag.trim()]);setNewTag("");}}} placeholder="Add tag…"
                    style={{ background:"transparent", border:`1px dashed ${C.cardBorder}`, borderRadius:20, padding:"3px 10px", fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, width:90 }} />
                </div>
              </div>
              {/* Suggested tags */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8 }}>
                {SYSTEM_TAGS.filter(t=>!editTags.includes(t)).slice(0,5).map(t=>(
                  <button key={t} onClick={()=>setEditTags(p=>[...p,t])} style={{ background:"transparent", border:`1px dashed ${C.cardBorder}`, borderRadius:20, padding:"2px 9px", fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.umber, cursor:"pointer" }}>+ {t}</button>
                ))}
              </div>
            </div>

            {/* Project */}
            <div style={{ marginBottom:18 }}>
              <label style={{ ...lbl, marginBottom:7 }}>Project</label>
              <InlineProjectPicker projectId={editProjectId} projects={projects} editMode={true}
                onSelect={setEditProjectId} onCreateNew={()=>setShowNewProject(true)} onViewProject={()=>{}} />
            </div>
          </div>

          <div style={{ padding:"12px 18px 16px", flexShrink:0, borderTop:`1px solid ${C.divider}`, background:C.bg, display:"flex", gap:10 }}>
            <button onClick={handleAddAnother} style={{ flex:1, padding:"12px 0", borderRadius:12, border:`1px solid ${C.cardBorder}`, background:C.card, color:C.walnut, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, cursor:"pointer" }}>
              + Add another
            </button>
            <button onClick={handleDone} style={{ flex:2, padding:"12px 0", borderRadius:12, border:"none", background:C.moss, color:"white", fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 14px ${C.mossGlow}` }}>
              Save &amp; done
            </button>
          </div>
        </>
      )}

      {showNewProject && <ProjectSheet project={null} onSave={data=>{ const id=onCreateProject(data); setProjectId(id); setShowNewProject(false); }} onClose={()=>setShowNewProject(false)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE (full-screen overlay)
// ═══════════════════════════════════════════════════════════════════════════════
function SettingsPage({ onClose }) {
  const [section, setSection] = useState("main"); // main | profile | notifications | preferences | tags | account
  const [synthFormat, setSynthFormat] = useState("all");
  const [theme, setTheme] = useState("system");
  const [audioRetention, setAudioRetention] = useState(30);
  const [notifSound, setNotifSound] = useState(true);
  const [customTags, setCustomTags] = useState(["Fundraising","Board communication"]);
  const [newTag, setNewTag] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const row = (icon, label, sub, onClick, danger=false) => (
    <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:13, padding:"13px 18px", cursor:"pointer", background:C.card, borderBottom:`1px solid ${C.divider}` }}
      onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card}>
      <div style={{ width:34, height:34, borderRadius:10, background:danger?C.dangerFaint:C.mossFaint, border:`1px solid ${danger?C.dangerBorder:C.mossBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:danger?C.danger:C.walnut, fontWeight:500 }}>{label}</div>
        {sub && <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, marginTop:1 }}>{sub}</div>}
      </div>
      <Icon.Chevron dir="right" color={danger?C.danger:C.umber} />
    </div>
  );

  const navBack = () => setSection("main");
  const sectionHeader = (title) => (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 18px 14px", flexShrink:0 }}>
      <button onClick={navBack} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:9, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Icon.Back /></button>
      <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:18, fontWeight:700, color:C.walnut }}>{title}</h2>
    </div>
  );

  const inp = { width:"100%", background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:"10px 13px", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.walnut };
  const lbl = { fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", color:C.umber, marginBottom:6, display:"block" };

  return (
    <div style={{ position:"absolute", inset:0, background:C.bg, zIndex:100, display:"flex", flexDirection:"column" }}>
      <StatusBar />

      {/* ── Main settings list ── */}
      {section === "main" && (
        <>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 18px 14px", flexShrink:0 }}>
            <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:22, fontWeight:700, color:C.walnut }}>Settings</h1>
            <button onClick={onClose} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:9, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Icon.X size={15} /></button>
          </div>
          <div style={{ flex:1, overflowY:"auto", scrollbarWidth:"none" }}>
            {/* Profile card at top */}
            <div onClick={() => setSection("profile")} style={{ margin:"0 18px 20px", background:C.card, borderRadius:16, padding:"16px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", border:`1px solid ${C.cardBorder}`, boxShadow:C.cardShadow }}
              onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card}>
              <div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg, #5C7A52, #4A6642)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 4px 14px ${C.mossGlow}` }}>
                <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:700, color:"white" }}>S</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:16, fontWeight:700, color:C.walnut }}>Stephanie Soderborg</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber, marginTop:1 }}>stephanie@example.com</div>
                <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:20, padding:"2px 8px", marginTop:5 }}>
                  <Icon.Building />
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.moss }}>Acme Corp · Senior Software Engineer</span>
                </div>
              </div>
              <Icon.Chevron dir="right" />
            </div>

            {/* Section groups */}
            <div style={{ margin:"0 18px 8px" }}>
              <SectionLabel style={{ marginBottom:8 }}>App</SectionLabel>
            </div>
            <div style={{ background:C.card, borderRadius:14, overflow:"hidden", margin:"0 18px 18px", border:`1px solid ${C.cardBorder}` }}>
              {row(<Icon.Bell color={C.moss} />, "Notifications", "Weekly wins · Quarterly review", ()=>setSection("notifications"))}
              {row(<Icon.Settings color={C.moss} />, "Preferences", "Synthesis format, theme, audio", ()=>setSection("preferences"))}
              {row(<Icon.Tag color={C.moss} />, "Tags", "Manage your tag library", ()=>setSection("tags"))}
            </div>

            <div style={{ margin:"0 18px 8px" }}>
              <SectionLabel style={{ marginBottom:8 }}>Account</SectionLabel>
            </div>
            <div style={{ background:C.card, borderRadius:14, overflow:"hidden", margin:"0 18px 18px", border:`1px solid ${C.cardBorder}` }}>
              {row(<Icon.User color={C.moss} />, "Company history", "Add or update your roles", ()=>setSection("company"))}
              {row(<Icon.LogOut />, "Sign out", null, ()=>{}, true)}
            </div>

            <div style={{ margin:"0 18px" }}>
              <button onClick={()=>setShowDeleteConfirm(true)} style={{ width:"100%", padding:"11px 0", borderRadius:11, border:`1px solid ${C.dangerBorder}`, background:C.dangerFaint, color:C.danger, fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer", marginBottom:8 }}>
                Delete account
              </button>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.umber, textAlign:"center", lineHeight:1.5, paddingBottom:16 }}>Career Memory · v1.0 · Made with ♥ for your future self</p>
            </div>

            {showDeleteConfirm && (
              <>
                <div onClick={()=>setShowDeleteConfirm(false)} style={{ position:"absolute", inset:0, background:"rgba(42,33,24,0.4)", zIndex:40, backdropFilter:"blur(3px)" }} />
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"calc(100% - 48px)", zIndex:50, background:C.card, borderRadius:18, padding:"24px 20px", boxShadow:"0 20px 60px rgba(42,33,24,0.25)" }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:700, color:C.walnut, marginBottom:8, textAlign:"center" }}>Delete your account?</div>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.umber, lineHeight:1.6, textAlign:"center", marginBottom:18 }}>All your entries, achievements, and projects will be permanently removed. This can't be undone.</p>
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={()=>setShowDeleteConfirm(false)} style={{ flex:1, padding:"11px 0", borderRadius:10, border:`1px solid ${C.cardBorder}`, background:C.bg, color:C.walnut, fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer" }}>Cancel</button>
                    <button style={{ flex:1, padding:"11px 0", borderRadius:10, border:"none", background:C.danger, color:"white", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, cursor:"pointer" }}>Delete</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ── Profile section ── */}
      {section === "profile" && (
        <>
          {sectionHeader("Profile")}
          <div style={{ flex:1, overflowY:"auto", padding:"0 18px", scrollbarWidth:"none" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:22 }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg, ${C.moss}, ${C.mossDeep})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 6px 20px ${C.mossGlow}`, marginBottom:8 }}>
                <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:28, fontWeight:700, color:"white" }}>S</span>
              </div>
              <button style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.moss, background:"transparent", border:"none", cursor:"pointer", fontWeight:500 }}>Change photo</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div><label style={lbl}>First name</label><input defaultValue="Stephanie" style={inp} /></div>
              <div><label style={lbl}>Last name</label><input defaultValue="Soderborg" style={inp} /></div>
              <div><label style={lbl}>Email</label><input defaultValue="stephanie@example.com" type="email" style={inp} /></div>
              <div>
                <label style={lbl}>Current company</label>
                <div style={{ background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:"10px 13px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.walnut }}>Acme Corp</span>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.mossFaint, borderRadius:20, padding:"2px 8px", fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.moss }}>Current</span>
                </div>
              </div>
              <div><label style={lbl}>Default role title</label><input defaultValue="Senior Software Engineer" style={inp} /></div>
              <div><label style={lbl}>Timezone</label>
                <select defaultValue="America/Los_Angeles" style={{ ...inp, appearance:"none", cursor:"pointer" }}>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                </select>
              </div>
              <button style={{ width:"100%", padding:"12px 0", borderRadius:12, border:"none", background:C.moss, color:"white", fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 14px ${C.mossGlow}` }}>Save changes</button>
            </div>
          </div>
        </>
      )}

      {/* ── Notifications section ── */}
      {section === "notifications" && (
        <>
          {sectionHeader("Notifications")}
          <div style={{ flex:1, overflowY:"auto", padding:"0 18px", scrollbarWidth:"none" }}>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.umber, lineHeight:1.6, marginBottom:16 }}>Each schedule fires independently. Add as many as you like.</p>
            {[
              { label:"Weekly wins", cadence:"Every Friday · 5:00 PM", active:true },
              { label:"Quarterly review", cadence:"Every 3 months · Monday · 9:00 AM", active:true },
            ].map((s,i) => (
              <div key={i} style={{ background:C.card, borderRadius:14, padding:"14px 16px", marginBottom:10, border:`1px solid ${C.cardBorder}`, display:"flex", alignItems:"center", gap:12, boxShadow:C.cardShadow }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:500, color:C.walnut }}>{s.label}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.umber, marginTop:2 }}>{s.cadence}</div>
                </div>
                <div style={{ cursor:"pointer" }}><Icon.Toggle on={s.active} /></div>
                <button style={{ background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:7, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Icon.Edit /></button>
              </div>
            ))}
            <button style={{ width:"100%", padding:"12px 0", borderRadius:12, border:`1px dashed ${C.mossBorder}`, background:C.mossFaint, color:C.moss, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:6 }}>
              <Icon.Plus color={C.moss} size={13} />Add schedule
            </button>
          </div>
        </>
      )}

      {/* ── Preferences section ── */}
      {section === "preferences" && (
        <>
          {sectionHeader("Preferences")}
          <div style={{ flex:1, overflowY:"auto", padding:"0 18px", scrollbarWidth:"none" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              {/* Synthesis format */}
              <div>
                <label style={lbl}>Synthesis format</label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[["paragraph","Paragraph"],["bullets","Bullets"],["star","STAR only"],["all","All three"]].map(([val,lab])=>(
                    <button key={val} onClick={()=>setSynthFormat(val)} style={{ padding:"10px 0", borderRadius:11, border:`1px solid ${synthFormat===val?C.moss:C.cardBorder}`, background:synthFormat===val?C.moss:C.card, color:synthFormat===val?"white":C.umber, fontFamily:"'DM Sans',sans-serif", fontSize:12.5, fontWeight:synthFormat===val?500:400, cursor:"pointer", transition:"all 0.15s" }}>
                      {lab}
                    </button>
                  ))}
                </div>
              </div>
              {/* Theme */}
              <div>
                <label style={lbl}>Theme</label>
                <div style={{ display:"flex", gap:8 }}>
                  {[["light","Light"],["dark","Dark"],["system","System"]].map(([val,lab])=>(
                    <button key={val} onClick={()=>setTheme(val)} style={{ flex:1, padding:"10px 0", borderRadius:11, border:`1px solid ${theme===val?C.moss:C.cardBorder}`, background:theme===val?C.moss:C.card, color:theme===val?"white":C.umber, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:theme===val?500:400, cursor:"pointer", transition:"all 0.15s" }}>
                      {lab}
                    </button>
                  ))}
                </div>
              </div>
              {/* Notification sound */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:C.card, borderRadius:13, padding:"14px 16px", border:`1px solid ${C.cardBorder}` }}>
                <div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.walnut, fontWeight:500 }}>Notification sound</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, marginTop:2 }}>Play a sound when a reminder fires</div>
                </div>
                <div onClick={()=>setNotifSound(!notifSound)} style={{ cursor:"pointer" }}><Icon.Toggle on={notifSound} /></div>
              </div>
              {/* Audio retention */}
              <div>
                <label style={lbl}>Audio retention</label>
                <div style={{ background:C.card, borderRadius:13, padding:"14px 16px", border:`1px solid ${C.cardBorder}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.walnut }}>Keep audio files for</span>
                    <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:700, color:C.moss }}>{audioRetention} days</span>
                  </div>
                  <input type="range" min={7} max={90} step={7} value={audioRetention} onChange={e=>setAudioRetention(Number(e.target.value))}
                    style={{ width:"100%", accentColor:C.moss }} />
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.umber }}>7 days</span>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.umber }}>90 days</span>
                  </div>
                </div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, marginTop:6, lineHeight:1.5 }}>Audio is automatically deleted after this period. Your transcribed text is always kept.</p>
              </div>
              <button style={{ width:"100%", padding:"12px 0", borderRadius:12, border:"none", background:C.moss, color:"white", fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 14px ${C.mossGlow}` }}>Save preferences</button>
            </div>
          </div>
        </>
      )}

      {/* ── Tags section ── */}
      {section === "tags" && (
        <>
          {sectionHeader("Tags")}
          <div style={{ flex:1, overflowY:"auto", padding:"0 18px", scrollbarWidth:"none" }}>
            <SectionLabel style={{ marginBottom:8 }}>System tags</SectionLabel>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:18 }}>
              {SYSTEM_TAGS.map(t=>(
                <span key={t} style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:20, padding:"4px 11px", fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.walnut }}>
                  {t}
                </span>
              ))}
            </div>
            <SectionLabel style={{ marginBottom:8 }}>Your custom tags</SectionLabel>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
              {customTags.map(t=>(
                <span key={t} style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.mossFaint, border:`1px solid ${C.mossBorder}`, borderRadius:20, padding:"4px 8px 4px 11px", fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.mossDeep }}>
                  {t}<button onClick={()=>setCustomTags(p=>p.filter(x=>x!==t))} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:0 }}><Icon.X size={11} color={C.mossDeep} /></button>
                </span>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={newTag} onChange={e=>setNewTag(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newTag.trim()){setCustomTags(p=>[...p,newTag.trim()]);setNewTag("");}}} placeholder="Add a custom tag…"
                style={{ flex:1, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:"9px 13px", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.walnut }} />
              <button onClick={()=>{if(newTag.trim()){setCustomTags(p=>[...p,newTag.trim()]);setNewTag("");}}} style={{ padding:"9px 16px", borderRadius:10, border:"none", background:C.moss, color:"white", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, cursor:"pointer" }}>Add</button>
            </div>
          </div>
        </>
      )}

      {/* ── Company section ── */}
      {section === "company" && (
        <>
          {sectionHeader("Company history")}
          <div style={{ flex:1, overflowY:"auto", padding:"0 18px", scrollbarWidth:"none" }}>
            {Object.entries(COMPANY_META).map(([name, meta]) => (
              <div key={name} style={{ background:C.card, borderRadius:14, padding:"15px 16px", marginBottom:10, border:`1px solid ${C.cardBorder}`, boxShadow:C.cardShadow }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                      <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:700, color:C.walnut }}>{name}</span>
                      {meta.isCurrent && <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, background:C.mossFaint, color:C.moss, border:`1px solid ${C.mossBorder}`, borderRadius:20, padding:"1px 7px" }}>Current</span>}
                    </div>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.walnut, opacity:0.8, marginBottom:2 }}>{meta.role}</div>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber }}>{meta.startDate} — {meta.endDate ?? "Present"}</div>
                  </div>
                  <button style={{ background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:7, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Icon.Edit /></button>
                </div>
              </div>
            ))}
            <button style={{ width:"100%", padding:"12px 0", borderRadius:12, border:`1px dashed ${C.mossBorder}`, background:C.mossFaint, color:C.moss, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:4 }}>
              <Icon.Plus color={C.moss} size={13} />Add company
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOME TAB
// ═══════════════════════════════════════════════════════════════════════════════
function HomeTab({ entries, projects, onNavigate, onNavigateToProject, onNavigateToAchievement, onOpenAddEntry, onOpenSettings }) {
  const allAchs = entries.flatMap(e => e.achievements);
  const highlights = [
    ...allAchs.filter(a => a.isHighlight).map(a => ({ id:a.id, name:a.name, type:"achievement", achievementId:a.id })),
    ...projects.filter(p => p.isHighlight).map(p => ({ id:p.id, name:p.name, type:"project", projectId:p.id })),
  ];
  const recentProjectIds = [...new Set(entries.slice(0,3).flatMap(e => e.achievements.map(a => a.projectId).filter(Boolean)))];
  const recentProject = recentProjectIds.length > 0 ? projects.find(p => p.id === recentProjectIds[0]) : null;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <StatusBar />
      <div style={{ flex:1, overflowY:"auto", padding:"0 20px 12px", scrollbarWidth:"none" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0 18px" }}>
          <div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:2 }}>Good morning</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:24, fontWeight:600, color:C.walnut, letterSpacing:"-0.3px", lineHeight:1.1 }}>Welcome back, Stephanie</div>
          </div>
          <button onClick={onOpenSettings} style={{ width:38, height:38, borderRadius:"50%", background:"#EDE5D4", border:`1.5px solid ${C.blush}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:700, color:C.moss, flexShrink:0 }}>S</button>
        </div>

        <SectionLabel style={{ marginBottom:9 }}>Recent focus</SectionLabel>
        <div style={{ background:C.card, borderRadius:16, padding:"15px 18px", marginBottom:18, position:"relative", overflow:"hidden", border:`1px solid ${C.cardBorder}`, boxShadow:C.cardShadow }}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:C.moss, opacity:0.5, borderRadius:"0 2px 2px 0" }} />
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, lineHeight:1.7, color:C.walnut, fontWeight:300 }}>
            {recentProject
              ?<>You've had a strong few weeks. Your <strong style={{ fontWeight:500, color:C.mossDeep }}>{recentProject.name}</strong> is picking up momentum — {liveAchievementCount(recentProject.id, entries)} achievements logged so far. Keep capturing while it's fresh.</>
              :<>You've been busy lately. Keep logging your wins while they're fresh — every entry makes your next review easier.</>
            }
          </p>
        </div>

        {/* Add Entry CTA */}
        <button onClick={onOpenAddEntry} style={{ width:"100%", background:C.moss, border:"none", borderRadius:14, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", marginBottom:20, boxShadow:`0 6px 22px ${C.mossGlow}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:34, height:34, background:"rgba(255,255,255,0.15)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(255,255,255,0.2)" }}><Icon.Mic /></div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:600, color:"white" }}>Log an achievement</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(255,255,255,0.65)", marginTop:1 }}>Voice or text · takes 2 minutes</div>
            </div>
          </div>
          <Icon.Chevron dir="right" color="rgba(255,255,255,0.7)" />
        </button>

        {/* Stats — each is clickable */}
        <SectionLabel style={{ marginBottom:9 }}>Your progress</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:9, marginBottom:20 }}>
          {[
            { label:"Entries",      val:entries.length,                                   nav:()=>onNavigate("entries")  },
            { label:"Achievements", val:entries.flatMap(e=>e.achievements).length,        nav:()=>{ onNavigate("entries"); } },
            { label:"Projects",     val:projects.length,                                  nav:()=>onNavigate("projects") },
          ].map(({label,val,nav}) => (
            <div key={label} onClick={nav} style={{ background:C.card, borderRadius:14, padding:"14px 10px", textAlign:"center", border:`1px solid ${C.cardBorder}`, boxShadow:C.cardShadow, cursor:"pointer" }}
              onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:32, fontWeight:700, color:C.walnut, lineHeight:1, letterSpacing:"-1px" }}>{val}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.umber, marginTop:4, letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:9 }}>
          <SectionLabel style={{ marginBottom:0 }}>Highlights</SectionLabel>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.moss, fontWeight:500, cursor:"pointer" }}>See all</span>
        </div>
        {highlights.length === 0
          ?<div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"16px", textAlign:"center" }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.umber }}>Mark an achievement as a highlight and it'll appear here.</p>
            </div>
          :highlights.map(h=>(
            <div key={h.id}
              onClick={() => h.type==="project" ? onNavigateToProject(h.projectId) : onNavigateToAchievement(h.achievementId)}
              style={{ background:C.card, borderRadius:12, padding:"11px 14px", marginBottom:7, display:"flex", alignItems:"center", gap:11, border:`1px solid ${C.cardBorder}`, cursor:"pointer", boxShadow:C.cardShadow }}
              onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card}>
              <div style={{ width:28, height:28, background:C.amberFaint, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1px solid ${C.amberBorder}` }}><Icon.Star filled size={13} /></div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.walnut, lineHeight:1.3 }}>{h.name}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.umber, marginTop:2, textTransform:"capitalize" }}>{h.type}</div>
              </div>
              <Icon.Chevron dir="right" />
            </div>
          ))
        }
      </div>
      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY TAB
// ═══════════════════════════════════════════════════════════════════════════════
function SummaryTab({ entries, projects, onNavigate }) {
  const resumeData = buildResumeData(entries, projects);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const exportOptions = [
    { label:"Copy all", soon:false },
    { label:"Copy for LinkedIn", soon:true },
    { label:"Export .docx", soon:true },
    { label:"Export PDF", soon:true },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", position:"relative" }}>
      <StatusBar />
      <div style={{ padding:"2px 20px 12px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:24, fontWeight:700, color:C.walnut, letterSpacing:"-0.5px", lineHeight:1 }}>Summary</h1>
          <div style={{ position:"relative" }}>
            <button onClick={()=>setShowExportMenu(!showExportMenu)} style={{ display:"flex", alignItems:"center", gap:5, background:showExportMenu?C.moss:C.card, border:`1px solid ${showExportMenu?C.moss:C.cardBorder}`, borderRadius:9, padding:"6px 11px", cursor:"pointer", transition:"all 0.15s" }}>
              <Icon.Export />
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:showExportMenu?"white":C.umber, fontWeight:500 }}>Export</span>
              <Icon.Chevron dir={showExportMenu?"up":"down"} color={showExportMenu?"white":C.umber} />
            </button>
            {showExportMenu&&(
              <div style={{ position:"absolute", top:"calc(100% + 5px)", right:0, background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:11, overflow:"hidden", boxShadow:"0 8px 24px rgba(42,33,24,0.12)", zIndex:20, minWidth:178 }}>
                {exportOptions.map((opt,i)=>(
                  <button key={opt.label} onClick={()=>{ if(!opt.soon){setCopied(true);setShowExportMenu(false);setTimeout(()=>setCopied(false),2000); }}}
                    style={{ width:"100%", padding:"9px 13px", background:"transparent", border:"none", borderBottom:i<exportOptions.length-1?`1px solid ${C.divider}`:"none", fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:opt.soon?C.umber:C.walnut, fontWeight:opt.soon?400:500, textAlign:"left", cursor:opt.soon?"default":"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", opacity:opt.soon?0.8:1 }}
                    onMouseEnter={e=>{if(!opt.soon)e.currentTarget.style.background=C.cardHover;}} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    {opt.label}{opt.soon&&<span style={{ fontSize:9, color:C.blush }}>Soon</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.umber, marginTop:4 }}>Your career story, ready to use.</p>
      </div>
      {copied&&<div style={{ position:"absolute", top:58, left:"50%", transform:"translateX(-50%)", background:C.walnut, color:"white", borderRadius:20, padding:"7px 14px", zIndex:30, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, boxShadow:"0 4px 16px rgba(0,0,0,0.3)", display:"flex", alignItems:"center", gap:6 }}><Icon.Check color="white" />Copied</div>}
      <div style={{ flex:1, overflowY:"auto", padding:"0 16px 14px", scrollbarWidth:"none" }} onClick={()=>showExportMenu&&setShowExportMenu(false)}>
        {resumeData.map(role=><RoleBlock key={role.id} role={role} />)}
      </div>
      <BottomNav active="summary" onNavigate={onNavigate} />
    </div>
  );
}
function RoleBlock({ role }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:16, marginBottom:12, overflow:"hidden", boxShadow:C.cardShadow }}>
      <div style={{ padding:"14px 16px 12px", borderBottom:collapsed?"none":`1px solid ${C.divider}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:C.moss, opacity:0.35 }} />
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:15, fontWeight:800, color:C.walnut }}>{role.company}</span>
              {role.isCurrent&&<span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9.5, fontWeight:500, background:C.mossFaint, color:C.moss, border:`1px solid ${C.mossBorder}`, borderRadius:20, padding:"1px 7px" }}>Current</span>}
            </div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.walnut, opacity:0.8, marginBottom:2 }}>{role.role}</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber }}>{role.startDate} — {role.endDate??"Present"}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <CopyBtn />
            <button onClick={()=>setCollapsed(!collapsed)} style={{ background:"transparent", border:"none", cursor:"pointer", padding:4, display:"flex" }}><Icon.Chevron dir={collapsed?"down":"up"} /></button>
          </div>
        </div>
      </div>
      {!collapsed&&(
        <div style={{ padding:"14px 16px" }}>
          {role.projects.map(p=>(
            <div key={p.id} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}><Icon.Folder color={p.isHighlight?C.amber:C.moss} /><span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, color:C.walnut }}>{p.name}</span>{p.isHighlight&&<Icon.Star filled size={11} />}</div>
                <CopyBtn />
              </div>
              <div style={{ marginBottom:8 }}><AISummaryCard text={p.summary} label="Project summary" /></div>
              <div style={{ paddingLeft:4 }}>{p.achievements.map((text,i)=><div key={i} style={{ display:"flex", gap:9, alignItems:"flex-start", marginBottom:7 }}><Icon.Dot /><p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, lineHeight:1.6, color:C.walnut, fontWeight:300, flex:1 }}>{text}</p></div>)}</div>
            </div>
          ))}
          {role.standaloneAchievements.length>0&&(
            <>
              {role.projects.length>0&&<div style={{ height:1, background:C.divider, margin:"4px 0 12px" }} />}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:9 }}><SectionLabel style={{ marginBottom:0 }}>Other achievements</SectionLabel><CopyBtn /></div>
              {role.standaloneAchievements.map(a=>(
                <div key={a.id} style={{ display:"flex", gap:9, alignItems:"flex-start", marginBottom:7, paddingLeft:4 }}>
                  {a.isHighlight?<div style={{ marginTop:4, flexShrink:0 }}><Icon.Star filled size={11} /></div>:<Icon.Dot />}
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, lineHeight:1.6, color:C.walnut, fontWeight:300, flex:1 }}>{a.text}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRIES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function EntriesTab({ entries, projects, onNavigate, onNavigateToProject, onUpdateAchievement, onCreateProject, onOpenAddEntry, targetAchievementId, onClearTargetAchievement }) {
  const [screen, setScreen]             = useState("list");
  const [selectedEntryId, setSelectedEntryId]           = useState(null);
  const [selectedAchievementId, setSelectedAchievementId] = useState(null);
  const [viewMode, setViewMode]         = useState("entry");
  const [showFilter, setShowFilter]     = useState(false);
  const [filterProjectId, setFilterProjectId] = useState("all");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd]     = useState("");

  // Deep-link to a specific achievement
  useEffect(() => {
    if (targetAchievementId) {
      setSelectedAchievementId(targetAchievementId);
      setSelectedEntryId(null);
      setScreen("achievementDetail");
      onClearTargetAchievement();
    }
  }, [targetAchievementId]);

  const selectedEntry = entries.find(e => e.id === selectedEntryId);
  const filteredEntries = entries.filter(e => {
    const d = parseEntryDate(e.date);
    if (filterDateStart && d < new Date(filterDateStart)) return false;
    if (filterDateEnd && d > new Date(filterDateEnd+"T23:59:59")) return false;
    if (filterProjectId==="all") return true;
    if (filterProjectId==="") return e.achievements.some(a=>!a.projectId);
    return e.achievements.some(a=>a.projectId===filterProjectId);
  });
  const allAchs = entries.flatMap(e=>e.achievements.map(a=>({...a,entryDate:e.date})));
  const filteredAchs = allAchs.filter(a=>{
    const d = parseEntryDate(a.entryDate);
    if (filterDateStart && d < new Date(filterDateStart)) return false;
    if (filterDateEnd && d > new Date(filterDateEnd+"T23:59:59")) return false;
    if (filterProjectId==="all") return true;
    if (filterProjectId==="") return !a.projectId;
    return a.projectId===filterProjectId;
  });
  const hasFilter = filterProjectId!=="all"||filterDateStart||filterDateEnd;

  if (screen==="achievementDetail"&&selectedAchievementId) {
    return (
      <AchievementDetail achievementId={selectedAchievementId} entries={entries}
        breadcrumb={selectedEntry?selectedEntry.date:"Entries"} projects={projects}
        onBack={()=>setScreen(selectedEntryId?"entryDetail":"list")}
        onUpdateAchievement={onUpdateAchievement} onCreateProject={onCreateProject}
        onNavigate={onNavigate} onNavigateToProject={onNavigateToProject} />
    );
  }
  if (screen==="entryDetail"&&selectedEntry) {
    const visibleAchs = filterProjectId!=="all" ? selectedEntry.achievements.filter(a=>filterProjectId===""?!a.projectId:a.projectId===filterProjectId) : selectedEntry.achievements;
    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
        <StatusBar />
        <div style={{ display:"flex", alignItems:"center", padding:"0 16px 10px", gap:8, flexShrink:0 }}>
          <button onClick={()=>setScreen("list")} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:9, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Icon.Back /></button>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber }}>Entries</span>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"0 20px 14px", scrollbarWidth:"none" }}>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber }}>{selectedEntry.company}</span>
          <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:24, fontWeight:700, color:C.walnut, letterSpacing:"-0.5px", margin:"5px 0 11px" }}>{selectedEntry.date}</h1>
          <div style={{ marginBottom:16 }}><AISummaryCard text={selectedEntry.summary} /></div>
          <SectionLabel style={{ marginBottom:9 }}>{visibleAchs.length} Achievement{visibleAchs.length!==1?"s":""}</SectionLabel>
          {visibleAchs.map(a=>(
            <AchievementCard key={a.id} achievement={{...a,entryDate:selectedEntry.date}} projects={projects}
              onClick={()=>{ setSelectedAchievementId(a.id); setScreen("achievementDetail"); }} />
          ))}
        </div>
        <BottomNav active="entries" onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <StatusBar />
      <div style={{ padding:"2px 20px 0", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:24, fontWeight:700, color:C.walnut, letterSpacing:"-0.5px", lineHeight:1 }}>Entries</h1>
          <div style={{ display:"flex", gap:7 }}>
            <button onClick={()=>setShowFilter(!showFilter)} style={{ background:showFilter||hasFilter?C.mossFaint:"transparent", border:`1px solid ${showFilter||hasFilter?C.mossBorder:C.cardBorder}`, borderRadius:9, padding:"5px 9px", display:"flex", alignItems:"center", gap:4, cursor:"pointer" }}>
              <Icon.Filter /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:showFilter||hasFilter?C.moss:C.umber, fontWeight:500 }}>Filter{hasFilter?" ●":""}</span>
            </button>
            <button onClick={onOpenAddEntry} style={{ background:C.moss, border:"none", borderRadius:9, padding:"5px 12px", display:"flex", alignItems:"center", gap:5, cursor:"pointer", boxShadow:`0 2px 8px ${C.mossGlow}` }}>
              <Icon.Plus color="white" size={12} /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"white", fontWeight:500 }}>Add new</span>
            </button>
          </div>
        </div>
        {showFilter&&(
          <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, padding:"12px 14px", marginBottom:12 }}>
            <div style={{ marginBottom:10 }}>
              <SectionLabel style={{ marginBottom:6 }}>Project</SectionLabel>
              <select value={filterProjectId} onChange={e=>setFilterProjectId(e.target.value)} style={{ width:"100%", background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:9, padding:"8px 11px", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.walnut, appearance:"none", cursor:"pointer" }}>
                <option value="all">All projects</option>
                <option value="">No project</option>
                {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <SectionLabel style={{ marginBottom:6 }}>Date range</SectionLabel>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <input type="date" value={filterDateStart} onChange={e=>setFilterDateStart(e.target.value)} style={{ flex:1, background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:9, padding:"7px 9px", fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.walnut, colorScheme:"light" }} />
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber, flexShrink:0 }}>to</span>
                <input type="date" value={filterDateEnd} onChange={e=>setFilterDateEnd(e.target.value)} style={{ flex:1, background:C.bg, border:`1px solid ${C.cardBorder}`, borderRadius:9, padding:"7px 9px", fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.walnut, colorScheme:"light" }} />
              </div>
            </div>
            {hasFilter&&<button onClick={()=>{setFilterProjectId("all");setFilterDateStart("");setFilterDateEnd("");}} style={{ marginTop:10, background:"transparent", border:"none", fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.danger, cursor:"pointer", padding:0 }}>Clear filters</button>}
          </div>
        )}
        <div style={{ display:"flex", background:C.card, borderRadius:11, padding:3, marginBottom:13, border:`1px solid ${C.cardBorder}` }}>
          {["entry","achievement"].map(mode=>(
            <button key={mode} onClick={()=>setViewMode(mode)} style={{ flex:1, padding:"6px 0", borderRadius:8, border:"none", cursor:"pointer", transition:"all 0.18s", background:viewMode===mode?C.moss:"transparent", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:viewMode===mode?500:400, color:viewMode===mode?"white":C.umber, boxShadow:viewMode===mode?"0 2px 8px rgba(92,122,82,0.2)":"none" }}>
              By {mode.charAt(0).toUpperCase()+mode.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"0 20px 14px", scrollbarWidth:"none" }}>
        {viewMode==="entry"
          ?(filteredEntries.length===0
            ?<p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.umber, textAlign:"center", paddingTop:30 }}>No entries match your filters.</p>
            :filteredEntries.map(e=><EntryCard key={e.id} entry={e} onClick={()=>{ setSelectedEntryId(e.id); setScreen("entryDetail"); }} />))
          :(filteredAchs.length===0
            ?<p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.umber, textAlign:"center", paddingTop:30 }}>No achievements match your filters.</p>
            :filteredAchs.map(a=><AchievementCard key={a.id} achievement={a} projects={projects} onClick={()=>{ setSelectedEntryId(null); setSelectedAchievementId(a.id); setScreen("achievementDetail"); }} />))
        }
      </div>
      <BottomNav active="entries" onNavigate={onNavigate} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ProjectsTab({ projects, entries, onNavigate, onCreate, onEdit, onDelete, targetProjectId, onClearTarget }) {
  const [screen, setScreen]             = useState(targetProjectId?"projectDetail":"list");
  const [selectedProjectId, setSelectedProjectId] = useState(targetProjectId??null);
  const [selectedAchievementId, setSelectedAchievementId] = useState(null);
  const [filter, setFilter]             = useState("all");
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [showEditSheet, setShowEditSheet]     = useState(false);

  if (targetProjectId && targetProjectId!==selectedProjectId) {
    setSelectedProjectId(targetProjectId); setScreen("projectDetail"); onClearTarget();
  }

  const allAchs = entries.flatMap(e=>e.achievements);
  const getProjectAchs = p => allAchs.filter(a=>a.projectId===p.id).map(a=>{
    const e = entries.find(en=>en.achievements.some(x=>x.id===a.id));
    return {...a,entryDate:e?.date};
  });
  const currentProject = projects.find(p=>p.id===selectedProjectId);
  const filtered = filter==="all"?projects:projects.filter(p=>p.status===filter);

  if (screen==="achievementDetail"&&selectedAchievementId&&currentProject) {
    return (
      <AchievementDetail achievementId={selectedAchievementId} entries={entries}
        breadcrumb={currentProject.name} projects={projects}
        onBack={()=>setScreen("projectDetail")} onUpdateAchievement={()=>{}} onCreateProject={onCreate}
        onNavigate={onNavigate} onNavigateToProject={id=>{setSelectedProjectId(id);setScreen("projectDetail");}} />
    );
  }
  if (screen==="projectDetail"&&currentProject) {
    const projAchs = getProjectAchs(currentProject);
    const count = liveAchievementCount(currentProject.id, entries);
    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100%", position:"relative" }}>
        <StatusBar />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px 10px", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={()=>{setScreen("list");setSelectedProjectId(null);}} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:9, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Icon.Back /></button>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.umber }}>Projects</span>
          </div>
          <div style={{ display:"flex", gap:7 }}>
            <button onClick={()=>onEdit(currentProject.id,{isHighlight:!currentProject.isHighlight})} style={{ display:"flex", alignItems:"center", gap:5, background:currentProject.isHighlight?C.amberFaint:C.card, border:`1px solid ${currentProject.isHighlight?C.amberBorder:C.cardBorder}`, borderRadius:9, padding:"5px 10px", cursor:"pointer" }}>
              <Icon.Star filled={currentProject.isHighlight} size={13} />
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:currentProject.isHighlight?C.amber:C.umber, fontWeight:500 }}>{currentProject.isHighlight?"Highlighted":"Highlight"}</span>
            </button>
            <button onClick={()=>setShowEditSheet(true)} style={{ width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:9, cursor:"pointer" }}><Icon.Edit /></button>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"0 20px 14px", scrollbarWidth:"none" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}><Icon.Folder color={currentProject.isHighlight?C.amber:C.moss} size={15} /><StatusBadge status={currentProject.status} /></div>
          <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:700, color:C.walnut, lineHeight:1.2, letterSpacing:"-0.3px", marginBottom:5 }}>{currentProject.name}</h1>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}><Icon.Building /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber }}>{currentProject.company}</span></div>
            <span style={{ width:3, height:3, borderRadius:"50%", background:C.umber, opacity:0.4 }} />
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.umber }}>{fmtDate(currentProject.startDate)}{currentProject.endDate?` — ${fmtDate(currentProject.endDate)}`:" — Present"}</span>
          </div>
          <SectionLabel style={{ marginBottom:7 }}>Project summary</SectionLabel>
          <div style={{ marginBottom:18 }}><AISummaryCard text={currentProject.summary||"Summary will generate as you add achievements."} /></div>
          <SectionLabel style={{ marginBottom:9 }}>{count} Achievement{count!==1?"s":""}</SectionLabel>
          {projAchs.map(a=><AchievementCard key={a.id} achievement={a} projects={projects} onClick={()=>{setSelectedAchievementId(a.id);setScreen("achievementDetail");}} />)}
          {count===0&&<p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.umber, textAlign:"center", paddingTop:10 }}>No achievements linked yet.</p>}
        </div>
        <BottomNav active="projects" onNavigate={onNavigate} />
        {showEditSheet&&<ProjectSheet project={currentProject} onSave={data=>{onEdit(currentProject.id,data);setShowEditSheet(false);}} onDelete={()=>{onDelete(currentProject.id);setShowEditSheet(false);setScreen("list");setSelectedProjectId(null);}} onClose={()=>setShowEditSheet(false)} />}
      </div>
    );
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", position:"relative" }}>
      <StatusBar />
      <div style={{ padding:"2px 20px 0", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:24, fontWeight:700, color:C.walnut, letterSpacing:"-0.5px", lineHeight:1 }}>Projects</h1>
          <button onClick={()=>setShowCreateSheet(true)} style={{ display:"flex", alignItems:"center", gap:5, background:C.moss, border:"none", borderRadius:11, padding:"7px 13px", cursor:"pointer", boxShadow:`0 3px 10px ${C.mossGlow}` }}>
            <Icon.Plus color="white" size={13} /><span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, color:"white" }}>New project</span>
          </button>
        </div>
        <div style={{ display:"flex", gap:6, marginBottom:13 }}>
          {["all","active","completed"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ padding:"4px 13px", borderRadius:20, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:filter===f?500:400, background:filter===f?C.moss:C.card, color:filter===f?"white":C.umber, border:`1px solid ${filter===f?C.moss:C.cardBorder}`, transition:"all 0.15s" }}>
              {f==="all"?"All":STATUS[f].label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"0 20px 14px", scrollbarWidth:"none" }}>
        {filtered.map(p=><ProjectListCard key={p.id} project={p} achievementCount={liveAchievementCount(p.id,entries)} onClick={()=>{setSelectedProjectId(p.id);setScreen("projectDetail");}} />)}
      </div>
      <BottomNav active="projects" onNavigate={onNavigate} />
      {showCreateSheet&&<ProjectSheet project={null} onSave={data=>{onCreate(data);setShowCreateSheet(false);}} onClose={()=>setShowCreateSheet(false)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab]                   = useState("home");
  const [projects, setProjects]         = useState(INITIAL_PROJECTS);
  const [entries, setEntries]           = useState(INITIAL_ENTRIES);
  const [targetProjectId, setTargetProjectId]         = useState(null);
  const [targetAchievementId, setTargetAchievementId] = useState(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleNavigateToProject     = id => { setTargetProjectId(id); setTab("projects"); };
  const handleNavigateToAchievement = id => { setTargetAchievementId(id); setTab("entries"); };

  const handleCreateProject = data => {
    const id = `p${Date.now()}`;
    setProjects(prev => [{ id, ...data, company:"Acme Corp", isHighlight:false, summary:"" }, ...prev]);
    return id;
  };
  const handleEditProject   = (id, updates) => setProjects(prev => prev.map(p => p.id===id ? {...p,...updates} : p));
  const handleDeleteProject = id => {
    setProjects(prev => prev.filter(p => p.id!==id));
    setEntries(prev => prev.map(e => ({ ...e, achievements:e.achievements.map(a => a.projectId===id ? {...a,projectId:null} : a) })));
  };
  const handleUpdateAchievement = (achievementId, updates) => {
    setEntries(prev => prev.map(e => ({ ...e, achievements:e.achievements.map(a => a.id===achievementId ? {...a,...updates} : a) })));
  };
  const handleSaveEntry = newEntry => setEntries(prev => [newEntry, ...prev]);

  const shared = { entries, projects, onNavigate:setTab };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#1a1410; display:flex; align-items:center; justify-content:center; min-height:100vh; }
        button, input, select, textarea { outline:none; font-family:inherit; }
        ::-webkit-scrollbar { display:none; }
      `}</style>
      <div style={{ background:"#1a1410", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
        <div style={{ width:390, height:"min(780px, calc(100vh - 40px))", background:C.bg, borderRadius:44, overflow:"hidden", position:"relative", display:"flex", flexDirection:"column", boxShadow:"0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)" }}>

          {tab==="home"     && <HomeTab     {...shared} onNavigateToProject={handleNavigateToProject} onNavigateToAchievement={handleNavigateToAchievement} onOpenAddEntry={()=>setShowAddEntry(true)} onOpenSettings={()=>setShowSettings(true)} />}
          {tab==="summary"  && <SummaryTab  {...shared} />}
          {tab==="entries"  && <EntriesTab  {...shared} onNavigateToProject={handleNavigateToProject} onUpdateAchievement={handleUpdateAchievement} onCreateProject={handleCreateProject} onOpenAddEntry={()=>setShowAddEntry(true)} targetAchievementId={targetAchievementId} onClearTargetAchievement={()=>setTargetAchievementId(null)} />}
          {tab==="projects" && <ProjectsTab {...shared} onCreate={handleCreateProject} onEdit={handleEditProject} onDelete={handleDeleteProject} targetProjectId={targetProjectId} onClearTarget={()=>setTargetProjectId(null)} />}

          {/* Overlays */}
          {showAddEntry && <AddEntryPage projects={projects} onSave={handleSaveEntry} onClose={()=>setShowAddEntry(false)} onCreateProject={handleCreateProject} />}
          {showSettings && <SettingsPage onClose={()=>setShowSettings(false)} />}
        </div>
      </div>
    </>
  );
}
