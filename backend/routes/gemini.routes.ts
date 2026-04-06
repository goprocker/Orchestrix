import { Router, Request, Response } from "express";

const router = Router();
const apiKey = process.env.GEMINI_API_KEY || '';
const GOOGLE_BASE = 'https://generativelanguage.googleapis.com/v1beta';

console.log('[GEMINI] Key loaded:', apiKey ? `Key exists (${apiKey.length} chars)` : 'NO KEY');

async function geminiChat(model: string, messages: any[], systemInstruction?: string) {
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const body: any = {
    contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    }
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

const safeParseJson = (text: string | undefined, fallback: any = {}) => {
  if (!text) return fallback;
  try {
    const cleanText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error('JSON Parse Error:', e);
    return fallback;
  }
};

router.post("/orchestrator", async (req: Request, res: Response) => {
  const { query } = req.body;
  try {
    const data = await geminiChat('gemini-3.1-flash', [
      { role: 'user', content: `You are the Orchestrix Central Orchestrator. Analyze the research query: "${query}" and determine the complexity and required specialized agents.
      
      Return a JSON object with:
      1. complexity: "low" | "medium" | "high"
      2. agents: string[] (e.g. ["planner", "searcher", "writer", "citer"])
      3. initialStrategy: string` }
    ], "You are a helpful research assistant. Always respond with valid JSON only.");

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json(safeParseJson(text, { complexity: 'medium', agents: [], initialStrategy: '' }));
  } catch (error: any) {
    console.error('Orchestrator Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/planner", async (req: Request, res: Response) => {
  const { query, strategy } = req.body;
  try {
    const data = await geminiChat('gemini-3.1-flash', [
      { role: 'user', content: `Based on the query: "${query}" and the strategy: "${strategy}", create a detailed research plan.
      
      Return a JSON object with:
      1. phases: { title: string, tasks: string[] }[]
      2. estimatedTime: string` }
    ], "You are a helpful research assistant. Always respond with valid JSON only.");

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json(safeParseJson(text, { phases: [], estimatedTime: '' }));
  } catch (error: any) {
    console.error('Planner Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/searcher", async (req: Request, res: Response) => {
  const { query } = req.body;
  try {
    const data = await geminiChat('gemini-3.1-flash', [
      { role: 'user', content: `Find relevant sources and information for: "${query}". 
      Focus on high-quality academic and news sources.
      
      Return a JSON object with:
      1. sources: { title: string, snippet: string, url: string }[]
      2. keyFindings: string[]` }
    ], "You are a helpful research assistant. Always respond with valid JSON only.");

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json(safeParseJson(text, { sources: [], keyFindings: [] }));
  } catch (error: any) {
    console.error('Searcher Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/writer", async (req: Request, res: Response) => {
  const { query, findings } = req.body;
  try {
    const data = await geminiChat('gemini-3.1-flash', [
      { role: 'user', content: `Based on the query: "${query}" and findings: ${JSON.stringify(findings).substring(0, 10000)}, generate a comprehensive research outline.
      
      Return a JSON object with:
      1. title: string
      2. sections: { heading: string, content: string[] }[]` }
    ], "You are a helpful research assistant. Always respond with valid JSON only.");

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json(safeParseJson(text, { title: query, sections: [] }));
  } catch (error: any) {
    console.error('Writer Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/ranker", async (req: Request, res: Response) => {
  const { query, results } = req.body;
  try {
    const data = await geminiChat('gemini-3.1-flash', [
      { role: 'user', content: `Analyze the following academic search results for: "${query}".
      
      Results: ${JSON.stringify(results).substring(0, 15000)}
      
      Return a JSON object with:
      1. rankedResults: { id: string, score: number, relevanceExplanation: string, citation: string }[]` }
    ], "You are a helpful research assistant. Always respond with valid JSON only.");

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json(safeParseJson(text, { rankedResults: [] }));
  } catch (error: any) {
    console.error('Ranker Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/assistant", async (req: Request, res: Response) => {
  const { message, history } = req.body;
  try {
    const contents = (history || []).map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: Array.isArray(m.parts) ? m.parts[0]?.text : m.text || '' }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const data = await geminiChat('gemini-3.1-flash', contents, "You are the Orchestrix Personal Assistant. Help users navigate the platform and provide guidance on their research. Be professional, helpful, and concise.");

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ text });
  } catch (error: any) {
    console.error('Assistant Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/summarize", async (req: Request, res: Response) => {
  const { source, isUrl } = req.body;
  try {
    const data = await geminiChat('gemini-3.1-flash', [
      { role: 'user', content: isUrl 
        ? `Provide a comprehensive synthesis of the content at this URL: ${source}. Focus on key findings, methodology, and conclusions.

Return JSON:
{
  "summary": "brief summary",
  "keyPoints": ["point1", "point2"],
  "synthesis": "detailed synthesis",
  "conclusions": "conclusions"
}`
        : `Provide a comprehensive synthesis of the following text: ${source.substring(0, 50000)}. Focus on key findings, methodology, and conclusions.

Return JSON:
{
  "summary": "brief summary",
  "keyPoints": ["point1", "point2"],
  "synthesis": "detailed synthesis",
  "conclusions": "conclusions"
}` }
    ], "You are a helpful research assistant. Always respond with valid JSON only.");

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json(safeParseJson(text, { summary: '', keyPoints: [], synthesis: '', conclusions: '' }));
  } catch (error: any) {
    console.error('Summarizer Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/deep-research", async (req: Request, res: Response) => {
  const { query } = req.body;
  try {
    const data = await geminiChat('gemini-3.1-flash', [
      { role: 'user', content: `Perform authentic, deep research on: "${query}".
      
Requirements:
1. Prioritize peer-reviewed papers, technical documentation, and verified data.
2. Provide a structured report with sections: Executive Summary, Technical Breakthroughs, Current Challenges, and Future Outlook.
3. Avoid anecdotal evidence or non-verified blog posts.
4. Include specific data points and metrics where available.
5. Use a professional, academic tone.` }
    ]);

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "No research data could be synthesized.";
    res.json({
      query,
      content,
      sources: [],
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Deep Research Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/autocorrect", async (req: Request, res: Response) => {
  const { text } = req.body;
  try {
    const data = await geminiChat('gemini-3.1-flash', [
      { role: 'user', content: `Autocorrect and improve the following text for clarity, grammar, and academic tone. Preserve the core meaning. Return ONLY the improved text.
      
Text: "${text}"` }
    ]);

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || text;
    res.json({ text: result.trim() || text });
  } catch (error: any) {
    console.error('Autocorrect Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/task-suggestions", async (req: Request, res: Response) => {
  const { projectName, existingTasks } = req.body;
  try {
    const data = await geminiChat('gemini-3.1-flash', [
      { role: 'user', content: `Project: "${projectName}". Existing tasks: ${existingTasks || 'none yet'}. Suggest 6 new tasks not yet listed. Return ONLY a JSON array of 6 short task strings, nothing else.` }
    ], "You are a project planning assistant. Always respond with valid JSON array only.");

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    res.json(safeParseJson(text, []));
  } catch (error: any) {
    console.error('Task Suggestions Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
