// ---------- Nav toggle ----------
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ---------- Flight path scroll progress ----------
const pathFg = document.getElementById('pathFg');
const droneMarker = document.getElementById('droneMarker');

function updateFlightPath() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
  pathFg.setAttribute('y2', (progress * 100).toFixed(2));
  droneMarker.style.top = `calc(${(progress * 100).toFixed(2)}vh - 14px)`;
}
window.addEventListener('scroll', updateFlightPath, { passive: true });
updateFlightPath();

// ---------- Reveal on scroll ----------
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// auto-add reveal class to major content blocks
document.querySelectorAll('.loop-statement, .service, .deliverables, .clients, .contact-inner, .output-card, .comp-card, .dcard, .band-card')
  .forEach(el => { el.classList.add('reveal'); revealObserver.observe(el); });

// ---------- BSF cycle stage reveal ----------
const cycleStages = document.querySelectorAll('.cycle-stage');
const cycleObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.3 });
cycleStages.forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.12}s`;
  cycleObserver.observe(el);
});

// ============================================================
// PROCEDURAL VISUALS
// ============================================================

// Simple seeded random for consistent-looking "data" patterns
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ---------- Hero NDVI cell field ----------
const ndviCells = document.getElementById('ndviCells');
if (ndviCells) {
  const rand = seededRandom(42);
  const cols = 24, rows = 15;
  const cw = 1440 / cols, ch = 900 / rows;
  const colors = ['#2E5A28', '#4A7C42', '#7FAE6A', '#9CCB5E', '#C9743D'];
  let html = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = rand();
      if (v > 0.82) {
        const colorIdx = Math.floor(rand() * colors.length);
        const x = c * cw, y = r * ch;
        html += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cw.toFixed(1)}" height="${ch.toFixed(1)}" fill="${colors[colorIdx]}" opacity="0" class="ndvi-flicker"/>`;
      }
    }
  }
  ndviCells.innerHTML = html;

  // staggered fade-in / pulse
  const flickers = ndviCells.querySelectorAll('.ndvi-flicker');
  flickers.forEach((el, i) => {
    setTimeout(() => {
      el.style.opacity = (0.08 + Math.random() * 0.1).toFixed(2);
    }, 200 + i * 40);
  });
  setInterval(() => {
    flickers.forEach(el => {
      if (Math.random() > 0.7) {
        el.style.opacity = (0.05 + Math.random() * 0.15).toFixed(2);
      }
    });
  }, 2200);
}

// ---------- NDVI map (deliverable showcase) ----------
const ndviGrid = document.getElementById('ndviGrid');
if (ndviGrid) {
  const rand = seededRandom(7);
  const cols = 28, rows = 21;
  const w = 560, h = 420;
  const cw = w / cols, ch = h / rows;
  const ramp = ['#8B3A2E', '#C9743D', '#E8D85E', '#9CCB5E', '#3D8B4A'];
  // create a smooth-ish field using simple value noise via averaged random
  const field = [];
  for (let r = 0; r < rows; r++) {
    field[r] = [];
    for (let c = 0; c < cols; c++) {
      field[r][c] = 0.55 + rand() * 0.4; // base healthy bias
    }
  }
  // carve a few stress patches
  const patches = [{r:5,c:6,rad:4},{r:14,c:20,rad:5},{r:9,c:14,rad:3}];
  patches.forEach(p => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const d = Math.hypot(r-p.r, c-p.c);
        if (d < p.rad) {
          field[r][c] = Math.max(0, field[r][c] - (1 - d/p.rad) * (0.5 + rand()*0.3));
        }
      }
    }
  });
  // smooth
  const smooth = [];
  for (let r = 0; r < rows; r++) {
    smooth[r] = [];
    for (let c = 0; c < cols; c++) {
      let sum = 0, count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const rr = r + dr, cc = c + dc;
          if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) {
            sum += field[rr][cc]; count++;
          }
        }
      }
      smooth[r][c] = sum / count;
    }
  }
  let html = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = smooth[r][c];
      const idx = Math.min(ramp.length - 1, Math.floor(v * ramp.length));
      const x = c * cw, y = r * ch;
      html += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(cw+0.3).toFixed(1)}" height="${(ch+0.3).toFixed(1)}" fill="${ramp[idx]}" opacity="0.85"/>`;
    }
  }
  ndviGrid.innerHTML = html;
}

