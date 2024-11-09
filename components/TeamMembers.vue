<template>
  <v-card class="pa-4">
    <v-card-title>Our Team</v-card-title>
    
    <v-card-subtitle class="mt-4">Managing Partners</v-card-subtitle>
    <v-list density="compact">
      <v-list-item v-for="partner in managing_partners" :key="partner">
        <v-list-item-title>{{ partner }}</v-list-item-title>
      </v-list-item>
    </v-list>
    
    <v-card-subtitle class="mt-4">Advisors</v-card-subtitle>
    <v-list density="compact">
      <v-list-item v-for="advisor in advisors" :key="advisor">
        <v-list-item-title>{{ advisor }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  managing_partners: string[]
  advisors: string[]
}>()
</script> 