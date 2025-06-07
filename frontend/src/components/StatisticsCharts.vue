<template>
  <div class="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
    <h3 class="text-xl font-bold mb-4 text-gray-800">Statistiques des dépenses</h3>
    <div class="h-64">
      <!-- Le graphique prendra la hauteur disponible -->
      <DoughnutChart :chart-data="categoryData" />
    </div>
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
    counts[exp.category] = (counts[exp.category] || 0) + exp.amount
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
