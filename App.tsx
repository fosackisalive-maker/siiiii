import React, { useState, useEffect, useCallback } from 'react';
import { Search, Menu, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import Sidebar from './components/Sidebar';
import AgentLog from './components/AgentLog';
import BrowserWindow from './components/BrowserWindow';
import SearchControls from './components/SearchControls';
import AuthModal from './components/AuthModal';
import { searchYouTubeChannels } from './services/geminiService';
import { authService } from './services/authService';
import { SearchResult, YouTuber, LogEntry, SavedItem, SearchOptions, User } from './types';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  // Autonomous Agent State
  const [isAutoLooping, setIsAutoLooping] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Advanced Search Options
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    focus: 'General',
    vibe: 'Any',
    mustInclude: '',
    exclude: ''
  });
  
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Initialize Logic
  useEffect(() => {
    // Check for active session
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserData(currentUser.id);
      addLog(`Welcome back, Agent ${currentUser.name}. Cloud Link Active.`, 'success');
    } else {
      loadGuestData();
      addLog('System initialized in Guest Mode. Local storage active.', 'info');
    }
  }, []);

  // Autonomous Loop Effect
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isAutoLooping && !isProcessing && searchResult) {
      // Delay slightly to allow user to read log and see UI update
      timeout = setTimeout(() => {
        addLog("Autonomous Agent: Iterating research depth...", 'process');
        handleLoadMore(); 
      }, 4000);
    }

    return () => clearTimeout(timeout);
  }, [isAutoLooping, isProcessing, searchResult]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      message,
      timestamp: Date.now(),
      type,
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  // --- Database Logic (Switching based on Auth) ---

  const loadGuestData = () => {
    const saved = localStorage.getItem('aether_db');
    if (saved) setSavedItems(JSON.parse(saved));
    else setSavedItems([]);
  };

  const loadUserData = (userId: string) => {
    const saved = localStorage.getItem(`aether_db_${userId}`);
    if (saved) setSavedItems(JSON.parse(saved));
    else setSavedItems([]);
  };

  const persistData = (items: SavedItem[]) => {
    if (user) {
      // Save to "Cloud" (Simulated by namespaced localstorage)
      localStorage.setItem(`aether_db_${user.id}`, JSON.stringify(items));
    } else {
      // Save to Local Guest
      localStorage.setItem('aether_db', JSON.stringify(items));
    }
  };

  // Update persistence whenever savedItems changes
  useEffect(() => {
    // Avoid initial overwrite of empty array before load
    if (savedItems) {
       persistData(savedItems);
    }
  }, [savedItems, user]);


  // --- Handlers ---

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setSavedItems([]); // Clear view temporarily
    loadUserData(loggedInUser.id); // Load their specific data
    addLog(`Identity confirmed. Switched to Cloud Database: ${loggedInUser.id}`, 'success');
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setSavedItems([]);
    loadGuestData();
    addLog('Disconnected from Cloud Node. Reverted to Guest storage.', 'warning');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    setIsAutoLooping(false); // Reset auto loop on new search
    setShowControls(false);
    setSearchResult(null);
    setLogs([]);
    addLog(`Receiving command: "${query}"`, 'info');

    try {
      addLog('Deploying search agents...', 'process');
      const result = await searchYouTubeChannels(query, searchOptions, (msg) => addLog(msg, 'process'));
      setSearchResult(result);
      addLog('Research complete. Visualizing data.', 'success');
    } catch (error) {
      addLog('Operation failed. Please check API limits or try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!searchResult || isProcessing) return;
    setIsProcessing(true);
    
    const currentNames = searchResult.items.map(i => i.name);
    addLog(`Expanding research horizon. Excluding ${currentNames.length} existing entities...`, 'process');

    try {
        const newResult = await searchYouTubeChannels(query, searchOptions, (msg) => addLog(msg, 'process'), currentNames);
        
        if (newResult.items.length === 0) {
            addLog("No new unique channels found in this scan. Stopping autonomous loop.", 'warning');
            setIsAutoLooping(false); // Stop looping if dry
        } else {
            setSearchResult(prev => {
                if (!prev) return newResult;
                return {
                    ...prev,
                    items: [...prev.items, ...newResult.items], 
                    sources: [...prev.sources, ...newResult.sources], 
                    strategy: newResult.strategy
                };
            });
            addLog(`Database expanded: +${newResult.items.length} new entities.`, 'success');
        }
    } catch (error) {
        addLog("Expansion failed. Stopping loop.", 'error');
        setIsAutoLooping(false);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleSave = (item: YouTuber) => {
    if (savedItems.some(i => i.id === item.id)) return;
    const newItem: SavedItem = { ...item, savedAt: Date.now() };
    const newItems = [newItem, ...savedItems];
    setSavedItems(newItems); // useEffect will handle persistence
    
    if (user) {
      addLog(`Entity synced to cloud: "${item.name}"`, 'success');
    } else {
      addLog(`Entity saved locally: "${item.name}"`, 'info');
    }
  };

  const handleRemove = (id: string) => {
    setSavedItems(prev => prev.filter(i => i.id !== id));
    addLog('Entity removed from database.', 'info');
  };

  const handleClearDatabase = () => {
    const storageType = user ? "Cloud" : "Local";
    if (window.confirm(`Are you sure you want to clear your ${storageType} database?`)) {
      setSavedItems([]);
      addLog(`${storageType} database purged successfully.`, 'warning');
    }
  };

  const handleExportDatabase = () => {
    const dataStr = JSON.stringify(savedItems, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sabeer_ai_${user ? user.name.replace(/\s/g,'_') : 'guest'}_export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('Database exported to JSON.', 'success');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-80 transition-transform duration-300 lg:relative lg:translate-x-0`}>
        <Sidebar 
          savedItems={savedItems} 
          onRemove={handleRemove} 
          onClear={handleClearDatabase}
          onExport={handleExportDatabase}
          user={user}
          onLoginClick={() => setShowAuthModal(true)}
          onLogoutClick={handleLogout}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative bg-slate-50">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-200 flex items-center px-4 gap-4 bg-white/80 backdrop-blur-md z-20 relative shadow-sm">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-500"
          >
            <Menu size={20} />
          </button>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl mx-auto flex gap-2">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={user ? `Research command for Agent ${user.name}...` : "Ask Sabeer AI to find channels..."}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-12 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-400 text-slate-900 shadow-sm"
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <div className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-500 border border-slate-200 font-mono">
                  ENTER
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setShowControls(!showControls)}
              className={`
                px-3 rounded-xl border transition-all flex items-center gap-2 text-xs font-medium shadow-sm
                ${showControls 
                  ? 'bg-cyan-50 border-cyan-500/50 text-cyan-700' 
                  : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800'}
              `}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Tune</span>
            </button>
          </form>
        </header>

        <SearchControls 
          options={searchOptions}
          onChange={setSearchOptions}
          isOpen={showControls}
          onClose={() => setShowControls(false)}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-hidden flex flex-col">
             <BrowserWindow 
               result={searchResult} 
               onSave={handleSave} 
               savedIds={new Set(savedItems.map(i => i.id))} 
               onLoadMore={handleLoadMore}
               isProcessing={isProcessing}
               isAutoLooping={isAutoLooping}
               onToggleAutoLoop={() => setIsAutoLooping(!isAutoLooping)}
             />
          </div>

          <div className="shrink-0 z-20">
             <AgentLog logs={logs} isProcessing={isProcessing} />
          </div>
        </main>

      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;