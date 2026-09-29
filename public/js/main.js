// Main UI Engine: Modern Animations, Theme Switcher & Scroll Observer

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupMobileMenu();
  setupScrollReveal();
  setupHeaderScrollEffect();
});

// Scroll Reveal with Staggered Easing (Modern Apple/Stripe Style)
function setupScrollReveal() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.08
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-fade-up').forEach(el => {
    observer.observe(el);
  });
}

// Dynamic Header Elevation on Scroll
function setupHeaderScrollEffect() {
  const header = document.querySelector('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('shadow-lg', 'py-1');
      header.classList.remove('shadow-sm');
    } else {
      header.classList.remove('shadow-lg', 'py-1');
      header.classList.add('shadow-sm');
    }
  });
}

// Theme Toggle Engine
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    setTheme('dark');
  } else {
    setTheme('light');
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
}

function setTheme(theme) {
  const html = document.documentElement;
  const icon = document.getElementById('theme-toggle-icon');
  const iconMobile = document.getElementById('theme-toggle-icon-mobile');
  const label = document.getElementById('theme-toggle-label');

  if (theme === 'dark') {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    if (icon) icon.className = 'fa-solid fa-sun text-amber-400 animate-spin-slow';
    if (iconMobile) iconMobile.className = 'fa-solid fa-sun text-amber-400';
    if (label) label.textContent = 'Light Mode';
  } else {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    if (icon) icon.className = 'fa-solid fa-moon text-stone-600';
    if (iconMobile) iconMobile.className = 'fa-solid fa-moon text-stone-600';
    if (label) label.textContent = 'Dark Mode';
  }

  if (typeof renderCategories === 'function') {
    renderCategories();
    renderMenuGrid();
  }
}

function setupMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

function triggerGloriaFoodOrder() {
  const glfButton = document.querySelector('.glf-button:not(.reservation)');
  if (glfButton) {
    glfButton.click();
  } else {
    alert('Direct online ordering loading... Please call 08 6205 2636 if ordering popup is blocked.');
  }
}

async function handleContactSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('contact-name').value;
  const email = document.getElementById('contact-email').value;
  const phone = document.getElementById('contact-phone').value;
  const message = document.getElementById('contact-message').value;
  const statusEl = document.getElementById('contact-status');

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, message })
    });
    const data = await res.json();

    if (data.success && statusEl) {
      statusEl.className = 'mt-3 text-xs p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 block font-medium shadow-sm animate-fade-in';
      statusEl.textContent = data.message;
      document.getElementById('contact-form').reset();
    }
  } catch (err) {
    console.error('Contact submission error:', err);
  }
}
