
import React from 'react';
import { KnowledgeFile } from '../types';

interface KnowledgeSidebarProps {
  files: KnowledgeFile[];
  onAddFile: (file: KnowledgeFile) => void;
  onRemoveFile: (id: string) => void;
  masterPrompt: string;
  onUpdateMasterPrompt: (prompt: string) => void;
  isOpen: boolean;
  toggleOpen: () => void;
}

const KnowledgeSidebar: React.FC<KnowledgeSidebarProps> = ({ 
  files, 
  onAddFile, 
  onRemoveFile, 
  masterPrompt,
  onUpdateMasterPrompt,
  isOpen,
  toggleOpen 
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    (Array.from(fileList) as File[]).forEach(file => {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          onAddFile({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            content: content,
            size: file.size
          });
        };
        reader.readAsText(file);
      } else {
        alert(`El archivo ${file.name} no es compatible. Sube solo archivos .txt.`);
      }
    });
    e.target.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <aside 
      className={`
        bg-slate-900 text-slate-200 flex flex-col transition-all duration-300 z-20 shrink-0 border-r border-slate-800
        ${isOpen ? 'w-96' : 'w-0 overflow-hidden'}
        fixed inset-y-0 left-0 lg:relative lg:translate-x-0
        ${!isOpen ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg text-white">Configuración Experta</h2>
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Panel de Administrador</p>
        </div>
        <button onClick={toggleOpen} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-8">
        {/* SECCIÓN 1: PROMPT MAESTRO */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-purple-500/20 rounded text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12L2.1 12.1"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prompt Maestro (Personalidad)</p>
          </div>
          <textarea 
            value={masterPrompt}
            onChange={(e) => onUpdateMasterPrompt(e.target.value)}
            className="w-full h-48 bg-slate-800 border border-slate-700 rounded-xl p-4 text-xs text-slate-300 leading-relaxed focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all resize-none custom-scrollbar"
            placeholder="Define aquí el rol y las reglas de oro de tu bot..."
          />
          <p className="mt-2 text-[10px] text-slate-500 italic">
            Define quién es el bot, cómo habla y cuáles son sus prioridades de atención.
          </p>
        </section>

        {/* SECCIÓN 2: ARCHIVOS DE CONOCIMIENTO */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 rounded text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base de Datos (.txt)</p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-bold">
              {files.length}
            </span>
          </div>
          
          <div className="space-y-3 mb-4">
            {files.length === 0 ? (
              <div className="bg-slate-800/30 rounded-xl p-6 text-center border border-dashed border-slate-800">
                <p className="text-[11px] text-slate-500">Sin archivos de datos específicos.</p>
              </div>
            ) : (
              files.map(file => (
                <div key={file.id} className="group bg-slate-800/50 p-3 rounded-lg border border-slate-800 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{file.name}</p>
                      <p className="text-[9px] text-slate-500 uppercase">{formatSize(file.size)}</p>
                    </div>
                    <button 
                      onClick={() => onRemoveFile(file.id)}
                      className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <label className="block w-full">
            <div className="relative cursor-pointer flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl border border-slate-700 transition-all active:scale-[0.98]">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <span className="text-xs uppercase tracking-wider">Añadir Archivo</span>
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                multiple 
                accept=".txt"
                onChange={handleFileUpload} 
              />
            </div>
          </label>
        </section>
      </div>

      <div className="p-6 bg-slate-900 border-t border-slate-800">
        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <p className="text-[10px] text-blue-400 font-medium text-center leading-relaxed">
            La IA combinará el Prompt Maestro con los archivos de texto para generar respuestas precisas.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default KnowledgeSidebar;
