<template>
  <main class="min-h-screen px-4 py-8 text-zen-ink sm:px-8">
    <div class="mx-auto max-w-6xl">
      <header class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold tracking-[1.4px] text-zen-muted">ZENWALLET / ADMINISTRATION</span>
          <h1 class="mt-2 font-display text-4xl font-normal">Santé technique</h1>
          <p class="mt-2 text-sm text-zen-muted">Bonjour {{ user.name }}, voici l’état du backend et son activité récente.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="button button-outline" type="button" @click="$emit('back')">← Retour au tableau de bord</button>
          <button class="button button-primary" type="button" :disabled="loading" @click="fetchMetrics">
            {{ loading ? 'Actualisation…' : 'Actualiser' }}
          </button>
          <button class="button button-outline" type="button" @click="logout">Déconnexion</button>
        </div>
      </header>

      <div v-if="error" class="notice notice-error mb-6" role="alert">{{ error }}</div>
      <div v-if="metrics" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-2xl border border-zen-line bg-white p-5 shadow-sm">
          <p class="text-xs font-bold tracking-wider text-zen-muted">BASE DE DONNÉES</p>
          <strong class="mt-3 block text-2xl" :class="metrics.database.status === 'connected' ? 'text-zen-forest' : 'text-red-600'">
            {{ metrics.database.status === 'connected' ? 'Connectée' : 'Indisponible' }}
          </strong>
          <span class="mt-1 block text-sm text-zen-muted">
            {{ metrics.database.status === 'connected' ? `${metrics.database.latencyMs} ms` : 'Vérifiez le backend' }}
          </span>
        </article>
        <article class="rounded-2xl border border-zen-line bg-white p-5 shadow-sm">
          <p class="text-xs font-bold tracking-wider text-zen-muted">REQUÊTES DEPUIS LE DÉMARRAGE</p>
          <strong class="mt-3 block text-2xl">{{ metrics.application.requests.total.toLocaleString('fr-FR') }}</strong>
          <span class="mt-1 block text-sm text-zen-muted">Démarré {{ formatDate(metrics.application.startedAt) }}</span>
        </article>
        <article class="rounded-2xl border border-zen-line bg-white p-5 shadow-sm">
          <p class="text-xs font-bold tracking-wider text-zen-muted">ERREURS HTTP</p>
          <strong class="mt-3 block text-2xl" :class="metrics.application.requests.serverErrors ? 'text-red-600' : 'text-zen-forest'">
            {{ metrics.application.requests.serverErrors }}
          </strong>
          <span class="mt-1 block text-sm text-zen-muted">{{ metrics.application.requests.clientErrors }} erreurs client (4xx)</span>
        </article>
        <article class="rounded-2xl border border-zen-line bg-white p-5 shadow-sm">
          <p class="text-xs font-bold tracking-wider text-zen-muted">TEMPS DE RÉPONSE</p>
          <strong class="mt-3 block text-2xl">{{ metrics.application.requests.averageLatencyMs }} ms</strong>
          <span class="mt-1 block text-sm text-zen-muted">95e percentile : {{ metrics.application.requests.p95LatencyMs }} ms</span>
        </article>
      </div>

      <section v-if="metrics" class="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article class="overflow-hidden rounded-2xl border border-zen-line bg-white shadow-sm">
          <div class="border-b border-zen-line px-5 py-4">
            <h2 class="font-display text-2xl">Activité des routes API</h2>
            <p class="mt-1 text-sm text-zen-muted">Chemins agrégés, sans adresse IP ni contenu des requêtes.</p>
          </div>
          <div v-if="metrics.application.endpoints.length" class="overflow-x-auto">
            <table class="w-full min-w-[560px] text-left text-sm">
              <thead class="bg-zen-canvas text-xs uppercase tracking-wide text-zen-muted">
                <tr><th class="px-5 py-3 font-semibold">Route</th><th class="px-4 py-3 font-semibold">Requêtes</th><th class="px-4 py-3 font-semibold">Erreurs</th><th class="px-4 py-3 font-semibold">Moyenne</th></tr>
              </thead>
              <tbody>
                <tr v-for="endpoint in metrics.application.endpoints" :key="endpoint.path" class="border-t border-zen-line">
                  <td class="px-5 py-3 font-mono text-xs">{{ endpoint.path }}</td>
                  <td class="px-4 py-3">{{ endpoint.requests }}</td>
                  <td class="px-4 py-3" :class="endpoint.errors ? 'text-red-600' : 'text-zen-muted'">{{ endpoint.errors }}</td>
                  <td class="px-4 py-3">{{ endpoint.averageLatencyMs }} ms</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="px-5 py-8 text-sm text-zen-muted">Les requêtes apparaîtront ici pendant l’utilisation de l’application.</p>
        </article>

        <div class="space-y-6">
          <article class="rounded-2xl border border-zen-line bg-white p-5 shadow-sm">
            <h2 class="font-display text-2xl">Sauvegardes MySQL</h2>
            <div class="mt-4 flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full" :class="metrics.backup.enabled ? 'bg-emerald-500' : 'bg-amber-500'"></span>
              <strong>{{ metrics.backup.enabled ? 'Planification active' : 'Planification inactive' }}</strong>
            </div>
            <p v-if="metrics.backup.configurationMessage" class="mt-2 text-sm text-zen-muted">{{ metrics.backup.configurationMessage }}</p>
            <dl class="mt-4 space-y-3 text-sm">
              <div class="flex justify-between gap-4"><dt class="text-zen-muted">Dernière tentative</dt><dd class="text-right">{{ formatDate(metrics.backup.lastAttemptAt) }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-zen-muted">Dernier succès</dt><dd class="text-right">{{ formatDate(metrics.backup.lastSuccessAt) }}</dd></div>
              <div v-if="metrics.backup.running" class="font-medium text-zen-forest">Sauvegarde en cours…</div>
              <div v-if="metrics.backup.lastError" class="break-words text-red-600">Dernière erreur : {{ metrics.backup.lastError }}</div>
            </dl>
          </article>

          <article class="rounded-2xl border border-zen-line bg-white p-5 shadow-sm">
            <h2 class="font-display text-2xl">Processus backend</h2>
            <dl class="mt-4 space-y-3 text-sm">
              <div class="flex justify-between gap-4"><dt class="text-zen-muted">Temps actif</dt><dd>{{ formatUptime(metrics.application.uptimeSeconds) }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-zen-muted">Mémoire résidente</dt><dd>{{ formatBytes(metrics.process.memoryUsageBytes) }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-zen-muted">Version Node.js</dt><dd>{{ metrics.process.nodeVersion }}</dd></div>
            </dl>
          </article>
        </div>
      </section>

      <p class="mt-6 text-xs text-zen-muted">
        Les compteurs sont conservés en mémoire et repartent à zéro au redémarrage du backend. Actualisation automatique toutes les 15 secondes.
      </p>
    </div>
  </main>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { apiRequest } from '../services/api';

defineProps({
  user: { type: Object, required: true },
});

const emit = defineEmits(['back', 'logout']);
const metrics = ref(null);
const loading = ref(false);
const error = ref('');
let refreshTimer;

function formatDate(value) {
  if (!value) return 'Aucune';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return [days && `${days} j`, hours && `${hours} h`, `${minutes} min`].filter(Boolean).join(' ');
}

function formatBytes(bytes) {
  const megabytes = bytes / (1024 * 1024);
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(megabytes)} Mo`;
}

async function fetchMetrics() {
  loading.value = true;
  error.value = '';
  try {
    metrics.value = await apiRequest('/admin/metrics');
  } catch (requestError) {
    error.value = requestError.message;
  } finally {
    loading.value = false;
  }
}

async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
    emit('logout');
  } catch (requestError) {
    error.value = requestError.message;
  }
}

onMounted(() => {
  fetchMetrics();
  refreshTimer = window.setInterval(fetchMetrics, 15000);
});

onUnmounted(() => window.clearInterval(refreshTimer));
</script>
