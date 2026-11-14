const SUPABASE_URL = 'https://ijctkszgvhinoubtbyfb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_behBeiZHFJxXRVL2L6VueQ_EFMm-5DY';
const SUPABASE_TABLE = 'events';
const SUPABASE_API = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`;
const SUPABASE_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`
};
async function nacitajUdalosti() {
  const response = await fetch(
    'https://putac.sk/api/v1/events/?per_page=500'
  );

  if (!response.ok) {
    throw new Error('Nepodarilo sa načítať podujatia');
  }

  const data = await response.json();

  return (data.results || []).map(p => ({
    nazov: p.title,
    datum: p.start,
    mesto: p.city?.name || '',
    kategoria: p.category?.name || '',
    popis: p.description || '',
    obrazok: p.image || '',
    lat: p.location?.lat ?? null,
    lon: p.location?.lng ?? null,
    url: p.url,
    zdroj: 'Pútač.sk'
  }));
}
// Podujatia z Brna – ArcGIS
async function nacitajBrno() {
    const response = await fetch('https://services6.arcgis.com/fUWVlHWZNxUvTUh8/arcgis/rest/services/Events/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&f=json');
    const data = await response.json();
    return (data.features || []).map(p => ({
      nazov: p.attributes.name.replace(/&nbsp;/g, ' ').replace(/&#8211;/g, '–').replace(/&amp;/g, '&'),
      kategoria: p.attributes.categories || '',
      popis: (p.attributes.text || '').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
      obrazok: p.attributes.first_image || '',
      datum: p.attributes.date_from ? new Date(p.attributes.date_from).toISOString() : null,
      mesto: 'Brno',
      lat: p.attributes.latitude,
      lon: p.attributes.longitude,
      url: p.attributes.url,
      zdroj: 'GoToBrno.cz'
}));
}
// Motoristické podujatia – Autoklub ČR
const MOTORSPORT_ZDROJ = 'https://www.autoklub.cz/205368-kalendar-automobiloveho-sportu-acr-2026/';
const motoristickePodujatia = [];
motoristickePodujatia.push({
  nazov: '🏁 Kalendár motoristických podujatí 2026',
  kategoria: 'Motorizmus',
  url: MOTORSPORT_ZDROJ,
  zdroj: 'Autoklub ČR'
});
motoristickePodujatia.push({
  nazov: '🇸🇰 Kalendár motocyklových podujatí SMF 2026',
  kategoria: 'Motorizmus',
  url: 'https://www.smf.sk/kalendare-podujati-smf/',
  zdroj: 'Slovenská motocyklová federácia'
});
document.addEventListener('DOMContentLoaded', async () => {
  const categories = document.querySelectorAll('.category-card');
  const searchBox = document.querySelector('.search-box');
 const searchButton = searchBox?.querySelector('button') || document.querySelector('.search-box + button');
let podujatia = [];
try {
  podujatia = await nacitajUdalosti();
  podujatia.push(...(await nacitajBrno()));
} catch (error) {
  console.error('Chyba načítania podujatí:', error);
}
  const dnes = new Date().toLocaleDateString('sv-SE');
const buducePodujatia = podujatia.filter(p => p.datum && new Date(p.datum).getTime() >= new Date().setHours(0, 0, 0, 0));
  podujatia = [...buducePodujatia].sort((a, b) => new Date(a.datum) - new Date(b.datum)).concat(motoristickePodujatia);
  
const motoAkcie = podujatia.filter(p =>
  (!p.datum || new Date(p.datum) >= new Date()) &&
  /motokros|motocross|motocyk|motork|moto zraz|superbike|road racing|cestné preteky|okruh|enduro|motard|speedway|plochá dráha/i.test(
    `${p.nazov || ''} ${p.kategoria || ''}`
  )
);



  const motoList = document.getElementById('moto-list');
if (motoList) {
  motoList.innerHTML = [...new Map([...motoristickePodujatia, ...motoAkcie].map(p => [p.url || p.nazov, p])).values()].map(p => `
    <div class="event-card" style="padding:16px;margin:12px 0;">
      <h3>${p.nazov}</h3>
      <p>🏍️ ${p.zdroj}</p>
      <a href="${p.url}" target="_blank" rel="noopener noreferrer">
        Zobraziť kalendár podujatí →
      </a>
    </div>
  `).join('');
}
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
    const country = document.getElementById('search-country')?.value || 'all';
const query = [what, where].filter(Boolean).join(' ');
    const selectedDate = when;
const cards = [...document.querySelectorAll('.event-card')];
const text = query.toLocaleLowerCase('sk');
let count = 0;
const najdene = podujatia.filter(p =>
  (!what || (p.nazov + ' ' + p.kategoria + ' ' + p.popis).toLocaleLowerCase('sk').includes(what.toLocaleLowerCase('sk'))) &&
  (!where || (p.mesto + ' ' + p.krajina).toLocaleLowerCase('sk').includes(where.toLocaleLowerCase('sk'))) &&
(country === 'all' || (country === 'sk' ? p.zdroj === 'Pútač.sk' : p.zdroj === 'GoToBrno')) &&
  (!when || p.datum?.slice(0, 10) === when)
).sort((a, b) => new Date(a.datum) - new Date(b.datum));
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
    if (p.obrazok) {
  const obrazok = document.createElement('img');
  obrazok.src = p.obrazok;
  obrazok.alt = p.nazov;
  obrazok.style.cssText = 'width:100%;border-radius:12px;margin:10px 0;';
  karta.appendChild(obrazok);
}
    karta.querySelector('p').textContent = `${p.mesto} • ${new Date(p.datum).toLocaleDateString('sk-SK')}`;
    karta.querySelector('.event-tag').textContent = p.kategoria;
    if (p.popis) {
  const detail = document.createElement('p');
  detail.textContent = p.popis;
  detail.style.display = 'none';

  const tlacidlo = document.createElement('button');
  tlacidlo.textContent = '📖 Viac o podujatí';
  tlacidlo.onclick = () => {
    detail.style.display = detail.style.display === 'none' ? 'block' : 'none';
  };

  karta.appendChild(tlacidlo);
  karta.appendChild(detail);
}
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

// Akcie v mojom okolí – do 50 km
document.getElementById('nearby-events')?.addEventListener('click', () => {
  const button = document.getElementById('nearby-events');

  if (!navigator.geolocation) {
    alert('Váš prehliadač nepodporuje zisťovanie polohy.');
    return;
  }

  button.disabled = true;
  button.textContent = localStorage.getItem('lang') === 'en' ? '📍 Finding your location...' : '📍 Zisťujem vašu polohu...';

  navigator.geolocation.getCurrentPosition(
    async position => {
      try {
        const podujatia = await nacitajUdalosti();
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

        const dnes = new Date().toLocaleDateString('sv-SE');

const blizke = podujatia
  .map(p => ({
    ...p,
    lat: Number(p.lat ?? p.latitude),
    lon: Number(p.lon ?? p.lng ?? p.longitude)
  }))
  .filter(p =>
    p.datum &&
    p.datum.slice(0, 10) >= dnes &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lon)
  )
  .map(p => ({
    ...p,
    km: vzdialenost(p.lat, p.lon)
  }))
  .filter(p => p.km <= 50)
  .sort((a, b) => new Date(a.datum) - new Date(b.datum) || a.km - b.km);

        let zoznam = document.getElementById('nearby-results');

        if (!zoznam) {
          zoznam = document.createElement('div');
          zoznam.id = 'nearby-results';
          button.insertAdjacentElement('afterend', zoznam);
        }

        zoznam.replaceChildren();

        const nadpis = document.createElement('h3');
        nadpis.textContent = '📍 ' + (localStorage.getItem('lang') === 'en' ? 'Events within 50 km of you' : 'Akcie do 50 km od vás');
        zoznam.appendChild(nadpis);

        if (!blizke.length) {
          const sprava = document.createElement('p');
          sprava.textContent = 'Zatiaľ nemáme v okolí do 50 km žiadne evidované podujatia.';
          zoznam.appendChild(sprava);
        }

        blizke.forEach(p => {
  const karta = document.createElement('div');
  karta.style.cssText = 'background:rgba(0,0,0,.65);padding:16px;margin:12px 0;border-radius:14px;color:white;';

  const nazov = document.createElement('h3');
  nazov.textContent = p.nazov;
  karta.appendChild(nazov);
if (p.obrazok) {
  const obrazok = document.createElement('img');
  obrazok.src = p.obrazok;
  obrazok.alt = p.nazov;
  obrazok.style.cssText = 'width:100%;border-radius:12px;margin:10px 0;';
  karta.appendChild(obrazok);
}
  const info = document.createElement('p');
  const datum = new Date(p.datum);
  info.textContent = `📅 ${datum.toLocaleDateString('sk-SK', {dateStyle:'medium'})}, ${datum.getHours() === 0 && datum.getMinutes() === 0 ? 'Čas neuvedený' : datum.toLocaleTimeString('sk-SK', {hour:'2-digit',minute:'2-digit'})} | 📍 ${p.mesto} | ${p.km.toFixed(1)} km`;
  karta.appendChild(info);
const detail = document.createElement('p');
detail.textContent = (p.popis || (localStorage.getItem('lang') === 'en' ? 'Details about this event are not available yet.' : 'Podrobnosti o podujatí zatiaľ nie sú dostupné.')).replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
detail.style.display = 'none';

const viac = document.createElement('button');
viac.textContent = localStorage.getItem('lang') === 'en' ? '📖 More about the event' : '📖 Viac o podujatí';
viac.addEventListener('click', () => {
  detail.style.display =
    detail.style.display === 'none' ? 'block' : 'none';
});

karta.appendChild(viac);
karta.appendChild(detail);
  if (p.url) {
    const odkaz = document.createElement('a');
    odkaz.href = p.url;
    odkaz.textContent = '🔗 Zdroj: Pútač.sk';
    odkaz.target = '_blank';
    odkaz.rel = 'noopener noreferrer';
    odkaz.style.color = '#ffd166';
    karta.appendChild(odkaz);
  }

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
  try {
  podujatia.push(...(await nacitajBrno()));
} catch (error) {
  console.error('Chyba načítania Brna:', error);
}

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
    const kategoria = (p.kategoria || '').toLowerCase();
const farba =
  /hudba|koncert|festival/.test(kategoria) ? 'purple' :
  /šport|sport|beh|turistika/.test(kategoria) ? 'green' :
  /divadlo|kultúra|kultura|výstava|vystava/.test(kategoria) ? 'orange' :
  /motor|auto|moto|veterán|veteran|tuning|rally|preteky|zraz/.test(kategoria) ? 'red' :
  'blue';
    L.circleMarker([p.lat, p.lon], {
      radius: 8,
      color: farba,
fillColor: farba,
      
      fillOpacity: 0.9
    })
      .addTo(mapa)
  .bindPopup(`<div style="min-width:200px;max-width:260px;max-height:55vh;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch">
  <b>${p.nazov}</b>
  ${p.obrazok ? `<img src="${p.obrazok}" alt="" style="width:100%;border-radius:10px;margin:10px 0">` : ''}
  <div>📍 ${p.mesto}</div>
  <div>📅 ${new Date(p.datum).toLocaleString('sk-SK', {dateStyle:'medium',timeStyle:'short'})}</div>
  <p>${p.popis || ''}</p>
  <a href="${p.url}" target="_blank" rel="noopener noreferrer">👉 Viac informácií</a>
</div>`, { maxWidth: 280, autoPan: true, autoPanPadding: [80, 80] });

  }
});
  setTimeout(() => {
  mapa.invalidateSize();

  const body = podujatia
    .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng))
    .map(p => [p.lat, p.lng]);

  if (body.length > 0) {
    mapa.fitBounds(body, { padding: [30, 30] });
  }
}, 300);
}
 }); 
// Prihlasovanie cez Supabase
const SUPABASE_AUTH_URL = `${SUPABASE_URL}/auth/v1`;
async function prihlasitSa(email) {
            const response = await fetch(`${SUPABASE_AUTH_URL}/otp?redirect_to=${encodeURIComponent('https://kamvceskoslovensku.sk/')}`, {
          method: 'POST',
          headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
  email,
  create_user: true,
  gotrue_meta_security: {},
  email_redirect_to: 'https://kamvceskoslovensku.sk/',
}),
        });
    if (!response.ok) throw new Error('Nepodarilo sa odoslať prihlasovací e-mail.');
  }
