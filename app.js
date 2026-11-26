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
  nazov: '🏁 Kalendár motoristických podujatí ČR – ročník 2026',
  kategoria: 'Motorizmus',
  url: MOTORSPORT_ZDROJ,
  zdroj: 'Autoklub ČR'
});
motoristickePodujatia.push({
  nazov: '🇸🇰 Kalendár motocyklových podujatí SMF – ročník 2026',
  kategoria: 'Motorizmus',
  url: 'https://www.smf.sk/kalendare-podujati-smf/',
  zdroj: 'Slovenská motocyklová federácia'
});

const smfPodujatia = [
  { datum: '2026-03-21', nazov: 'Enduro Cup Stred', mesto: 'Brezno – BMT' },
  { datum: '2026-03-28', nazov: 'MM SR – skrátené enduro', mesto: 'Družstevná pri Hornáde' },
  { datum: '2026-04-03', nazov: 'M SR šprint – POWER FEST', mesto: 'Slovakia Ring' },
  { datum: '2026-04-18', nazov: 'MM SR – country cross', mesto: 'Skýcov' },
  { datum: '2026-04-24', nazov: 'Jarná cena Brna – cestné preteky', mesto: 'Brno, ČR' },
  { datum: '2026-05-09', nazov: 'MM SR a Pohár SMF', mesto: 'Vieska Bezdedov' },
  { datum: '2026-05-23', nazov: 'MM SR – skrátené enduro', mesto: 'Morovno' },
  { datum: '2026-06-06', nazov: 'MM SR – enduro', mesto: 'Lehota pod Vtáčnikom' },
  { datum: '2026-07-11', nazov: 'MM SR – country cross', mesto: 'Žaškov' },
  { datum: '2026-08-22', nazov: 'MM SR – enduro', mesto: 'Polomka' },
  { datum: '2026-09-12', nazov: 'MM SR – skrátené enduro', mesto: 'Duchonka' },
  { datum: '2026-10-24', nazov: 'MM SR – enduro', mesto: 'Szandaváralja, Maďarsko' }
];
const noveMotoPodujatia = [];
// Podujatia SMF – konkrétne termíny
// Kalendár 2026 je už ukončený.
// Nové podujatia pridáme po zverejnení kalendára 2027.
// Archív motocyklových podujatí SMF 2026
const aktualneSmfPodujatia = smfPodujatia.filter(p => p.datum && new Date(p.datum) >= new Date());
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
  const vsetkyMoto = [
    ...motoristickePodujatia,
    ...aktualneSmfPodujatia,
    ...motoAkcie
  ];

  const bezDuplicit = [...new Map(
    vsetkyMoto.map(p => [`${p.nazov}|${p.datum || ''}`, p])
  ).values()];

  motoList.innerHTML = bezDuplicit.map(p => `
    <div class="event-card" style="padding:16px;margin:12px 0;">
      <h3>${p.nazov}</h3>
      <p>📅 ${p.datum ? new Date(p.datum).toLocaleDateString('sk-SK') : 'Kalendár podujatí'}${p.mesto ? ' 📍 ' + p.mesto : ''}</p>
      <p>🏍️ ${p.zdroj || 'SMF – Slovenská motocyklová federácia'}</p>
      ${p.url ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer">Zobraziť podrobnosti →</a>` : ''}
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

  const groups = {};
  const colors = {'Podujatia':'#2563eb','Hudba':'#9333ea','Šport':'#16a34a','Kultúra':'#ea580c','Moto':'#dc2626','Turistika':'#15803d','Cyklistika':'#0891b2','Rodina':'#db2777','Príroda':'#65a30d','Hrady':'#92400e','Kemping':'#0f766e'};
  for (const name of Object.keys(colors)) groups[name]=L.layerGroup().addTo(mapa);
  const points=[
    ['Turistika','Štrbské Pleso',49.119,20.063],['Turistika','Pustevny',49.49,18.264],
    ['Príroda','Slovenský raj – Podlesok',48.967,20.386],['Príroda','Macocha',49.373,16.729],
    ['Hrady','Spišský hrad',49.0008,20.7684],['Hrady','Karlštejn',49.939,14.188],
    ['Rodina','Zoo Bojnice',48.781,18.574],['Rodina','Zoo Praha',50.117,14.412],
    ['Moto','Čertovica',48.904,19.738],['Moto','Červenohorské sedlo',50.125,17.153],
    ['Cyklistika','Dunajská hrádza – Gabčíkovo',47.891,17.578],['Cyklistika','Lednice',48.799,16.805],
    ['Kemping','Autocamping Tatranská Štrba',49.086,20.069],['Kemping','Autokemp Merkur Pasohlávky',48.903,16.563],
    ["Hrady","Oravský hrad",49.261,19.359,"Historický hrad nad riekou Orava."],
    ["Hrady","Bojnický zámok",48.78,18.577,"Romantický zámok s historickými interiérmi."],
    ["Hrady","Trenčiansky hrad",48.894,18.044,"Dominanta mesta Trenčín."],
    ["Hrady","Hrad Devín",48.174,16.978,"Zrúcanina nad sútokom Dunaja a Moravy."],
    ["Hrady","Hluboká nad Vltavou",49.052,14.441,"Novogotický zámok."],
    ["Hrady","Lednický zámok",48.801,16.805,"Zámok a rozsiahly park."],
    ["Hrady","Hrad Bouzov",49.705,16.889,"Historický hrad na Morave."],
    ["Príroda","Šútovský vodopád",49.18,19.076,"Vodopád v Malej Fatre; cieľ pešej túry."],
    ["Príroda","Súľovské skaly",49.17,18.59,"Skalné útvary a turistické chodníky."],
    ["Príroda","Demänovská jaskyňa slobody",48.998,19.585,"Krasová jaskyňa v Nízkych Tatrách."],
    ["Príroda","Adršpašské skaly",50.616,16.12,"Rozsiahle pieskovcové skalné mesto."],
    ["Príroda","Prachovské skály",50.468,15.288,"Skalné mesto v Českom raji."],
    ["Turistika","Hrebienok",49.159,20.224,"Východisko tatranských turistických trás."],
    ["Turistika","Donovaly",48.878,19.226,"Horské stredisko a východisko výletov."],
    ["Turistika","Jánošíkove diery",49.257,19.065,"Rokliny s lávkami a rebríkmi; overte priechodnosť."],
    ["Turistika","Sněžka",50.736,15.739,"Najvyšší vrch Česka; horská turistika."],
    ["Turistika","Praděd",50.083,17.231,"Najvyšší vrch Hrubého Jeseníka."],
    ["Rodina","Vlkolínec",49.039,19.278,"Historická dedina zapísaná v UNESCO."],
    ["Rodina","Zoo Košice",48.786,21.204,"Zoologická záhrada v Kavečanoch."],
    ["Rodina","Zoo Zlín",49.272,17.714,"Zoologická záhrada v Lešnej."],
    ["Rodina","Zoo Ostrava",49.844,18.318,"Zoologická záhrada a botanický areál."],
    ["Rodina","Valašské múzeum v prírode",49.459,18.151,"Tradičná architektúra v Rožnove pod Radhoštěm."],
    ["Príroda","Panská skála",50.77,14.485,"Čadičové skalné útvary."],
    ["Hrady","Hrad Loket",50.186,12.754,"Hrad nad riekou Ohře."]
  ];
  function addPoint(group,name,lat,lon,detail,url){
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return;
    const popup=document.createElement('div');
    const title=document.createElement('strong');title.textContent=name;popup.append(title);
    if(detail){const p=document.createElement('p');p.textContent=detail;popup.append(p);}
    const link=document.createElement('a');link.textContent='🗺️ Otvoriť v Google Maps';link.target='_blank';link.rel='noopener noreferrer';link.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+' '+lat+','+lon);popup.append(link);
    try{const u=new URL(url);if(['https:','http:'].includes(u.protocol)){const more=document.createElement('a');more.href=u.href;more.target='_blank';more.rel='noopener noreferrer';more.textContent='Viac informácií';popup.append(document.createElement('br'),more);}}catch{}
    L.circleMarker([lat,lon],{radius:8,color:colors[group],fillColor:colors[group],fillOpacity:0.85,weight:2}).bindPopup(popup).addTo(groups[group]);
  }
  for(const [group,name,lat,lon,description] of points)addPoint(group,name,lat,lon,(description?description+' ':'')+'Orientačný bod – pred cestou overte dostupnosť.');
  for(const p of podujatia){
    const k=String(p.kategoria||'').toLowerCase();
    const group=/motor|auto|moto|rally|zraz/.test(k)?'Moto':/hudba|koncert|festival/.test(k)?'Hudba':/šport|sport|beh/.test(k)?'Šport':/divadlo|kultúra|kultura|výstava|vystava/.test(k)?'Kultúra':'Podujatia';
    addPoint(group,p.nazov,p.lat,p.lon??p.lng,[p.mesto,p.datum?new Date(p.datum).toLocaleString('sk-SK'):'',p.popis].filter(Boolean).join(' · '),p.url);
  }
  const overlays={};for(const name of Object.keys(groups))overlays['<span style="color:'+colors[name]+'">●</span> '+name]=groups[name];
  L.control.layers(null,overlays,{collapsed:true}).addTo(mapa);
  setTimeout(()=>mapa.invalidateSize(),300);

}
 }); 
