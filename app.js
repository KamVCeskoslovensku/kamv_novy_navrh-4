const SUPABASE_URL = 'https://ijctkszgvhinoubtbyfb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_behBeiZHFJxXRVL2L6VueQ_EFMm-5DY';
const SUPABASE_TABLE = 'events';
const SUPABASE_API = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`;
const SUPABASE_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`
};
async function nacitajUdalosti() {
  const response = await fetch(SUPABASE_API + '?select=*', {
    headers: SUPABASE_HEADERS
  });
  if (!response.ok) throw new Error('Nepodarilo sa načítať udalosti');
  const data = await response.json();
return data.map(p => ({
  ...p,
  nazov: p.title,
  datum: p.start_date,
  mesto: p.city,
  kategoria: p.category,
  popis: p.description || ''
}));
}

document.addEventListener('DOMContentLoaded', async () => {
  const categories = document.querySelectorAll('.category-card');
  const searchBox = document.querySelector('.search-box');
 const searchButton = searchBox?.querySelector('button') || document.querySelector('.search-box + button');
const podujatia = await nacitajUdalosti();
  const dnes = new Date().toLocaleDateString('sv-SE');
const buducePodujatia = podujatia.filter(p => p.datum >= dnes);
  // Kliknutie na kategóriu presunie návštevníka
  // na príslušnú časť stránky.
  categories.forEach(card => {
    card.addEventListener('click', event => {
      event.preventDefault();

      categories.forEach(item => item.classList.remove('active'));
      card.classList.add('active');

      const name = card.querySelector('b')?.textContent || '';
      const section = document.querySelector('.content-section');

      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }

      console.log('Vybraná kategória:', name);
    });
  });

  // Základná reakcia na vyhľadávanie.
  searchButton?.addEventListener('click', () => {
 document.getElementById('nearby-results')?.remove();
    const what = document.getElementById('search-what')?.value.trim() || '';
const where = document.getElementById('search-where')?.value.trim() || '';
const when = document.getElementById('search-when')?.value || '';
const query = [what, where].filter(Boolean).join(' ');
    const selectedDate = when;
const cards = [...document.querySelectorAll('.event-card')];
const text = query.toLocaleLowerCase('sk');
let count = 0;
const najdene = podujatia.filter(p =>
  (!what || (p.nazov + ' ' + p.kategoria + ' ' + p.popis).toLocaleLowerCase('sk').includes(what.toLocaleLowerCase('sk'))) &&
  (!where || (p.mesto + ' ' + p.krajina).toLocaleLowerCase('sk').includes(where.toLocaleLowerCase('sk'))) &&
  (!when || p.datum === when)
);
console.log('Nájdené podujatia:', najdene);
    const zoznam = document.querySelector('#event-list');
if (zoznam) {
  zoznam.innerHTML = '';
  najdene.forEach(p => {
    const karta = document.createElement('article');
    karta.className = 'event-card';
    karta.innerHTML = `
      <h3></h3>
      <p></p>
      <span class="event-tag"></span>
    `;
    karta.querySelector('h3').textContent = p.nazov;
    karta.querySelector('p').textContent = `${p.mesto} • ${p.datum}`;
    karta.querySelector('.event-tag').textContent = p.kategoria;
    zoznam.appendChild(karta);
  });
  count = najdene.length;
}

let result = document.getElementById('search-result');
if (!result) {
  result = document.createElement('p');
  result.id = 'search-result';
  searchButton.insertAdjacentElement('afterend', result);
}
result.textContent = count
  ? `Našli sme ${count} podujatí na našej stránke.`
  : 'Zatiaľ nemáme podujatie podľa vášho výberu.';
 document.getElementById('event-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Tlačidlo mapy.
  const mapButton = document.querySelector('.map-copy button');

  mapButton?.addEventListener('click', () => {
    document.querySelector('.map-art')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  });

  // Obľúbené položky.
  document.querySelectorAll('.event-card button').forEach(button => {
    button.addEventListener('click', () => {
      const selected = button.classList.toggle('selected');
      button.textContent = selected ? '♥' : '♡';
    });
  });
});
// Zapamätanie obľúbených podujatí
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.event-card button').forEach((button, index) => {
    const key = 'kamv-favorite-' + index;

    if (localStorage.getItem(key) === 'true') {
      button.classList.add('active');
      button.textContent = '♥';
    }

    button.addEventListener('click', () => {
      localStorage.setItem(
        key,
        String(button.textContent.trim() === '♥')
      );
    });
  });
});
nacitajUdalosti()

  .then(podujatia => {
    const zoznam = document.querySelector('.event-grid');
    if (!zoznam) return;
zoznam.innerHTML = '';
    podujatia.filter(p => p.datum >= new Date().toLocaleDateString('sv-SE')).forEach(p => {
      const karta = document.createElement('article');
      karta.className = 'event-card';
      karta.innerHTML = `
        <h3></h3>
        <p></p>
        <span class="event-tag"></span>
      `;
      karta.querySelector('h3').textContent = p.nazov;
      karta.querySelector('p').textContent = `📍 ${p.mesto} | 📅 ${p.datum}`;
      karta.querySelector('.event-tag').textContent = p.kategoria;
      zoznam.appendChild(karta);
    });
  })
  .catch(error => console.error('Chyba načítania podujatí:', error));

