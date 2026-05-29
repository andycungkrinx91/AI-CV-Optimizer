<script lang="ts">
  type Props = { label: string; score: number; delay?: number };
  let { label, score, delay = 0 }: Props = $props();

  const S = 148, W = 13, R = (S - W) / 2, C = 2 * Math.PI * R;
  let animated = $state(0), started = false;

  $effect(() => {
    if (started) return; started = true;
    const target = Math.max(0, Math.min(100, score | 0));
    const t0 = performance.now() + delay;
    let raf = 0;
    const tick = (now: number) => {
      if (now < t0) { raf = requestAnimationFrame(tick); return; }
      const p = Math.min(1, (now - t0) / 1300);
      animated = Math.round(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });

  const tone   = $derived(score >= 75 ? 'good' : score >= 50 ? 'ok' : 'low');
  const offset = $derived(C - (C * animated) / 100);
  const gid    = $derived(`sg-${label.replace(/\W/g,'-')}`);

  const toneColors = {
    good: ['#10b981','#34d399'],
    ok:   ['#f59e0b','#fbbf24'],
    low:  ['#ef4444','#f87171'],
  };
</script>

<article class="gauge card" data-tone={tone}>
  <div class="ring-wrap" style="width:{S}px;height:{S}px;">
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} aria-label="{label}: {animated}%" role="img">
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color={toneColors[tone][0]} />
          <stop offset="100%" stop-color={toneColors[tone][1]} />
        </linearGradient>
        <filter id="gf-{gid}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Track -->
      <circle cx={S/2} cy={S/2} r={R} fill="none"
        stroke="var(--border)" stroke-width={W} stroke-linecap="round"
        transform={`rotate(-90 ${S/2} ${S/2})`}/>

      <!-- Value -->
      <circle cx={S/2} cy={S/2} r={R} fill="none"
        stroke={`url(#${gid})`} stroke-width={W} stroke-linecap="round"
        stroke-dasharray={C} stroke-dashoffset={offset}
        transform={`rotate(-90 ${S/2} ${S/2})`}
        filter={`url(#gf-${gid})`}/>
    </svg>

    <div class="center">
      <strong class="score">{animated}</strong>
      <span class="pct">%</span>
    </div>
  </div>

  <p class="lbl">
    <span class="dot" data-tone={tone}></span>
    {label}
  </p>
</article>

<style>
  .gauge {
    display: grid;
    place-items: center;
    gap: 0.85rem;
    padding: 1.75rem 1.25rem;
    text-align: center;
    transition: transform var(--t-base) var(--ease-out), box-shadow var(--t-base);
  }

  .gauge:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  .ring-wrap {
    position: relative;
    display: grid;
    place-items: center;
  }

  svg { position: absolute; inset: 0; }

  .center {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1px;
  }

  .score {
    font-size: 2.4rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    color: var(--tone-color, var(--brand));
  }

  .pct {
    font-size: 1rem;
    font-weight: 600;
    color: var(--tone-color, var(--brand));
    align-self: flex-end;
    padding-bottom: 0.3rem;
  }

  [data-tone='good'] { --tone-color: var(--success); }
  [data-tone='ok']   { --tone-color: var(--warning); }
  [data-tone='low']  { --tone-color: var(--error);   }

  .lbl {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  [data-tone='good'] .dot { background: var(--success); box-shadow: 0 0 6px var(--success); }
  [data-tone='ok']   .dot { background: var(--warning); box-shadow: 0 0 6px var(--warning); }
  [data-tone='low']  .dot { background: var(--error);   box-shadow: 0 0 6px var(--error);   }
</style>
