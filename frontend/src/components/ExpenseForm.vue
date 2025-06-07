<template>
  <form @submit.prevent="submitForm" class="bg-white p-4 rounded shadow mb-4">
    <h3 class="font-semibold mb-2">Ajouter une dépense</h3>

    <input v-model="form.title" placeholder="Titre" class="border rounded px-3 py-1 w-full mb-2" required />
    <input v-model.number="form.amount" type="number" placeholder="Montant (€)" class="border rounded px-3 py-1 w-full mb-2" required />
    <input v-model="form.date" type="date" class="border rounded px-3 py-1 w-full mb-2" required />
    <select v-model="form.category" class="border rounded px-3 py-1 w-full mb-2" required>
        <option disabled value="">-- Choisir une catégorie --</option>
        <option>Alimentation</option>
        <option>Transport</option>
        <option>Logement</option>
        <option>Loisirs</option>
        <option>Santé</option>
        <option>Autres</option>
    </select>
    <!-- Nouveau champ Tag -->
    <input v-model="form.tag" placeholder="Tag (ex : Urgent)" class="border rounded px-3 py-1 w-full mb-2" />

    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ajouter</button>
  </form>
</template>

<script>
export default {
  name: 'ExpenseForm',
  props: {
    expense: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        title: '',
        amount: '',
        date: '',
        category:'',
        tag: ''
      }
    }
  },
  watch: {
    expense: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.form = { ...newVal }; // préremplit si modif
        } else {
          this.form = { title: '', amount: '', date: '',  tag: '' , category:''};
        }
      }
    }
  },
  emits: ['submitted', 'updated'],
  methods: {
    async submitForm() {
      try {
        const url = this.expense ? `http://localhost:5000/api/expenses/${this.expense.id}` : 'http://localhost:5000/api/expenses';
        const method = this.expense ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });
        if (!response.ok) throw new Error(this.expense ? 'Erreur lors de la mise à jour' : 'Erreur lors de l’ajout');

        this.$emit(this.expense ? 'updated' : 'submitted');
        this.form = { title: '', amount: '', date: '',  tag: '' , category:''};
      } catch (error) {
        alert(error.message);
      }
    }
  }
}
</script>
