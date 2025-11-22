import React, { useState, useEffect } from 'react';
import { Globe, Search, ExternalLink, Youtube, UserPlus, Check, Network, Zap, BarChart3, Filter, RefreshCcw, Loader2, Plus, ChevronDown, Copy, Flame, Clock, PlayCircle, X, Maximize2, Infinity as InfinityIcon } from 'lucide-react';
import { SearchResult, YouTuber } from '../types';

interface BrowserWindowProps {
  result: SearchResult | null;
  onSave: (youtuber: YouTuber) => void;
  savedIds: Set<string>;
  onLoadMore: () => void;
  isProcessing: boolean;
  isAutoLooping: boolean;
  onToggleAutoLoop: () => void;
}

// Helper to parse "10k", "1.5M", "500" into numbers
const parseSubCount = (str: string | undefined): number => {
  if (!str) return 0;
  const clean = str.toUpperCase().replace(/,/g, '').trim();
  const match = clean.match(/([\d\.]+)\s*(K|M|B)?/);
  if (!match) return 0;
  
  const val = parseFloat(match[1]);
  const suffix = match[2];
  
  if (suffix === 'K') return val * 1_000;
  if (suffix === 'M') return val * 1_000_000;
  if (suffix === 'B') return val * 1_000_000_000;
  return val;
};

interface ChannelDetailModalProps {
  item: YouTuber;
  onClose: () => void;
  onSave: (item: YouTuber) => void;
  isSaved: boolean;
}

