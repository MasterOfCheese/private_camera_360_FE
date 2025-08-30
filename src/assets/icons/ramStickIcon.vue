<!-- src/assets/icons/RamStickIcon.vue -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="prime-icon"
  >
    <!-- Main PCB Rectangle -->
    <rect x="2" y="7" width="20" height="10" rx="1"></rect>
    <!-- Memory Chips (Simplified) -->
    <rect x="4" y="9" width="3" height="6" rx="0.5"></rect>
    <rect x="8.5" y="9" width="3" height="6" rx="0.5"></rect>
    <rect x="13" y="9" width="3" height="6" rx="0.5"></rect>
    <rect x="17.5" y="9" width="3" height="6" rx="0.5"></rect>
    <!-- Contact Pins with Notch -->
    <line x1="2" y1="17" x2="10" y2="17"></line>
    <!-- Left side of contacts -->
    <line x1="14" y1="17" x2="22" y2="17"></line>
    <!-- Right side of contacts -->
  </svg>
</template>

<script setup>
// No script needed for a simple SVG icon component
</script>

<style scoped>
/* Add any specific styles if needed, though usually handled by parent CSS */
.prime-icon {
  /* Example: ensures consistent sizing if not set by parent */
  /* width: 1em;
    height: 1em; */
  display: inline-block;
  vertical-align: middle;
}
</style>
