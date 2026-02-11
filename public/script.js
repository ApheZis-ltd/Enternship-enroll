document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggler ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const THEME_KEY = 'aphezis-theme';

    // 1. Check local storage or system preference
    const savedTheme = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        htmlElement.setAttribute('data-theme', 'dark');
    }

    // 2. Toggle Logic
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
    });

    // --- Mobile Menu ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = mobileMenuToggle.querySelector('.menu-icon');
    const closeIcon = mobileMenuToggle.querySelector('.close-icon');

    const toggleMenu = () => {
        const isOpen = !mobileMenu.classList.contains('hidden');
        if (isOpen) {
            mobileMenu.classList.add('hidden');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            document.body.style.overflow = '';
        } else {
            mobileMenu.classList.remove('hidden');
            menuIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    };

    mobileMenuToggle.addEventListener('click', toggleMenu);

    // Close menu when clicking a link
    document.querySelectorAll('.mobile-nav-item').forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu();
        });
    });

    // --- Scroll Spy ---
    const navItems = document.querySelectorAll('.nav-item');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    const sections = ['home', 'about', 'solutions', 'interns', 'contact'];

    const updateActiveSection = () => {
        const scrollPosition = window.scrollY + 100;

        let currentSection = 'home';
        for (const sectionId of sections) {
            const element = document.getElementById(sectionId);
            if (element && element.offsetTop <= scrollPosition) {
                currentSection = sectionId;
            }
        }

        // Update Nav Links
        navItems.forEach(item => {
            if (item.getAttribute('data-section') === currentSection) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update Mobile Nav Links
        mobileNavItems.forEach(item => {
            if (item.getAttribute('data-section') === currentSection) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    window.addEventListener('scroll', updateActiveSection);
    updateActiveSection(); // Initial check


    // --- Form Submission ---
    const form = document.getElementById('enrollment-form');
    const submitBtn = form.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const messageDiv = document.getElementById('form-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset UI
        messageDiv.classList.add('hidden');
        messageDiv.className = ''; // remove success/error classes
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        submitBtn.disabled = true;

        // Gather Data
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            interest: document.getElementById('interest').value,
            resumeLink: document.getElementById('resumeLink').value
        };

        try {
            const response = await fetch('/api/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Success State
                messageDiv.textContent = result.message || 'Application submitted successfully!';
                messageDiv.classList.add('success');
                messageDiv.classList.remove('hidden');
                form.reset();
            } else {
                // Error State (Server side)
                throw new Error(result.message || 'Submission failed.');
            }

        } catch (error) {
            console.error('Submission Error:', error);
            messageDiv.textContent = error.message || 'Something went wrong. Please try again.';
            messageDiv.classList.add('error');
            messageDiv.classList.remove('hidden');
        } finally {
            // Restore Button
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    // --- Animations on Scroll (Simple Intersection Observer) ---
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-up').forEach(el => {
        // el.style.animationPlayState = 'paused'; // Optional: if you want to wait for scroll
        // observer.observe(el);
    });
});