// Akcie v mojom okolí – do 50 km
document.getElementById('nearby-events')?.addEventListener('click', () => {
  const button = document.getElementById('nearby-events');

  if (!navigator.geolocation) {
    alert('Váš prehliadač nepodporuje zisťovanie polohy.');
    return;
  }

  button.disabled = true;
  button.textContent = '📍 Zisťujem vašu polohu...';

  navigator.geolocation.getCurrentPosition(
    async position => {
      try {
        const response = await fetch('podujatia.json');
        if (!response.ok) throw new Error('Nepodarilo sa načítať podujatia.');

        const podujatia = await response.json();
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const vzdialenost = (lat2, lon2) => {
          const rad = Math.PI / 180;
          const dLat = (lat2 - lat) * rad;
          const dLon = (lon2 - lon) * rad;
          const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) ** 2;
          return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };

        const blizke = podujatia
          .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lon))
          .map(p => ({ ...p, km: vzdialenost(p.lat, p.lon) }))
          .filter(p => p.km <= 50)
          .sort((a, b) => a.km - b.km);

        let zoznam = document.getElementById('nearby-results');

        if (!zoznam) {
          zoznam = document.createElement('div');
          zoznam.id = 'nearby-results';
          button.insertAdjacentElement('afterend', zoznam);
        }

        zoznam.replaceChildren();

        const nadpis = document.createElement('h3');
        nadpis.textContent = '📍 Akcie do 50 km od vás';
        zoznam.appendChild(nadpis);

        if (!blizke.length) {
          const sprava = document.createElement('p');
          sprava.textContent = 'Zatiaľ nemáme v okolí do 50 km žiadne evidované podujatia.';
          zoznam.appendChild(sprava);
        }

        blizke.forEach(p => {
          const karta = document.createElement('p');
          karta.textContent = `${p.nazov} – ${p.mesto} – ${p.km.toFixed(1)} km – ${p.datum}`;
          zoznam.appendChild(karta);
        });

        zoznam.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (error) {
        alert('Nepodarilo sa načítať podujatia. Skúste to znova.');
      } finally {
        button.disabled = false;
        button.textContent = '📍 Akcie v mojom okolí (do 50 km)';
      }
    },
    () => {
      button.disabled = false;
      button.textContent = '📍 Akcie v mojom okolí (do 50 km)';
      alert('Povoľte prístup k polohe, aby sme mohli nájsť blízke akcie.');
    },
    { enableHighAccuracy: false, timeout: 15000 }
  );
});
document.addEventListener('DOMContentLoaded', async () => {
const podujatia = await nacitajUdalosti();
  

  const mapaElement = document.getElementById('mapa-podujati');

if (mapaElement && typeof L !== 'undefined') {
  
  const mapa = L.map('mapa-podujati').setView([49.2, 17.0], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(mapa);
 L.circleMarker([48.1486, 17.1077], {
  radius: 10,
  color: 'red',
  fillColor: 'red',
  fillOpacity: 0.8
}).addTo(mapa).bindPopup("📍 Bratislava – Slovensko");

podujatia.forEach((p, index) => {
  if (typeof p.lat === 'number' && typeof p.lon === 'number') {
    L.circleMarker([p.lat, p.lon], {
      radius: 8,
      color: 'blue',
      fillColor: 'blue',
      fillOpacity: 0.9
    })
      .addTo(mapa)
  .bindPopup(`<b>${p.nazov}</b><br>📍 ${p.mesto}<br>📅 ${p.datum}<br>📝 ${p.popis || ''}<br><a href="/podujatie.html?id=${encodeURIComponent(p.nazov)}">👉 Viac informácií</a>`, { maxWidth: 220, autoPan: true, autoPanPadding: [80, 80] });

  }
});
  setTimeout(() => {
  mapa.invalidateSize();

  const body = podujatia
    .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lon))
    .map(p => [p.lat, p.lon]);

  if (body.length > 0) {
    mapa.fitBounds(body, { padding: [30, 30] });
  }
}, 300);
}
 }); 
// Prihlasovanie cez Supabase
const SUPABASE_AUTH_URL = `${SUPABASE_URL}/auth/v1`;
async function prihlasitSa(email) {
    const response = await fetch(`${SUPABASE_AUTH_URL}/otp?redirect_to=${encodeURIComponent('https://kamvceskoslovensku.github.io/kamv_novy_navrh-4/')}`, {
          method: 'POST',
          headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
  email,
  create_user: true,
  gotrue_meta_security: {},
  email_redirect_to: 'https://kamvceskoslovensku.github.io/kamv_novy_navrh-4/'
}),
        });
    if (!response.ok) throw new Error('Nepodarilo sa odoslať prihlasovací e-mail.');
  }
// Dokončenie prihlásenia cez e-mailový odkaz Supabase
async function skontrolujPrihlasenie() {
  const params = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (accessToken && refreshToken) {
    localStorage.setItem('kamv_access_token', accessToken);
    localStorage.setItem('kamv_refresh_token', refreshToken);
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  const token = localStorage.getItem('kamv_access_token');
  if (!token) return;

  try {
    const response = await fetch(`${SUPABASE_AUTH_URL}/user`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      localStorage.removeItem('kamv_access_token');
      localStorage.removeItem('kamv_refresh_token');
      return;
    }

    const user = await response.json();
    const tlacidlo = [...document.querySelectorAll('button')]
      .find(b => b.textContent.trim() === 'Prihlásiť');

    if (tlacidlo) {
      tlacidlo.textContent = '👤 Môj účet';
      tlacidlo.onclick = () => alert(`Prihlásený účet: ${user.email}`);
    }
  } catch (error) {
    console.error('Chyba overenia prihlásenia:', error);
  }
}

document.addEventListener('DOMContentLoaded', skontrolujPrihlasenie);
