const cities = [
  { name: "New York, NY", stateFips: "36", placeFips: "51000", lat: 40.7128, lon: -74.0060 },
  { name: "Los Angeles, CA", stateFips: "06", placeFips: "44000", lat: 34.0522, lon: -118.2437 },
  { name: "Chicago, IL", stateFips: "17", placeFips: "14000", lat: 41.8781, lon: -87.6298 },
  { name: "Houston, TX", stateFips: "48", placeFips: "35000", lat: 29.7604, lon: -95.3698 },
  { name: "Phoenix, AZ", stateFips: "04", placeFips: "55000", lat: 33.4484, lon: -112.0740 }
];

const map = L.map('map').setView([39.5, -98.35], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
const criteria = [
  { key: 'weather', label: 'Weather' },
  { key: 'col', label: 'Cost of Living' },
  { key: 'housing', label: 'Housing Costs' },
  { key: 'income', label: 'Median Income' },
  { key: 'jobs', label: 'Job Opportunities' },
  { key: 'crime', label: 'Crime Rate' },
  { key: 'education', label: 'Education Quality' },
  { key: 'health', label: 'Healthcare Access' },
  { key: 'air', label: 'Air Quality' },
  { key: 'commute', label: 'Commute Time' },
  { key: 'transit', label: 'Public Transportation' },
  { key: 'tax', label: 'Tax Rate' },
  { key: 'parks', label: 'Parks & Recreation' },
  { key: 'internet', label: 'Internet Access' },
  { key: 'culture', label: 'Cultural Amenities' },
  { key: 'growth', label: 'Population Growth' },
  { key: 'disaster', label: 'Natural Disaster Risk' },
  { key: 'diversity', label: 'Diversity' },
  { key: 'food', label: 'Food Options' },
  { key: 'nightlife', label: 'Nightlife' }
];

const criteriaList = document.getElementById('criteria-list');

criteria.forEach(c => {
  const li = document.createElement('li');
  li.dataset.key = c.key;
  const label = document.createElement('span');
  label.textContent = c.label;
  li.appendChild(label);
  const controls = document.createElement('span');
  const up = document.createElement('button');
  up.textContent = '▲';
  up.addEventListener('click', () => moveItem(li, -1));
  const down = document.createElement('button');
  down.textContent = '▼';
  down.addEventListener('click', () => moveItem(li, 1));
  controls.appendChild(up);
  controls.appendChild(down);
  li.appendChild(controls);
  criteriaList.appendChild(li);
});

function moveItem(li, dir) {
  const sibling = dir === -1 ? li.previousElementSibling : li.nextElementSibling;
  if (!sibling) return;
  if (dir === -1) {
    criteriaList.insertBefore(li, sibling);
  } else {
    criteriaList.insertBefore(sibling, li);
  }
}

document.getElementById('update').addEventListener('click', updateData);

async function fetchCityData(city) {
  const censusUrl = `https://api.census.gov/data/2022/acs/acs5?get=B19013_001E,B25064_001E&for=place:${city.placeFips}&in=state:${city.stateFips}`;
  const [censusResp, weatherResp] = await Promise.all([
    fetch(censusUrl).then(r => r.json()),
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`).then(r => r.json())
  ]);
  const censusData = censusResp[1].map(Number);
  const income = censusData[0];
  const rent = censusData[1];
  const temp = weatherResp.current_weather.temperature;
  return { ...city, income, rent, temp };
}

function normalize(arr, invert = false) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  return arr.map(v => {
    if (max === min) return 0;
    return invert ? (max - v) / (max - min) : (v - min) / (max - min);
  });
}

let markers = [];

function updateMarkers(data) {
  markers.forEach(m => m.remove());
  markers = data.map(c => {
    const m = L.marker([c.lat, c.lon]).addTo(map);
    m.bindPopup(`${c.name}<br>Score: ${c.score.toFixed(2)}`);
    return m;
  });
}

function updateList(data) {
  const list = document.getElementById('ranking');
  list.innerHTML = '';
  data.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.name} - ${c.score.toFixed(2)}`;
    list.appendChild(li);
  });
}

function getWeights() {
  const items = Array.from(criteriaList.querySelectorAll('li'));
  const n = items.length;
  const total = (n * (n + 1)) / 2;
  const weights = {};
  items.forEach((li, idx) => {
    const key = li.dataset.key;
    const weight = n - idx;
    weights[key] = weight / total;
  });
  return weights;
}

async function updateData() {
  const weights = getWeights();

  const data = await Promise.all(cities.map(fetchCityData));

  const temps = data.map(c => c.temp);
  const incomes = data.map(c => c.income);
  const rents = data.map(c => c.rent);

  const tempScores = normalize(temps);
  const colScores = normalize(incomes, true);
  const housingScores = normalize(rents, true);

  data.forEach((c, i) => {
    const wWeather = weights.weather || 0;
    const wCol = weights.col || 0;
    const wHousing = weights.housing || 0;
    c.score = tempScores[i] * wWeather + colScores[i] * wCol + housingScores[i] * wHousing;
  });

  data.sort((a, b) => b.score - a.score);

  updateList(data);
  updateMarkers(data);
}

updateData();
