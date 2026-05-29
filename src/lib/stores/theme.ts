import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function detectSystemTheme(): Theme {
  if (!browser) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  if (!browser) return;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

function createThemeStore() {
  const initial = browser ? (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? detectSystemTheme() : 'light';
  const store = writable<Theme>(initial);

  if (browser) {
    applyTheme(initial);
  }

  return {
    subscribe: store.subscribe,
    set(theme: Theme) {
      applyTheme(theme);
      store.set(theme);
    },
    toggle() {
      store.update((current) => {
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        return next;
      });
    },
  };
}

export const theme = createThemeStore();

export function initTheme() {
  if (!browser) return;
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  theme.set(saved ?? detectSystemTheme());
}

export function setTheme(next: Theme) {
  theme.set(next);
}

export function toggleTheme() {
  theme.toggle();
}
