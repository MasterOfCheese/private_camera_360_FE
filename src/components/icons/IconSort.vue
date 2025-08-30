<template>
  <span class="inline-block w-4 text-xs ml-1">
    <span v-if="direction === 'asc'">↑</span>
    <span v-else-if="direction === 'desc'">↓</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  field: String,
  current: Object, // { by: string, order: 'asc' | 'desc' }
})

const direction = computed(() => {
  if (!props.current || props.current.by !== props.field) return ''
  return props.current.order
})

</script>
