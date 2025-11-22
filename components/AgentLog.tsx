import React, { useEffect, useRef } from 'react';
import { Terminal, CheckCircle2, Loader2, AlertTriangle, Activity, Cpu } from 'lucide-react';
import { LogEntry } from '../types';

interface AgentLogProps {
  logs: LogEntry[];
  isProcessing: boolean;
}

const AgentLog: React.FC<AgentLogProps> = ({ logs, isProcessing }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-white border-t border-slate-200 h-48 flex flex-col font-mono text-sm relative shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-bold tracking-widest text-[10px] uppercase text-slate-500 flex items-center gap-2">
             <Terminal size={12} /> SABEER.KERNEL.V1
          </span>
        </div>
        {isProcessing ? (
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-cyan-600 animate-pulse">PROCESSING_STREAMS</span>
            <Loader2 size={12} className="text-cyan-600 animate-spin" />
          </div>
        ) : (
           <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase tracking-wider">
            <Cpu size={12} />
            <span>System Ready</span>
          </div>
        )}
      </div>
      
      {/* Log Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 relative font-mono text-xs bg-white">
        {logs.length === 0 && (
          <div className="text-slate-400 flex flex-col items-center justify-center h-full opacity-50 gap-2">
             <Activity size={24} />
             <p>> Waiting for command parameters...</p>
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
            <span className="text-slate-400 min-w-[70px] select-none text-[10px] pt-0.5">
              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
            </span>
            <div className="flex items-center gap-2 max-w-full">
              
              {log.type === 'process' && <span className="text-cyan-600">>></span>}
              {log.type === 'success' && <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />}
              {log.type === 'error' && <AlertTriangle size={12} className="text-red-600 shrink-0" />}
              {log.type === 'info' && <span className="text-slate-400">#</span>}

              <span className={`
                leading-relaxed tracking-tight font-medium
                ${log.type === 'process' ? 'text-cyan-700' : ''}
                ${log.type === 'success' ? 'text-emerald-700' : ''}
                ${log.type === 'error' ? 'text-red-600' : ''}
                ${log.type === 'info' ? 'text-slate-600' : ''}
              `}>
                {log.message}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default AgentLog;