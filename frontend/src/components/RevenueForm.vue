<template>
<form @submit.prevent="submitForm" class="bg-white p-4 rounded shadow mb-4">
    <h3 class="font-semibold mb-2">{{ isEditing ? 'Modifier un revenu' : 'Ajouter un revenu' }}</h3>

    <input v-model="form.title" placeholder="Titre" class="border rounded px-3 py-1 w-full mb-2" required />
    <input v-model.number="form.amount" type="number" placeholder="Montant (€)" class="border rounded px-3 py-1 w-full mb-2" required />
    <input v-model="form.date" type="date" class="border rounded px-3 py-1 w-full mb-2" required />
    <input v-model="form.source" placeholder="Source" class="border rounded px-3 py-1 w-full mb-2" />

    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      {{ isEditing ? 'Modifier' : 'Ajouter' }}
    </button>
  </form>
</template>

<script>
export default {
  name: 'RevenueForm',
  props: {
    revenue: Object // reçu en prop si modification
  },
  data() {
    return {
      form: {
        title: '',
        amount: '',
        date: '',
        source: ''
      }
    }
  },
  computed: {
    isEditing() {
      return !!this.revenue && !!this.revenue.id;
    }
  },
  watch: {
    revenue: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.form = {
            title: newVal.title || '',
            amount: newVal.amount || '',
            date: newVal.date || '',
            source: newVal.source || ''
          };
        } else {
          this.form = { title: '', amount: '', date: '', source: '' };
        }
      }
    }
  },
  emits: ['submitted'],
  methods: {
    async submitForm() {
      try {
        const url = this.isEditing 
          ? `http://localhost:5000/api/revenues/${this.revenue.id}`
          : 'http://localhost:5000/api/revenues';
        
        const method = this.isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });

        if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

        this.$emit('submitted');
        this.form = { title: '', amount: '', date: '', source: '' };
      } catch (error) {
        alert(error.message);
      }
    }
  }
}
</script>
