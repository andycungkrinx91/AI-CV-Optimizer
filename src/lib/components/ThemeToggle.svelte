<script lang="ts">
  import { theme, toggleTheme } from '$lib/stores/theme';
</script>

<button class="theme-btn btn-icon" type="button" onclick={toggleTheme}
  aria-label={$theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
  {#if $theme === 'dark'}
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  {:else}
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  {/if}
</button>

<style>
  .theme-btn {
    width: 2.75rem;
    height: 2.75rem;
    transition: transform var(--t-base) var(--ease-spring), box-shadow var(--t-base);
  }
  .theme-btn:hover {
    transform: rotate(15deg) scale(1.1);
  }
</style>
