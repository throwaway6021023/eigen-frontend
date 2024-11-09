<template>
  <v-card class="pa-4">
    <v-form @submit.prevent="submitForm">
      <v-text-field
        v-model="form.name"
        label="Name"
        required
        :disabled="submitted"
      ></v-text-field>
      
      <v-text-field
        v-model="form.email"
        label="Email"
        type="email"
        required
        :disabled="submitted"
      ></v-text-field>
      
      <v-textarea
        v-model="form.message"
        label="Message"
        required
        :disabled="submitted"
      ></v-textarea>

      <v-btn
        type="submit"
        color="primary"
        :disabled="submitted"
        :loading="loading"
      >
        Submit
      </v-btn>
    </v-form>

    <v-alert
      v-if="submitted"
      type="success"
      class="mt-4"
    >
      Form submitted successfully!
    </v-alert>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  name?: string
  email?: string
  message?: string
}>()

const form = ref({
  name: props.name || '',
  email: props.email || '',
  message: props.message || ''
})

const loading = ref(false)
const submitted = ref(false)

const submitForm = async () => {
  loading.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  loading.value = false
  submitted.value = true
}
</script> 