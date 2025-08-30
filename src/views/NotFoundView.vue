<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 text-gray-200 flex flex-col items-center justify-center p-8 text-center"
  >
    <h1 class="text-8xl sm:text-9xl font-extrabold text-blue-400 drop-shadow-lg animate-pulse">
      404
    </h1>

    <h2 class="mt-4 text-3xl sm:text-4xl font-semibold text-white drop-shadow-md">
      Page Not Found
    </h2>

    <p class="mt-6 text-lg text-gray-300 max-w-lg mx-auto">
      Oops! It seems the page you were trying to reach doesn't exist or may have been moved. Please
      check the URL or navigate back home.
    </p>

    <svg
      class="mt-8 w-24 h-24 text-blue-700/50 opacity-50"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1"
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        class="text-blue-500/60"
      ></path>
    </svg>

    <div class="mt-10">
      <router-link
        to="/"
        class="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        Go Back Home
      </router-link>
    </div>
  </div>
</template>

<script setup>
// Import RouterLink if you haven't already globally registered it
import { RouterLink } from 'vue-router'

// No specific logic needed for a static 404 page in most cases
</script>

<style scoped>
/* Add a subtle pulsing animation to the 404 */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

/* Add any other specific styles if needed */
</style>
