document.addEventListener('DOMContentLoaded', function () {
    var starColor = '#f1c40f';
    var starCount = 500;
    var starsContainer = document.querySelector('.stars-container');
    var stars = [];

    var physics = {
        mouseInfluence:  20,
        mouseRadius:     150,
        friction:        0.3,
        repulsionRadius: 60,
        repulsionForce:  5
    };

    var mouseX = null, mouseY = null;
    var mouseActive = false;

    /* ── Star creation ── */
    function initStars() {
        starsContainer.innerHTML = '';
        stars = [];
        for (var i = 0; i < starCount; i++) {
            createStar();
        }
    }

    function createStar() {
        var star = document.createElement('div');
        star.className = 'star';

        var size = Math.random() * 2 + 1;
        star.style.width  = size + 'px';
        star.style.height = size + 'px';

        var x = Math.random() * 100;
        var y = Math.random() * 100;
        star.style.left = x + '%';
        star.style.top  = y + '%';
        star.style.backgroundColor = starColor;

        starsContainer.appendChild(star);

        stars.push({
            element: star,
            x:    x * window.innerWidth  / 100,
            y:    y * window.innerHeight / 100,
            vx:   0,
            vy:   0,
            size: size
        });
    }

    /* ── Mouse tracking ── */
    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        mouseActive = true;
        spawnSparkle(e.clientX, e.clientY);
    });

    document.addEventListener('mouseleave', function () {
        mouseActive = false;
    });

    /* ── Sparkle cursor ── */
    var lastSparkle = 0;

    function spawnSparkle(x, y) {
        var now = Date.now();
        if (now - lastSparkle < 40) return;
        lastSparkle = now;

        var sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = x + 'px';
        sparkle.style.top  = y + 'px';
        sparkle.style.backgroundColor = starColor;
        document.body.appendChild(sparkle);

        setTimeout(function () {
            if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
        }, 1000);
    }

    /* ── Animation loop ── */
    function animate() {
        for (var i = 0; i < stars.length; i++) {
            var star = stars[i];
            var ax = 0, ay = 0;

            if (mouseActive && mouseX !== null) {
                var dx = mouseX - star.x;
                var dy = mouseY - star.y;
                var distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < physics.mouseRadius) {
                    var angle = Math.atan2(dy, dx);
                    var force = physics.mouseInfluence * (1 - distance / physics.mouseRadius);

                    ax += Math.cos(angle + Math.PI / 2) * force * 0.5;
                    ay += Math.sin(angle + Math.PI / 2) * force * 0.5;
                    ax += dx * 0.01;
                    ay += dy * 0.01;

                    if (distance < physics.repulsionRadius) {
                        var repulsion = physics.repulsionForce * (1 - distance / physics.repulsionRadius);
                        ax -= dx * repulsion * 0.1;
                        ay -= dy * repulsion * 0.1;
                    }
                }
            }

            for (var j = 0; j < stars.length; j++) {
                if (i === j) continue;
                var other = stars[j];
                var cdx  = other.x - star.x;
                var cdy  = other.y - star.y;
                var dist = Math.sqrt(cdx * cdx + cdy * cdy);
                var minD = (star.size + other.size) * 2;

                if (dist < minD) {
                    var cf = physics.repulsionForce * (1 - dist / minD);
                    ax -= cdx * cf * 0.05;
                    ay -= cdy * cf * 0.05;
                }
            }

            star.vx = star.vx * (1 - physics.friction) + ax;
            star.vy = star.vy * (1 - physics.friction) + ay;
            star.x += star.vx;
            star.y += star.vy;

            if (star.x < 0 || star.x > window.innerWidth) {
                star.x = Math.max(0, Math.min(window.innerWidth, star.x));
                star.vx *= -0.5;
            }
            if (star.y < 0 || star.y > window.innerHeight) {
                star.y = Math.max(0, Math.min(window.innerHeight, star.y));
                star.vy *= -0.5;
            }

            star.element.style.left = star.x + 'px';
            star.element.style.top  = star.y + 'px';

            var speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
            star.element.style.opacity = speed > 2 ? (0.7 + 0.3 * Math.random()) : 1;
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', function () {
        for (var i = 0; i < stars.length; i++) {
            stars[i].x = parseFloat(stars[i].element.style.left);
            stars[i].y = parseFloat(stars[i].element.style.top);
        }
    });

    if (starsContainer) {
        initStars();
        animate();
    }
});
