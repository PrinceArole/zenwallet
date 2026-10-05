<template>
  <div class="dashboard-shell">
    <aside class="sidebar">
      <a class="brand-lockup dashboard-brand" href="#" aria-label="Zenwallet, accueil">
        <span class="brand-mark"><span></span><span></span><span></span></span>
        <span>zenwallet</span>
      </a>

      <div class="sidebar-section-label">ESPACE PERSONNEL</div>
      <nav class="side-nav" aria-label="Navigation principale">
        <a class="nav-link nav-link-active" href="#overview"><span class="nav-icon">⌂</span>Vue d’ensemble</a>
        <a class="nav-link" href="#transactions"><span class="nav-icon">↔</span>Transactions</a>
        <a class="nav-link" href="#budget"><span class="nav-icon">◷</span>Budget mensuel</a>
      </nav>

      <div class="sidebar-bottom">
        <div class="sidebar-tip">
          <span class="tip-sparkle">✳</span>
          <p><strong>Un pas à la fois.</strong><br>Chaque décision compte.</p>
        </div>
        <div class="profile-row">
          <div class="avatar">{{ userInitials }}</div>
          <div class="profile-copy"><strong>{{ user.name }}</strong><span>{{ user.email }}</span></div>
          <button class="icon-button logout-button" type="button" title="Se déconnecter" aria-label="Se déconnecter" @click="logout">↗</button>
        </div>
      </div>
    </aside>

    <main id="overview" class="dashboard-main">
      <header class="topbar">
        <div>
          <div class="breadcrumb">MON ESPACE <span>/</span> VUE D’ENSEMBLE</div>
          <h1>Bonjour, {{ firstName }} <span class="wave">✳</span></h1>
          <p class="topbar-subtitle">Voici où en sont vos finances aujourd’hui.</p>
        </div>
        <div class="topbar-actions">
          <span class="current-date">{{ todayLabel }}</span>
          <button v-if="user.role === 'admin'" class="button button-outline" type="button" @click="$emit('open-admin')">
            Administration
          </button>
          <button class="button button-primary" type="button" @click="openExpenseForm">
            <span class="button-plus">+</span> Ajouter une dépense
          </button>
        </div>
      </header>

      <div v-if="pageError" class="notice notice-error" role="alert">{{ pageError }}</div>
      <div v-if="notice" class="notice notice-success" role="status">{{ notice }}</div>

      <section class="balance-banner" aria-label="Solde actuel">
        <div class="balance-copy">
          <span class="overline overline-light">VOTRE SOLDE DISPONIBLE</span>
          <strong>{{ formatAmount(soldeActuel) }}</strong>
          <span class="balance-caption">Budget du mois + revenus − dépenses</span>
        </div>
        <div class="balance-decoration" aria-hidden="true">
          <div class="balance-orbit orbit-one"></div><div class="balance-orbit orbit-two"></div>
          <div class="balance-orbit orbit-three"></div><span class="balance-star">✳</span>
        </div>
        <div class="balance-month"><span>MOIS EN COURS</span><strong>{{ currentMonthLabel }}</strong></div>
      </section>

      <section class="summary-grid" aria-label="Résumé du mois">
        <article class="summary-card">
          <div class="summary-top"><span class="summary-icon budget-icon">◷</span><span class="summary-trend">CE MOIS</span></div>
          <span class="summary-label">Budget défini</span>
          <strong>{{ formatAmount(monthlyBudgetAmount) }}</strong>
          <span class="summary-foot">{{ budgetRecord ? 'Votre enveloppe mensuelle' : 'Aucun budget défini' }}</span>
        </article>
        <article class="summary-card">
          <div class="summary-top"><span class="summary-icon income-icon">↙</span><span class="summary-trend">CE MOIS</span></div>
          <span class="summary-label">Revenus</span>
          <strong>{{ formatAmount(totalRevenus) }}</strong>
          <span class="summary-foot">{{ monthRevenues.length }} {{ monthRevenues.length > 1 ? 'entrées' : 'entrée' }} enregistrée{{ monthRevenues.length > 1 ? 's' : '' }}</span>
        </article>
        <article class="summary-card">
          <div class="summary-top"><span class="summary-icon expense-icon">↗</span><span class="summary-trend">CE MOIS</span></div>
          <span class="summary-label">Dépenses</span>
          <strong>{{ formatAmount(totalDepenses) }}</strong>
          <span class="summary-foot">{{ monthExpenses.length }} {{ monthExpenses.length > 1 ? 'opérations' : 'opération' }} enregistrée{{ monthExpenses.length > 1 ? 's' : '' }}</span>
        </article>
      </section>

      <section class="content-grid">
        <article id="budget" class="panel budget-panel">
          <div class="panel-heading">
            <div><span class="overline">GARDER LE CAP</span><h2>Votre budget</h2></div>
            <span class="panel-icon">◷</span>
          </div>
          <form class="budget-form" @submit.prevent="submitBudget">
            <label class="form-field budget-month"><span>Mois</span><input v-model="budgetForm.month" type="month" required @change="fetchMonthlyBudget"></label>
            <label class="form-field"><span>Enveloppe</span><input v-model.number="budgetForm.amount" type="number" min="0" step="0.01" placeholder="0,00" required></label>
            <button class="button button-dark" type="submit" :disabled="savingBudget">{{ savingBudget ? 'Enregistrement…' : budgetRecord ? 'Mettre à jour' : 'Définir le budget' }}</button>
          </form>
          <div class="budget-progress-copy"><span>Dépenses utilisées</span><strong>{{ budgetUsage }} %</strong></div>
          <div class="progress-track"><span :style="{ width: `${budgetUsage}%` }"></span></div>
          <div class="budget-foot"><span>{{ formatAmount(totalDepenses) }} dépensés</span><span>{{ formatAmount(Math.max(monthlyBudgetAmount - totalDepenses, 0)) }} restants</span></div>
        </article>

        <article class="panel chart-panel">
          <div class="panel-heading">
            <div><span class="overline">EN UN COUP D’ŒIL</span><h2>Vos dépenses</h2></div>
            <span class="chart-caption">Par catégorie</span>
          </div>
          <StatisticsCharts :expenses="monthExpenses" />
        </article>
      </section>

      <section id="transactions" class="panel transactions-panel">
        <div class="panel-heading transaction-heading">
          <div><span class="overline">VOTRE ACTIVITÉ</span><h2>Transactions récentes</h2></div>
          <div class="transaction-actions">
            <button class="button button-outline" type="button" @click="openRevenueForm"><span class="button-plus">+</span> Ajouter un revenu</button>
            <button class="button button-soft" type="button" @click="openExpenseForm"><span class="button-plus">+</span> Ajouter une dépense</button>
          </div>
        </div>

        <div v-if="!recentTransactions.length" class="empty-state">
          <span class="empty-icon">✳</span><strong>Votre histoire commence ici.</strong>
          <p>Ajoutez un revenu ou une dépense pour voir vos transactions apparaître.</p>
        </div>
        <div v-else class="transaction-list">
          <div v-for="item in recentTransactions" :key="`${item.kind}-${item.id}`" class="transaction-row">
            <div class="transaction-symbol" :class="item.kind === 'income' ? 'transaction-symbol-income' : 'transaction-symbol-expense'">{{ item.kind === 'income' ? '↙' : '↗' }}</div>
            <div class="transaction-description"><strong>{{ item.title }}</strong><span>{{ item.category || item.source || 'Transaction' }} · {{ formatDate(item.date) }}</span></div>
            <span v-if="item.tag" class="transaction-tag">{{ item.tag }}</span>
            <strong class="transaction-amount" :class="item.kind === 'income' ? 'amount-income' : 'amount-expense'">{{ item.kind === 'income' ? '+' : '−' }}{{ formatAmount(item.amount) }}</strong>
            <div class="transaction-controls">
              <button class="icon-button" type="button" :aria-label="`Modifier ${item.title}`" title="Modifier" @click="editTransaction(item)">✎</button>
              <button class="icon-button delete-control" type="button" :aria-label="`Supprimer ${item.title}`" title="Supprimer" @click="deleteTransaction(item)">×</button>
            </div>
          </div>
        </div>
      </section>
      <footer class="dashboard-footer"><span>zenwallet</span><span>Un regard plus serein sur votre argent.</span></footer>
    </main>

    <BaseModal :show="showExpenseForm" @close="closeExpenseForm">
      <ExpenseForm :expense="expenseToEdit" @submitted="onExpenseSaved" @updated="onExpenseSaved" />
    </BaseModal>
    <BaseModal :show="showRevenueForm" @close="closeRevenueForm">
      <RevenueForm :revenue="revenueToEdit" @submitted="onRevenueSaved" />
    </BaseModal>
  </div>
