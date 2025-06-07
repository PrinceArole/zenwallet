<template>
  <div class="min-h-screen bg-gray-100 text-gray-800 p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-6 text-center">Zenwallet</h1>

      <!-- Solde -->
      <div class="bg-white p-4 rounded-lg shadow mb-6 text-center">
        <h2 class="text-xl font-semibold mb-2">💼 Bilan mensuel</h2>
        <div class="flex justify-around text-lg font-medium">
          <div>Budget : {{ monthlyBudgetAmount }} €</div>
          <div>Revenus : {{ totalRevenus }} €</div>
          <div>Dépenses : {{ totalDepenses }} €</div>
        </div>
        <p class="text-3xl font-bold mt-4" :class="soldeActuel < 0 ? 'text-red-600' : 'text-green-600'">
          Solde actuel : {{ soldeActuel }} €
        </p>
      </div>

      <StatisticsCharts :expenses="expenses" />

      <!-- Boutons -->
      <div class="flex justify-between mb-4 mt-10">
        <button @click="showAddRevenue = true" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Ajouter un revenu
        </button>
        <button @click="showAddExpense = true" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          Ajouter une dépense
        </button>
      </div>


      <form @submit.prevent="submitBudget" class="bg-white p-4 rounded shadow mb-6">
        <h3 class="font-semibold mb-2">💼 Définir le budget mensuel</h3>
       <div class="flex justify-center items-center space-x-5">
           <input v-model="budgetForm.month" type="month" placeholder="Mois (ex: Juin)" class="border rounded px-3 py-1 w-full mb-2" required />
        <input v-model="budgetForm.amount" type="number" placeholder="Montant (€)" class="border rounded px-3 py-1 w-full mb-2" required />
        <button class="bg-indigo-600 text-white px-4 py-2 rounded mt-2">Enregistrer</button>
       </div>
      </form>
      <!-- <div class="bg-white p-4 rounded shadow mb-4">
        <h3 class="font-semibold mb-2">📆 Filtrer par période</h3>
        <div class="flex gap-4">
          <input type="date" v-model="filters.startDate" class="input" />
          <input type="date" v-model="filters.endDate" class="input" />
          <button @click="fetchFilteredExpenses" class="bg-blue-500 text-white px-4 py-2 rounded">Filtrer</button>
        </div>
      </div>  -->


      <!-- Modales -->
      <BaseModal :show="showAddExpense" @close="showAddExpense = false">
        <ExpenseForm @submitted="onExpenseAdded" />
      </BaseModal>

      <BaseModal :show="showEditExpense" @close="showEditExpense = false">
        <ExpenseForm :expense="expenseToEdit" @updated="onExpenseUpdated" />
      </BaseModal>

      <BaseModal :show="showAddRevenue" @close="closeRevenueModal">
        <RevenueForm :revenue="selectedRevenue" @submitted="onRevenueAdded" />
      </BaseModal>

      <!-- Listes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 class="text-lg font-semibold mb-2">💰 Revenus</h3>
          <ul class="bg-white p-4 rounded shadow space-y-2">
            <li v-for="r in revenues" :key="r.id" class="flex justify-between border-b pb-1 items-center">
              <div>
                <span>{{ r.title }}</span>
                <span class="text-green-600 font-medium ml-2">+{{ r.amount }} €</span>
              </div>
              <div class="flex space-x-2">
                <button @click="openEditRevenue(r)" class="text-blue-600 hover:underline text-sm" title="Modifier">
                  <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M14 4.182A4.136 4.136 0 0 1 16.9 3c1.087 0 2.13.425 2.899 1.182A4.01 4.01 0 0 1 21 7.037c0 1.068-.43 2.092-1.194 2.849L18.5 11.214l-5.8-5.71 1.287-1.31.012-.012Zm-2.717 2.763L6.186 12.13l2.175 2.141 5.063-5.218-2.141-2.108Zm-6.25 6.886-1.98 5.849a.992.992 0 0 0 .245 1.026 1.03 1.03 0 0 0 1.043.242L10.282 19l-5.25-5.168Zm6.954 4.01 5.096-5.186-2.218-2.183-5.063 5.218 2.185 2.15Z" clip-rule="evenodd"/>
                  </svg>
                </button>
                <button @click="deleteRevenue(r.id)" class="text-red-600 hover:underline text-sm" title="Supprimer">
                  <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                  </svg>
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-2">💸 Dépenses</h3>
          <ul class="bg-white p-4 rounded shadow space-y-2">
            <li v-for="e in expenses" :key="e.id" class="flex justify-between border-b pb-1 items-center">
              <div>
                <span>{{ e.title }}</span>
                <span v-if="e.tag" class="ml-2 text-xs bg-yellow-300 text-yellow-900 rounded px-1">{{ e.tag }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-red-600 font-medium">-{{ e.amount }} €</span>
                <button @click="editExpense(e)" class="text-blue-600 hover:underline text-sm" title="Modifier">
                  <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M14 4.182A4.136 4.136 0 0 1 16.9 3c1.087 0 2.13.425 2.899 1.182A4.01 4.01 0 0 1 21 7.037c0 1.068-.43 2.092-1.194 2.849L18.5 11.214l-5.8-5.71 1.287-1.31.012-.012Zm-2.717 2.763L6.186 12.13l2.175 2.141 5.063-5.218-2.141-2.108Zm-6.25 6.886-1.98 5.849a.992.992 0 0 0 .245 1.026 1.03 1.03 0 0 0 1.043.242L10.282 19l-5.25-5.168Zm6.954 4.01 5.096-5.186-2.218-2.183-5.063 5.218 2.185 2.15Z" clip-rule="evenodd"/>
                  </svg>
                </button>
                <button @click="deleteExpense(e.id)" class="text-red-600 hover:underline text-sm" title="Supprimer">
                  <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                  </svg>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RevenueForm from '../components/RevenueForm.vue'
import ExpenseForm from '../components/ExpenseForm.vue'
import BaseModal from '../components/BaseModal.vue'
import StatisticsCharts from '../components/StatisticsCharts.vue';


export default {
  name: 'Home',
  components: {
    RevenueForm,
    ExpenseForm,
    BaseModal,
    StatisticsCharts,
  },
  data() {
    return {
      selectedRevenue: null,
      showAddRevenue: false,
      showAddExpense: false,
      showEditExpense: false,
      expenseToEdit: null,
      monthlyBudgetAmount: 0,
      revenues: [],
      expenses: [],
      budgetForm: {
        month: '',
        year: new Date().getFullYear(),
        amount: ''
      },
      filters: {
        startDate: '',
        endDate: ''
      }

    }
  },
  computed: {
    
      totalRevenus() {
        return this.revenues.reduce((sum, r) => sum + parseFloat(r.amount), 0);
      },
      totalDepenses() {
        return this.expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      },
      soldeActuel() {
        return (this.monthlyBudgetAmount + this.totalRevenus - this.totalDepenses).toFixed(2);
      }
  },
  methods: {

        async fetchFilteredExpenses() {
      const params = new URLSearchParams(this.filters).toString();
      const res = await fetch(`http://localhost:5000/api/expenses?${params}`);
      this.expenses = await res.json();
    },
    async fetchRevenues() {
      const res = await fetch('http://localhost:5000/api/revenues');
      this.revenues = await res.json();
    },
    async fetchExpenses() {
      const res = await fetch('http://localhost:5000/api/expenses');
      this.expenses = await res.json();
    },
    onRevenueAdded() {
      this.showAddRevenue = false;
      this.selectedRevenue = null;
      this.fetchRevenues();
    },
    onExpenseAdded() {
      this.showAddExpense = false;
      this.fetchExpenses();
    },
    async deleteRevenue(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce revenu ?')) return;

      try {
        const response = await fetch(`http://localhost:5000/api/revenues/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erreur lors de la suppression du revenu');
        this.fetchRevenues();
      } catch (error) {
        alert(error.message);
      }
    },
    async deleteExpense(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return;

      try {
        const response = await fetch(`http://localhost:5000/api/expenses/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        this.fetchExpenses();
      } catch (error) {
        alert(error.message);
      }
    },
    editExpense(expense) {
      this.expenseToEdit = { ...expense };
      this.showEditExpense = true;
    },
    onExpenseUpdated() {
      this.showEditExpense = false;
      this.expenseToEdit = null;
      this.fetchExpenses();
    },
    openEditRevenue(revenue) {
      this.selectedRevenue = revenue;
      this.showAddRevenue = true;
    },
    closeRevenueModal() {
      this.showAddRevenue = false;
      this.selectedRevenue = null;
    },

    async submitBudget() {
      try {
        const res = await fetch('http://localhost:5000/api/budget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.budgetForm)
        });
        if (!res.ok) throw new Error('Erreur lors de la sauvegarde');
        alert('Budget enregistré');
window.location.reload();
      } catch (err) {
        alert(err.message);
      }
    },


  async fetchMonthlyBudget() {
    try {
      const month = new Date().toISOString().slice(0, 7); // ex: "2025-06"
      const url = `http://localhost:5000/api/budget/${month}`;
      // console.log('Requête GET sur :', url);

      const res = await fetch(url);
      const data = await res.json();

      // console.log('Réponse budget :', data);
      this.monthlyBudgetAmount = data?.amount || 0;
    } catch (err) {
      console.error('Erreur lors de la récupération du budget :', err);
    }
  }

  },
  mounted() {
    this.fetchRevenues();
    this.fetchExpenses();
    this.fetchMonthlyBudget();
  }
}
</script>