class TargetCursor {
    constructor(options = {}) {
        this.targetSelector = options.targetSelector || '.cursor-target';
        this.spinDuration = options.spinDuration || 2;
        this.hideDefaultCursor = options.hideDefaultCursor !== undefined ? options.hideDefaultCursor : true;
        this.hoverDuration = options.hoverDuration || 0.9; // User requested 0.9
        this.parallaxOn = options.parallaxOn !== undefined ? options.parallaxOn : true;

        this.cursor = null;
        this.corners = [];
        this.dot = null;
        this.spinTl = null;
        this.activeTarget = null;
        this.activeStrength = { current: 0 };
        this.targetCornerPositions = null;
        this.borderWidth = 3;
        this.cornerSize = 12;

        this.init();
    }



    init() {
        this.createCursorElement();
        this.setupStyles();
        this.setupEventListeners();
        this.createSpinTimeline();
        this.startTicker();
        this.addAutoTargets();
    }

    createCursorElement() {
        const wrapper = document.createElement('div');
        wrapper.className = 'target-cursor-wrapper';
        wrapper.innerHTML = `
            <div class="target-cursor-dot"></div>
            <div class="target-cursor-corner corner-tl"></div>
            <div class="target-cursor-corner corner-tr"></div>
            <div class="target-cursor-corner corner-br"></div>
            <div class="target-cursor-corner corner-bl"></div>
            <div class="target-cursor-tip"></div>
        `;
        document.body.appendChild(wrapper);
        this.cursor = wrapper;
        this.corners = wrapper.querySelectorAll('.target-cursor-corner');
        this.dot = wrapper.querySelector('.target-cursor-dot');
        this.tip = wrapper.querySelector('.target-cursor-tip');

        gsap.set(this.cursor, {
            xPercent: -50,
            yPercent: -50,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        });
    }

    setupStyles() {
        if (this.hideDefaultCursor) {
            document.body.classList.add('hide-cursor');
        }
    }

    setupEventListeners() {
        window.addEventListener('mousemove', (e) => {
            gsap.to(this.cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: 'power3.out'
            });
        });

        window.addEventListener('mousedown', () => {
            gsap.to(this.dot, { scale: 0.7, duration: 0.3 });
            gsap.to(this.cursor, { scale: 0.9, duration: 0.2 });
        });

        window.addEventListener('mouseup', () => {
            gsap.to(this.dot, { scale: 1, duration: 0.3 });
            gsap.to(this.cursor, { scale: 1, duration: 0.2 });
        });

        window.addEventListener('mouseover', (e) => {
            const target = e.target.closest(this.targetSelector);
            if (target && target !== this.activeTarget) {
                this.handleEnter(target);
            }
        });

        window.addEventListener('scroll', () => {
            if (!this.activeTarget) return;
            const mouseX = gsap.getProperty(this.cursor, 'x');
            const mouseY = gsap.getProperty(this.cursor, 'y');
            const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
            if (!elementUnderMouse || !elementUnderMouse.closest(this.targetSelector)) {
                this.handleLeave();
            }
        }, { passive: true });

