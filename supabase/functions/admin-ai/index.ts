// Admin AI assistant — generates exam questions and extracts them from a photo.
// Staff-only: JWT validated in code, then role checked with the service role client.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SYSTEM = `You are the StudyPlug Kenya admin content assistant.
You create high quality multiple-choice exam questions aligned to the Kenyan CBC curriculum.
Rules:
- Exactly 4 options per question, only one correct.
- Use plain text only. Never use LaTeX, markdown or code fences.
- Use Kenyan contexts (shillings, local places, local examples) where natural.
- Pitch the language and difficulty at the given grade.
- Every question must include a short explanation of the correct answer.`;

const SCHEMA_NOTE = `Return ONLY valid JSON of this exact shape, with no prose:
{"questions":[{"question":"...","options":["A","B","C","D"],"correct_answer":0,"explanation":"...","difficulty":"easy|medium|hard"}]}`;

function parseQuestions(raw: string) {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  const parsed = JSON.parse(slice);
  const list = Array.isArray(parsed) ? parsed : parsed.questions;
  if (!Array.isArray(list)) throw new Error("AI returned an unexpected format");
  return list
    .map((q: Record<string, unknown>) => ({
      question: String(q.question ?? "").trim(),
      options: Array.isArray(q.options) ? q.options.slice(0, 4).map((o) => String(o).trim()) : [],
      correct_answer: Number(q.correct_answer ?? 0),
      explanation: String(q.explanation ?? "").trim(),
      difficulty: ["easy", "medium", "hard"].includes(String(q.difficulty))
        ? String(q.difficulty)
        : "medium",
    }))
    .filter((q) => q.question && q.options.length === 4 && q.correct_answer >= 0 && q.correct_answer < 4);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const anon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: claimsData, error: claimsError } = await anon.auth.getClaims(
    authHeader.replace("Bearer ", ""),
  );
  const userId = claimsData?.claims?.sub as string | undefined;
  if (claimsError || !userId) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: roles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const isStaff = (roles ?? []).some((r) => r.role === "admin" || r.role === "teacher");
  if (!isStaff) return json({ error: "Staff only" }, 403);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI not configured" }, 500);

  try {
    const body = await req.json();
    const mode: string = body?.mode ?? "generate";

    let userContent: unknown;

    if (mode === "photo") {
      const imageDataUrl: string = body?.image ?? "";
      if (!imageDataUrl.startsWith("data:")) return json({ error: "An image is required" }, 400);
      userContent = [
        {
          type: "text",
          text: `Read this photo of an exam paper. Extract every multiple-choice question you can see, correcting obvious typos from the scan. If a question has fewer than 4 options, write sensible extra distractors. If the correct answer is not marked, work it out yourself. ${
            body?.notes ? `Extra instructions from the admin: ${String(body.notes).slice(0, 500)}` : ""
          }\n${SCHEMA_NOTE}`,
        },
        { type: "image_url", image_url: { url: imageDataUrl } },
      ];
    } else {
      const count = Math.min(Math.max(Number(body?.count ?? 5), 1), 20);
      const subject = String(body?.subject ?? "").slice(0, 120);
      const grade = Number(body?.grade ?? 7);
      const topic = String(body?.topic ?? "").slice(0, 200);
      const difficulty = ["easy", "medium", "hard", "mixed"].includes(String(body?.difficulty))
        ? String(body.difficulty)
        : "medium";
      if (!subject) return json({ error: "A subject is required" }, 400);
      userContent = `Write ${count} multiple-choice questions.
Subject: ${subject}
Grade: ${grade}
Topic: ${topic || "any core topic for this grade and subject"}
Difficulty: ${difficulty}
${body?.notes ? `Extra instructions: ${String(body.notes).slice(0, 500)}` : ""}
${SCHEMA_NOTE}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": LOVABLE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return json({ error: "Too many requests, please slow down." }, 429);
      if (response.status === 402) {
        return json({ error: "AI credits exhausted. Add credits in workspace settings." }, 402);
      }
      console.error("AI gateway error:", response.status, await response.text());
      return json({ error: "AI service error" }, 500);
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";
    const questions = parseQuestions(raw);
    if (questions.length === 0) return json({ error: "The AI could not produce usable questions. Try again." }, 422);

    return json({ questions });
  } catch (e) {
    console.error("admin-ai error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
