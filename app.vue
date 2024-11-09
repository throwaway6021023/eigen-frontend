<template>
  <v-app>
    <v-app-bar>
      <v-container class="d-flex align-center">
        <v-app-bar-title>EigenChat</v-app-bar-title>
        <v-spacer></v-spacer>
        <v-btn to="/" variant="text">Chat</v-btn>
        <v-btn to="/add-context" variant="text">Add Context</v-btn>
      </v-container>
    </v-app-bar>
    
    <v-main>
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
// Component will be auto-imported by Nuxt
</script>

<style>
.app-container {
  min-height: 100vh;
  padding: 20px;
}
</style>
