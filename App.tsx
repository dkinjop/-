import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Hash, Heart, Terminal, Cpu, Disc, Plus } from 'lucide-react';
import { IPData, CPData, SiteConfig } from './types';
import { FANDOM_DATA, DEFAULT_SITE_CONFIG } from './constants';
import { NoiseOverlay } from './components/NoiseOverlay';
import { EditableText } from './components/EditableText';

// --- Custom Hook for LocalStorage ---

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

// --- Helper Components ---

const Marquee = ({ text, onUpdate }: { text: string; onUpdate: (val: string) => void }) => (
  <div className="relative flex overflow-hidden py-2 bg-acid-green text-black font-mono font-bold text-sm tracking-widest border-y-2 border-acid-black select-none">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-acid-green">
      {/* Hidden edit trigger for Marquee could be placed here, but simpler to just edit one of the spans? 
          Actually, editing scrolling text is hard. Let's place a static editable area that syncs.
          Or simpler: The marquee repeats the text. We can overlay an input?
          Let's try making the first item editable and it updates the rest.
      */}
    </div>
    <motion.div
      className="flex gap-8 whitespace-nowrap"
      animate={{ x: '-50%' }}
      initial={{ x: '0%' }}
      transition={{ repeat: Infinity, ease: 'linear', duration: 25 }}
    >
      {[...Array(10)].map((_, i) => (
        <span key={i} className="mx-4 flex">
           {/* Only the first one is practically editable without chasing it, 
               but for UX let's just allow clicking any. 
               However, moving text is hard to click. 
               We will trust the user to pause/catch it or just edit the config elsewhere?
               Actually, let's just make them all editable instances that update the single source.
           */}
           <EditableText 
             value={text} 
             onSave={onUpdate} 
             className="cursor-text"
           />
        </span>
      ))}
    </motion.div>
  </div>
);

const GlitchTitle = ({ text, onUpdate }: { text: string, onUpdate: (val: string) => void }) => {
  return (
    <div className="relative inline-block group">
      {/* Main editable layer */}
      <div className="text-6xl md:text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-acid-green via-acid-blue to-acid-pink z-10 relative">
        <EditableText value={text} onSave={onUpdate} />
      </div>
      
      {/* Decor layers reading the same text prop */}
      <h1 className="absolute top-0 left-[2px] text-6xl md:text-8xl font-display font-black text-acid-blue opacity-0 group-hover:opacity-70 animate-pulse mix-blend-screen pointer-events-none select-none">
        {text}
      </h1>
      <h1 className="absolute top-0 -left-[2px] text-6xl md:text-8xl font-display font-black text-acid-pink opacity-0 group-hover:opacity-70 animate-pulse delay-75 mix-blend-screen pointer-events-none select-none">
        {text}
      </h1>
    </div>
  );
};

// --- Main Components ---