// Dokončenie prihlásenia cez e-mailový odkaz Supabase
async function skontrolujPrihlasenie() {
  const params = new URLSearchParams(window.location.hash.substring(1) || window.location.search.substring(1));
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
      tlacidlo.onclick = () => alert('👤 Môj profil\n📧 ' + user.email);
    }
  } catch (error) {
    console.error('Chyba overenia prihlásenia:', error);
  }
}

document.getElementById('pridat-mototrasu')?.addEventListener('click', async () => {
  const token = localStorage.getItem('kamv_access_token');

  if (!token) {
    alert('🔐 Na pridanie mototrasy sa musíš najprv prihlásiť.');
    return;
  }

  const response = await fetch(`${SUPABASE_AUTH_URL}/user`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    alert('🔐 Prihlásenie vypršalo. Prihlás sa znova.');
    return;
  }

  const formular = document.getElementById('formular-mototrasy');
if (formular) {
  formular.style.display = 'block';
  formular.scrollIntoView({ behavior: 'smooth' });
}
});
document.addEventListener('DOMContentLoaded', skontrolujPrihlasenie);
document.addEventListener('DOMContentLoaded', () => {
  const tlacidlo = [...document.querySelectorAll('button')]
    .find(b => b.textContent.includes('Môj účet'));

  if (tlacidlo) {
    tlacidlo.onclick = () => {
      const email = prompt('Zadaj svoj e-mail:');
      if (email) alert('👤 Môj profil\n📧 ' + email);
    };
  }
});
