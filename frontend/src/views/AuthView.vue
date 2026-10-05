<template>
  <main class="auth-page">
    <section class="auth-showcase">
      <div class="showcase-inner">
        <a class="brand-lockup" href="#" aria-label="Zenwallet, accueil">
          <span class="brand-mark"><span></span><span></span><span></span></span>
          <span>zenwallet</span>
        </a>

        <div class="showcase-copy">
          <span class="eyebrow"><span class="eyebrow-dot"></span> VOTRE ARGENT, ENFIN À SA PLACE</span>
          <h1>De la clarté<br>dans vos <em>finances.</em></h1>
          <p>Une vision simple et sereine de votre argent, pour avancer vers ce qui compte vraiment.</p>
        </div>

        <div class="preview-card">
          <div class="preview-heading">
            <div>
              <span class="preview-label">SOLDE DISPONIBLE</span>
              <strong>2 840,50</strong>
            </div>
            <span class="preview-trend">↗ 12,8 %</span>
          </div>
          <div class="preview-chart" aria-hidden="true">
            <span style="--height: 33%"></span><span style="--height: 51%"></span>
            <span style="--height: 43%"></span><span style="--height: 67%"></span>
            <span style="--height: 57%"></span><span style="--height: 78%"></span>
            <span style="--height: 69%"></span><span style="--height: 93%"></span>
            <span style="--height: 83%"></span><span style="--height: 100%"></span>
          </div>
          <div class="preview-months"><span>MAI</span><span>JUIN</span><span>JUIL.</span><span>AOÛT</span></div>
        </div>

        <p class="showcase-footnote">Fait pour vous aider à voir plus loin.</p>
      </div>
      <div class="showcase-orb showcase-orb-one"></div>
      <div class="showcase-orb showcase-orb-two"></div>
    </section>

    <section class="auth-panel">
      <div class="auth-form-wrap">
        <div class="auth-mobile-brand brand-lockup">
          <span class="brand-mark"><span></span><span></span><span></span></span>
          <span>zenwallet</span>
        </div>
        <div class="auth-heading">
          <span class="auth-kicker">{{ isRegister ? 'VOTRE ESPACE PERSONNEL' : 'HEUREUX DE VOUS REVOIR' }}</span>
          <h2>{{ isRegister ? 'Créez votre compte' : 'Bon retour.' }}</h2>
          <p>{{ isRegister ? 'Quelques secondes pour reprendre vos finances en main.' : 'Connectez-vous pour retrouver votre tableau de bord.' }}</p>
        </div>

        <form class="auth-form" @submit.prevent="submit">
          <label v-if="isRegister" class="form-field">
            <span>Votre prénom</span>
            <input v-model.trim="form.name" autocomplete="name" placeholder="Ex. Camille" required minlength="2" maxlength="80">
          </label>
          <label class="form-field">
            <span>Adresse e-mail</span>
            <input v-model.trim="form.email" type="email" autocomplete="email" placeholder="vous@exemple.fr" required>
          </label>
          <label class="form-field">
            <span>Mot de passe</span>
            <input v-model="form.password" type="password" :autocomplete="isRegister ? 'new-password' : 'current-password'" placeholder="8 caractères minimum" required :minlength="isRegister ? 8 : undefined">
          </label>

          <p v-if="error" class="auth-error" role="alert">{{ error }}</p>
          <button class="auth-submit" type="submit" :disabled="loading">
            <span>{{ loading ? 'Un instant…' : isRegister ? 'Créer mon compte' : 'Se connecter' }}</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <p class="auth-switch">
          {{ isRegister ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?' }}
          <button type="button" @click="toggleMode">{{ isRegister ? 'Se connecter' : 'Créer un compte' }}</button>
        </p>
        <p class="auth-privacy"><span aria-hidden="true">◈</span> Vos données financières restent privées.</p>
      </div>
      <span class="auth-copyright">© 2026 Zenwallet · Prenez soin de votre avenir.</span>
    </section>
  </main>
</template>

<script>
import { apiRequest } from '../services/api';

export default {
  name: 'AuthView',
  emits: ['authenticated'],
  data() {
    return {
      isRegister: false,
      loading: false,
      error: '',
      form: { name: '', email: '', password: '' },
    };
  },
  methods: {
    toggleMode() {
      this.isRegister = !this.isRegister;
      this.error = '';
    },
    async submit() {
      this.loading = true;
      this.error = '';
      try {
        const path = this.isRegister ? '/auth/register' : '/auth/login';
        const response = await apiRequest(path, {
          method: 'POST',
          body: JSON.stringify(this.form),
        });
        this.$emit('authenticated', response.user);
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
