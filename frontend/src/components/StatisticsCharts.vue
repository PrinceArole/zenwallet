<template>
  <div class="statistics-chart">
    <div v-if="expenses.length" class="h-64">
      <!-- Le graphique prendra la hauteur disponible -->
      <DoughnutChart :chart-data="categoryData" />
    </div>
    <div v-else class="chart-empty">Les catégories de dépenses apparaîtront ici.</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DoughnutChart from './DoughnutChart.vue'

const props = defineProps({
  expenses: {
    type: Array,
    required: true
  }
})

const categoryData = computed(() => {
  const counts = {}
  props.expenses.forEach(exp => {
    const category = exp.category || 'Autres'
    counts[category] = (counts[category] || 0) + Number(exp.amount || 0)
  })
  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: 'Montant dépensé',
        data: Object.values(counts),
        backgroundColor: ['#f87100', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'],
      },
    ],
  }
})
</script>
