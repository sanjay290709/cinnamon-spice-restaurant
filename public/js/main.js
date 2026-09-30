// Main UI Engine: Modern Animations, Theme Switcher, Mobile Menu & Scroll Observer

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
    if (icon) icon.className = 'fa-solid fa-sun text-amber-400';
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

// Mobile Menu Handler (Smooth Open/Close, Icon Toggle to ×, Swipe & Auto-Close on Click/Scroll)
function setupMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const menuIcon = document.getElementById('mobile-menu-icon');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!menuBtn || !mobileMenu) return;

  let isOpen = false;
  let openTime = 0;

  function openMobileMenu() {
    if (isOpen) return;
    isOpen = true;
    openTime = Date.now();
    mobileMenu.classList.remove('hidden', 'menu-closed');
    mobileMenu.classList.add('menu-open');

    // Lock scroll — triple approach covers all browsers + iOS Safari
    const scrollY = window.scrollY;
    document.body.dataset.scrollY = scrollY;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.classList.add('scroll-locked');

    // Swap hamburger ☰ → ✕ by replacing button content
    menuBtn.innerHTML = '<i class="fa-solid fa-xmark" style="font-size:1.5rem;color:#c2410c;display:block;line-height:1;"></i>';
  }

  function closeMobileMenu() {
    if (!isOpen) return;
    isOpen = false;
    mobileMenu.classList.remove('menu-open');
    mobileMenu.classList.add('menu-closed');

    // Restore scroll — undo all three lock layers
    const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.classList.remove('scroll-locked');
    window.scrollTo(0, scrollY);

    // Restore hamburger ✕ → ☰
    menuBtn.innerHTML = '<i id="mobile-menu-icon" class="fa-solid fa-bars" style="font-size:1.3rem;display:block;line-height:1;"></i>';

    setTimeout(() => {
      if (!isOpen) mobileMenu.classList.add('hidden');
    }, 300);
  }

  // Toggle on button click
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Auto-close when clicking any link inside mobile menu
  mobileMenu.querySelectorAll('a, .glf-button').forEach(item => {
    item.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Auto-close when clicking anywhere outside header & mobile menu
  document.addEventListener('click', (e) => {
    if (isOpen && (Date.now() - openTime > 200) && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Swipe-up to dismiss on the mobile menu drawer (after 350ms cooldown)
  let touchStartY = 0;
  mobileMenu.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  mobileMenu.addEventListener('touchmove', (e) => {
    if (!isOpen || (Date.now() - openTime < 350)) return;
    const touchCurrentY = e.touches[0].clientY;
    const diffY = touchStartY - touchCurrentY;
    // Swipe UP gesture on the drawer
    if (diffY > 40) {
      closeMobileMenu();
    }
  }, { passive: true });

  // Auto-close menu if user scrolls the page (belt + braces for scroll-lock)
  window.addEventListener('scroll', () => {
    if (isOpen && (Date.now() - openTime > 400)) {
      closeMobileMenu();
    }
  }, { passive: true });
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
