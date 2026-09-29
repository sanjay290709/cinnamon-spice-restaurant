// Geo-Fencing & Dynamic Location Messaging Engine (Warm Theme)

const SUBURB_COORDINATES = {
  'clarkson': { lat: -31.6835, lon: 115.7275, name: 'Clarkson' },
  'mindarie': { lat: -31.6917, lon: 115.7083, name: 'Mindarie' },
  'merriwa': { lat: -31.6708, lon: 115.7250, name: 'Merriwa' },
  'butler': { lat: -31.6500, lon: 115.7167, name: 'Butler' },
  'quinns rocks': { lat: -31.6750, lon: 115.6980, name: 'Quinns Rocks' },
  'alkimos': { lat: -31.6167, lon: 115.7000, name: 'Alkimos' },
  'jindalee': { lat: -31.6333, lon: 115.6950, name: 'Jindalee' },
  'currambine': { lat: -31.7333, lon: 115.7417, name: 'Currambine' },
  'joondalup': { lat: -31.7450, lon: 115.7660, name: 'Joondalup' },
  'kinross': { lat: -31.7167, lon: 115.7333, name: 'Kinross' },
  'burns beach': { lat: -31.7167, lon: 115.7083, name: 'Burns Beach' }
};

document.addEventListener('DOMContentLoaded', () => {
  requestBrowserLocation();
});

function requestBrowserLocation() {
  const heroBadge = document.getElementById('hero-geo-badge');
  if (heroBadge) {
    heroBadge.innerHTML = `<i class="fa-solid fa-spinner animate-spin text-xs mr-1 text-cinnamon-600"></i> Detecting location...`;
  }

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        checkLocationBackend(lat, lon);
      },
      (error) => {
        console.warn('Geolocation access denied or unavailable. Falling back to default Clarkson coordinates.', error);
        checkLocationBackend(-31.6835, 115.7275);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  } else {
    checkLocationBackend(-31.6835, 115.7275);
  }
}

async function checkLocationBackend(lat, lon) {
  try {
    const response = await fetch('/api/geo/check-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: lat, longitude: lon })
    });

    const data = await response.json();
    if (data.success) {
      updateGeoUI(data);
    }
  } catch (err) {
    console.error('Geo API error:', err);
  }
}

function updateGeoUI(data) {
  // Top Banner
  const bannerBar = document.getElementById('geo-banner-bar');
  const bannerText = document.getElementById('geo-banner-text');
  const promoCodeEl = document.getElementById('geo-promo-code');

  if (bannerBar && bannerText) {
    bannerText.textContent = data.bannerMessage;
    promoCodeEl.textContent = data.promoCode;
    bannerBar.classList.remove('hidden');
  }

  // Hero Badge
  const heroBadge = document.getElementById('hero-geo-badge');
  if (heroBadge) {
    heroBadge.innerHTML = `<i class="fa-solid fa-location-dot text-cinnamon-600 mr-1"></i> ${data.badgeText}`;
  }

  // Result Card
  const geoCardResult = document.getElementById('geo-card-result');
  const geoCardTitle = document.getElementById('geo-card-title');
  const geoCardBody = document.getElementById('geo-card-body');
  const geoCardTime = document.getElementById('geo-card-time');
  const geoCardCode = document.getElementById('geo-card-code');

  if (geoCardResult) {
    geoCardTitle.textContent = data.popupTitle;
    geoCardBody.textContent = data.popupBody;
    geoCardTime.textContent = `⏱️ ${data.deliveryTimeEstimate}`;
    geoCardCode.textContent = `🎟️ Promo: ${data.promoCode}`;
    geoCardResult.classList.remove('hidden');
  }

  // Modal
  if (!sessionStorage.getItem('geoModalShown')) {
    showGeoModal(data);
    sessionStorage.setItem('geoModalShown', 'true');
  }
}

function showGeoModal(data) {
  const modal = document.getElementById('geo-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalCode = document.getElementById('modal-code');

  if (modal && modalTitle) {
    modalTitle.textContent = data.popupTitle;
    modalBody.textContent = data.popupBody;
    modalCode.textContent = data.promoCode;
    modal.classList.remove('hidden');
  }
}

function closeGeoModal() {
  const modal = document.getElementById('geo-modal');
  if (modal) modal.classList.add('hidden');
}

// Suburb Search Handler
function handleSuburbSearch(event) {
  event.preventDefault();
  const input = document.getElementById('suburb-input');
  if (!input) return;
  quickCheckSuburb(input.value);
}

function quickCheckSuburb(suburbName) {
  const query = suburbName.toLowerCase().trim();
  const suburbResult = document.getElementById('suburb-result');
  
  if (!query) return;

  const matchedKey = Object.keys(SUBURB_COORDINATES).find(key => key.includes(query) || query.includes(key));

  if (matchedKey) {
    const coords = SUBURB_COORDINATES[matchedKey];
    checkLocationBackend(coords.lat, coords.lon);
    
    if (suburbResult) {
      suburbResult.className = 'mt-4 text-xs p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 block font-medium shadow-sm';
      suburbResult.innerHTML = `<i class="fa-solid fa-circle-check mr-1.5 text-emerald-700"></i> Great news! <strong>${coords.name}</strong> is within our direct delivery zone (~15-35 mins).`;
    }
  } else {
    checkLocationBackend(-31.6835, 115.7275);
    if (suburbResult) {
      suburbResult.className = 'mt-4 text-xs p-3.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 block font-medium shadow-sm';
      suburbResult.innerHTML = `<i class="fa-solid fa-location-dot mr-1.5 text-cinnamon-700"></i> Delivery check for <strong>${suburbName}</strong> processed! Check options above.`;
    }
  }
}
