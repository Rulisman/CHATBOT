
import React, { useState, useCallback, useEffect } from 'react';
import { Message, KnowledgeFile } from './types';
import { sendMessageStreamToGemini } from './services/geminiService';
import Header from './components/Header';
import KnowledgeSidebar from './components/KnowledgeSidebar';
import ChatInterface from './components/ChatInterface';

const DEFAULT_MASTER_PROMPT = "Eres el asistente oficial de Càmping Paradís. Tu objetivo es resolver dudas de forma clara, elegante y amable. Presenta la información siempre de forma ordenada, utilizando listas si hay varias opciones y asegurándote de que el texto sea fácil de leer en dispositivos móviles. Si no tienes un dato concreto en los archivos, sé honesto y ofrece el contacto directo del camping.";

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '¡Hola! Bienvido al Càmping Paradís.\n\nSoy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      timestamp: Date.now()
    }
  ]);
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([]);
  const [masterPrompt, setMasterPrompt] = useState<string>(DEFAULT_MASTER_PROMPT);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Lógica para detectar acceso de administrador "secreto"
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasAdminParam = params.has('admin'); // Puedes cambiar 'admin' por una clave más secreta como 'setup_dev'
    const hasStoredAuth = localStorage.getItem('cp_admin_auth') === 'true';

    if (hasAdminParam || hasStoredAuth) {
      setIsAuthorized(true);
      localStorage.setItem('cp_admin_auth', 'true');
      
      // Limpiar el parámetro de la URL para que no sea obvio
      if (hasAdminParam) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'model',
      text: '',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, aiMessage]);

    try {
      const stream = sendMessageStreamToGemini(
        [...messages, userMessage], 
        knowledgeFiles,
        masterPrompt
      );
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, text: fullText } : msg
        ));
        if (isLoading) setIsLoading(false);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? { ...msg, text: "Lo siento, ha ocurrido un error al conectar con el servidor." } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  }, [messages, knowledgeFiles, masterPrompt, isLoading]);

  const handleAddFile = (file: KnowledgeFile) => {
    setKnowledgeFiles(prev => [...prev, file]);
  };

  const handleRemoveFile = (id: string) => {
    setKnowledgeFiles(prev => prev.filter(f => f.id !== id));
  };

  const toggleAdminMode = () => {
    if (isAuthorized) {
      setIsAdminMode(!isAdminMode);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-900">
      {isAuthorized && (
        <KnowledgeSidebar 
          files={knowledgeFiles} 
          onAddFile={handleAddFile} 
          onRemoveFile={handleRemoveFile}
          masterPrompt={masterPrompt}
          onUpdateMasterPrompt={setMasterPrompt}
          isOpen={isAdminMode}
          toggleOpen={toggleAdminMode}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          isAdminMode={isAdminMode} 
          toggleAdminMode={toggleAdminMode} 
          showAdminButton={isAuthorized}
        />
        
        <main className="flex-1 overflow-hidden flex flex-col">
          <ChatInterface 
            messages={messages} 
            onSend={handleSendMessage} 
            isLoading={isLoading} 
          />
        </main>
      </div>

      {isAdminMode && isAuthorized && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-10 lg:hidden"
          onClick={toggleAdminMode}
        ></div>
      )}
    </div>
  );
};

export default App;