const IPCard: React.FC<{ 
  data: IPData; 
  onClick: () => void;
  onUpdate: (updatedData: Partial<IPData>) => void;
}> = ({ data, onClick, onUpdate }) => {
  const colorMap = {
    green: 'border-acid-green hover:bg-acid-green hover:text-black text-acid-green',
    pink: 'border-acid-pink hover:bg-acid-pink hover:text-black text-acid-pink',
    blue: 'border-acid-blue hover:bg-acid-blue hover:text-black text-acid-blue',
  };

  return (
    <motion.div
      layoutId={`card-${data.id}`}
      onClick={onClick}
      whileHover={{ scale: 0.98, rotate: Math.random() * 2 - 1 }}
      className={`relative p-6 border-2 ${colorMap[data.colorTheme]} cursor-pointer group transition-colors duration-300 min-h-[300px] flex flex-col justify-between overflow-hidden`}
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-current" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-current" />
      
      {/* Background Texture on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]" />

      <div className="space-y-2">
        <div className="flex justify-between items-start font-mono text-xs border-b border-current pb-2 mb-4">
          <span>NO.{data.id}</span>
          <EditableText value={data.category} onSave={(val) => onUpdate({ category: val })} />
        </div>
        <div className="text-4xl font-display font-bold leading-none break-words uppercase">
          <EditableText value={data.title} onSave={(val) => onUpdate({ title: val })} multiline />
        </div>
      </div>

      <div className="space-y-4 mt-8">
         <div className="flex flex-wrap gap-2">
            {data.tags.map((tag, idx) => (
              <span key={idx} className="text-[10px] font-mono border border-current px-1 py-0.5 flex">
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
         <div className="flex items-center gap-2 font-mono text-xs">
            <Disc className={`w-4 h-4 ${data.colorTheme === 'pink' ? 'animate-spin-slow' : ''}`} />
            <span>ENTERED: <EditableText value={data.entryDate} onSave={(val) => onUpdate({ entryDate: val })} /></span>
         </div>
      </div>
    </motion.div>
  );
};

const DetailView = ({ 
  data, 
  onClose, 
  onUpdate 
}: { 
  data: IPData; 
  onClose: () => void;
  onUpdate: (updatedData: Partial<IPData>) => void; 
}) => {
  
  const themeColors = {
    green: 'text-acid-green border-acid-green selection:bg-acid-green selection:text-black',
    pink: 'text-acid-pink border-acid-pink selection:bg-acid-pink selection:text-black',
    blue: 'text-acid-blue border-acid-blue selection:bg-acid-blue selection:text-black',
  };

  const bgColors = {
     green: 'bg-acid-green',
     pink: 'bg-acid-pink',
     blue: 'bg-acid-blue',
  };

  const updateCP = (index: number, field: keyof CPData, value: string) => {
    const newCPs = [...data.cps];
    newCPs[index] = { ...newCPs[index], [field]: value };
    onUpdate({ cps: newCPs });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 overflow-y-auto"
    >
      <motion.div
        layoutId={`card-${data.id}`}
        className={`w-full max-w-4xl min-h-[80vh] bg-acid-black border-2 ${themeColors[data.colorTheme].split(' ')[1]} p-1 relative shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col`}
      >
        {/* Header Bar */}
        <div className={`flex justify-between items-center p-4 border-b ${themeColors[data.colorTheme].split(' ')[1]} bg-black/50 sticky top-0 z-10 backdrop-blur-md`}>
           <div className={`font-mono text-sm ${themeColors[data.colorTheme].split(' ')[0]} flex items-center gap-2`}>
             <Terminal size={16} />
             <span>LOG_VIEWER_V.2.5</span>
             <span className="hidden md:inline"> // ID: {data.id}</span>
           </div>
           <button 
             onClick={onClose}
             className={`p-2 hover:bg-white hover:text-black transition-colors rounded-full border border-current ${themeColors[data.colorTheme].split(' ')[0]}`}
           >
             <X size={24} />
           </button>
        </div>

        <div className={`p-6 md:p-12 overflow-y-auto flex-1 ${themeColors[data.colorTheme]}`}>
          {/* Main Title Area */}
          <div className="mb-12 border-l-4 border-current pl-6 md:pl-12 py-2">
            <motion.h2 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-8xl font-display font-black uppercase mb-4 leading-[0.9]"
            >
              <EditableText value={data.title} onSave={(val) => onUpdate({ title: val })} multiline />
            </motion.h2>
            <div className="font-mono text-lg opacity-80 flex flex-col md:flex-row gap-4 md:items-center">
              <span className="bg-white/10 px-2 py-1 flex gap-2">TYPE: <EditableText value={data.category} onSave={(val) => onUpdate({ category: val })} /></span>
              <span className="bg-white/10 px-2 py-1 flex gap-2">DATE: <EditableText value={data.entryDate} onSave={(val) => onUpdate({ entryDate: val })} /></span>
            </div>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            
            {/* Left Col: Summary & Stats */}
            <div className="md:col-span-1 space-y-8">
              <div className="border border-current p-4 relative">
                <div className={`absolute -top-3 left-4 px-2 bg-acid-black font-mono text-xs uppercase ${themeColors[data.colorTheme].split(' ')[0]}`}>
                   System Note
                </div>
                <div className="font-mono text-sm leading-relaxed opacity-90">
                  <EditableText value={data.summary} onSave={(val) => onUpdate({ summary: val })} multiline />
                </div>
              </div>

              <div className="space-y-2">
                 <h3 className="font-display font-bold text-xl uppercase mb-4 flex items-center gap-2">
                    <Hash size={20} /> Data Tags
                 </h3>
                 <div className="flex flex-wrap gap-2">
                   {data.tags.map((tag, idx) => (
                     <span key={idx} className={`text-xs font-mono px-3 py-1 border border-current ${idx % 2 === 0 ? 'bg-white/5' : ''}`}>
                       <EditableText 
                         value={tag} 
                         onSave={(val) => {
                           const newTags = [...data.tags];
                           newTags[idx] = val;
                           onUpdate({ tags: newTags });
                         }} 
                       />
                     </span>
                   ))}
                   <button 
                     onClick={() => onUpdate({ tags: [...data.tags, 'NEW_TAG'] })}
                     className="text-xs font-mono px-2 py-1 border border-current bg-white/10 hover:bg-white/20"
                   >
                     +
                   </button>
                 </div>
              </div>
            </div>

            {/* Right Col: CPs & Feelings */}
            <div className="md:col-span-2 space-y-12">
              <div>
                <h3 className="text-3xl font-display font-bold mb-8 border-b border-current pb-2 flex items-center gap-3">
                  <Heart className="fill-current" />
                  SHIPPING MANIFEST
                </h3>

                <div className="space-y-8">
                  {data.cps.map((cp, index) => (
                    <motion.div 
                      key={index}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + (index * 0.1) }}
                      className="group"
                    >
                      <div className="flex items-baseline gap-4 mb-2">
                        <span className="font-mono text-xs opacity-50">0{index + 1}</span>
                        <h4 className={`text-xl md:text-2xl font-bold font-mono ${bgColors[data.colorTheme]} text-black px-2 inline-block`}>
                          <EditableText value={cp.name} onSave={(val) => updateCP(index, 'name', val)} />
                        </h4>
                      </div>
                      
                      <div className="pl-8 border-l border-current/30 ml-2 space-y-3">
                        <div className="flex gap-4 font-mono text-xs uppercase tracking-widest opacity-70">
                          <span className="flex">
                            [<EditableText value={cp.role} onSave={(val) => updateCP(index, 'role', val)} />]
                          </span>
                          <span>///</span>
                          <span className="flex">
                            <EditableText value={cp.vibe} onSave={(val) => updateCP(index, 'vibe', val)} />
                          </span>
                        </div>
                        <div className="font-serif italic text-lg md:text-xl leading-relaxed opacity-90 transition-all duration-300 hover:opacity-100 hover:scale-[1.02] origin-left hover:text-white">
                          "<EditableText value={cp.description} onSave={(val) => updateCP(index, 'description', val)} multiline />"
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  <button 
                     onClick={() => onUpdate({ 
                       cps: [...data.cps, { name: 'NEW CP', role: 'ROLE', vibe: 'VIBE', description: 'Description...' }] 
                     })}
                     className="mt-8 flex items-center gap-2 font-mono text-xs border border-current px-4 py-2 hover:bg-white/10"
                   >
                     <Plus size={16} /> ADD ENTRY
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Footer of modal */}
        <div className="p-2 border-t border-current flex justify-between items-center font-mono text-[10px] uppercase opacity-50">
          <span>// END OF FILE</span>
          <span>MEMORY SIZE: {Math.floor(Math.random() * 500) + 100}MB</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [fandomData, setFandomData] = useStickyState<IPData[]>('acid_fandom_data', FANDOM_DATA);
  const [config, setConfig] = useStickyState<SiteConfig>('acid_site_config', DEFAULT_SITE_CONFIG);
  
  const [selectedID, setSelectedID] = useState<string | null>(null);

  const selectedIP = fandomData.find(ip => ip.id === selectedID) || null;

  const handleUpdateIP = (id: string, updatedFields: Partial<IPData>) => {
    setFandomData(prev => prev.map(item => 
      item.id === id ? { ...item, ...updatedFields } : item
    ));
  };

  const handleUpdateConfig = (field: keyof SiteConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-acid-black text-white relative overflow-x-hidden">
      <NoiseOverlay />
      
      {/* Top Marquee */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <Marquee 
          text={config.marqueeText} 
          onUpdate={(val) => handleUpdateConfig('marqueeText', val)} 
        />
      </div>

      <main className="pt-24 pb-24 px-4 md:px-12 max-w-[1600px] mx-auto relative z-10">
        
        {/* Header Section */}
        <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
             <div className="flex items-center gap-2 font-mono text-acid-green text-xs border border-acid-green px-2 py-1 w-fit">
               <span className="w-2 h-2 bg-acid-green rounded-full animate-pulse"></span>
               <span className="flex gap-2">
                 SYSTEM STATUS: <EditableText value={config.systemStatus} onSave={(val) => handleUpdateConfig('systemStatus', val)} />
               </span>
             </div>
             <GlitchTitle 
               text={config.mainTitle} 
               onUpdate={(val) => handleUpdateConfig('mainTitle', val)}
             />
          </div>
          
          <div className="text-right font-mono text-sm text-acid-blue hidden md:block">
            <p className="flex justify-end gap-2">USER: <EditableText value={config.userRole} onSave={(val) => handleUpdateConfig('userRole', val)} /></p>
            <p className="flex justify-end gap-2">LOCATION: <EditableText value={config.location} onSave={(val) => handleUpdateConfig('location', val)} /></p>
            <p>TOTAL ENTRIES: {fandomData.length}</p>
          </div>
        </header>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Introductory 'Card' */}
          <div className="p-6 border-2 border-dashed border-white/20 flex flex-col justify-end min-h-[300px]">
            <Cpu className="w-12 h-12 text-white/20 mb-4" />
            <div className="font-mono text-sm text-white/50 leading-relaxed whitespace-pre-wrap">
              <EditableText 
                value={config.introText} 
                onSave={(val) => handleUpdateConfig('introText', val)} 
                multiline 
                className="block"
              />
            </div>
          </div>

          {fandomData.map((item) => (
            <IPCard 
              key={item.id} 
              data={item} 
              onClick={() => setSelectedID(item.id)}
              onUpdate={(updated) => handleUpdateIP(item.id, updated)}
            />
          ))}
        </div>

      </main>

      {/* Bottom Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-acid-black border-t border-white/10 p-4 z-20 flex justify-between items-center font-mono text-xs text-white/40">
        <EditableText value={config.footerText} onSave={(val) => handleUpdateConfig('footerText', val)} />
        <div className="flex gap-4">
           <span>MADE WITH REACT + TAILWIND</span>
           <span>[ACID_MODE_ON]</span>
        </div>
      </footer>

      {/* Modal View */}
      <AnimatePresence>
        {selectedIP && (
          <DetailView 
            data={selectedIP} 
            onClose={() => setSelectedID(null)}
            onUpdate={(updated) => handleUpdateIP(selectedIP.id, updated)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}