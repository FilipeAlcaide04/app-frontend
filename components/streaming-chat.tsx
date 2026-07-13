/**
 * Componente React para Chat com Streaming
 * 
 * Exemplo de uso:
 * <StreamingChatComponent 
 *   agentId="agent-123" 
 *   token="seu-token"
 * />
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { StreamingChatClient } from '@/lib/streaming-client';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface StreamingChatComponentProps {
  agentId: string;
  token: string;
  agentName?: string;
  baseUrl?: string;
}

export function StreamingChatComponent({
  agentId,
  token,
  agentName = 'Assistant',
  baseUrl = 'http://localhost:8000',
}: StreamingChatComponentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emotionalState, setEmotionalState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<StreamingChatClient | null>(null);

  // Hook de reconhecimento de voz
  const {
    isListening,
    transcript,
    isSupported: voiceSupported,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    language: 'pt-PT',
    continuous: false,
    interimResults: true,
    onTranscript: (text) => {
      // Quando termina a gravação, preenche o input
      setInput(text);
    },
    onError: (err) => {
      setError(`Erro de voz: ${err}`);
    },
  });

  // Inicializar cliente
  useEffect(() => {
    clientRef.current = new StreamingChatClient(baseUrl, token);
  }, [baseUrl, token]);

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Adicionar mensagem do usuário
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      },
    ]);

    setIsLoading(true);

    let assistantMessage = '';

    try {
      await clientRef.current?.chatStream({
        agentId,
        message: userMessage,
        conversationId: messages[messages.length - 1]?.timestamp.toString(),
        
        // Callback para cada caractere
        onContent: (char) => {
          assistantMessage += char;
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[updated.length - 1]?.role === 'assistant') {
              updated[updated.length - 1].content = assistantMessage;
            }
            return updated;
          });
        },

        // Callback para metadados iniciais
        onMetadata: (data) => {
          console.log('Metadados recebidos:', data);
          if (data.emotional_state) {
            setEmotionalState(data.emotional_state);
          }
        },

        // Callback para fim do stream
        onEnd: (data) => {
          console.log('Stream finalizado:', data);
        },

        // Callback de erro
        onError: (error) => {
          setError(`Erro: ${error.message}`);
          console.error('Erro no chat stream:', error);
        },

        // Callback de conclusão
        onComplete: (data) => {
          setIsLoading(false);
        },
      });

      // Se ainda não há mensagem de assistente, criar uma
      if (!assistantMessage) {
        setMessages((prev) =>
          prev[prev.length - 1]?.role === 'assistant'
            ? prev
            : [
                ...prev,
                {
                  role: 'assistant',
                  content: '',
                  timestamp: Date.now(),
                },
              ]
        );
      } else {
        // Adicionar mensagem do assistente se não existir
        setMessages((prev) => {
          if (prev[prev.length - 1]?.role === 'assistant') return prev;
          return [
            ...prev,
            {
              role: 'assistant',
              content: assistantMessage,
              timestamp: Date.now(),
            },
          ];
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('Erro ao enviar mensagem:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{agentName}</h1>
            {emotionalState && (
              <p className="text-sm text-gray-600 mt-1">
                Estado emocional: {Object.entries(emotionalState)
                  .map(([k, v]) => `${k}: ${(v as number).toFixed(2)}`)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-center">
                Comece uma conversa com {agentName}...
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xl px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        {/* Transcrição ao vivo quando gravando */}
        {isListening && transcript && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              🎙️ <em>{transcript}</em>
            </p>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Envie uma mensagem para ${agentName}...`}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />

            {/* Botão de Voz */}
            {voiceSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isListening ? 'Parar gravação' : 'Usar voz para enviar mensagem'}
              >
                {isListening ? (
                  <>🎙️ Ouvindo...</>
                ) : (
                  <>🎤</>
                )}
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StreamingChatComponent;
