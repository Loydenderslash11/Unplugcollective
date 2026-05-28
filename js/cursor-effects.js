/* ============================================================
   The Unplug Collective — js/cursor-effects.js
   Full physics star system with mouse attraction/repulsion,
   star-to-star collisions, friction, sparkle cursor effects,
   star color picker and count slider controls.
   ============================================================ */

(function () {
  'use strict';

  /* ── State ─────────────────────────────────────────────── */
  var stars        = [];
  var mouse        = { x: -9999, y: -9999 };
  var starColor    = '#f1c40f';
  var starCount    = 500;
  var container    = null;
  var animFrameId  = null;
  var lastTime     = 0;

  /* ── Config ────────────────────────────────────────────── */
  var CONFIG = {
    minSize:         1,
    maxSize:         4,
    mouseRadius:     120,
    attractForce:    0.04,
    repelForce:      0.12,
    friction:        0.92,
    collisionRadius: 6,
    maxSpeed:        4
  };

  /* ── Star factory ──────────────────────────────────────── */
  function createStar() {
    var size = Math.random() * (CONFIG.maxSize - CONFIG.minSize) + CONFIG.minSize;
    var el   = document.createElement('div');
    el.classList.add('star');
    el.style.width   = size + 'px';
    el.style.height  = size + 'px';
    el.style.background = starColor;
    el.style.position   = 'absolute';
    el.style.borderRadius = '50%';
    el.style.pointerEvents = 'none';

    var x = Math.random() * window.innerWidth;
    var y = Math.random() * window.innerHeight;

    el.style.left = x + 'px';
    el.style.top  = y + 'px';

    if (container) container.appendChild(el);

    return {
      el:   el,
      x:    x,
      y:    y,
      vx:   (Math.random() - 0.5) * 0.6,
      vy:   (Math.random() - 0.5) * 0.6,
      size: size,
      baseOpacity: Math.random() * 0.6 + 0.4
    };
  }

  /* ── Initialize / reinitialize star field ──────────────── */
  function initStars() {
    // Remove existing stars
    stars.forEach(function (s) {
      if (s.el && s.el.parentNode) s.el.parentNode.removeChild(s.el);
    });
    stars = [];

    container = document.querySelector('.stars-container');
    if (!container) return;

    // Clear any basic stars added by main.js
    container.innerHTML = '';

    for (var i = 0; i < starCount; i++) {
      stars.push(createStar());
    }
  }

  /* ── Physics animation loop ────────────────────────────── */
  function animate(timestamp) {
    animFrameId = requestAnimationFrame(animate);

    var dt = timestamp - lastTime;
    lastTime = timestamp;
    if (dt > 100) dt = 100; // cap large gaps (tab was hidden etc.)

    var W = window.innerWidth;
    var H = window.innerHeight;

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];

      /* Mouse influence */
      var dx = mouse.x - s.x;
      var dy = mouse.y - s.y;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;

      if (dist < CONFIG.mouseRadius) {
        var factor = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
        /* Left button held → attract; otherwise → repel */
        if (mouseDown) {
          s.vx += (dx / dist) * factor * CONFIG.attractForce;
          s.vy += (dy / dist) * factor * CONFIG.attractForce;
        } else {
          s.vx -= (dx / dist) * factor * CONFIG.repelForce;
          s.vy -= (dy / dist) * factor * CONFIG.repelForce;
        }
      }

      /* Star-to-star collision (only check nearby — sample 20 random) */
      var checks = Math.min(20, stars.length);
      for (var j = 0; j < checks; j++) {
        var k = Math.floor(Math.random() * stars.length);
        if (k === i) continue;
        var other = stars[k];
        var cdx   = s.x - other.x;
        var cdy   = s.y - other.y;
        var cdist = Math.sqrt(cdx * cdx + cdy * cdy) || 1;
        var minD  = (s.size + other.size) * 0.5 + CONFIG.collisionRadius;
        if (cdist < minD) {
          var overlap = minD - cdist;
          var nx = cdx / cdist;
          var ny = cdy / cdist;
          // Simple elastic-ish push
          s.vx     += nx * overlap * 0.05;
          s.vy     += ny * overlap * 0.05;
          other.vx -= nx * overlap * 0.05;
          other.vy -= ny * overlap * 0.05;
        }
      }

      /* Friction */
      s.vx *= CONFIG.friction;
      s.vy *= CONFIG.friction;

      /* Speed limit */
      var speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      if (speed > CONFIG.maxSpeed) {
        s.vx = (s.vx / speed) * CONFIG.maxSpeed;
        s.vy = (s.vy / speed) * CONFIG.maxSpeed;
      }

      /* Move */
      s.x += s.vx;
      s.y += s.vy;

      /* Wrap around edges */
      if (s.x < 0)  s.x = W;
      if (s.x > W)  s.x = 0;
      if (s.y < 0)  s.y = H;
      if (s.y > H)  s.y = 0;

      /* Apply to DOM */
      s.el.style.left = s.x + 'px';
      s.el.style.top  = s.y + 'px';
    }
  }

  /* ── Mouse tracking ────────────────────────────────────── */
  var mouseDown = false;

  document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    spawnSparkle(e.clientX, e.clientY);
  }, { passive: true });

  document.addEventListener('mousedown', function () { mouseDown = true;  });
  document.addEventListener('mouseup',   function () { mouseDown = false; });

  /* ── Cursor sparkles ───────────────────────────────────── */
  var lastSparkle = 0;
  var SPARKLE_THROTTLE = 40; // ms between sparkles

  function spawnSparkle(x, y) {
    var now = Date.now();
    if (now - lastSparkle < SPARKLE_THROTTLE) return;
    lastSparkle = now;

    var sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    sparkle.style.left = x + 'px';
    sparkle.style.top  = y + 'px';
    sparkle.style.background = starColor;
    sparkle.style.boxShadow  = '0 0 6px ' + starColor + ', 0 0 12px ' + starColor + '80';

    // Randomize size slightly
    var sz = Math.random() * 6 + 4;
    sparkle.style.width  = sz + 'px';
    sparkle.style.height = sz + 'px';

    document.body.appendChild(sparkle);

    // Remove after animation completes
    setTimeout(function () {
      if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
    }, 650);
  }

  /* ── Star controls panel ───────────────────────────────── */
  function buildControlsPanel() {
    // Check if controls already exist in HTML (added by HTML update)
    if (document.querySelector('.star-controls')) return;

    var panel = document.createElement('div');
    panel.classList.add('star-controls');
    panel.innerHTML =
      '<label>Star Color' +
        '<input type="color" id="starColorPicker" value="#f1c40f" />' +
      '</label>' +
      '<label style="flex-direction:column;align-items:flex-start;gap:0.3rem;">' +
        'Stars: <span id="starCountVal">500</span>' +
        '<input type="range" id="starCountSlider" min="0" max="2500" value="500" />' +
      '</label>';

    document.body.appendChild(panel);
    bindControlEvents();
  }

  function bindControlEvents() {
    var colorPicker = document.getElementById('starColorPicker');
    var countSlider = document.getElementById('starCountSlider');
    var countLabel  = document.getElementById('starCountVal');

    if (colorPicker) {
      colorPicker.addEventListener('input', function () {
        starColor = this.value;
        // Update all existing star colors
        stars.forEach(function (s) { s.el.style.background = starColor; });
      });
    }

    if (countSlider) {
      countSlider.addEventListener('input', function () {
        starCount = parseInt(this.value, 10);
        if (countLabel) countLabel.textContent = starCount;
        initStars();
      });
    }
  }

  /* ── Handle window resize ──────────────────────────────── */
  window.addEventListener('resize', function () {
    // Re-clamp stars that are now off-screen (they will wrap naturally)
  }, { passive: true });

  /* ── Bootstrap ─────────────────────────────────────────── */
  function boot() {
    container = document.querySelector('.stars-container');
    if (!container) {
      // Create container if missing
      container = document.createElement('div');
      container.classList.add('stars-container');
      document.body.insertBefore(container, document.body.firstChild);
    }

    initStars();
    buildControlsPanel();
    bindControlEvents();

    // Start animation loop
    animFrameId = requestAnimationFrame(function (ts) {
      lastTime = ts;
      animate(ts);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
