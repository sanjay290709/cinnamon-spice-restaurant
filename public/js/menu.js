// Menu Management & Interactive Animated Rendering Script

let menuData = null;
let activeCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {
  fetchMenuData();
});

async function fetchMenuData() {
  try {
    const response = await fetch('/api/menu');
    menuData = await response.json();
    renderCategories();
    renderMenuGrid();
  } catch (err) {
    console.error('Failed to load menu data:', err);
  }
}

function renderCategories() {
  const container = document.getElementById('menu-categories');
  if (!container || !menuData) return;

  const isDark = document.documentElement.classList.contains('dark');

  const activeClass = isDark 
    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/20 scale-[1.03]' 
    : 'bg-gradient-to-r from-cinnamon-700 to-cinnamon-600 text-white shadow-lg shadow-cinnamon-700/20 scale-[1.03]';

  const inactiveClass = isDark 
    ? 'bg-darkbg-card hover:bg-slate-800 text-slate-300 border border-darkbg-border hover:border-amber-500/40' 
    : 'bg-white hover:bg-amber-50 text-stone-700 border border-amber-300 hover:border-cinnamon-600';

  let html = `
    <button onclick="setMenuCategory('all')" class="category-btn whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform active:scale-95 ${activeCategory === 'all' ? activeClass : inactiveClass}">
      <i class="fa-solid fa-list mr-1.5"></i> All Dishes
    </button>
  `;

  menuData.categories.forEach(cat => {
    const isActive = activeCategory === cat.id;
    html += `
      <button onclick="setMenuCategory('${cat.id}')" class="category-btn whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform active:scale-95 ${isActive ? activeClass : inactiveClass}">
        <i class="fa-solid ${cat.icon} mr-1.5"></i> ${cat.name}
      </button>
    `;
  });

  container.innerHTML = html;
}

function setMenuCategory(catId) {
  activeCategory = catId;
  renderCategories();
  renderMenuGrid();
}

function filterMenuItems() {
  renderMenuGrid();
}

function renderMenuGrid() {
  const grid = document.getElementById('menu-grid');
  const searchInput = document.getElementById('menu-search');
  if (!grid || !menuData) return;

  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let filtered = menuData.items;

  if (activeCategory !== 'all') {
    filtered = filtered.filter(item => item.category === activeCategory);
  }

  if (searchQuery) {
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery) ||
      item.dietary.some(tag => tag.toLowerCase().includes(searchQuery))
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-stone-500 dark:text-slate-400 bg-white dark:bg-darkbg-card rounded-3xl border border-amber-200 dark:border-darkbg-border shadow-sm animate-fade-in">
        <i class="fa-solid fa-utensils text-4xl mb-3 text-amber-500 animate-bounce-short"></i>
        <p class="text-sm font-bold">No dishes found matching your search.</p>
        <button onclick="setMenuCategory('all')" class="mt-3 text-cinnamon-700 dark:text-amber-400 underline text-xs font-bold hover:scale-105 transition">Clear Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((item, index) => {
    let spiceHtml = '';
    if (item.spiceLevel > 0) {
      const peppers = Array(item.spiceLevel).fill('<i class="fa-solid fa-pepper-hot text-red-500 text-xs"></i>').join('');
      spiceHtml = `<span class="inline-flex items-center gap-0.5 ml-2" title="Spice Level: ${item.spiceLevel}/3">${peppers}</span>`;
    }

    const dietaryHtml = item.dietary.map(d => {
      const isVeg = d.toLowerCase().includes('veg') || d.toLowerCase().includes('vegan');
      const badgeClass = isVeg 
        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' 
        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-400 border-amber-300 dark:border-amber-500/30';
      return `<span class="text-[10px] px-2.5 py-0.5 rounded-md border font-bold ${badgeClass}">${d}</span>`;
    }).join(' ');

    const delayClass = `delay-${((index % 4) + 1) * 100}`;

    return `
      <div class="card-modern bg-white dark:bg-darkbg-card rounded-3xl overflow-hidden border border-amber-200/90 dark:border-darkbg-border hover:border-cinnamon-600/60 dark:hover:border-amber-500/50 shadow-md hover:shadow-2xl hover:shadow-amber-500/10 group flex flex-col justify-between reveal-fade-up ${delayClass}">
        <div>
          <!-- Image Container with Zoom Effect -->
          <div class="relative h-52 overflow-hidden bg-amber-50 dark:bg-darkbg-main">
            <img src="${item.image}" alt="${item.name}" class="img-zoom w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition"></div>
            
            <div class="absolute top-3 right-3 bg-cinnamon-700/90 dark:bg-black/75 backdrop-blur-md text-white dark:text-amber-400 px-3.5 py-1 rounded-full text-xs font-extrabold shadow-lg border border-amber-300/40 dark:border-amber-500/30 transform group-hover:scale-105 transition duration-300">
              $${item.price.toFixed(2)}
            </div>
            
            <div class="absolute bottom-3 left-3 flex flex-wrap gap-1">
              ${dietaryHtml}
            </div>
          </div>

          <!-- Content Body -->
          <div class="p-6 space-y-2">
            <h3 class="font-serif text-lg font-bold text-stone-900 dark:text-white group-hover:text-cinnamon-700 dark:group-hover:text-amber-400 transition-colors flex items-center">
              ${item.name}
              ${spiceHtml}
            </h3>
            <p class="text-stone-600 dark:text-slate-400 text-xs leading-relaxed font-medium line-clamp-2">${item.description}</p>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="px-6 pb-6 pt-3 flex items-center justify-between border-t border-amber-100 dark:border-darkbg-border/60">
          <span class="text-[11px] text-stone-500 dark:text-slate-500 font-semibold">Authentic Recipe</span>
          <button onclick="triggerGloriaFoodOrder()" class="bg-amber-100 dark:bg-amber-600/20 hover:bg-cinnamon-700 dark:hover:bg-amber-600 text-cinnamon-800 dark:text-amber-300 hover:text-white font-bold px-4 py-2 rounded-xl text-xs transition duration-300 border border-amber-300 dark:border-amber-500/30 flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95">
            Order Now <i class="fa-solid fa-plus text-[10px]"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Trigger reveal observer for newly rendered items
  if (typeof setupScrollReveal === 'function') {
    setupScrollReveal();
  }
}