</template>

<script>
import BaseModal from '../components/BaseModal.vue';
import ExpenseForm from '../components/ExpenseForm.vue';
import RevenueForm from '../components/RevenueForm.vue';
import StatisticsCharts from '../components/StatisticsCharts.vue';
import { apiRequest } from '../services/api';

function localMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default {
  name: 'Home',
  components: { BaseModal, ExpenseForm, RevenueForm, StatisticsCharts },
  props: {
    user: { type: Object, required: true },
  },
  emits: ['logout', 'open-admin'],
  data() {
    const today = new Date();
    return {
      revenues: [],
      expenses: [],
      monthlyBudgetAmount: 0,
      budgetRecord: null,
      budgetForm: { month: localMonth(today), amount: '' },
      showExpenseForm: false,
      showRevenueForm: false,
      expenseToEdit: null,
      revenueToEdit: null,
      savingBudget: false,
      pageError: '',
      notice: '',
    };
  },
  computed: {
    userInitials() {
      return this.user.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    },
    firstName() {
      return this.user.name.trim().split(/\s+/)[0];
    },
    todayLabel() {
      return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
    },
    currentMonthLabel() {
      const [year, month] = this.budgetForm.month.split('-');
      if (!year || !month) return '';
      return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(Number(year), Number(month) - 1, 1));
    },
    monthRevenues() {
      return this.revenues.filter((item) => item.date.startsWith(this.budgetForm.month));
    },
    monthExpenses() {
      return this.expenses.filter((item) => item.date.startsWith(this.budgetForm.month));
    },
    totalRevenus() {
      return this.monthRevenues.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    },
    totalDepenses() {
      return this.monthExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    },
    soldeActuel() {
      return this.monthlyBudgetAmount + this.totalRevenus - this.totalDepenses;
    },
    budgetUsage() {
      if (!this.monthlyBudgetAmount) return this.totalDepenses > 0 ? 100 : 0;
      return Math.min(100, Math.round((this.totalDepenses / this.monthlyBudgetAmount) * 100));
    },
    recentTransactions() {
      return [
        ...this.revenues.map((item) => ({ ...item, kind: 'income' })),
        ...this.expenses.map((item) => ({ ...item, kind: 'expense' })),
      ].sort((first, second) => new Date(second.date) - new Date(first.date)).slice(0, 8);
    },
  },
  async mounted() {
    await Promise.all([this.fetchRevenues(), this.fetchExpenses(), this.fetchMonthlyBudget()]);
  },
  methods: {
    formatAmount(value) {
      return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(Number(value) || 0);
    },
    formatDate(value) {
      return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
    },
    async fetchRevenues() {
      try {
        this.revenues = await apiRequest('/revenues');
      } catch (error) {
        this.pageError = error.message;
      }
    },
    async fetchExpenses() {
      try {
        this.expenses = await apiRequest('/expenses');
      } catch (error) {
        this.pageError = error.message;
      }
    },
    async fetchMonthlyBudget() {
      this.budgetRecord = null;
      this.budgetForm.amount = '';
      this.monthlyBudgetAmount = 0;
      if (!this.budgetForm.month) return;
      try {
        const budget = await apiRequest(`/budget/${this.budgetForm.month}`);
        this.budgetRecord = budget;
        this.budgetForm.amount = Number(budget.amount);
        this.monthlyBudgetAmount = Number(budget.amount);
      } catch (error) {
        if (error.status !== 404) this.pageError = error.message;
      }
    },
    async submitBudget() {
      this.savingBudget = true;
      this.pageError = '';
      try {
        const [year] = this.budgetForm.month.split('-');
        const budget = await apiRequest(
          this.budgetRecord ? `/budget/${this.budgetRecord.id}` : '/budget',
          {
            method: this.budgetRecord ? 'PUT' : 'POST',
            body: JSON.stringify({
              month: this.budgetForm.month,
              year: Number(year),
              amount: Number(this.budgetForm.amount),
            }),
          }
        );
        this.budgetRecord = budget;
        this.monthlyBudgetAmount = Number(budget.amount);
        this.notice = 'Votre budget est à jour.';
      } catch (error) {
        this.pageError = error.message;
      } finally {
        this.savingBudget = false;
      }
    },
    openExpenseForm() {
      this.expenseToEdit = null;
      this.showExpenseForm = true;
    },
    closeExpenseForm() {
      this.showExpenseForm = false;
      this.expenseToEdit = null;
    },
    openRevenueForm() {
      this.revenueToEdit = null;
      this.showRevenueForm = true;
    },
    closeRevenueForm() {
      this.showRevenueForm = false;
      this.revenueToEdit = null;
    },
    editTransaction(item) {
      if (item.kind === 'income') {
        this.revenueToEdit = { ...item };
        this.showRevenueForm = true;
      } else {
        this.expenseToEdit = { ...item };
        this.showExpenseForm = true;
      }
    },
    async onExpenseSaved() {
      this.closeExpenseForm();
      await this.fetchExpenses();
    },
    async onRevenueSaved() {
      this.closeRevenueForm();
      await this.fetchRevenues();
    },
    async deleteTransaction(item) {
      if (!window.confirm(`Supprimer « ${item.title} » ?`)) return;
      try {
        await apiRequest(`/${item.kind === 'income' ? 'revenues' : 'expenses'}/${item.id}`, { method: 'DELETE' });
        if (item.kind === 'income') await this.fetchRevenues();
        else await this.fetchExpenses();
        this.notice = 'Transaction supprimée.';
      } catch (error) {
        this.pageError = error.message;
      }
    },
    async logout() {
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
        this.$emit('logout');
      } catch (error) {
        this.pageError = error.message;
      }
    },
  },
};
</script>
