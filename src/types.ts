export type AgentType = 'orchestrator' | 'planner' | 'searcher' | 'writer' | 'citer' | 'assistant';

export interface AgentStatus {
  type: AgentType;
  name: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  progress: number;
  message?: string;
}

export interface AcademicResult {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  abstract: string | null;
  url: string | null;
  citation: string;
  score: number;
  relevanceExplanation: string;
}

export interface ResearchProject {
  id: string;
  userId: string;
  query: string;
  status: 'planning' | 'searching' | 'writing' | 'completed';
  progress: number;
  outline?: string;
  citations?: string[];
  academicResults?: AcademicResult[];
  content?: string;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}
