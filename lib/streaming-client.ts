/**
 * Cliente para API de Streaming do Backend
 * Permite receber respostas em tempo real (caractere por caractere)
 * 
 * Uso:
 * ```ts
 * const client = new StreamingChatClient(token);
 * 
 * client.chatStream({
 *   agentId: 'agent-123',
 *   message: 'Olá!',
 *   onContent: (char) => console.log('Char:', char),
 *   onMetadata: (data) => console.log('Meta:', data),
 *   onError: (err) => console.error(err),
 *   onComplete: (data) => console.log('Done:', data),
 * });
 * ```
 */

interface StreamMetadata {
  type: 'metadata' | 'content' | 'end';
  conversation_id?: string;
  agent_id?: string;
  agent_name?: string;
  emotional_state?: any;
  persona_state?: any;
  content?: string;
  relationship?: any;
  confidence?: number;
  thought_contributions?: any[];
}

interface ChatStreamOptions {
  agentId: string;
  message: string;
  conversationId?: string;
  context?: Record<string, any>;
  onContent?: (char: string) => void;
  onMetadata?: (data: any) => void;
  onEnd?: (data: any) => void;
  onError?: (error: Error) => void;
  onComplete?: (data: any) => void;
}

export class StreamingChatClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string = 'http://localhost:8000', token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  /**
   * Chat com streaming (caracteres aparecem em tempo real)
   */
  async chatStream(options: ChatStreamOptions): Promise<void> {
    const {
      agentId,
      message,
      conversationId,
      context,
      onContent,
      onMetadata,
      onEnd,
      onError,
      onComplete,
    } = options;

    try {
      const response = await fetch(
        `${this.baseUrl}/personas/${agentId}/chat/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
          body: JSON.stringify({
            message,
            conversation_id: conversationId,
            context,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Streaming não suportado');

      const decoder = new TextDecoder();
      let buffer = '';
      let endData: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines[lines.length - 1]; // Guardar linha incompleta

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          try {
            const data = JSON.parse(line) as StreamMetadata;

            if (data.type === 'metadata') {
              onMetadata?.(data);
            } else if (data.type === 'content') {
              onContent?.(data.content || '');
            } else if (data.type === 'end') {
              endData = data;
              onEnd?.(data);
            }
          } catch (e) {
            console.warn('Erro ao parsear linha JSON:', line, e);
          }
        }
      }

      // Processar linha final se houver
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer) as StreamMetadata;
          if (data.type === 'end') {
            endData = data;
            onEnd?.(data);
          }
        } catch (e) {
          console.warn('Erro ao parsear buffer final:', e);
        }
      }

      onComplete?.(endData);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    }
  }

  /**
   * Chat normal (sem streaming) - para comparação
   */
  async chat(
    agentId: string,
    message: string,
    conversationId?: string,
    context?: Record<string, any>
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/personas/${agentId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export como hook React se necessário
export function useStreamingChat(token: string) {
  const client = new StreamingChatClient(undefined, token);
  
  return {
    chat: (agentId: string, message: string, conversationId?: string) =>
      client.chat(agentId, message, conversationId),
    
    chatStream: (options: Omit<ChatStreamOptions, 'baseUrl'>) =>
      client.chatStream(options),
  };
}
