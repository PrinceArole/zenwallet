<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
      <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-500 hover:text-red-500">
        ✕
      </button>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    show: Boolean
  }
}
</script>
