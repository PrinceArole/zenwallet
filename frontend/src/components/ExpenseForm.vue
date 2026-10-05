<template>
  <form @submit.prevent="submitForm" class="entry-form">
    <span class="overline">GARDER LE CAP</span>
    <h2>{{ expense ? 'Modifier la dépense' : 'Ajouter une dépense' }}</h2>

    <label class="form-field"><span>Libellé</span><input v-model.trim="form.title" placeholder="Ex. Courses, abonnement…" required></label>
    <label class="form-field"><span>Montant (€)</span><input v-model.number="form.amount" type="number" min="0.01" step="0.01" placeholder="0,00" required></label>
    <label class="form-field"><span>Date</span><input v-model="form.date" type="date" required></label>
    <label class="form-field"><span>Catégorie</span><select v-model="form.category" required>
        <option disabled value="">Choisir une catégorie</option>
        <option>Alimentation</option>
        <option>Transport</option>
        <option>Logement</option>
        <option>Loisirs</option>
        <option>Santé</option>
        <option>Autres</option>
    </select></label>
    <label class="form-field"><span>Note <small>Facultatif</small></span><input v-model.trim="form.tag" placeholder="Ex. À prévoir"></label>

    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <button type="submit" class="button button-primary form-submit" :disabled="saving">{{ saving ? 'Enregistrement…' : expense ? 'Enregistrer les modifications' : 'Ajouter la dépense' }}</button>
  </form>
</template>

<script>
import { apiRequest } from '../services/api';

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function emptyExpense() {
  return { title: '', amount: '', date: today(), category: '', tag: '' };
}

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
      error: '',
      saving: false,
      form: {
        title: '',
        amount: '',
        date: today(),
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
          this.form = emptyExpense();
        }
      }
    }
  },
  emits: ['submitted', 'updated'],
  methods: {
    async submitForm() {
      this.saving = true;
      this.error = '';
      try {
        await apiRequest(
          this.expense ? `/expenses/${this.expense.id}` : '/expenses',
          { method: this.expense ? 'PUT' : 'POST', body: JSON.stringify(this.form) }
        );

        this.$emit(this.expense ? 'updated' : 'submitted');
        this.form = emptyExpense();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.saving = false;
      }
    }
  }
}
</script>
