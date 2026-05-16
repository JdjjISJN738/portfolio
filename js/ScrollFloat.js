document.addEventListener('DOMContentLoaded', () => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    const initScrollFloat = () => {
        const sectionTitles = document.querySelectorAll('.section-title');

        sectionTitles.forEach((el) => {
            // Get text and split into characters
            const text = el.textContent.trim();
            el.innerHTML = ''; // Clear original text

            const wrapper = document.createElement('span');
            wrapper.className = 'scroll-float-text';

            // Split text and create spans for each character
            text.split('').forEach((char) => {
                const span = document.createElement('span');
                span.className = 'char';
                // Handle spaces
                if (char === ' ') {
                    span.innerHTML = '&nbsp;';
                } else {
                    span.textContent = char;
                }
                wrapper.appendChild(span);
            });

            el.appendChild(wrapper);

            const charElements = el.querySelectorAll('.char');

            // Apply GSAP animation
            gsap.fromTo(
                charElements,
                {
                    willChange: 'opacity, transform',
                    opacity: 0,
                    yPercent: 120,
                    scaleY: 2.3,
                    scaleX: 0.7,
                    transformOrigin: '50% 0%'
                },
                {
                    duration: 1, // animationDuration
                    ease: 'back.inOut(2)', // ease
                    opacity: 1,
                    yPercent: 0,
                    scaleY: 1,
                    scaleX: 1,
                    stagger: 0.03, // stagger
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom-=10%', // scrollStart - adjusted for better trigger
                        end: 'bottom center', // scrollEnd - adjusted for better visibility
                        scrub: true,
                        // markers: true, // Uncomment for debugging
                    }
                }
            );
        });
    };

    // Initialize the animation
    initScrollFloat();
});