const ChannelDetailModal: React.FC<ChannelDetailModalProps> = ({ item, onClose, onSave, isSaved }) => {
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(item);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none opacity-50" />
        
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100 relative z-10">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-red-600 border border-slate-200 shadow-sm">
                 <Youtube size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{item.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 flex items-center gap-1">
                     <BarChart3 size={12} /> {item.subscribers}
                  </span>
                  {item.reason && (
                    <span className="text-xs text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <Zap size={12} /> {item.reason}
                    </span>
                  )}
                </div>
              </div>
           </div>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors p-1 hover:bg-slate-100 rounded-lg">
             <X size={24} />
           </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
           
           <div className="space-y-2">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Channel Analysis</h3>
             <p className="text-slate-700 leading-relaxed text-sm border-l-2 border-slate-200 pl-4">
               {item.description}
             </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <div className="flex items-center gap-2 text-cyan-700 mb-2 text-xs font-bold uppercase">
                    <Clock size={14} /> Recent Activity
                 </div>
                 <p className="text-sm text-slate-600">
                    {item.recent_activity || "No recent activity data available."}
                 </p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <div className="flex items-center gap-2 text-purple-700 mb-2 text-xs font-bold uppercase">
                    <PlayCircle size={14} /> Recommended Watch
                 </div>
                 <p className="text-sm text-slate-600">
                    "{item.top_video || "Featured Content"}"
                 </p>
              </div>
           </div>

           <div className="space-y-2">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Semantic Tags</h3>
             <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    #{tag}
                  </span>
                ))}
             </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
           {item.url && (
             <a 
               href={item.url}
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-cyan-700 transition-colors"
               onClick={(e) => e.stopPropagation()}
             >
               Open on YouTube <ExternalLink size={14} />
             </a>
           )}
           
           <div className="relative flex-1">
             <button
                onClick={handleSave}
                disabled={isSaved}
                className={`
                  w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all uppercase shadow-sm
                  ${isSaved 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default' 
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-200'}
                `}
              >
                {isSaved ? (
                  <>Saved to Database <Check size={16} /></>
                ) : (
                  <>Add Channel to Database <UserPlus size={16} /></>
                )}
              </button>
              
              {justSaved && (
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 whitespace-nowrap animate-in slide-in-from-bottom-2 fade-in duration-300 pointer-events-none z-50">
                    <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-[0_4px_15px_rgba(5,150,105,0.3)] flex items-center gap-1.5 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-x-6 after:border-x-transparent after:border-t-6 after:border-t-emerald-600">
                      <Check size={14} strokeWidth={3} /> SAVED!
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

interface ChannelCardProps {
  item: YouTuber;
  isSaved: boolean;
  onSave: (item: YouTuber) => void;
  onClick: (item: YouTuber) => void;
  index: number;
  variant?: 'default' | 'trending';
  id?: string;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ item, isSaved, onSave, onClick, index, variant = 'default', id }) => {
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(item);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const isTrending = variant === 'trending';

  return (
    <div 
      id={id}
      onClick={() => onClick(item)}
      className={`
        group cursor-pointer rounded-xl p-5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden animate-in fade-in zoom-in-95 scroll-mt-32
        hover:-translate-y-1 hover:shadow-lg
        ${isTrending 
          ? 'bg-gradient-to-br from-orange-50 to-white border border-orange-200 hover:border-orange-300' 
          : 'bg-white border border-slate-200 hover:border-cyan-400 hover:shadow-cyan-100'}
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Decorator */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl pointer-events-none transition-all duration-500 group-hover:opacity-100 ${isTrending ? 'from-orange-100/50 opacity-50' : 'from-cyan-50 opacity-0 group-hover:from-cyan-100'}`} />
      
      <div>
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105 ${isTrending ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-100 text-red-600'}`}>
             {isTrending ? <Flame size={24} fill="currentColor" fillOpacity={0.2} /> : <Youtube size={28} strokeWidth={1.5} />}
          </div>
          <div className="flex flex-col items-end gap-1">
             <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 group-hover:border-slate-300 transition-colors">
                <BarChart3 size={12} className="text-slate-500" />
                <span className="text-sm font-bold font-mono text-slate-800">
                   {item.subscribers}
                </span>
             </div>
             {item.reason && (
               <span className={`text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded border max-w-[140px] text-right truncate ${isTrending ? 'text-orange-700 bg-orange-50 border-orange-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>
                 <Zap size={10} /> {item.reason}
               </span>
             )}
          </div>
        </div>
        
        <h3 className={`text-lg font-bold text-slate-900 mb-2 transition-colors tracking-tight line-clamp-1 ${isTrending ? 'group-hover:text-orange-600' : 'group-hover:text-cyan-700'}`}>
          {item.name}
        </h3>
        
        <p className="text-xs text-slate-600 leading-relaxed mb-5 line-clamp-2 h-[3em]">
          {item.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-5 h-[26px] overflow-hidden">
          {item.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-[10px] uppercase tracking-wide text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 z-10 mt-auto relative group/footer">
         <div className="flex items-center gap-3">
             <button className="text-xs font-bold text-slate-500 group-hover:text-cyan-600 flex items-center gap-1 transition-colors">
                <Maximize2 size={10} /> DETAILS
             </button>
             
             {item.url && (
               <>
                <div className="w-px h-3 bg-slate-200" />
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-bold text-slate-500 hover:text-cyan-600 flex items-center gap-1 transition-colors"
                >
                   <ExternalLink size={10} /> OPEN
                </a>
               </>
             )}
         </div>

        <div className="relative">
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition-all uppercase shadow-sm
                ${isSaved 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default' 
                  : 'bg-slate-100 text-slate-700 hover:bg-cyan-500 hover:text-white hover:shadow-md'}
              `}
            >
              {isSaved ? (
                <>Saved <Check size={12} /></>
              ) : (
                <>Add to DB <UserPlus size={12} /></>
              )}
            </button>

            {justSaved && (
               <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap animate-in slide-in-from-bottom-2 fade-in duration-300 pointer-events-none z-50">
                  <div className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-[0_4px_15px_rgba(5,150,105,0.3)] flex items-center gap-1.5 after:content-[''] after:absolute after:top-full after:right-4 after:border-x-4 after:border-x-transparent after:border-t-4 after:border-t-emerald-600 scale-110">
                    <Check size={12} strokeWidth={3} /> SAVED!
                  </div>
               </div>
            )}
        </div>
      </div>
    </div>
  );
};

const BrowserWindow: React.FC<BrowserWindowProps> = ({ result, onSave, savedIds, onLoadMore, isProcessing, isAutoLooping, onToggleAutoLoop }) => {
  // Filter State
  const [minSubs, setMinSubs] = useState('10k');
  const [maxSubs, setMaxSubs] = useState('4M');
  const [filteredItems, setFilteredItems] = useState<YouTuber[]>([]);
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(6);
  const [prevVisibleCount, setPrevVisibleCount] = useState(visibleCount);

  // Copy State
  const [isKeywordsCopied, setIsKeywordsCopied] = useState(false);

  // Modal State
  const [selectedChannel, setSelectedChannel] = useState<YouTuber | null>(null);

  useEffect(() => {
    if (result) {
      const min = parseSubCount(minSubs);
      const max = parseSubCount(maxSubs);
      
      const filtered = result.items.filter(item => {
        const count = parseSubCount(item.subscribers);
        if (count === 0) return true; 
        return count >= min && count <= max;
      });
      setFilteredItems(filtered);
    }
  }, [result, minSubs, maxSubs]);

  // Scroll to new items when visible count increases
  useEffect(() => {
    if (visibleCount > prevVisibleCount) {
      const element = document.getElementById(`channel-card-${prevVisibleCount}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setPrevVisibleCount(visibleCount);
  }, [visibleCount, prevVisibleCount]);

  // Helper to determine what action the main button should take
  const hasHiddenItems = filteredItems.length > visibleCount;
  const handleShowMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const handleCopyKeywords = () => {
    if (!result) return;
    const text = result.generated_keywords.join('\n');
    navigator.clipboard.writeText(text);
    setIsKeywordsCopied(true);
    setTimeout(() => setIsKeywordsCopied(false), 2000);
  };

  if (!result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 relative overflow-hidden h-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05),transparent_70%)] pointer-events-none" />
        
        {/* Logo Container */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full group-hover:bg-cyan-400/30 transition-all duration-500" />
          <div className="w-24 h-24 bg-white border border-slate-200 rounded-2xl flex items-center justify-center relative z-10 shadow-xl transform group-hover:scale-105 transition-transform duration-500">
            <Globe size={48} className="text-cyan-500" strokeWidth={1.5} />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white">
               <Search size={14} className="text-white" />
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tighter text-center drop-shadow-sm">
          SABEER <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">SEARCH AI</span>
        </h1>
        
        <p className="max-w-md text-center text-slate-500 leading-relaxed mb-8">
          Deep search agent active. Enter a topic to generate multi-vector search queries, analyze metadata, and curate hidden gems between 10k - 4M subscribers.
        </p>
        
        <div className="grid grid-cols-2 gap-4 opacity-60 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-500">
             <Filter size={12} /> Range: 10k - 4M
          </div>
           <div className="flex items-center gap-2 text-slate-500">
             <Network size={12} /> Multi-Vector
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth relative">
        
        {/* AI Thinking / Strategy Header */}
        <div className="animate-in fade-in slide-in-from-top-5 duration-500 space-y-4">
          <div className="bg-white/80 border-l-4 border-cyan-500 rounded-r-xl p-5 backdrop-blur-md shadow-sm relative overflow-hidden border border-y-slate-200 border-r-slate-200">
            
            <div className="flex items-start gap-5 relative z-10">
              <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100 text-cyan-600">
                <Network size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-cyan-700 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    Neural Research Vectors
                  </h3>
                  
                  {/* Auto Loop Toggle */}
                  <button 
                    onClick={onToggleAutoLoop}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono border transition-all ${isAutoLooping ? 'bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm animate-pulse' : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400'}`}
                  >
                    <InfinityIcon size={12} className={isAutoLooping ? 'animate-spin-slow' : ''} />
                    {isAutoLooping ? 'AUTO-PILOT ACTIVE' : 'ENABLE AUTO-LOOP'}
                  </button>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-500 text-xs font-mono">
                    &gt; Generated Search Angles:
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onLoadMore}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 hover:text-cyan-600 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Generate new keyword variations to find missed channels"
                    >
                      <RefreshCcw size={12} className={isProcessing ? "animate-spin" : ""} />
                      <span>Iterate Scan</span>
                    </button>

                    <button
                      onClick={handleCopyKeywords}
                      className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 hover:text-cyan-600 transition-colors uppercase tracking-wider"
                      title="Copy keywords to clipboard"
                    >
                      {isKeywordsCopied ? (
                        <>
                          <Check size={12} className="text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Vectors</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Keywords Visualization */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {result.generated_keywords.map((keyword, idx) => (
                    <div key={idx} className="group flex items-center gap-2 bg-slate-50 hover:bg-white border border-slate-200 hover:border-cyan-400 px-3 py-1.5 rounded text-xs text-slate-700 transition-all cursor-default shadow-sm">
                      <Search size={10} className="text-slate-400 group-hover:text-cyan-500" />
                      {keyword}
                    </div>
                  ))}
                </div>

                <div className="text-slate-600 text-sm italic border-l-2 border-slate-300 pl-4 py-1 bg-slate-50 rounded-r">
                  "{result.strategy}"
                </div>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-cyan-600 px-2">
              <Filter size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Filters</span>
            </div>
            
            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
               <label className="text-[10px] text-slate-500 uppercase font-bold">Min Subs:</label>
               <select 
                  value={minSubs}
                  onChange={(e) => setMinSubs(e.target.value)}
                  className="bg-white border border-slate-300 rounded text-xs px-2 py-1 text-slate-700 focus:border-cyan-500 focus:outline-none shadow-sm"
               >
                 <option value="0">0</option>
                 <option value="10k">10k</option>
                 <option value="50k">50k</option>
                 <option value="100k">100k</option>
                 <option value="500k">500k</option>
                 <option value="1M">1M</option>
               </select>
            </div>
            
            <div className="flex items-center gap-2">
               <label className="text-[10px] text-slate-500 uppercase font-bold">Max Subs:</label>
               <select 
                  value={maxSubs}
                  onChange={(e) => setMaxSubs(e.target.value)}
                  className="bg-white border border-slate-300 rounded text-xs px-2 py-1 text-slate-700 focus:border-cyan-500 focus:outline-none shadow-sm"
               >
                 <option value="100k">100k</option>
                 <option value="500k">500k</option>
                 <option value="1M">1M</option>
                 <option value="2M">2M</option>
                 <option value="4M">4M</option>
                 <option value="10M+">10M+</option>
               </select>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.slice(0, visibleCount).map((item, idx) => (
            <ChannelCard 
              key={item.id}
              id={`channel-card-${idx}`}
              item={item}
              index={idx}
              isSaved={savedIds.has(item.id)}
              onSave={onSave}
              onClick={(item) => setSelectedChannel(item)}
            />
          ))}
        </div>

        {/* Show More / Loading */}
        <div className="flex justify-center pt-6 pb-10">
          {isProcessing ? (
             <div className="flex items-center gap-2 text-cyan-600 text-sm font-mono animate-pulse">
               <Loader2 size={16} className="animate-spin" />
               ANALYZING_NETWORK_NODES...
             </div>
          ) : hasHiddenItems ? (
             <button 
               onClick={handleShowMore}
               className="flex items-center gap-2 bg-white hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 px-6 py-2 rounded-full transition-all border border-slate-300 hover:border-cyan-300 text-xs font-bold uppercase tracking-widest shadow-sm"
             >
               <Plus size={14} /> Load Next Batch
             </button>
          ) : (
             <button 
               onClick={onLoadMore}
               className="flex items-center gap-2 bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-600 px-6 py-2 rounded-full transition-all border border-slate-300 hover:border-purple-300 text-xs font-bold uppercase tracking-widest shadow-sm"
             >
               <RefreshCcw size={14} /> Deep Research Expansion
             </button>
          )}
        </div>
        
        {/* Trending Section */}
        {result.trending && result.trending.length > 0 && (
          <div className="mt-8 border-t border-slate-200 pt-8 mb-8">
            <h3 className="text-orange-500 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
               <Flame size={16} /> Trending Breakout Channels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {result.trending.map((item, idx) => (
                 <ChannelCard 
                    key={item.id}
                    item={item}
                    index={idx}
                    isSaved={savedIds.has(item.id)}
                    onSave={onSave}
                    onClick={(item) => setSelectedChannel(item)}
                    variant="trending"
                  />
               ))}
            </div>
          </div>
        )}
        
        {/* Sources Footer */}
        {result.sources && result.sources.length > 0 && (
           <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 mb-2 text-[10px] font-bold uppercase tracking-wider">
                 <Network size={12} /> Research Sources
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                 {result.sources.map((source, idx) => (
                   <a 
                     key={idx}
                     href={source.url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-xs text-slate-600 hover:text-cyan-600 transition-colors truncate max-w-[200px] flex items-center gap-1"
                   >
                     <ExternalLink size={10} /> {source.title}
                   </a>
                 ))}
              </div>
           </div>
        )}
      </div>

      {/* Modal */}
      {selectedChannel && (
        <ChannelDetailModal 
          item={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
          onSave={onSave}
          isSaved={savedIds.has(selectedChannel.id)}
        />
      )}
    </>
  );
};

export default BrowserWindow;