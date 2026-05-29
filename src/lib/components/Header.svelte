<script lang="ts">
  import ThemeToggle from './ThemeToggle.svelte';
</script>

<header class="site-header blur-fade">
  <div class="header-card glass">
    <div class="brand">
      <div class="logo-ring">
        <img src="/logo.svg" alt="AI CV Optimizer" class="logo" />
      </div>
      <div class="brand-text">
        <span class="badge">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
            <circle cx="5" cy="5" r="3" opacity="0.5"/>
            <circle cx="5" cy="5" r="1.5"/>
          </svg>
          AI-powered resume analysis
        </span>
        <h1 class="site-title gradient-text">AI CV Optimizer</h1>
        <p class="site-sub muted">Upload your CV and a job description — get instant scores, persona insights, rewrites, ATS tips, and role suggestions.</p>
      </div>
    </div>
    <ThemeToggle />
  </div>
</header>

<style>
  .site-header {
    width: min(980px, calc(100vw - 2rem));
    margin: 1.5rem auto 0;
  }

  .header-card {
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.25rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    min-width: 0;
  }

  .logo-ring {
    position: relative;
    flex-shrink: 0;
    width: 56px;
    height: 56px;
  }

  .logo-ring::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 22px;
    background: linear-gradient(135deg, var(--brand), var(--brand-3), var(--brand));
    background-size: 200% 200%;
    animation: shimmerBg 4s ease infinite;
    z-index: 0;
  }

  .logo {
    position: relative;
    z-index: 1;
    width: 56px;
    height: 56px;
    border-radius: 18px;
    object-fit: cover;
    border: 2px solid var(--bg-surface);
    animation: float 4s ease-in-out infinite;
    box-shadow: var(--shadow-md);
  }

  .brand-text {
    display: grid;
    gap: 0.35rem;
    min-width: 0;
  }

  .site-title {
    font-size: clamp(1.6rem, 4vw, 2.6rem);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .site-sub {
    font-size: 0.88rem;
    line-height: 1.6;
    max-width: 52ch;
  }

  @media (max-width: 600px) {
    .header-card {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
