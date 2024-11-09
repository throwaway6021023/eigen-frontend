<template>
  <v-card class="pa-4">
    <v-card-title>Open Positions</v-card-title>
    <v-list>
      <template v-for="(positions, department) in roles" :key="department">
        <v-list-subheader>{{ department }}</v-list-subheader>
        <v-list-item v-for="position in positions" :key="position">
          <v-list-item-title>{{ position }}</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  roles: Record<string, string[]>
}>()
</script> 