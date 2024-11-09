<template>
  <v-card class="eigen-chat">
    <div class="chat-container">
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="chatHistory.length === 0" class="starter-questions">
          <h3 class="text-subtitle-1 mb-4">Start a conversation:</h3>
          <v-chip
            v-for="question in starterQuestions"
            :key="question"
            class="ma-2"
            color="primary"
            variant="outlined"
            @click="handleStarterQuestion(question)"
          >
            {{ question }}
          </v-chip>
        </div>
        <div v-for="message in chatHistory" :key="message.id" class="message" :class="message.role">
          <v-card :color="message.role === 'user' ? 'primary' : 'grey-lighten-3'" class="message-card">
            <v-card-text>
              <template v-if="message.component">
                <component
                  :is="resolveComponent(message.component.name)"
                  v-bind="message.component.props"
                />
              </template>
              <template v-else>
                {{ message.content }}
              </template>
              <div class="message-timestamp">
                {{ formatTimestamp(message.timestamp) }}
              </div>
            </v-card-text>
          </v-card>
        </div>
        <div v-if="isLoading" class="message assistant loading">
          <v-card color="grey-lighten-3" class="message-card">
            <v-card-text>
              <div class="loading-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
      
      <v-alert
        v-if="error"
        type="error"
        class="ma-2"
      >
        {{ error }}
      </v-alert>
      
      <div class="chat-input">
        <v-textarea
          v-model="userInput"
          @keydown.enter.prevent="sendMessage"
          placeholder="Type your message..."
          :disabled="isLoading"
          rows="1"
          auto-grow
          hide-details
          density="comfortable"
          class="mr-2"
        ></v-textarea>
        <v-btn
          @click="sendMessage"
          :disabled="isLoading || !userInput.trim()"
          color="primary"
          :loading="isLoading"
        >
          Send
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import ContactForm from './ContactForm.vue'
import OpenRoles from './OpenRoles.vue'
import TeamMembers from './TeamMembers.vue'
import CaseStudyQuote from './CaseStudyQuote.vue'

interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant' | 'component'
  timestamp: Date
  component?: {
    name: string
    props: Record<string, any>
  }
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

const resolveComponent = (name: string) => {
  const components = {
    contact_form: ContactForm,
    open_roles: OpenRoles,
    team_members: TeamMembers,
    case_study_quote: CaseStudyQuote
  }
  return components[name as keyof typeof components]
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
          try {
            const parsed = JSON.parse(chunk)
            if (parsed.type === 'component') {
              currentStreamingMessage.value.component = {
                name: parsed.component,
                props: parsed.props
              }
              currentStreamingMessage.value.role = 'component'
            } else {
              currentStreamingMessage.value.content += chunk
            }
            scrollToBottom()
          } catch {
            // If it's not JSON, treat it as regular text
            currentStreamingMessage.value.content += chunk
            scrollToBottom()
          }
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

// Add starter questions
const starterQuestions = [
  "What services do you offer?",
  "Tell me about your team",
  "How can we work together?",
  "What are your areas of expertise?"
]

// Add handler for starter questions
const handleStarterQuestion = (question: string) => {
  userInput.value = question
  sendMessage()
}
</script>

<style scoped>
.eigen-chat {
  max-width: 800px;
  margin: 0 auto;
  height: 80vh;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
}

.chat-input {
  display: flex;
  padding: 20px;
  background: #f9f9f9;
}

.message {
  margin-bottom: 1rem;
  max-width: 80%;
}

.message.user {
  margin-left: auto;
}

.message.assistant {
  margin-right: auto;
}

.message-card {
  border-radius: 12px !important;
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

.message.component {
  margin-left: auto;
  margin-right: auto;
  max-width: 100%;
}

.starter-questions {
  text-align: center;
  padding: 20px;
  margin: 20px 0;
}

.starter-questions h3 {
  color: rgba(0, 0, 0, 0.7);
}
</style> 