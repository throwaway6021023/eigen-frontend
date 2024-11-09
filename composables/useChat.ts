interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant' | 'component'
  timestamp: Date
}

interface ChatResponse {
  content: string
  role: 'assistant'
}

export const useChat = () => {
  const config = useRuntimeConfig()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const sendChatMessage = async (
    message: string,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse | null> => {
    isLoading.value = true
    error.value = null
    let fullResponse = ''

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Response body is not readable')
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6)
              const parsed = JSON.parse(jsonStr)
              if (parsed.event === 'data' && parsed.data) {
                fullResponse += parsed.data
                onChunk?.(parsed.data)
              }
            } catch (e) {
              console.error('Error parsing chunk:', e)
            }
          }
        }
      }

      return {
        content: fullResponse,
        role: 'assistant'
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    sendChatMessage,
    isLoading,
    error,
  }
} 