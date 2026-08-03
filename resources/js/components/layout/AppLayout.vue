<script setup lang="ts">
import AppSidebar from "./AppSidebar.vue";
import AppHeader from "./AppHeader.vue";
import { useAppStore } from "@/stores/app";
import { useKeyboardShortcuts } from "@/composables/useKeyboardShortcuts";
const app = useAppStore();
useKeyboardShortcuts();
</script>
<template>
  <div class="min-h-screen bg-[#f4f6f9] dark:bg-[#111827]">
    <AppSidebar /><AppHeader />
    <main
      class="min-h-screen pt-16 transition-all duration-200"
      :class="app.sidebarCollapsed ? 'ml-[68px]' : 'ml-[232px]'"
    >
      <div class="mx-auto max-w-[1700px] p-5"><router-view /></div>
    </main>
  </div>
</template>