// Prihlasovanie cez Supabase
const SUPABASE_AUTH_URL = `${SUPABASE_URL}/auth/v1`;

async function prihlasitSa(email) {
  const redirectUrl = 'https://kamvceskoslovensku.sk/hladat.html';

  const response = await fetch(
    `${SUPABASE_AUTH_URL}/otp?redirect_to=${encodeURIComponent(redirectUrl)}`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        create_user: true,
        email_redirect_to: redirectUrl
      })
    }
  );

  if (!response.ok) {
    throw new Error('Nepodarilo sa odoslať prihlasovací e-mail.');
  }
}

// Dokončenie prihlásenia cez e-mailový odkaz Supabase
async function skontrolujPrihlasenie() {
  const params = new URLSearchParams(window.location.search || window.location.hash.substring(1));
  


const hashParams = new URLSearchParams(
  window.location.hash.substring(1)
);

const accessToken =
  hashParams.get('access_token') ||
  params.get('access_token');

const refreshToken =
  hashParams.get('refresh_token') ||
  params.get('refresh_token');


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
  const form = document.getElementById('formular-mototrasy');
  if (!form) return;
  function validMap(value) {
    try {
      const u = new URL(value);
      return u.protocol === 'https:' && !u.username && !u.password &&
        (u.hostname === 'maps.app.goo.gl' || u.hostname === 'maps.google.com' ||
        (['www.google.com','www.google.sk','www.google.cz','google.com'].includes(u.hostname) && /^\/maps(?:\/|$)/.test(u.pathname)));
    } catch { return false; }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    if (button.disabled) return;
    const token = localStorage.getItem('kamv_access_token');
    if (!token) return alert('Najprv sa prihlás.');
    const data = {category:'moto', title:document.getElementById('moto-nazov').value.trim(), country:document.getElementById('moto-krajina').value, description:document.getElementById('moto-popis').value.trim(), map_url:document.getElementById('moto-mapa').value.trim()};
    if (!data.title || !data.description || !validMap(data.map_url)) return alert('Vyplň názov, popis a platný odkaz na Google Maps.');
    button.disabled = true;
    try {
      const response = await fetch(SUPABASE_URL+'/rest/v1/trips', {method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+token,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(data)});
      if (response.status === 401) return alert('Prihlásenie vypršalo. Prihlás sa znova.');
      if (!response.ok) throw new Error('HTTP '+response.status);
      form.reset(); form.style.display='none';
      alert('Mototrasa bola odoslaná a čaká na schválenie.');
    } catch(error) { console.error(error); alert('Mototrasu sa nepodarilo uložiť. Skús to znova.'); }
    finally { button.disabled=false; }
  });
  (async () => {
    try {
      const response=await fetch(SUPABASE_URL+'/rest/v1/trips?select=title,country,description,map_url&category=eq.moto&status=eq.approved&order=created_at.desc',{headers:{apikey:SUPABASE_KEY}});
      if (!response.ok) throw new Error('HTTP '+response.status);
      for (const route of await response.json()) {
        if (!validMap(route.map_url)) continue;
        const card=document.createElement('article'); card.className='event-card';
        const title=document.createElement('h3'); title.textContent='🏍️ '+route.title;
        const country=document.createElement('p'); country.textContent='📍 '+route.country;
        const description=document.createElement('p'); description.textContent=route.description;
        const link=document.createElement('a'); link.href=route.map_url; link.target='_blank'; link.rel='noopener noreferrer'; link.textContent='🗺️ Zobraziť mototrasu →';
        card.append(title,country,description,link); document.getElementById('moto').appendChild(card);
      }
    } catch(error) { console.error('Načítanie mototrás:',error); }
  })();
});
