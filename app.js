document.addEventListener('DOMContentLoaded', () => {
  const categories = document.querySelectorAll('.category-card');
  const searchBox = document.querySelector('.search-box');
  const searchButton = searchBox?.querySelector('button');

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
  const what = document.getElementById('search-what')?.value.trim() || '';
const where = document.getElementById('search-where')?.value.trim() || '';
const when = document.getElementById('search-when')?.value || '';
const query = [what, where].filter(Boolean).join(' ');
const cards = [...document.querySelectorAll('.event-card')];
const text = query.toLocaleLowerCase('sk');
let count = 0;

cards.forEach(card => {
  const matches = !text || text.split(' ').every(word =>
    card.textContent.toLocaleLowerCase('sk').includes(word)
  );
  card.style.display = matches ? '' : 'none';
  if (matches) count++;
});

let result = document.getElementById('search-result');
if (!result) {
  result = document.createElement('p');
  result.id = 'search-result';
  searchButton.insertAdjacentElement('afterend', result);
}
result.textContent = count
  ? `Našli sme ${count} podujatí na našej stránke.`
  : 'Zatiaľ nemáme podujatie podľa vášho výberu.';
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
fetch('podujatia.json')
  .then(response => response.json())
  .then(podujatia => {
    const zoznam = document.querySelector('.event-grid');
    if (!zoznam) return;

    podujatia.forEach(p => {
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
