import React from 'react';
import { Database, Trash2, ExternalLink, Download, AlertCircle, UserCircle2, LogIn, Cloud, CloudOff, LogOut, Monitor, Smartphone, Globe } from 'lucide-react';
import { SavedItem, User } from '../types';

interface SidebarProps {
  savedItems: SavedItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onExport: () => void;
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  savedItems, 
  onRemove, 
  onClear, 
  onExport, 
  user, 
  onLoginClick, 
  onLogoutClick 
}) => {
  
  const handleDownload = (platform: string) => {
     // Simulate a real file download
     const isWindows = platform === 'Windows';
     const extension = isWindows ? 'exe' : 'apk';
     const filename = `Sabeer_Search_AI_Setup_v1.0.${extension}`;
     
     // Create dummy content for the installer stub
     const content = `[SABEER AI INSTALLER STUB]\n\nPlatform: ${platform}\nVersion: 1.0.0\nBuild: Stable\n\nIn a production environment, this file would be the compiled Electron binary (Windows) or Signed APK (Android).`;
     
     const blob = new Blob([content], { type: 'application/octet-stream' });
     const url = URL.createObjectURL(blob);
     
     const link = document.createElement('a');
     link.href = url;
     link.download = filename;
     document.body.appendChild(link);
     link.click();
     
     // Cleanup
     document.body.removeChild(link);
     setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const handleOpenBrowser = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-slate-900">
            <Database className="text-purple-600" size={18} />
            <h2 className="font-semibold tracking-tight">
              {user ? 'Cloud Database' : 'Local Storage'}
            </h2>
          </div>
          {user ? (
             <div className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
               <Cloud size={10} /> SYNCED
             </div>
          ) : (
             <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
               <CloudOff size={10} /> GUEST
             </div>
          )}
        </div>
        <p className="text-xs text-slate-500">
          {savedItems.length} entities stored
        </p>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {savedItems.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-sm flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
              <Database size={20} className="text-slate-400" />
            </div>
            <p>
              No saved entities.<br />
              <span className="text-xs opacity-70">Research results to populate list.</span>
            </p>
          </div>
        )}
        {savedItems.map((item) => (
          <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-purple-300 transition-colors group relative animate-in fade-in slide-in-from-left-2 shadow-sm hover:shadow-md hover:bg-white">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-medium text-slate-800 truncate pr-6">{item.name}</h3>
              <button 
                onClick={() => onRemove(item.id)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove Item"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 mb-2">{item.description}</p>
            
            <div className="flex items-center justify-between mt-2 border-t border-slate-200 pt-2">
               <span className="text-[10px] text-slate-400 font-mono">
                 {new Date(item.savedAt).toLocaleDateString()}
               </span>
               {item.url && (
                 <a 
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-500 flex items-center gap-1 text-[10px] font-semibold"
                 >
                   VISIT <ExternalLink size={10} />
                 </a>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Tools Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        
        {/* App Download Section (NEW) */}
        <div className="mb-3">
           <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Access Node</h4>
           <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => handleDownload('Windows')}
                className="flex items-center justify-center gap-1 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-[10px] py-2 rounded transition-colors border border-slate-200 hover:border-blue-200 shadow-sm"
                title="Download Windows Client"
              >
                <Monitor size={12} /> Win 11
              </button>
              <button 
                onClick={() => handleDownload('Android')}
                className="flex items-center justify-center gap-1 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 text-[10px] py-2 rounded transition-colors border border-slate-200 hover:border-emerald-200 shadow-sm"
                title="Download Android Client"
              >
                <Smartphone size={12} /> Android
              </button>
              <button 
                onClick={handleOpenBrowser}
                className="flex items-center justify-center gap-1 bg-white hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 text-[10px] py-2 rounded transition-colors border border-slate-200 hover:border-cyan-200 shadow-sm"
                title="Open Web Version"
              >
                <Globe size={12} /> Web
              </button>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button 
            onClick={onExport}
            disabled={savedItems.length === 0}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-600 text-xs py-2 rounded transition-colors border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Download size={14} /> JSON
          </button>
          <button 
            onClick={onClear}
            disabled={savedItems.length === 0}
            className="flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs py-2 rounded transition-colors border border-slate-200 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <AlertCircle size={14} /> Clear
          </button>
        </div>

        {/* User Profile Section */}
        <div className="pt-3 border-t border-slate-200">
          {user ? (
            <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.avatarUrl ? (
                   <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full bg-slate-100" />
                ) : (
                   <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
                      <span className="text-xs font-bold">{user.name.charAt(0)}</span>
                   </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate font-mono">ID: {user.id.slice(0,6)}</p>
                </div>
              </div>
              <button 
                onClick={onLogoutClick}
                className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-slate-50 rounded transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
             <button 
              onClick={onLoginClick}
              className="w-full flex items-center justify-center gap-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 hover:border-cyan-300 py-2.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wide shadow-sm"
             >
               <LogIn size={14} /> Sign In / Register
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;