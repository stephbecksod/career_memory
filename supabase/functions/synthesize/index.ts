import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1000;
const TEMPERATURE = 0;

const UNIVERSAL_SYSTEM_PROMPT = `You are a synthesis assistant for a career memory app. Your job is to help professionals capture and articulate their work accomplishments.

CRITICAL RULES — follow these without exception:

1. ONLY use information the user explicitly provided. Never infer, assume, or fill in details they didn't give you.
2. Calibrate how much you rewrite based on the quality of the input. If the user gave a rambling, stream-of-consciousness response, do real synthesis work — distill and clarify it. If they gave something already clean and concise, you don't need to reinvent it. The goal is the clearest version of what they said, not a maximally rewritten one.
3. If information is missing, leave that section sparse or omit it. Do not pad or speculate.
4. Never invent metrics, outcomes, or context that weren't in the input.
5. Write in first-person perspective from the user's point of view (e.g. "Led the migration..." not "The user led...").
6. Use professional but natural language. Avoid jargon, buzzwords, or corporate filler phrases like "leveraged synergies" or "drove impactful outcomes."
7. Be concise. Every word should earn its place.
8. When the user provides sparse input, produce a sparse output. Do not stretch thin material into something it isn't.`;

const ACHIEVEMENT_SYSTEM = `Your task is to synthesize a professional achievement from the user's answers to structured questions.

You will produce a JSON object with these fields:
- "name": A 4–7 word title for this achievement. Descriptive and specific. No punctuation at the end. Should reflect the actual accomplishment, not a generic label.
- "paragraph": A 2–4 sentence summary of the achievement written in first person. Use the user's own strong language wherever possible. Only include information they provided.
- "bullets": An array of 1–5 bullet strings. Each bullet should capture one clear, specific point. Do not create bullets for things the user didn't mention.
- "star_situation": The situation or context, extracted only from what the user described. Null if not provided.
- "star_task": The specific task or responsibility. Null if not provided.
- "star_action": What the user specifically did. Prioritize their exact phrasing if it's clear. Null if not provided.
- "star_result": The outcome or impact. Only use what they stated. Do not embellish. Null if not provided.
- "tags": An array of tag slugs from this list only — use only slugs that genuinely match what the user described: ["leadership", "cross_functional", "shipped_product", "cost_reduction", "revenue_impact", "process_improvement", "mentorship", "communication", "problem_solving", "data_analysis", "project_management", "stakeholder_management"]. Return an empty array if none fit.
- "completeness_flags": An array of STAR components that are meaningfully absent or too vague to be useful. Values: "situation", "task", "action", "result", "metrics". Only flag a component if it is genuinely missing — not just brief.
- "completeness_score": An integer 0–100 reflecting how complete and specific this achievement record is. A fully detailed entry with situation, action, result, and metrics scores 85–100. A single-sentence entry with no outcome scores 20–40. Be honest.

- Calibrate your rewriting effort to the input quality. If the response is a long, rambling voice recording, distill it into something clear and structured. If it's already clean and well-articulated, a synthesis that closely mirrors the original is fine. Don't rewrite for the sake of rewriting.
- Always preserve specific details — exact metrics, named projects, specific methods. Don't flatten "reduced churn by 18% in Q3" into "improved customer retention."
- If they only answered one question with two sentences, your paragraph should be one or two sentences. Don't pad it.
- The name should reflect the actual work, not a generic category. "Rebuilt onboarding flow to reduce churn" is better than "Product Improvement Initiative."
- Return ONLY valid JSON. No preamble, no explanation, no markdown code fences.`;

const ACHIEVEMENT_NAME_SYSTEM = `Generate a short achievement name only — 4–7 words, descriptive, no punctuation. Based only on what the user provided. Return only the name string, nothing else.`;

const ENTRY_SUMMARY_SYSTEM = `You are writing a short summary for a work entry that contains one or more professional achievements. Your output is a single string — 1–3 sentences — summarizing what this entry covers. Plain, clear, professional. Only reference what's in the achievements. Do not invent a through-line that isn't there. If there is only one achievement, the summary can closely mirror its synthesis — that's fine.

Return ONLY the summary as a plain string. No JSON wrapper, no preamble.`;

