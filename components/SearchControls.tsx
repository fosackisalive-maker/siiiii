import React from 'react';
import { Settings2, Target, Sparkles, PlusCircle, MinusCircle, X } from 'lucide-react';
import { SearchOptions } from '../types';

interface SearchControlsProps {
  options: SearchOptions;
  onChange: (options: SearchOptions) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SearchControls: React.FC<SearchControlsProps> = ({ options, onChange, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof SearchOptions, value: string) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="w-full bg-white/95 border-b border-slate-200 backdrop-blur-md animate-in slide-in-from-top-2 duration-200 absolute top-16 left-0 z-10 shadow-xl">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-cyan-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Settings2 size={14} /> Search Parameters Configuration
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Strategy */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Target size={12} /> Research Focus
              </label>
              <select 
                value={options.focus}
                onChange={(e) => handleChange('focus', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 focus:border-cyan-500 focus:outline-none"
              >
                <option value="General">General Discovery (Balanced)</option>
                <option value="Tutorials">Tutorials & Educational</option>
                <option value="Analysis">Video Essays & Analysis</option>
                <option value="Technical">Technical Breakdown & Workflow</option>
                <option value="Industry">Industry News & Career</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Sparkles size={12} /> Content Vibe
              </label>
              <select 
                value={options.vibe}
                onChange={(e) => handleChange('vibe', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Any">Any Style</option>
                <option value="Professional">Professional & Polished</option>
                <option value="Casual">Casual & Entertaining</option>
                <option value="Academic">Academic & Deep</option>
                <option value="Fast-Paced">Fast-Paced / Short Form</option>
                <option value="Relaxing">Relaxing / Cozy</option>
              </select>
            </div>
          </div>

          {/* Right Column: Keyword Tuning */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                <PlusCircle size={12} /> Force Include Keywords
              </label>
              <input 
                type="text"
                value={options.mustInclude}
                onChange={(e) => handleChange('mustInclude', e.target.value)}
                placeholder="e.g. Blender, frame-by-frame..."
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500/50 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none placeholder:text-slate-400"
              />
              <p className="text-[10px] text-slate-500">AI will force these terms into generated search vectors.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-red-600/70 uppercase flex items-center gap-1">
                <MinusCircle size={12} /> Exclude Keywords
              </label>
              <input 
                type="text"
                value={options.exclude}
                onChange={(e) => handleChange('exclude', e.target.value)}
                placeholder="e.g. Minecraft, Reaction..."
                className="w-full bg-slate-50 border border-slate-300 focus:border-red-300 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchControls;