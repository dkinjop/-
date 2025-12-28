import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, Plus, Disc, Zap, Eye } from 'lucide-react';
import { IPData, CPData, SiteConfig } from './types';
import { FANDOM_DATA, DEFAULT_SITE_CONFIG } from './constants';
import { EditableText } from './components/EditableText';
import { GrainOverlay } from './components/GrainOverlay';

// --- Custom Hook ---
function useStickyState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// --- Components ---

const BrutalistCard: React.FC<{ 
  data: IPData; 
  index: number;
  onClick: () => void;
  onUpdate: (updatedData: Partial<IPData>) => void;
}> = ({ data, index, onClick, onUpdate }) => {
  return (
    <motion.div
      layoutId={`card-${data.id}`}
      onClick={onClick}
      className="group relative min-h-[400px] border-r border-b border-white/20 bg-void hover:bg-white hover:text-void transition-colors duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      {/* Giant ID Number in Background */}
      <div className="absolute -bottom-10 -right-4 text-[12rem] font-impact font-black text-white/5 group-hover:text-black/5 leading-none select-none pointer-events-none transition-colors duration-200">
        {data.id}
      </div>

      {/* Header */}
      <div className="p-4 border-b border-white/20 group-hover:border-black/20 flex justify-between items-start">
         <div className="font-mono text-xs uppercase tracking-widest flex flex-col">
            <span>INDEX_0{index + 1}</span>
            <span className="opacity-50 group-hover:opacity-100">{data.entryDate}</span>
         </div>
         <div className="border border-current px-2 py-0.5 text-[10px] font-mono uppercase rounded-full group-hover:bg-black group-hover:text-white transition-colors">
            <EditableText value={data.category} onSave={(val) => onUpdate({ category: val })} />
         </div>
      </div>

      {/* Main Content */}
      <div className="p-4 relative z-10">
         <h2 className="text-5xl md:text-6xl font-display font-bold leading-[0.85] uppercase tracking-tight mb-4 mix-blend-difference">
            <EditableText value={data.title} onSave={(val) => onUpdate({ title: val })} multiline />
         </h2>
         <div className="flex flex-wrap gap-2 mt-4">
            {data.tags.map((tag, idx) => (
               <span key={idx} className="text-xs font-mono border border-current px-1 group-hover:border-black">
                 #<EditableText 
                    value={tag} 
                    onSave={(val) => {
                       const newTags = [...data.tags];
                       newTags[idx] = val;
                       onUpdate({ tags: newTags });
                    }} 
                 />
               </span>
            ))}
         </div>
      </div>

      {/* Footer Action */}
      <div className="p-4 flex justify-between items-end">
         <ArrowUpRight className="w-8 h-8 group-hover:rotate-45 transition-transform duration-300" />
         <span className="font-mono text-[10px] uppercase hidden group-hover:inline-block animate-pulse">
            Access File →
         </span>
      </div>
    </motion.div>
  );
};

const Drawer = ({ 
  data, 
  onClose, 
  onUpdate,
  onDelete
}: { 
  data: IPData; 
  onClose: () => void;
  onUpdate: (updatedData: Partial<IPData>) => void; 
  onDelete: () => void;
}) => {
  
  const updateCP = (index: number, field: keyof CPData, value: string) => {
    const newCPs = [...data.cps];
    newCPs[index] = { ...newCPs[index], [field]: value };
    onUpdate({ cps: newCPs });
  };

  const deleteCP = (index: number) => {
    if (confirm("DELETE RELATIONAL DATA?")) {
      const newCPs = data.cps.filter((_, i) => i !== index);
      onUpdate({ cps: newCPs });
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: '0%' }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', ease: 'circOut', duration: 0.5 }}
      className="fixed inset-y-0 right-0 z-[60] w-full md:w-[60vw] bg-white text-black border-l-4 border-black shadow-[0_0_50px_rgba(255,255,255,0.2)] flex flex-col overflow-hidden"
    >
      <div className="flex-none bg-black text-white p-4 flex justify-between items-center select-none">
        <div className="flex items-center gap-4">
           <div className="w-3 h-3 bg-red-600 animate-pulse rounded-full" />
           <h2 className="font-mono text-sm uppercase tracking-widest">
             ARCHIVE_ID: {data.id}
           </h2>
        </div>
        <button onClick={onClose} className="hover:bg-white hover:text-black transition-colors p-1">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
        
        {/* Title Section */}
        <section className="border-b-4 border-black pb-8">
           <div className="flex justify-between items-end mb-4">
              <span className="font-mono text-xs bg-black text-white px-2 py-1">
                 <EditableText value={data.category} onSave={(val) => onUpdate({ category: val })} />
              </span>
              <span className="font-mono text-xs">
                 REC: <EditableText value={data.entryDate} onSave={(val) => onUpdate({ entryDate: val })} />
              </span>
           </div>
           <h1 className="text-6xl md:text-8xl font-black font-impact uppercase leading-[0.85] tracking-tighter mb-6 break-words">
              <EditableText value={data.title} onSave={(val) => onUpdate({ title: val })} multiline />
           </h1>
           <p className="font-mono text-sm md:text-base leading-relaxed max-w-2xl border-l-2 border-black pl-4">
              <EditableText value={data.summary} onSave={(val) => onUpdate({ summary: val })} multiline />
           </p>
        </section>

        {/* Data Points */}
        <section className="grid grid-cols-2 gap-4">
           {data.tags.map((tag, idx) => (
             <div key={idx} className="border border-black p-3 font-mono text-xs uppercase flex justify-between items-center hover:bg-black hover:text-white transition-colors">
                <span>#<EditableText value={tag} onSave={(t) => {
                  const nt = [...data.tags]; nt[idx]=t; onUpdate({tags:nt});
                }} /></span>
             </div>
           ))}
           <button onClick={() => onUpdate({ tags: [...data.tags, 'NEW_TAG'] })} className="border border-dashed border-black p-3 font-mono text-xs uppercase text-center hover:bg-black hover:text-white">
             + ADD TAG
           </button>
        </section>

        {/* Relationships */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-4xl font-display font-bold uppercase">CP Manifest</h3>
            <div className="flex-1 h-px bg-black" />
          </div>

          <div className="space-y-8">
            {data.cps.map((cp, index) => (
               <div key={index} className="relative group border border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  <button onClick={() => deleteCP(index)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:text-red-600">
                    <X size={16} />
                  </button>
                  <div className="font-impact text-3xl md:text-4xl mb-2">
                    <EditableText value={cp.name} onSave={(v) => updateCP(index, 'name', v)} />
                  </div>
                  <div className="flex gap-4 font-mono text-xs uppercase border-b border-black/10 pb-4 mb-4 text-gray-500">
                     <span>ROLE: <EditableText value={cp.role} onSave={(v) => updateCP(index, 'role', v)} /></span>
                     <span>//</span>
                     <span>VIBE: <EditableText value={cp.vibe} onSave={(v) => updateCP(index, 'vibe', v)} /></span>
                  </div>
                  <div className="font-serif italic text-lg md:text-xl">
                    "<EditableText value={cp.description} onSave={(v) => updateCP(index, 'description', v)} multiline />"
                  </div>
               </div>
            ))}
          </div>

          <button 
            onClick={() => onUpdate({ cps: [...data.cps, { name: 'PAIRING_NAME', role: 'ARCHETYPE', vibe: 'DYNAMICS', description: 'Analyze relationship here...' }] })}
            className="mt-8 w-full py-6 border-2 border-black border-dashed font-mono uppercase text-sm hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Init New Relationship Protocol
          </button>
        </section>

        {/* Delete Zone */}
        <div className="pt-12 mt-12 border-t border-black/20">
           <button onClick={() => { if(confirm("PERMANENT DELETION??")) onDelete(); }} className="text-red-600 font-mono text-xs uppercase hover:underline">
             [X] TERMINATE THIS ARCHIVE ENTRY PERMANENTLY
           </button>
        </div>

      </div>
    </motion.div>
  );
};

export default function App() {
  const [fandomData, setFandomData] = useStickyState<IPData[]>('acid_fandom_data', FANDOM_DATA);
  const [config, setConfig] = useStickyState<SiteConfig>('acid_site_config', DEFAULT_SITE_CONFIG);
  const [selectedID, setSelectedID] = useState<string | null>(null);

  const selectedIP = fandomData.find(ip => ip.id === selectedID) || null;

  const handleUpdateIP = (id: string, updatedFields: Partial<IPData>) => {
    setFandomData(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
  };

  const handleUpdateConfig = (field: keyof SiteConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleAddIP = () => {
    const newIP: IPData = {
      id: crypto.randomUUID().slice(0, 4).toUpperCase(),
      title: 'UNTITLED DATA',
      category: 'MISC',
      entryDate: '2025.XX.XX',
      colorTheme: 'green',
      summary: 'Data corruption detected. Please enter summary.',
      tags: ['NEW'],
      cps: []
    };
    setFandomData([...fandomData, newIP]);
  };

  return (
    <div className="min-h-screen bg-void text-white selection:bg-white selection:text-black overflow-x-hidden font-sans">
      <GrainOverlay />
      
      {/* Header Area */}
      <header className="relative z-10 pt-12 md:pt-20 px-4 mb-0">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex justify-between items-end border-b border-white pb-2 mb-2">
            <div className="font-mono text-xs uppercase flex gap-4">
              <span className="flex items-center gap-2"><Disc className="animate-spin" size={12} /> <EditableText value={config.systemStatus} onSave={(v) => handleUpdateConfig('systemStatus', v)} /></span>
              <span className="hidden md:inline">LOC: <EditableText value={config.location} onSave={(v) => handleUpdateConfig('location', v)} /></span>
            </div>
            <div className="font-mono text-xs uppercase text-right">
               <EditableText value={config.userRole} onSave={(v) => handleUpdateConfig('userRole', v)} />
            </div>
          </div>
          
          <h1 className="text-[12vw] leading-[0.8] font-impact font-black uppercase tracking-tighter mix-blend-difference break-words">
            <EditableText value={config.mainTitle} onSave={(v) => handleUpdateConfig('mainTitle', v)} />
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mt-8 pb-12 border-b border-white/20">
             <div className="md:w-1/3 text-sm font-mono leading-relaxed opacity-80 uppercase">
                <EditableText value={config.introText} onSave={(v) => handleUpdateConfig('introText', v)} multiline />
             </div>
             <div className="md:w-1/3 flex justify-end">
                <div className="border border-white p-4 w-full md:w-auto text-center hover:bg-white hover:text-black transition-colors cursor-help">
                   <div className="text-4xl font-display font-bold">{fandomData.length}</div>
                   <div className="text-[10px] font-mono uppercase">Total Archives</div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 border-t border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 bg-white/20 gap-[1px] border-b border-white/20">
          {fandomData.map((item, index) => (
            <BrutalistCard 
              key={item.id} 
              index={index}
              data={item} 
              onClick={() => setSelectedID(item.id)}
              onUpdate={(updated) => handleUpdateIP(item.id, updated)}
            />
          ))}

          {/* ADD BUTTON */}
          <button 
            onClick={handleAddIP} 
            className="group min-h-[400px] bg-void flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:text-black transition-colors"
          >
             <Plus className="w-24 h-24 mb-4 stroke-1 group-hover:scale-110 transition-transform" />
             <span className="font-impact text-2xl uppercase tracking-widest border-b-2 border-transparent group-hover:border-black">Initialize New Entry</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono uppercase opacity-50 relative z-10">
         <div className="flex gap-4">
            <span>Memory: {Math.floor(Math.random() * 100)}%</span>
            <span>Uptime: Forever</span>
         </div>
         <EditableText value={config.footerText} onSave={(v) => handleUpdateConfig('footerText', v)} />
      </footer>

      {/* Drawer / Modal */}
      <AnimatePresence>
        {selectedIP && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
               onClick={() => setSelectedID(null)}
            />
            <Drawer 
              data={selectedIP} 
              onClose={() => setSelectedID(null)}
              onUpdate={(updated) => handleUpdateIP(selectedIP.id, updated)}
              onDelete={() => {
                 setFandomData(prev => prev.filter(p => p.id !== selectedIP.id));
                 setSelectedID(null);
              }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
