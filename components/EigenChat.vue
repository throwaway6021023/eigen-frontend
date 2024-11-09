<template>
  <div class="eigen-chat">
    <div class="chat-container">
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="message in chatHistory" :key="message.id" class="message" :class="message.role">
          <div class="message-content">
            {{ message.content }}
          </div>
          <div class="message-timestamp">
            {{ formatTimestamp(message.timestamp) }}
          </div>
        </div>
        <div v-if="isLoading" class="message assistant loading">
          <div class="loading-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      
      <div class="error-message" v-if="error">
        {{ error }}
      </div>
      
      <div class="chat-input">
        <textarea 
          v-model="userInput"
          @keydown.enter.prevent="sendMessage"
          placeholder="Type your message..."
          :disabled="isLoading"
        ></textarea>
        <button 
          @click="sendMessage" 
          :disabled="isLoading || !userInput.trim()"
        >
          Send
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant' | 'component'
  timestamp: Date
}

const userInput = ref('')
const chatHistory = ref<ChatMessage[]>([])
const messagesContainer = ref<HTMLElement | null>(null)

const currentStreamingMessage = ref<ChatMessage | null>(null)

const { sendChatMessage, isLoading, error } = useChat()

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTimestamp = (date: Date) => {
  return new Intl.DateTimeFormat('default', {
    hour: 'numeric',
    minute: 'numeric'
  }).format(date)
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return
  
  // Add user message to chat
  const userMessage: ChatMessage = {
    id: crypto.randomUUID(),
    content: userInput.value,
    role: 'user',
    timestamp: new Date()
  }
  
  chatHistory.value.push(userMessage)
  const currentMessage = userInput.value
  userInput.value = ''
  scrollToBottom()
  
  // Create a placeholder message for streaming
  currentStreamingMessage.value = {
    id: crypto.randomUUID(),
    content: '',
    role: 'assistant',
    timestamp: new Date()
  }
  chatHistory.value.push(currentStreamingMessage.value)
  
  // Send to API and get streaming response
  try {
    const response = await sendChatMessage(
      currentMessage,
      (chunk) => {
        if (currentStreamingMessage.value) {
          currentStreamingMessage.value.content += chunk
          scrollToBottom()
        }
      }
    )
    
    if (response) {
      // Update the final message content
      currentStreamingMessage.value.content = response.content
    }
  } catch (e) {
    // Remove the streaming message if there was an error
    chatHistory.value = chatHistory.value.filter(msg => msg.id !== currentStreamingMessage.value?.id)
  } finally {
    currentStreamingMessage.value = null
    scrollToBottom()
  }
}

// Scroll to bottom when component mounts
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.eigen-chat {
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 80vh;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
}

.chat-input {
  display: flex;
  padding: 20px;
  border-top: 1px solid #ddd;
  background: #f9f9f9;
}

.chat-input textarea {
  flex-grow: 1;
  margin-right: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
}

.chat-input button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-input button:hover {
  background: #0056b3;
}

.message {
  margin-bottom: 1rem;
  padding: 10px;
  border-radius: 8px;
  max-width: 80%;
}

.message.user {
  margin-left: auto;
  background-color: #007bff;
  color: white;
}

.message.assistant {
  margin-right: auto;
  background-color: #f0f0f0;
  color: #333;
}

.message-timestamp {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 4px;
}

.loading-indicator {
  display: flex;
  gap: 4px;
  padding: 10px;
}

.loading-indicator span {
  width: 8px;
  height: 8px;
  background-color: #666;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.loading-indicator span:nth-child(1) { animation-delay: 0s; }
.loading-indicator span:nth-child(2) { animation-delay: 0.2s; }
.loading-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.error-message {
  color: #dc3545;
  padding: 10px;
  text-align: center;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  margin: 10px;
  border-radius: 4px;
}

.chat-input textarea:disabled,
.chat-input button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message.assistant.streaming {
  opacity: 0.7;
}
</style> 