        // Touch support for mobile
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                gsap.to(this.cursor, {
                    x: touch.clientX,
                    y: touch.clientY,
                    duration: 0.1,
                    ease: 'power3.out'
                });
                gsap.to(this.cursor, { opacity: 1, duration: 0.2 });
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                gsap.to(this.cursor, {
                    x: touch.clientX,
                    y: touch.clientY,
                    duration: 0.1,
                    ease: 'power3.out'
                });
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            gsap.to(this.cursor, { opacity: 0, duration: 0.5, delay: 1 });
        }, { passive: true });
    }

    createSpinTimeline() {
        if (this.spinTl) this.spinTl.kill();
        this.spinTl = gsap.timeline({ repeat: -1 })
            .to(this.cursor, { rotation: '+=360', duration: this.spinDuration, ease: 'none' });
    }

    startTicker() {
        gsap.ticker.add(() => {
            if (this.activeStrength.current === 0) return;

            // Update target positions if we are hovering an element
            if (this.activeTarget) {
                const rect = this.activeTarget.getBoundingClientRect();
                this.targetCornerPositions = [
                    { x: rect.left - this.borderWidth, y: rect.top - this.borderWidth },
                    { x: rect.right + this.borderWidth - this.cornerSize, y: rect.top - this.borderWidth },
                    { x: rect.right + this.borderWidth - this.cornerSize, y: rect.bottom + this.borderWidth - this.cornerSize },
                    { x: rect.left - this.borderWidth, y: rect.bottom + this.borderWidth - this.cornerSize }
                ];
            }

            if (!this.targetCornerPositions) return;

            const cursorX = gsap.getProperty(this.cursor, 'x');
            const cursorY = gsap.getProperty(this.cursor, 'y');
            const strength = this.activeStrength.current;

            this.corners.forEach((corner, i) => {
                const currentX = gsap.getProperty(corner, 'x');
                const currentY = gsap.getProperty(corner, 'y');

                const targetX = this.targetCornerPositions[i].x - cursorX;
                const targetY = this.targetCornerPositions[i].y - cursorY;

                const finalX = currentX + (targetX - currentX) * strength;
                const finalY = currentY + (targetY - currentY) * strength;

                const duration = strength >= 0.99 ? (this.parallaxOn ? 0.2 : 0) : 0.05;

                gsap.to(corner, {
                    x: finalX,
                    y: finalY,
                    duration: duration,
                    ease: duration === 0 ? 'none' : 'power1.out',
                    overwrite: 'auto'
                });
            });
        });
    }

    addAutoTargets() {
        // Automatically add cursor-target class to interactive elements
        const elements = document.querySelectorAll('a, button, input[type="submit"], .btn, .nav-link, .social-links a');
        elements.forEach(el => el.classList.add('cursor-target'));
    }

    handleEnter(target) {
        this.activeTarget = target;
        this.spinTl.pause();
        gsap.to(this.cursor, { rotation: 0, duration: 0.2 });

        // Handle Tooltip
        const tipText = target.getAttribute('data-cursor-tip');
        if (tipText) {
            this.tip.textContent = tipText;
            gsap.to(this.tip, { opacity: 1, y: -20, duration: 0.3, ease: 'power2.out' });
        }

        const rect = target.getBoundingClientRect();
        this.targetCornerPositions = [
            { x: rect.left - this.borderWidth, y: rect.top - this.borderWidth },
            { x: rect.right + this.borderWidth - this.cornerSize, y: rect.top - this.borderWidth },
            { x: rect.right + this.borderWidth - this.cornerSize, y: rect.bottom + this.borderWidth - this.cornerSize },
            { x: rect.left - this.borderWidth, y: rect.bottom + this.borderWidth - this.cornerSize }
        ];

        gsap.to(this.activeStrength, {
            current: 1,
            duration: this.hoverDuration,
            ease: 'power2.out'
        });

        const leaveHandler = () => {
            this.handleLeave();
            target.removeEventListener('mouseleave', leaveHandler);
        };
        target.addEventListener('mouseleave', leaveHandler);
    }

    handleLeave() {
        if (!this.activeTarget) return;
        
        // Hide Tooltip
        gsap.to(this.tip, { opacity: 0, y: 0, duration: 0.2 });

        this.activeTarget = null;
        this.targetCornerPositions = null;
        gsap.set(this.activeStrength, { current: 0, overwrite: true });

        const positions = [
            { x: -this.cornerSize * 1.5, y: -this.cornerSize * 1.5 },
            { x: this.cornerSize * 0.5, y: -this.cornerSize * 1.5 },
            { x: this.cornerSize * 0.5, y: this.cornerSize * 0.5 },
            { x: -this.cornerSize * 1.5, y: this.cornerSize * 0.5 }
        ];

        this.corners.forEach((corner, i) => {
            gsap.to(corner, {
                x: positions[i].x,
                y: positions[i].y,
                duration: 0.3,
                ease: 'power3.out'
            });
        });

        setTimeout(() => {
            if (!this.activeTarget) {
                this.spinTl.restart();
            }
        }, 50);
    }
}

// Robust initialization
function initCursor() {
    if (window.targetCursor) return; // Prevent double init
    window.targetCursor = new TargetCursor({
        spinDuration: 2,
        hideDefaultCursor: true,
        parallaxOn: true,
        hoverDuration: 0.9
    });
    console.log("TargetCursor: Initialized");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCursor);
} else {
    initCursor();
}
