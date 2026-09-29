const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Restaurant Master Location (Clarkson, WA 6030)
const RESTAURANT = {
  name: 'Cinnamon Spice Indian Restaurant',
  suburb: 'Clarkson',
  postcode: '6030',
  latitude: -31.6835,
  longitude: 115.7275,
  maxDeliveryRadiusKm: 10,
  phone: '08 6205 2636',
  openHours: '04:30 PM - 09:30 PM Everyday'
};

// Haversine distance formula in kilometers
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// API: Geo Location Check & Auto-Generated Message Generator (Blinkit/Zomato style)
app.post('/api/geo/check-location', (req, res) => {
  const { latitude, longitude, userSuburb } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and Longitude are required.'
    });
  }

  const userLat = parseFloat(latitude);
  const userLon = parseFloat(longitude);
  const distance = calculateDistanceKm(
    RESTAURANT.latitude,
    RESTAURANT.longitude,
    userLat,
    userLon
  );

  const isEligible = distance <= RESTAURANT.maxDeliveryRadiusKm;

  let estimatedMinutesMin = Math.round(20 + distance * 3);
  let estimatedMinutesMax = estimatedMinutesMin + 15;

  let bannerMessage = '';
  let popupTitle = '';
  let popupBody = '';
  let badgeText = '';

  if (isEligible) {
    badgeText = `⚡ ${distance} km away • ${estimatedMinutesMin}-${estimatedMinutesMax} mins delivery`;
    bannerMessage = `🔥 Hot & Fresh Indian Delights delivering to your door in ${estimatedMinutesMin}-${estimatedMinutesMax} mins! Use code SPICE10 for 10% OFF.`;
    popupTitle = `🚀 We deliver to your location (${distance} km away)!`;
    popupBody = `Good news! Cinnamon Spice Clarkson delivers right to your address. Enjoy rich Indian curries & tandoori treats delivered hot in ${estimatedMinutesMin}-${estimatedMinutesMax} minutes.`;
  } else {
    badgeText = `📍 ${distance} km away • Outside Direct Delivery Zone`;
    bannerMessage = `📍 You are ${distance} km away! Direct delivery limit is ${RESTAURANT.maxDeliveryRadiusKm}km, but Pickup & Table Reservations are ready for you!`;
    popupTitle = `Welcome to Cinnamon Spice Indian Restaurant!`;
    popupBody = `You are currently ${distance} km from our Clarkson restaurant. Visit us for an exquisite dine-in experience or place an online pickup order!`;
  }

  return res.json({
    success: true,
    distanceKm: distance,
    isEligibleForDelivery: isEligible,
    deliveryTimeEstimate: `${estimatedMinutesMin}-${estimatedMinutesMax} mins`,
    badgeText,
    bannerMessage,
    popupTitle,
    popupBody,
    promoCode: isEligible ? 'SPICE10' : 'DINEIN10',
    restaurant: {
      name: RESTAURANT.name,
      phone: RESTAURANT.phone,
      hours: RESTAURANT.openHours
    }
  });
});

// API: Retrieve Menu JSON
app.get('/api/menu', (req, res) => {
  const menuPath = path.join(__dirname, 'data', 'menu.json');
  fs.readFile(menuPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to load menu.' });
    }
    return res.json(JSON.parse(data));
  });
});

// API: Contact Form Submission endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }
  return res.json({
    success: true,
    message: `Thank you ${name}! We have received your query and will reply shortly.`
  });
});

app.listen(PORT, () => {
  console.log(`Cinnamon Spice server running on http://localhost:${PORT}`);
});
