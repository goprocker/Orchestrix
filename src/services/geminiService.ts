const API_BASE = '/api/gemini';

export const orchestratorAgent = async (query: string) => {
  const response = await fetch(`${API_BASE}/orchestrator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error('Orchestrator failed');
  return response.json();
};

export const plannerAgent = async (query: string, strategy: string) => {
  const response = await fetch(`${API_BASE}/planner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, strategy })
  });
  if (!response.ok) throw new Error('Planner failed');
  return response.json();
};

export const searcherAgent = async (query: string) => {
  const response = await fetch(`${API_BASE}/searcher`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error('Searcher failed');
  return response.json();
};

export const writerAgent = async (query: string, findings: string[]) => {
  const response = await fetch(`${API_BASE}/writer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, findings })
  });
  if (!response.ok) throw new Error('Writer failed');
  return response.json();
};

export const citerAgent = async (sources: any[], style: 'APA' | 'MLA' = 'APA') => {
  return { citations: [] };
};

export const rankerAgent = async (query: string, results: any[]) => {
  const response = await fetch(`${API_BASE}/ranker`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, results })
  });
  if (!response.ok) throw new Error('Ranker failed');
  return response.json();
};

export const pdfSummarizerAgent = async (paperTitle: string, paperText: string) => {
  const response = await fetch(`${API_BASE}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: paperText, isUrl: false })
  });
  if (!response.ok) throw new Error('Summarizer failed');
  return response.json();
};

export const pdfCriticalAnalyzerAgent = async (paperTitle: string, paperText: string) => {
  return { criticalReview: '', evidenceStrength: 'moderate', sentiment: 'neutral' };
};

export const conflictResolutionOrchestrator = async (paperTitle: string, paperText: string) => {
  const [summary, analysis] = await Promise.all([
    pdfSummarizerAgent(paperTitle, paperText),
    pdfCriticalAnalyzerAgent(paperTitle, paperText)
  ]);

  const hasConflict = summary.sentiment !== analysis.sentiment;

  if (hasConflict) {
    return {
      status: "CONFLICT_DETECTED",
      message: "The Summarization and Analysis agents have provided diverging views.",
      details: {
        summarizer_view: summary,
        analyzer_view: analysis
      },
      action_required: "Please review the raw data or provide additional constraints."
    };
  }

  return {
    status: "SUCCESS",
    data: summary,
    analysis: analysis
  };
};

export const conflictResolutionAgent = async (summaryA: string, summaryB: string) => {
  return { hasConflict: false, conflicts: [], unifiedView: '' };
};

export const crossPaperSynthesisAgent = async (summaries: { title: string, analysis: any }[]) => {
  return { commonThemes: [], contradictions: [], researchGaps: [], synthesisParagraph: '' };
};

export const researchAssistantAgent = async (query: string) => {
  return { papers: [], analysis: '' };
};

export const universalSummarizerAgent = async (source: string, isUrl: boolean = false) => {
  const response = await fetch(`${API_BASE}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, isUrl })
  });
  if (!response.ok) throw new Error('Summarizer failed');
  return response.json();
};

export const assistantAgent = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const response = await fetch(`${API_BASE}/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  });
  if (!response.ok) throw new Error('Assistant failed');
  const data = await response.json();
  return data.text;
};

export async function autocorrectAgent(text: string): Promise<string> {
  const response = await fetch(`${API_BASE}/autocorrect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!response.ok) throw new Error('Autocorrect failed');
  const data = await response.json();
  return data.text;
}
