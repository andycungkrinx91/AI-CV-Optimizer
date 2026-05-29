<script lang="ts">
</script>

<footer class="site-footer">
  <div class="footer-inner glass">
    <div class="foot-brand">
      <img src="/logo.svg" alt="" class="foot-logo" aria-hidden="true" />
      <div>
        <p class="foot-name">AI CV Optimizer</p>
        <p class="muted small">Copyright Andy Setiyawan © 2026. All rights reserved.</p>
      </div>
    </div>
    <div class="foot-links">
      <a href="https://www.linkedin.com/in/andy-setiyawan-452396170/" target="_blank" rel="noopener noreferrer" class="btn-secondary foot-link">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect x="2" y="9" width="4" height="12"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
        LinkedIn
      </a>
    </div>
  </div>
</footer>

<style>
  .site-footer {
    width: min(980px, calc(100vw - 2rem));
    margin: 1.5rem auto 2rem;
  }

  .footer-inner {
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .foot-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .foot-logo {
    width: 32px; height: 32px;
    border-radius: 10px;
    opacity: 0.8;
  }

  .foot-name { font-weight: 600; font-size: 0.88rem; }

  .foot-links { display: flex; gap: 0.5rem; }

  .foot-link {
    font-size: 0.82rem;
    padding: 0.45rem 0.9rem;
  }
</style>
