<template>
  <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card" role="dialog" aria-modal="true">
      <button class="modal-close" type="button" aria-label="Fermer" @click="$emit('close')">
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
