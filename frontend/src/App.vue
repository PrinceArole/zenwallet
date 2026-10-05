<template>
  <div v-if="checkingSession" class="app-loading">
    <span class="loading-mark"><span></span><span></span><span></span></span>
  </div>
  <main v-else-if="sessionError" class="session-error">
    <span class="overline">ZENWALLET</span>
    <h1>Connexion impossible</h1>
    <p>{{ sessionError }}</p>
    <button class="button button-primary" type="button" @click="checkSession">Réessayer</button>
  </main>
  <AuthView v-else-if="!user" @authenticated="setUser" />
  <Home v-else :user="user" @logout="user = null" />
</template>

<script>
import AuthView from './views/AuthView.vue';
import Home from './views/Home.vue';
import { apiRequest } from './services/api';

export default {
  name: 'App',
  components: { AuthView, Home },
  data() {
    return { user: null, checkingSession: true, sessionError: '' };
  },
  async mounted() {
    await this.checkSession();
  },
  methods: {
    async checkSession() {
      this.checkingSession = true;
      this.sessionError = '';
      try {
        const response = await apiRequest('/auth/me');
        this.user = response.user;
      } catch (error) {
        if (error.status === 401) this.user = null;
        else this.sessionError = error.message;
      } finally {
        this.checkingSession = false;
      }
    },
    setUser(user) {
      this.user = user;
    },
  },
};
</script>

<style scoped>
.session-error {
  display: grid;
  min-height: 100vh;
  align-content: center;
  justify-items: center;
  gap: 14px;
  padding: 24px;
  text-align: center;
}

.session-error h1 {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 34px;
  font-weight: 400;
}

.session-error p {
  max-width: 420px;
  margin: 0 0 8px;
  color: #78847e;
  font-size: 13px;
}
</style>
