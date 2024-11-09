<template>
  <v-container>
    <v-card class="mx-auto" max-width="800">
      <v-card-title class="text-h5 mb-4">
        Add New Context
      </v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="submitContext" ref="form">
          <v-text-field
            v-model="title"
            label="Title"
            :rules="[v => !!v || 'Title is required']"
            required
          ></v-text-field>
          
          <v-textarea
            v-model="content"
            label="Content"
            :rules="[v => !!v || 'Content is required']"
            required
            auto-grow
            rows="5"
          ></v-textarea>
          
          <v-alert
            v-if="error"
            type="error"
            class="mb-4"
          >
            {{ error }}
          </v-alert>
          
          <v-alert
            v-if="success"
            type="success"
            class="mb-4"
          >
            Context added successfully!
          </v-alert>
          
          <v-btn
            type="submit"
            color="primary"
            :loading="isLoading"
            :disabled="isLoading"
            block
          >
            Add Context
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const title = ref('')
const content = ref('')
const error = ref('')
const success = ref(false)
const isLoading = ref(false)
const form = ref<any>(null)

const submitContext = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) return
  
  isLoading.value = true
  error.value = ''
  success.value = false
  
  try {
    const response = await fetch('http://localhost:8000/context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title.value,
        content: content.value,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to add context')
    }
    
    success.value = true
    title.value = ''
    content.value = ''
    form.value.reset()
    
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred'
  } finally {
    isLoading.value = false
  }
}
</script> 