const PROJECT_SUMMARY_SYSTEM = `You are generating a summary for a project that groups multiple professional achievements. Your output is a single paragraph — 3–5 sentences — that tells the story of this project as a whole.

Rules:
- Write in first person
- Only use information from the achievements provided
- If the achievements show a clear arc (problem → work → outcome), reflect that arc
- If they're more parallel (multiple workstreams under one umbrella), summarize the scope and impact collectively
- Do not repeat information that's identical across achievements — consolidate it
- Do not embellish outcomes or add context not present in the input
- If the project is early-stage with only one or two achievements, keep the summary proportionally brief — do not pad it

Return ONLY the paragraph as a plain string. No JSON wrapper, no preamble.`;

const RECENT_FOCUS_SYSTEM = `You are writing a short "recent focus" summary for a professional's career memory app home screen. This is a friendly, warm, 2–4 sentence paragraph that gives them an encouraging overview of what they've been working on lately.

Tone: Warm and motivating — like a smart colleague who's been keeping track and is genuinely impressed by the work. Not sycophantic, not corporate. Just human and energizing.

Rules:
- Draw on the achievements and entry summaries provided, but synthesize across them to identify themes, arcs, or patterns — even if those weren't explicitly labeled by the user. If multiple entries clearly relate to the same project or initiative, call that out and give it a name.
- Focus on what's most interesting or significant — don't try to mention everything.
- 2–4 sentences maximum. No bullet points, no headers — just a paragraph.
- End on a note that makes the user feel good about the work they've been putting in.

Return ONLY the paragraph as a plain string. No JSON wrapper, no preamble.`;

// --- Type definitions ---

interface AchievementPayload {
  headline?: string;
  situation?: string;
  action?: string;
  result?: string;
  metrics?: string;
  skills?: string;
  freeform?: string;
}

interface AchievementNamePayload {
  text: string;
}

interface EntrySummaryPayload {
  achievements: Array<{ name: string; paragraph: string }>;
}

interface ProjectSummaryPayload {
  project_name: string;
  project_description?: string | null;
  achievements: Array<{ name: string; paragraph: string; date: string }>;
}

interface RecentFocusPayload {
  entries: Array<{
    entry_date: string;
    entry_summary: string;
    achievement_names: string[];
  }>;
}

type SynthesisType = "achievement" | "achievement_name" | "entry_summary" | "project_summary" | "recent_focus";

// --- Prompt builders ---

function buildAchievementMessages(payload: AchievementPayload) {
  const lines: string[] = ["Here are the user's responses:", ""];
  if (payload.headline) lines.push(`[HEADLINE]: ${payload.headline}`);
  if (payload.situation) lines.push(`[SITUATION]: ${payload.situation}`);
  if (payload.action) lines.push(`[ACTION]: ${payload.action}`);
  if (payload.result) lines.push(`[RESULT]: ${payload.result}`);
  if (payload.metrics) lines.push(`[METRICS]: ${payload.metrics}`);
  if (payload.skills) lines.push(`[SKILLS]: ${payload.skills}`);
  if (payload.freeform) lines.push(`[ADDITIONAL]: ${payload.freeform}`);

  return {
    system: UNIVERSAL_SYSTEM_PROMPT + "\n\n" + ACHIEVEMENT_SYSTEM,
    user: lines.join("\n"),
  };
}

function buildAchievementNameMessages(payload: AchievementNamePayload) {
  return {
    system: UNIVERSAL_SYSTEM_PROMPT + "\n\n" + ACHIEVEMENT_NAME_SYSTEM,
    user: `The user described: ${payload.text}`,
  };
}

function buildEntrySummaryMessages(payload: EntrySummaryPayload) {
  const lines = ["This entry contains the following achievements:", ""];
  for (const a of payload.achievements) {
    lines.push(`${a.name}: ${a.paragraph}`);
  }
  return {
    system: UNIVERSAL_SYSTEM_PROMPT + "\n\n" + ENTRY_SUMMARY_SYSTEM,
    user: lines.join("\n"),
  };
}

