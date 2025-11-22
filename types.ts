
export interface YouTuber {
  id: string;
  name: string;
  description: string;
  subscribers?: string;
  tags: string[];
  url?: string;
  reason?: string; // Why the AI picked this
  recent_activity?: string; // New: context on what they are doing now
  top_video?: string; // New: specific video recommendation
}

export interface SearchResult {
  strategy: string;
  generated_keywords: string[]; // The auto-generated keywords used
  items: YouTuber[];
  sources: { title: string; url: string }[];
  trending?: YouTuber[]; // Separate list for breakout stars
}

export interface LogEntry {
  id: string;
  message: string;
  timestamp: number;
  type: 'info' | 'success' | 'process' | 'error' | 'warning';
}

export interface SavedItem extends YouTuber {
  savedAt: number;
}

export interface SearchOptions {
  focus: string;      // e.g. "Tutorials", "Analysis"
  vibe: string;       // e.g. "Technical", "Funny"
  mustInclude: string; // Force specific keywords
  exclude: string;    // Negative keywords
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: number;
}
