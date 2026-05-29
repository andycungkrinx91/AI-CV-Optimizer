<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    let running = true;

    // ── Resize ─────────────────────────────────────────────────────
    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // ── Helpers ────────────────────────────────────────────────────
    const rnd  = (a: number, b: number) => Math.random() * (b - a) + a;
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const COLORS = ['#00d4ff','#38bdf8','#a78bfa','#ffffff','#00d4ff','#00d4ff'];

    // ── Lightning bolt math ────────────────────────────────────────
    type Pt = { x: number; y: number };

    function fracture(
      x1: number, y1: number,
      x2: number, y2: number,
      spread: number,
      depth: number,
      out: Pt[]
    ): void {
      if (depth === 0) { out.push({ x: x2, y: y2 }); return; }
      const mx = (x1 + x2) / 2 + rnd(-spread, spread);
      const my = (y1 + y2) / 2 + rnd(-spread * 0.3, spread * 0.3);
      fracture(x1, y1, mx, my, spread / 1.9, depth - 1, out);
      fracture(mx, my, x2, y2, spread / 1.9, depth - 1, out);
    }

    function drawSegment(
      pts: Pt[],
      ox: number, oy: number,
      alpha: number, color: string,
      lineW: number, glowW: number, glowBlur: number
    ) {
      if (pts.length < 1) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth   = lineW;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur  = glowBlur;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      for (const p of pts) ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.restore();
    }

    function renderBolt(
      x1: number, y1: number,
      x2: number, y2: number,
      alpha: number, color: string,
      depth: number
    ): void {
      if (alpha < 0.03) return;
      const len  = Math.hypot(x2 - x1, y2 - y1);
      const pts: Pt[] = [];
      fracture(x1, y1, x2, y2, len * 0.2, Math.min(depth, 8), pts);

      // Layer 1 — wide outer halo
      ctx.save();
      ctx.filter = 'blur(8px)';
      drawSegment(pts, x1, y1, alpha * 0.2, color, 20, 0, 0);
      ctx.restore();

      // Layer 2 — mid glow
      drawSegment(pts, x1, y1, alpha * 0.5, color, 4,  0, 28);

      // Layer 3 — bright core
      drawSegment(pts, x1, y1, alpha * 0.92, '#ffffff', 1.2, 0, 10);

      // Branches
      if (depth > 1) {
        const brIdx = Math.floor(pts.length * rnd(0.25, 0.7));
        if (brIdx < pts.length) {
          const bp    = pts[brIdx];
          const ang   = Math.atan2(y2 - y1, x2 - x1) + rnd(-1.1, 1.1);
          const bLen  = len * rnd(0.25, 0.5);
          renderBolt(
            bp.x, bp.y,
            bp.x + Math.cos(ang) * bLen,
            bp.y + Math.sin(ang) * bLen,
            alpha * 0.5, color, depth - 1
          );
        }
      }
    }

    // ── Sparks ─────────────────────────────────────────────────────
    type Spark = { x: number; y: number; vx: number; vy: number; r: number; life: number; color: string };
    const sparks: Spark[] = [];

    function spawnSparks(x: number, y: number, n: number, color: string) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = rnd(1.5, 6);
        sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - rnd(0.5, 2.5), r: rnd(1, 3.5), life: 1, color });
      }
    }

    function tickSparks() {
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x   += s.vx;
        s.y   += s.vy;
        s.vy  += 0.14;
        s.vx  *= 0.96;
        s.life -= 0.03;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = s.life * 0.85;
        ctx.fillStyle   = s.color;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // ── Active strikes ─────────────────────────────────────────────
    type Strike = {
      x1: number; y1: number; x2: number; y2: number;
      color: string; alpha: number; decay: number; delay: number; fresh: boolean;
    };
    const strikes: Strike[] = [];

    function spawnStrike() {
      const w = canvas.width;
      const h = canvas.height;
      let x1: number, y1: number, x2: number, y2: number;

      const edge = Math.random();
      if (edge < 0.55) {
        // top → bottom half
        x1 = rnd(w * 0.05, w * 0.95);
        y1 = rnd(-60, -10);
        x2 = x1 + rnd(-w * 0.3, w * 0.3);
        y2 = rnd(h * 0.3, h * 0.9);
      } else if (edge < 0.78) {
        // left → right area
        x1 = rnd(-60, -10);
        y1 = rnd(0, h * 0.7);
        x2 = rnd(w * 0.25, w * 0.8);
        y2 = y1 + rnd(-h * 0.3, h * 0.4);
      } else {
        // right → left area
        x1 = rnd(w + 10, w + 60);
        y1 = rnd(0, h * 0.7);
        x2 = rnd(w * 0.2, w * 0.75);
        y2 = y1 + rnd(-h * 0.3, h * 0.4);
      }

      strikes.push({
        x1, y1, x2, y2,
        color: pick(COLORS),
        alpha: 0,
        decay: rnd(0.014, 0.026),
        delay: rnd(0, 150),
        fresh: true,
      });
    }

    // ── Flash overlay ──────────────────────────────────────────────
    let flash = 0;

    // ── Ambient plasma / aurora ────────────────────────────────────
    let t = 0;

    function drawAmbient() {
      const w = canvas.width;
      const h = canvas.height;

      // Pulsing top glow
      const v    = 0.03 + Math.sin(t * 0.012) * 0.015;
      const top  = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      top.addColorStop(0, `rgba(0,212,255,${v})`);
      top.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = top;
      ctx.fillRect(0, 0, w, h);

      // Corner arcs
      const pulse = 0.025 + Math.sin(t * 0.009) * 0.01;
      const tl = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.55);
      tl.addColorStop(0, `rgba(124,58,237,${pulse})`);
      tl.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = tl;
      ctx.fillRect(0, 0, w, h);

      const br = ctx.createRadialGradient(w, h, 0, w, h, w * 0.5);
      br.addColorStop(0, `rgba(0,212,255,${pulse * 0.6})`);
      br.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = br;
      ctx.fillRect(0, 0, w, h);
    }

    // ── Spawn schedule ─────────────────────────────────────────────
    // Using real time-based scheduling instead of frame comparison
    let nextSpawnAt = 0;

    function scheduleNextSpawn(now: number) {
      // 600-1800ms between spawns, sometimes double-strike
      nextSpawnAt = now + rnd(600, 1800);
    }

    // ── Main loop ──────────────────────────────────────────────────
    function loop(now: number) {
      if (!running) return;

      try {
        t++;
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Ambient always-on effects
        drawAmbient();

        // Screen flash
        if (flash > 0.01) {
          ctx.save();
          ctx.globalAlpha = flash * 0.13;
          ctx.fillStyle   = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.restore();
          flash *= 0.82;
        }

        // Spawn new strikes on schedule
        if (now >= nextSpawnAt) {
          spawnStrike();
          // 30% chance of double strike
          if (Math.random() < 0.3) spawnStrike();
          scheduleNextSpawn(now);
        }

        // Update and draw all strikes
        for (let i = strikes.length - 1; i >= 0; i--) {
          const s = strikes[i];

          if (s.delay > 0) {
            s.delay -= 16;
            continue;
          }

          // First frame of this strike
          if (s.fresh) {
            s.fresh  = false;
            s.alpha  = rnd(0.82, 1.0);
            flash    = Math.max(flash, s.alpha * 0.7);
            spawnSparks(s.x2, s.y2, Math.floor(rnd(8, 22)), s.color);
          }

          if (s.alpha > 0) {
            renderBolt(s.x1, s.y1, s.x2, s.y2, s.alpha, s.color, 4);
            s.alpha -= s.decay;
          } else {
            strikes.splice(i, 1);
          }
        }

        // Sparks
        tickSparks();

      } catch (_) {
        // Never let an error kill the loop
      }

      animId = requestAnimationFrame(loop);
    }

    // Kick off immediately
    scheduleNextSpawn(performance.now());
    animId = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  });
</script>

<canvas bind:this={canvas} class="lc" aria-hidden="true"></canvas>

<style>
  .lc {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    mix-blend-mode: screen;
  }
</style>
