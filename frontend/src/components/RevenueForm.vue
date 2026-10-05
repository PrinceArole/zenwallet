<template>
  <form @submit.prevent="submitForm" class="entry-form">
    <span class="overline">VOTRE ARGENT QUI ENTRE</span>
    <h2>{{ isEditing ? 'Modifier le revenu' : 'Ajouter un revenu' }}</h2>

    <label class="form-field"><span>Libellé</span><input v-model.trim="form.title" placeholder="Ex. Salaire, remboursement…" required></label>
    <label class="form-field"><span>Montant (€)</span><input v-model.number="form.amount" type="number" min="0.01" step="0.01" placeholder="0,00" required></label>
    <label class="form-field"><span>Date</span><input v-model="form.date" type="date" required></label>
    <label class="form-field"><span>Source <small>Facultatif</small></span><input v-model.trim="form.source" placeholder="Ex. Employeur"></label>

    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <button type="submit" class="button button-primary form-submit" :disabled="saving">{{ saving ? 'Enregistrement…' : isEditing ? 'Enregistrer les modifications' : 'Ajouter le revenu' }}</button>
  </form>
</template>

<script>
import { apiRequest } from '../services/api';

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function emptyRevenue() {
  return { title: '', amount: '', date: today(), source: '' };
}

export default {
  name: 'RevenueForm',
  props: {
    revenue: Object // reçu en prop si modification
  },
  data() {
    return {
      error: '',
      saving: false,
      form: {
        title: '',
        amount: '',
        date: today(),
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
          this.form = emptyRevenue();
        }
      }
    }
  },
  emits: ['submitted'],
  methods: {
    async submitForm() {
      this.saving = true;
      this.error = '';
      try {
        await apiRequest(
          this.isEditing ? `/revenues/${this.revenue.id}` : '/revenues',
          { method: this.isEditing ? 'PUT' : 'POST', body: JSON.stringify(this.form) }
        );
        this.$emit('submitted');
        this.form = emptyRevenue();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.saving = false;
      }
    }
  }
}
</script>