// ---------- Small NDVI for deliverables card ----------
const ndviSmall = document.getElementById('ndviSmall');
if (ndviSmall) {
  const rand = seededRandom(19);
  const cols = 16, rows = 11;
  const w = 200, h = 140;
  const cw = w / cols, ch = h / rows;
  const ramp = ['#8B3A2E', '#C9743D', '#E8D85E', '#9CCB5E', '#3D8B4A'];
  const field = [];
  for (let r = 0; r < rows; r++) {
    field[r] = [];
    for (let c = 0; c < cols; c++) field[r][c] = 0.55 + rand() * 0.4;
  }
  const patches = [{r:3,c:4,rad:3},{r:7,c:11,rad:3}];
  patches.forEach(p => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const d = Math.hypot(r-p.r, c-p.c);
        if (d < p.rad) field[r][c] = Math.max(0, field[r][c] - (1 - d/p.rad) * (0.5 + rand()*0.3));
      }
    }
  });
  const smooth = [];
  for (let r = 0; r < rows; r++) {
    smooth[r] = [];
    for (let c = 0; c < cols; c++) {
      let sum = 0, count = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const rr = r+dr, cc = c+dc;
          if (rr>=0 && rr<rows && cc>=0 && cc<cols) { sum += field[rr][cc]; count++; }
        }
      smooth[r][c] = sum/count;
    }
  }
  let html = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = smooth[r][c];
      const idx = Math.min(ramp.length-1, Math.floor(v*ramp.length));
      html += `<rect x="${(c*cw).toFixed(1)}" y="${(r*ch).toFixed(1)}" width="${(cw+0.3).toFixed(1)}" height="${(ch+0.3).toFixed(1)}" fill="${ramp[idx]}" opacity="0.85"/>`;
    }
  }
  ndviSmall.innerHTML = html;
}

// ---------- Orthomosaic grid (field plots) ----------
const orthoGrid = document.getElementById('orthoGrid');
if (orthoGrid) {
  const rand = seededRandom(33);
  let html = '';
  const plots = [
    {x:10,y:10,w:80,h:55,c:'#4A7C42'},
    {x:95,y:10,w:55,h:55,c:'#7FAE6A'},
    {x:155,y:10,w:35,h:55,c:'#2E5A28'},
    {x:10,y:70,w:60,h:60,c:'#6FCB6A'},
    {x:75,y:70,w:50,h:60,c:'#4A7C42'},
    {x:130,y:70,w:60,h:60,c:'#3D8B4A'},
  ];
  plots.forEach(p => {
    html += `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${p.c}" opacity="0.8"/>`;
    // furrow lines
    for (let i = 0; i < p.w; i += 6) {
      html += `<line x1="${p.x+i}" y1="${p.y}" x2="${p.x+i}" y2="${p.y+p.h}" stroke="#1A2E26" stroke-width="0.5" opacity="0.25"/>`;
    }
  });
  html += `<g stroke="#E8FF5E" stroke-width="1" fill="none" opacity="0.6"><rect x="10" y="10" width="180" height="120"/></g>`;
  orthoGrid.innerHTML = html;
}

// ---------- Stress / anomaly map ----------
const stressMap = document.getElementById('stressMap');
if (stressMap) {
  const rand = seededRandom(55);
  let html = '<rect width="200" height="140" fill="#1A2E26"/>';
  // base healthy grid
  for (let i = 0; i < 60; i++) {
    const x = rand()*200, y = rand()*140, r = 1.5 + rand()*2;
    html += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#3D8B4A" opacity="${(0.2+rand()*0.3).toFixed(2)}"/>`;
  }
  // stress hotspots
  const hotspots = [{x:60,y:50},{x:140,y:90},{x:100,y:30}];
  hotspots.forEach(h => {
    for (let i = 0; i < 14; i++) {
      const ang = rand()*Math.PI*2, dist = rand()*22;
      const x = h.x + Math.cos(ang)*dist, y = h.y + Math.sin(ang)*dist;
      html += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2+rand()*3).toFixed(1)}" fill="#C9743D" opacity="${(0.4+rand()*0.4).toFixed(2)}"/>`;
    }
    html += `<circle cx="${h.x}" cy="${h.y}" r="26" fill="none" stroke="#E8FF5E" stroke-width="1" stroke-dasharray="3 3" opacity="0.7"/>`;
  });
  stressMap.innerHTML = html;
}

// ---------- Time-series change map ----------
const changeMap = document.getElementById('changeMap');
if (changeMap) {
  const rand = seededRandom(88);
  let html = '';
  const cols = 16, rows = 11;
  const cw = 200/cols, ch = 140/rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = rand();
      let fill = '#3D8B4A', op = 0.15;
      if (v > 0.88) { fill = '#9CCB5E'; op = 0.9; } // improvement
      else if (v > 0.80) { fill = '#C9743D'; op = 0.8; } // decline
      else { op = 0.1 + rand()*0.2; }
      html += `<rect x="${(c*cw).toFixed(1)}" y="${(r*ch).toFixed(1)}" width="${(cw+0.3).toFixed(1)}" height="${(ch+0.3).toFixed(1)}" fill="${fill}" opacity="${op.toFixed(2)}"/>`;
    }
  }
  changeMap.innerHTML = `<rect width="200" height="140" fill="#1A2E26"/>` + html;
}
