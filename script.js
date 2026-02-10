// ScaleNow Digital — Interactive animations with scroll triggers

document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

  document.documentElement.classList.toggle('dark-mode', initialTheme === 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isDark = document.documentElement.classList.toggle('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all animated elements
  const animatedElements = document.querySelectorAll(
    '.service-card, .work-item, .process-step, .benefit-card, .section-title, .section-subtitle, .cta-section h2, .cta-section p'
  );
  
  animatedElements.forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });

  // Smooth scroll for navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const targetPosition = target.offsetTop - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Navbar shadow on scroll
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
      navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });

  // Mobile nav toggle (overlay + side menu)
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  function openMenu() {
    if (!mobileToggle || !mobileMenu || !menuOverlay) return;
    mobileToggle.classList.add('active');
    mobileMenu.classList.add('open');
    menuOverlay.classList.add('show');
    document.body.classList.add('nav-open');
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!mobileToggle || !mobileMenu || !menuOverlay) return;
    mobileToggle.classList.remove('active');
    mobileMenu.classList.remove('open');
    menuOverlay.classList.remove('show');
    document.body.classList.remove('nav-open');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      if (mobileToggle.classList.contains('active')) closeMenu(); else openMenu();
    });
  }
  if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    // Inline validation & submission behavior
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');
    const successMsg = document.getElementById('form-success');
    const errorMsg = document.getElementById('form-error-message');

    const validateEmail = (value) => {
      return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    const showError = (input, errorSpan, message) => {
      if (!input || !errorSpan) return;
      input.classList.add('error');
      try { input.setAttribute('aria-invalid', 'true'); } catch (e) {}
      errorSpan.textContent = message;
      errorSpan.classList.add('show');
      try { errorSpan.setAttribute('role', 'status'); } catch (e) {}
    };

    const clearError = (input, errorSpan) => {
      if (!input || !errorSpan) return;
      input.classList.remove('error');
      try { input.removeAttribute('aria-invalid'); } catch (e) {}
      errorSpan.textContent = '';
      errorSpan.classList.remove('show');
      try { errorSpan.removeAttribute('role'); } catch (e) {}
    };

    // Name validation
    if (name) {
      name.addEventListener('blur', function () {
        if (!this.value.trim()) {
          showError(this, nameError, '✕ Name is required');
        } else {
          clearError(this, nameError);
        }
      });
      name.addEventListener('input', function () {
        if (this.value.trim() && this.classList.contains('error')) {
          clearError(this, nameError);
        }
      });
    }

    // Email validation
    if (email) {
      email.addEventListener('blur', function () {
        if (!this.value) {
          showError(this, emailError, '✕ Email is required');
        } else if (!validateEmail(this.value)) {
          showError(this, emailError, '✕ Enter a valid email (e.g., user@example.com)');
        } else {
          clearError(this, emailError);
        }
      });
      email.addEventListener('input', function () {
        if (validateEmail(this.value) && this.classList.contains('error')) {
          clearError(this, emailError);
        }
      });
    }

    // Message validation
    if (message) {
      message.addEventListener('blur', function () {
        if (!this.value.trim()) {
          showError(this, messageError, '✕ Message is required');
        } else if (this.value.trim().length < 10) {
          showError(this, messageError, '✕ Message must be at least 10 characters');
        } else {
          clearError(this, messageError);
        }
      });
      message.addEventListener('input', function () {
        if (this.value.trim().length >= 10 && this.classList.contains('error')) {
          clearError(this, messageError);
        }
      });
    }

    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      // Hide global messages
      if (successMsg) successMsg.style.display = 'none';
      if (errorMsg) errorMsg.style.display = 'none';

      let isValid = true;
      const debugErrors = [];

      if (!name || !name.value.trim()) {
        showError(name, nameError, '✕ Name is required');
        isValid = false;
        debugErrors.push('name-empty');
      } else {
        clearError(name, nameError);
      }

      if (!email || !email.value) {
        showError(email, emailError, '✕ Email is required');
        isValid = false;
        debugErrors.push('email-empty');
      } else if (!validateEmail(email.value)) {
        showError(email, emailError, '✕ Enter a valid email address');
        isValid = false;
        debugErrors.push('email-invalid');
      } else {
        clearError(email, emailError);
      }

      if (!message || !message.value.trim()) {
        showError(message, messageError, '✕ Message is required');
        isValid = false;
        debugErrors.push('message-empty');
      } else if (message.value.trim().length < 10) {
        showError(message, messageError, '✕ Message must be at least 10 characters');
        isValid = false;
        debugErrors.push('message-too-short');
      } else {
        clearError(message, messageError);
      }

      if (!isValid) {
        // Debugging output to help trace why validation failed
        console.groupCollapsed('Contact form validation failed');
        console.log('field values:', {
          name: name ? name.value : null,
          email: email ? email.value : null,
          message: message ? message.value : null,
          honey: (document.getElementById('honey') || {}).value || ''
        });
        console.log('errors:', debugErrors);
        console.groupEnd();

        const firstError = contactForm.querySelector('.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
        if (errorMsg) errorMsg.style.display = 'block';
        return;
      }

      // Prepare submission
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
      }

      // Read honeypot
      const honeyInput = document.getElementById('honey');
      const honey = honeyInput ? (honeyInput.value || '').trim() : '';

      // Using SheetDB for form submissions; Apps Script logic removed.

      // If you want to use SheetDB.io, set SHEETDB_URL to your SheetDB endpoint.
      // Example SheetDB endpoint: https://sheetdb.io/api/v1/<your-id>
      const SHEETDB_URL = 'https://sheetdb.io/api/v1/q9743283u5c7h';

      if (SHEETDB_URL.includes('PASTE_YOUR_SHEETDB_URL_HERE') || !SHEETDB_URL.startsWith('https://')) {
        console.error('SheetDB endpoint not configured. Set SHEETDB_URL in script.js.');
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
        if (errorMsg) {
          errorMsg.textContent = 'Form not configured — contact site owner.';
          errorMsg.style.display = 'block';
        }
        return;
      }

      // Build JSON payload for SheetDB: append as a row via { data: [ { ... } ] }
      const payload = {
        data: [
          {
            Timestamp: new Date().toISOString(),
            Name: name.value.trim(),
            Email: email.value.trim(),
            Message: message.value.trim()
          }
        ]
      };

      try {
        const resp = await fetch(SHEETDB_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          cache: 'no-store'
        });

        const text = await resp.text().catch(() => '');
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (e) { data = {}; }

        // SheetDB and similar endpoints often return different payloads.
        // Treat any 2xx response as success (unless the response explicitly indicates failure).
        if (resp.ok) {
          console.debug('Form submission succeeded', { status: resp.status, body: text, parsed: data });
          if (successMsg) successMsg.style.display = 'block';
          contactForm.reset();
        } else {
          console.error('Form submission failed', { status: resp.status, statusText: resp.statusText, body: text, parsed: data });
          if (errorMsg) {
            errorMsg.textContent = 'Submission failed — please try again later.';
            errorMsg.style.display = 'block';
          }
        }
      } catch (err) {
        console.error('Network or fetch error', err);
        if (errorMsg) {
          errorMsg.textContent = 'Network error — please try again later.';
          errorMsg.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }
    });
  }
});
