document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) return; // Skip 3D tilt on mobile

    const ROTATE_AMPLITUDE = 12;
    const SCALE_ON_HOVER = 1.05;

    const certCards = document.querySelectorAll('.cert-card');

    certCards.forEach(card => {
        // Make card position relative for overlays
        card.style.position = 'relative';
        card.style.overflow = 'hidden';

        // Create glare overlay
        const glare = document.createElement('div');
        glare.className = 'tilt-glare';
        card.appendChild(glare);

        // Create floating caption
        const caption = document.createElement('div');
        caption.className = 'tilt-caption';
        const titleEl = card.querySelector('.cert-title h3');
        caption.textContent = titleEl ? titleEl.textContent : '';
        card.appendChild(caption);

        // Mouse move → 3D tilt + glare + caption
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const offsetX = e.clientX - rect.left - rect.width / 2;
            const offsetY = e.clientY - rect.top - rect.height / 2;

            const rotateX = (offsetY / (rect.height / 2)) * -ROTATE_AMPLITUDE;
            const rotateY = (offsetX / (rect.width / 2)) * ROTATE_AMPLITUDE;

            // Apply 3D transform
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                scale: SCALE_ON_HOVER,
                duration: 0.3,
                ease: 'power2.out',
                overwrite: 'auto'
            });

            // Move glare
            const glareX = ((e.clientX - rect.left) / rect.width) * 100;
            const glareY = ((e.clientY - rect.top) / rect.height) * 100;
            glare.style.setProperty('--glare-x', glareX + '%');
            glare.style.setProperty('--glare-y', glareY + '%');

            // Move caption to cursor position
            gsap.to(caption, {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top - 30,
                opacity: 1,
                duration: 0.2,
                ease: 'power2.out'
            });

            card.classList.add('tilting');
        });

        // Mouse enter
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                scale: SCALE_ON_HOVER,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        // Mouse leave → reset
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)',
                overwrite: 'auto'
            });
            gsap.to(caption, {
                opacity: 0,
                duration: 0.2
            });
            card.classList.remove('tilting');
        });
    });
});
