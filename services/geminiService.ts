
import { GoogleGenAI } from "@google/genai";
import { SearchResult, YouTuber, SearchOptions } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchYouTubeChannels = async (
  query: string, 
  options: SearchOptions,
  onLog: (msg: string) => void,
  existingChannels: string[] = []
): Promise<SearchResult> => {
  
  onLog(`Initializing Deep Research Agent...`);
  
  // 1. Query Expansion Phase
  onLog(`analyzing_intent: "${query}"`);
  onLog(`configuration: [${options.focus}] [${options.vibe}]`);
  
  if (options.mustInclude) onLog(`priority_term: "${options.mustInclude}"`);
  if (options.exclude) onLog(`exclusion_filter: "${options.exclude}"`);
  if (existingChannels.length > 0) onLog(`excluding_${existingChannels.length}_existing_entities`);

  onLog(`generating_search_vectors...`);

  const prompt = `
    You are Sabeer AI, an elite Deep Research AI specialized in YouTube discovery.
    
    USER GOAL: "${query}"
    
    USER PARAMETERS (STRICT TUNING):
    - RESEARCH FOCUS: ${options.focus} (Prioritize channels that match this category).
    - CONTENT VIBE: ${options.vibe} (Look for this specific presentation style).
    - MUST INCLUDE: ${options.mustInclude ? `"${options.mustInclude}"` : "None"} (These terms MUST appear in your search strategy).
    - EXCLUDE: ${options.exclude ? `"${options.exclude}"` : "None"} (Do NOT include channels related to this).

    STRICT HARD CONSTRAINTS (CRITICAL):
    1. SUBSCRIBER COUNT: MUST be > 10,000 and < 4,000,000. (Between 10k and 4M). 
       - REJECT any channel with < 10k subs.
       - REJECT any channel with > 4M subs.
    2. RECENCY: Channel must be active in 2024-2025.
    3. DUPLICATE PREVENTION:
       ${existingChannels.length > 0 ? `DO NOT return the following channels as they are already listed: ${JSON.stringify(existingChannels)}.` : "No existing exclusions."}
       - You MUST find NEW channels that are not in the list above.

    YOUR RESEARCH PROCESS (Deep Search):
    1. KEYWORD GENERATION: Generate 4 highly distinct search queries to find hidden gems.
       - ADAPT to the 'RESEARCH FOCUS' of "${options.focus}".
       - ADAPT to the 'CONTENT VIBE' of "${options.vibe}".
       ${options.mustInclude ? `- CRITICAL: Every query should try to incorporate "${options.mustInclude}" or related synonyms.` : ''}
       ${options.exclude ? `- CRITICAL: Ensure search queries explicitly avoid "${options.exclude}".` : ''}
    
    2. EXECUTE SEARCH: Use the Google Search tool to execute these queries.
    
    3. ANALYZE & FILTER: 
       - Check subscriber counts carefully.
       - Verify content matches the requested FOCUS and VIBE.
    
    4. SELECT: Pick the top 6-9 channels that fit the criteria.
    
    OUTPUT FORMAT (JSON ONLY):
    {
      "strategy": "Explained: I targeted [Focus] channels with a [Vibe] style, filtering for [Keywords]...",
      "generated_keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4"],
      "items": [
        {
          "name": "Channel Name",
          "description": "Concise 2-sentence summary. HIGHLIGHT how it matches the '${options.focus}' focus.",
          "subscribers": "e.g. 250K",
          "tags": ["tag1", "tag2", "tag3"],
          "url": "https://youtube.com/...",
          "reason": "Specific reason (e.g. 'Perfect match for ${options.vibe} vibe', 'Great ${options.focus}')",
          "recent_activity": "Brief note on recent uploads (e.g. 'Uploaded a Blender 4.0 guide 2 days ago', 'Weekly essays on anime')",
          "top_video": "Title of a specific must-watch video from them"
        }
      ],
      "trending": [
        {
           "name": "Trending Channel Name",
           "description": "Why is this channel spiking right now?",
           "subscribers": "e.g. 500K",
           "tags": ["Viral", "Breakout"],
           "url": "...",
           "reason": "High Velocity Growth / Viral Hit"
        }
      ]
    }
  `;

  onLog(`executing_multi_vector_search...`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7, 
      },
    });

    onLog(`processing_grounding_data...`);
    
    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Extract Sources
    const sources = groundingChunks
      .filter(c => c.web?.uri && c.web?.title)
      .map(c => ({ title: c.web!.title!, url: c.web!.uri! }));

    onLog(`found_${sources.length}_source_nodes`);
    onLog(`applying_strict_filters [>10k && <4M]...`);

    // JSON Parsing with resiliency
    let jsonData: any = {};
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        jsonData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("JSON Parse Error", e);
        onLog("ERROR: data_structure_corrupted");
        throw new Error("Invalid JSON format from AI");
      }
    } else {
       throw new Error("No JSON found in response");
    }

    const mapItems = (list: any[]) => {
        if (!Array.isArray(list)) return [];
        return list.map((item: any, index: number) => ({
            id: `yt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name || "Unknown Channel",
            description: item.description || "No description available.",
            subscribers: item.subscribers || "N/A",
            tags: item.tags || [],
            url: item.url,
            reason: item.reason || "Matches criteria",
            recent_activity: item.recent_activity || "Data unavailable",
            top_video: item.top_video || "Recommended Watch"
        }));
    };

    const items: YouTuber[] = mapItems(jsonData.items);
    const trending: YouTuber[] = mapItems(jsonData.trending);

    onLog(`curation_complete: ${items.length} qualified candidates.`);

    return {
      strategy: jsonData.strategy || "Deep Research Scan",
      generated_keywords: jsonData.generated_keywords || [],
      items,
      trending: trending.slice(0, 3), // Limit trending to top 3
      sources
    };

  } catch (error) {
    console.error("Gemini Service Error:", error);
    onLog("CRITICAL_FAILURE: search_aborted");
    throw error;
  }
};