function buildProjectSummaryMessages(payload: ProjectSummaryPayload) {
  const lines = [`Project: ${payload.project_name}`];
  if (payload.project_description) {
    lines.push(`Description: ${payload.project_description}`);
  }
  lines.push("", "Achievements (chronological):");
  for (const a of payload.achievements) {
    lines.push(`[${a.date}] ${a.name}: ${a.paragraph}`);
  }
  return {
    system: UNIVERSAL_SYSTEM_PROMPT + "\n\n" + PROJECT_SUMMARY_SYSTEM,
    user: lines.join("\n"),
  };
}

function buildRecentFocusMessages(payload: RecentFocusPayload) {
  const lines = ["Here are the user's 3 most recent work entries:", ""];
  for (const entry of payload.entries) {
    lines.push(`[${entry.entry_date}]: ${entry.entry_summary}`);
    lines.push(`Achievements: ${entry.achievement_names.join(", ")}`);
    lines.push("");
  }
  return {
    system: UNIVERSAL_SYSTEM_PROMPT + "\n\n" + RECENT_FOCUS_SYSTEM,
    user: lines.join("\n"),
  };
}

// --- JSON parsing helper ---

function parseJSON(text: string): Record<string, unknown> {
  // Strip any preamble before the first {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in response");
  }
  return JSON.parse(text.slice(start, end + 1));
}

function validateAchievementResult(parsed: Record<string, unknown>) {
  const required = ["name", "paragraph", "bullets", "tags", "completeness_flags", "completeness_score"];
  for (const key of required) {
    if (!(key in parsed)) {
      throw new Error(`Missing required field: ${key}`);
    }
  }
  if (!Array.isArray(parsed.bullets)) throw new Error("bullets must be an array");
  if (!Array.isArray(parsed.tags)) throw new Error("tags must be an array");
  if (!Array.isArray(parsed.completeness_flags)) throw new Error("completeness_flags must be an array");
  if (typeof parsed.completeness_score !== "number") throw new Error("completeness_score must be a number");
}

// --- CORS headers ---

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --- Main handler ---

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Validate auth - check for Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, payload } = await req.json() as { type: SynthesisType; payload: unknown };

    if (!type || !payload) {
      return new Response(
        JSON.stringify({ error: "Missing type or payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build messages based on type
    let messages: { system: string; user: string };

    switch (type) {
      case "achievement":
        messages = buildAchievementMessages(payload as AchievementPayload);
        break;
      case "achievement_name":
        messages = buildAchievementNameMessages(payload as AchievementNamePayload);
        break;
      case "entry_summary":
        messages = buildEntrySummaryMessages(payload as EntrySummaryPayload);
        break;
      case "project_summary":
        messages = buildProjectSummaryMessages(payload as ProjectSummaryPayload);
        break;
      case "recent_focus":
        messages = buildRecentFocusMessages(payload as RecentFocusPayload);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown synthesis type: ${type}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Call Anthropic API
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      system: messages.system,
      messages: [{ role: "user", content: messages.user }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in Anthropic response");
    }

    const rawText = textBlock.text.trim();

    // Parse response based on type
    let result: unknown;

    if (type === "achievement") {
      const parsed = parseJSON(rawText);
      validateAchievementResult(parsed);
      result = {
        ai_generated_name: parsed.name,
        synthesis_paragraph: parsed.paragraph,
        synthesis_bullets: parsed.bullets,
        star_situation: parsed.star_situation ?? null,
        star_task: parsed.star_task ?? null,
        star_action: parsed.star_action ?? null,
        star_result: parsed.star_result ?? null,
        tag_suggestions: parsed.tags,
        completeness_score: parsed.completeness_score,
        completeness_flags: parsed.completeness_flags,
      };
    } else {
      // All other types return plain text
      result = { text: rawText };
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[synthesize] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
