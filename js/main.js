document.addEventListener('DOMContentLoaded', function() {
    // Preloader Hiding Logic (Optimized for speed)
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Fade out as soon as the DOM is ready for a faster feel
        // We still check window load as a fallback for slow connections
        const hidePreloader = () => {
            if (!preloader.classList.contains('fade-out')) {
                preloader.classList.add('fade-out');
                console.log("Preloader: Hidden");
            }
        };

        // Trigger on DOMContentLoaded (already inside the listener)
        setTimeout(hidePreloader, 300); // Very short delay for visual polish
        
        // Fallback for safety
        window.addEventListener('load', hidePreloader);
    }

    // Navigation elements
    const showMenu = document.getElementById('showMenu');
    const navMenu = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-item');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Animate navigation items in sequence
    function animateNavItems() {
        navItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, 100 * index);
        });
    }
    
    // Initialize navigation animation
    animateNavItems();
    
    // Toggle mobile menu
    if (showMenu) {
        showMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            
            // Toggle between bars and times icon
            if (navMenu.classList.contains('active')) {
                showMenu.classList.remove('fa-bars');
                showMenu.classList.add('fa-times');
            } else {
                showMenu.classList.remove('fa-times');
                showMenu.classList.add('fa-bars');
            }
            
            // Re-trigger animation when menu is opened
            if (navMenu.classList.contains('active')) {
                navItems.forEach(item => item.classList.remove('visible'));
                setTimeout(animateNavItems, 50);
            }
        });
    }
    
    // Close mobile menu when clicking on a nav item
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 991) {
                navMenu.classList.remove('active');
                showMenu.classList.remove('fa-times');
                showMenu.classList.add('fa-bars');
            }
            
            // Add active class to clicked link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            navLinks.forEach(l => l.removeAttribute('aria-current'));
            link.setAttribute('aria-current', 'page');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-links') && !e.target.matches('#showMenu')) {
            navMenu.classList.remove('active');
            if (showMenu) {
                showMenu.classList.remove('fa-times');
                showMenu.classList.add('fa-bars');
            }
        }
    });
    
    // Sticky Header on Scroll
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add/remove scrolled class based on scroll position
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Show/hide header on scroll direction
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scroll Down
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Scroll Up
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        
        lastScroll = currentScroll;
        
        // Update active section
        updateActiveSection();
    });
    
    // Header reveal on proximity to top (desktop + mobile)
    if (header) {
        const enableAutoHide = () => {
            header.classList.add('auto-hide');
            header.classList.remove('reveal');
        };
        
        const disableAutoHide = () => {
            header.classList.remove('auto-hide');
            header.classList.add('reveal');
        };
        
        // Start with auto-hide on all viewports
        enableAutoHide();
        
        const navLinksEl = document.querySelector('.nav-links');
        const revealIfNearTop = (y) => {
            if (y < 90) {
                disableAutoHide();
            } else if (!navLinksEl || !navLinksEl.classList.contains('active')) {
                enableAutoHide();
            }
        };
        
        // Pointer/mouse movement (desktop + touch-enabled browsers)
        window.addEventListener('pointermove', (e) => {
            if (typeof e.clientY === 'number') {
                revealIfNearTop(e.clientY);
            }
        }, { passive: true });
        
        // Touch support (mobile)
        window.addEventListener('touchstart', (e) => {
            const y = e.touches && e.touches.length ? e.touches[0].clientY : 0;
            revealIfNearTop(y);
        }, { passive: true });
        
        window.addEventListener('touchmove', (e) => {
            const y = e.touches && e.touches.length ? e.touches[0].clientY : 0;
            revealIfNearTop(y);
        }, { passive: true });
        
        // Ensure header is revealed when menu opens
        document.addEventListener('click', (e) => {
            if (navLinksEl && navLinksEl.classList.contains('active')) {
                disableAutoHide();
            }
        });
        
        // Reveal when pointer enters header itself
        header.addEventListener('pointerenter', disableAutoHide);
    }
    
    // Typing Animation
    const typedTextSpan = document.querySelector('.typing');
    if (typedTextSpan) {
        // Clear any existing text before starting animation
        typedTextSpan.textContent = '';
        
        const textArray = ['Graphic Designer', 'Frontend Developer', 'UI/UX Designer'];
        const typingDelay = 100;
        const erasingDelay = 50;
        const newTextDelay = 2000;
        let textArrayIndex = 0;
        let charIndex = 0;
        
        function type() {
            if (charIndex < textArray[textArrayIndex].length) {
                typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
                charIndex++;
                setTimeout(type, typingDelay);
            } else {
                setTimeout(erase, newTextDelay);
            }
        }
        
        function erase() {
            if (charIndex > 0) {
                typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
                charIndex--;
                setTimeout(erase, erasingDelay);
            } else {
                textArrayIndex = (textArrayIndex + 1) % textArray.length;
                setTimeout(type, typingDelay + 1100);
            }
        }
        
        // Start the typing effect on page load
        if (textArray.length) setTimeout(type, newTextDelay + 250);
    }
    
    // Smooth Scrolling for Anchor Links with active state
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Update URL hash without page jump
                history.pushState(null, null, targetId);
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Update active state
                updateActiveSection();
            }
        });
    });
    
    // Update active section in navigation
    function updateActiveSection() {
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all nav items
                navItems.forEach(item => item.classList.remove('active'));
                
                // Add active class to corresponding nav item
                const activeNavItem = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
                if (activeNavItem) {
                    activeNavItem.classList.add('active');
                    navLinks.forEach(l => l.removeAttribute('aria-current'));
                    activeNavItem.setAttribute('aria-current', 'page');
                }
            }
        });
    }
    
    // Set initial active section
    updateActiveSection();
    
    // Handle back/forward navigation
    window.addEventListener('popstate', function() {
        updateActiveSection();
    });
    
    // Removed duplicate navigation highlight; updateActiveSection handles active state.
    
    // Animate Skills on Scroll
    const skillBars = document.querySelectorAll('.progress');
    
    function animateSkills() {
        skillBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        bar.style.width = width;
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(bar);
        });
    }
    
    // Back to Top Button
    const backToTopBtn = document.querySelector('.back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('active');
            } else {
                backToTopBtn.classList.remove('active');
            }
        });
        
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Enhanced contact items functionality
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't interfere with link clicks
            if (e.target.tagName === 'A') return;
            
            const link = this.querySelector('a');
            const span = this.querySelector('span');
            const textToCopy = link ? link.textContent : (span ? span.textContent : '');
            
            if (textToCopy) {
                copyToClipboard(textToCopy);
                showCopyFeedback(this);
            }
        });
    });
    
    // Copy to clipboard function
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }
    
    // Show copy feedback
    function showCopyFeedback(element) {
        const originalHTML = element.innerHTML;
        const feedbackIcon = '<i class="fas fa-check"></i>';
        
        // Add checkmark icon
        const icon = element.querySelector('i');
        if (icon) {
            const originalIcon = icon.className;
            icon.className = 'fas fa-check';
            icon.style.color = '#10b981';
            
            setTimeout(() => {
                icon.className = originalIcon;
                icon.style.color = '';
            }, 2000);
        }
        
        // Show tooltip
        const tooltip = document.createElement('div');
        tooltip.textContent = 'Copied!';
        tooltip.style.cssText = `
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: #10b981;
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
            z-index: 1000;
            animation: fadeInOut 2s ease;
        `;
        
        element.style.position = 'relative';
        element.appendChild(tooltip);
        
        setTimeout(() => tooltip.remove(), 2000);
    }
    
    // Add fadeInOut animation
    const tooltipStyle = document.createElement('style');
    tooltipStyle.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(-5px); }
            20% { opacity: 1; transform: translateX(-50%) translateY(0); }
            80% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-5px); }
        }
    `;
    document.head.appendChild(tooltipStyle);
    
    // Enhanced form submission handling with Formspree backend
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        // Validate Formspree endpoint on page load
        
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Validate form data
            if (!validateForm(formObject)) {
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            
            
            // Submit to Web3Forms
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: JSON.stringify(formObject),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then(data => {
                        if (data.message) {
                            throw new Error(data.message);
                        }
                        throw new Error(`Server error: ${response.status}`);
                    });
                }
            })
            .then(data => {
                if (data.success) {
                    showFormMessage('success', 'Message sent successfully! I will get back to you soon.');
                    this.reset();
                } else {
                    throw new Error(data.message || 'Submission failed');
                }
            })
            .catch(error => {
                showFormMessage('error', error.message || 'Failed to send message. Please try again.');
            })
            .finally(() => {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                
            });
        });
    }
    
    // Alternative: Add EmailJS functionality (uncomment and configure if you have EmailJS)
    /*
    // Initialize EmailJS (replace with your actual service details)
    emailjs.init("YOUR_PUBLIC_KEY");
    
    // Enhanced form submission with EmailJS
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Validate form data
            if (!validateForm(formObject)) {
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Send email using EmailJS
            emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formObject)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    showFormMessage('success', 'Message sent successfully! I will get back to you soon.');
                    contactForm.reset();
                }, function(error) {
                    console.log('FAILED...', error);
                    showFormMessage('error', 'Failed to send message. Please try again or email directly.');
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    }
    */
    
    // Form validation function
    function validateForm(data) {
        const errors = [];
        
        // Name validation
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            errors.push('Please enter a valid email address');
        }
        
        // Subject validation
        if (!data.subject || data.subject.trim().length < 3) {
            errors.push('Subject must be at least 3 characters long');
        }
        
        // Message validation
        if (!data.message || data.message.trim().length < 10) {
            errors.push('Message must be at least 10 characters long');
        }
        
        // Show errors if any
        if (errors.length > 0) {
            showFormMessage('error', errors.join('<br>'));
            return false;
        }
        
        return true;
    }
    
    // Show form message function
    function showFormMessage(type, message) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message form-message-${type}`;
        messageDiv.innerHTML = message;
        
        // Style the message
        messageDiv.style.cssText = `
            padding: 1rem 1.5rem;
            margin: 1rem 0;
            border-radius: 8px;
            font-weight: 500;
            animation: slideDown 0.3s ease-out;
            ${type === 'success' 
                ? 'background: #10b981; color: white; border: 1px solid #059669;' 
                : 'background: #ef4444; color: white; border: 1px solid #dc2626;'
            }
        `;
        
        // Find the contact form and insert message after it
        const contactForm = document.querySelector('.contact-form');
        if (contactForm && contactForm.parentNode) {
            contactForm.parentNode.insertBefore(messageDiv, contactForm.nextSibling);
        } else {
            
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideUp 0.3s ease-out';
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, 5000);
    }
    
    // Add CSS animations for form messages
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
    
    // Set current year in footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Initialize animations when the page loads
    window.addEventListener('load', () => {
        // Animate skills when skills section is in view
        const skillsSection = document.getElementById('skills');
        if (skillsSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateSkills();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            
            observer.observe(skillsSection);
        }
        
        // Animate achievements timeline items on scroll
        const timelineItems = document.querySelectorAll('.timeline-item');
        if (timelineItems.length) {
            const timelineObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        timelineObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            
            timelineItems.forEach(item => timelineObserver.observe(item));
        }
        
        // Add fade-in animation to elements on scroll
        const fadeElements = document.querySelectorAll('.section, .project-card, .about-content > div, .contact-container > div, .form-label');
        
        const fadeInOnScroll = () => {
            fadeElements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (elementTop < windowHeight - 100) {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                    
                    // Add animate-in class to form labels
                    if (element.classList.contains('form-label')) {
                        element.classList.add('animate-in');
                    }
                }
            });
        };
        
        // Set initial styles for fade-in elements
        fadeElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        });
        
        // Run once on page load
        fadeInOnScroll();
        
        // Run on scroll
        window.addEventListener('scroll', fadeInOnScroll);
        
        // Back to top button functionality
        const backToTopButton = document.querySelector('.back-to-top');
        
        if (backToTopButton) {
            // Show/hide button based on scroll position
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    backToTopButton.classList.add('show');
                } else {
                    backToTopButton.classList.remove('show');
                }
            });
            
            // Smooth scroll to top when clicked
            backToTopButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    });

    // Theme Toggle Functionality (New Toggle Switch)
    const themeCheckbox = document.getElementById('themeCheckbox');
    
    if (themeCheckbox) {
        // Check for saved user preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        // Apply saved theme and sync checkbox state
        // In this specific toggle: checked = light, unchecked = dark (moon)
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeCheckbox.checked = false;
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeCheckbox.checked = true;
        }
        
        // Toggle theme on change
        themeCheckbox.addEventListener('change', () => {
            if (themeCheckbox.checked) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // ===== SMOOTHNESS UPGRADE =====
    console.log("Smoothness: Initializing...");
    
    // 1. Initialize Lenis Smooth Scroll
    if (typeof Lenis === 'undefined') {
        console.error("Smoothness: Lenis library not found!");
    } else {
        const lenis = new Lenis({
            duration: 1.5, // Slightly longer for more "buttery" feel
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.2, // More responsive
            smoothTouch: true,  // Enabled for mobile smoothness
            touchMultiplier: 1.5,
            infinite: false,
        });

        // Integrate Lenis with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
        console.log("Smoothness: Lenis Initialized");
        
        window.lenis = lenis; // Export for debugging
    }

    // 2. Global Reveal Animations
    const revealSections = document.querySelectorAll('.section, .hero-content, .about-content, .skills-container, .certification-grid, .project-card, .contact-content, .cert-card, .timeline-item');
    
    revealSections.forEach((section) => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 90%", // Trigger slightly earlier for better flow
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: "power2.out",
            clearProps: "all" // Clear styles after animation to prevent layout issues
        });
    });

    // 3. Smooth internal link scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, {
                    offset: -80,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    // 4. Force refresh on all assets load to prevent "hanging"
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
        console.log("Smoothness: ScrollTrigger Refreshed");
    });
    
    // 5. Initialize Horizontal Carousel for Projects
    if (window.HorizontalCarousel) {
        new HorizontalCarousel('#tech-carousel');
        new HorizontalCarousel('#design-carousel');
        console.log("Smoothness: Horizontal Carousels Initialized");
    }
});
