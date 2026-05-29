<script lang="ts">
  type Props = { name: string; description: string; emoji: string };
  let { name, description, emoji }: Props = $props();
</script>

<section class="persona card-glow slide-up d2">
  <div class="aurora" aria-hidden="true"></div>
  <div class="inner">
    <div class="emoji-wrap">
      <div class="emoji" aria-hidden="true">{emoji}</div>
    </div>
    <div class="content">
      <span class="badge">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
        </svg>
        Your Coder Persona
      </span>
      <h2 class="persona-name gradient-text">{name}</h2>
      <p class="persona-desc muted">{description}</p>
    </div>
  </div>
</section>

<style>
  .persona {
    position: relative;
    overflow: hidden;
    border-radius: var(--r-xl);
    background: var(--bg-surface);
  }

  .aurora {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 60% at 10% 50%, color-mix(in srgb, var(--brand) 12%, transparent), transparent),
      radial-gradient(ellipse 50% 50% at 90% 20%, color-mix(in srgb, var(--brand-3) 8%, transparent), transparent);
    animation: blobDrift 14s ease-in-out infinite alternate;
    pointer-events: none;
  }

  .inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 2rem;
  }

  .emoji-wrap { flex-shrink: 0; }

  .emoji {
    width: 96px;
    height: 96px;
    font-size: 3.5rem;
    display: grid;
    place-items: center;
    border-radius: var(--r-lg);
    background: color-mix(in srgb, var(--brand) 10%, var(--bg-surface-2));
    border: 1.5px solid var(--border-2);
    box-shadow: var(--shadow-md);
    animation: bounce 3.5s ease-in-out infinite;
  }

  .content { display: grid; gap: 0.6rem; min-width: 0; flex: 1; }

  .persona-name {
    font-size: clamp(1.3rem, 3.5vw, 2rem);
    font-weight: 800;
    letter-spacing: -0.025em;
    line-height: 1.1;
  }

  .persona-desc { font-size: 0.92rem; line-height: 1.7; }

  @media (max-width: 560px) {
    .inner { flex-direction: column; align-items: flex-start; padding: 1.5rem; }
  }
</style>
