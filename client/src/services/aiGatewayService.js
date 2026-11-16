/**
 * AdaptIQ AI Gateway & Tutor 3.0 Client Service
 * Supports Server-Sent Events (SSE) streaming with AbortController,
 * live metadata events, model discovery, and persistent conversation memory.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Initiates an SSE streaming chat session with cancellation support
 * @param {Object} params
 * @param {string} params.message - Student prompt
 * @param {string} [params.conversationId] - Active conversation ID
 * @param {string} [params.subject] - Academic subject
 * @param {string} [params.topic] - Academic topic
 * @param {string} [params.tutorMode='explain'] - Active tutor mode
 * @param {string} [params.mode='auto'] - 'auto' | 'manual'
 * @param {string} [params.requestedModel] - Model ID for manual mode
 * @param {Function} params.onChunk - Receives each incoming text token/chunk
 * @param {Function} [params.onMetadata] - Receives routing, fallback, and usage metadata
 * @param {Function} [params.onError] - Receives error events
 * @param {Function} [params.onDone] - Receives completion payload
 * @returns {{ abort: () => void }} Controller to cancel streaming
 */
export function streamAITutorChat({
  message,
  conversationId = null,
  subject = 'Science & Mathematics',
  topic = 'General',
  tutorMode = 'explain',
  mode = 'auto',
  requestedModel = null,
  studentContext = null,
  onChunk,
  onMetadata,
  onError,
  onDone
}) {
  const abortController = new AbortController();
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const payload = {
    message,
    conversationId,
    subject,
    topic,
    tutorMode,
    mode,
    requestedModel,
    studentContext
  };

  fetch(`${API_BASE}/ai/chat/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: abortController.signal
  })
    .then(async (response) => {
      if (!response.ok) {
        let errMessage = `Server error HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          errMessage = errJson.message || errJson.error || errMessage;
        } catch (e) {}
        throw new Error(errMessage);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let currentEvent = 'message';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep partial line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue; // skip heartbeats

          if (trimmed.startsWith('event: ')) {
            currentEvent = trimmed.slice(7).trim();
            continue;
          }

          if (trimmed.startsWith('data: ')) {
            const rawData = trimmed.slice(6);
            try {
              const parsed = JSON.parse(rawData);

              if (currentEvent === 'chunk' && parsed.chunk !== undefined) {
                if (typeof onChunk === 'function') onChunk(parsed.chunk);
              } else if (currentEvent === 'metadata') {
                if (typeof onMetadata === 'function') onMetadata(parsed);
              } else if (currentEvent === 'done') {
                if (typeof onDone === 'function') onDone(parsed);
              } else if (currentEvent === 'error') {
                if (typeof onError === 'function') onError(parsed);
              }
            } catch (e) {
              // Non-JSON SSE payload fallback
              if (currentEvent === 'chunk' && typeof onChunk === 'function') {
                onChunk(rawData);
              }
            }
          }
        }
      }

      if (typeof onDone === 'function') {
        onDone({ done: true });
      }
    })
    .catch((err) => {
      if (err.name === 'AbortError') {
        if (typeof onMetadata === 'function') {
          onMetadata({ type: 'cancelled', message: 'Stream stopped by user.' });
        }
      } else {
        if (typeof onError === 'function') {
          onError({
            error: err.message || 'Network stream interrupted. Please retry.',
            code: 'NETWORK_ERROR'
          });
        }
      }
    });

  return {
    abort: () => {
      abortController.abort();
    }
  };
}

/**
 * Fetch catalog of configured AI models
 */
export async function fetchAIModels() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/ai/models`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to load AI models');
  const data = await res.json();
  return data.models || [];
}

/**
 * Fetch Provider Health Status
 */
export async function fetchProviderHealth() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/ai/providers/health`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) return {};
  const data = await res.json();
  return data.providers || {};
}

/**
 * Conversation API endpoints
 */
export async function fetchConversations() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/ai/conversations`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.conversations || [];
}

export async function createConversation({ title, subject, topic, tutorMode }) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/ai/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ title, subject, topic, tutorMode })
  });
  if (!res.ok) throw new Error('Failed to create conversation');
  const data = await res.json();
  return data.conversation;
}

export async function fetchConversationDetails(conversationId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/ai/conversations/${conversationId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to load conversation');
  return await res.json();
}

export async function clearConversationMessages(conversationId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/ai/conversations/${conversationId}/messages`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to clear conversation messages');
  return await res.json();
}

export async function deleteConversation(conversationId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/ai/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to delete conversation');
  return await res.json();
}

