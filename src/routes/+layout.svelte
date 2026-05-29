<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Lightning from '$lib/components/Lightning.svelte';
  import { initTheme } from '$lib/stores/theme';

  let { children } = $props();

  $effect(() => {
    initTheme();
  });
</script>

<Lightning />
<div class="layout-root">
  <Header />
  <main class="page-shell">{@render children()}</main>
  <Footer />
</div>

<style>
  .layout-root {
    position: relative;
    z-index: 1;
    min-height: 100vh;
  }
</style>
