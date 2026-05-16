/**
 * HorizontalCarousel.js
 * Creates an infinite horizontal loop for project cards that reacts to cursor position.
 */

class HorizontalCarousel {
    constructor(selector) {
        this.container = document.querySelector(selector);
        if (!this.container) return;
        
        this.track = this.container.querySelector('.carousel-track');
        this.items = Array.from(this.track.children);
        
        this.isMouseOver = false;
        this.mouseX = 0;
        this.currentX = 0;
        this.targetX = 0;
        this.scrollSpeed = 0.05;
        
        this.init();
    }

    init() {
        // Clone items for infinite effect
        this.cloneItems();
        
        // Setup mouse listeners
        this.setupListeners();
        
        // Start animation loop
        this.animate();
    }

    cloneItems() {
        // Clone items to fill space and enable seamless looping
        this.items.forEach(item => {
            const clone = item.cloneNode(true);
            this.track.appendChild(clone);
        });
        
        // Update items list to include clones
        this.allItems = Array.from(this.track.children);
    }

    setupListeners() {
        this.container.addEventListener('mouseenter', () => {
            this.isMouseOver = true;
        });

        this.container.addEventListener('mouseleave', () => {
            this.isMouseOver = false;
            // Slowly return to slow auto-scroll or stop
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isMouseOver) return;
            
            // Map mouse position to target translation
            // Center is 0, left is positive, right is negative
            const rect = this.container.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width; // 0 to 1
            
            // Map 0-1 to speed/direction
            this.targetX = (relX - 0.5) * -40; // Max speed multiplier
        });
    }

    animate() {
        // Calculate the actual width of one full set of items (including the gap)
        const firstItem = this.items[0];
        const lastItem = this.items[this.items.length - 1];
        const gap = parseFloat(getComputedStyle(this.track).gap) || 0;
        const setWidth = (lastItem.offsetLeft + lastItem.offsetWidth + gap) - firstItem.offsetLeft;

        const loop = () => {
            // Auto-scroll slowly if mouse is not over
            const baseSpeed = this.isMouseOver ? this.targetX : -1.2; 
            
            this.currentX += baseSpeed;
            
            // Seamless wrap logic
            if (this.currentX <= -setWidth) {
                this.currentX += setWidth;
            } else if (this.currentX > 0) {
                this.currentX -= setWidth;
            }
            
            gsap.set(this.track, { x: this.currentX });
            
            // Suble 3D tilt and SCALE based on distance from center
            this.allItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                const viewportCenter = window.innerWidth / 2;
                const itemCenter = rect.left + rect.width / 2;
                const distFromCenter = Math.abs(viewportCenter - itemCenter);
                
                // Calculate scale (1.2 at center, 0.8 at edges)
                const maxDist = window.innerWidth / 2;
                const normalizedDist = Math.min(distFromCenter / maxDist, 1);
                const scale = 1.15 - (normalizedDist * 0.35); // Scale from 1.15 down to 0.8
                const opacity = 1 - (normalizedDist * 0.4); // Fade out slightly on sides
                const rotation = (itemCenter - viewportCenter) * 0.03;
                
                gsap.set(item, { 
                    scale: scale,
                    opacity: opacity,
                    rotationY: rotation,
                    z: -distFromCenter * 0.2,
                    zIndex: Math.round(scale * 100) // Ensure centered item is on top
                });
            });

            requestAnimationFrame(loop);
        };
        
        requestAnimationFrame(loop);
    }
}

// Export for main.js
window.HorizontalCarousel = HorizontalCarousel;
