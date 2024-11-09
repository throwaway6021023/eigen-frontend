<template>
  <v-card class="pa-4">
    <v-card-text class="text-h6 font-italic">
      "{{ quote }}"
    </v-card-text>
    <v-card-actions>
      <v-btn
        color="primary"
        variant="text"
        :href="url"
        target="_blank"
      >
        Read Case Study
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  quote: string
  url: string
}>()
</script> 