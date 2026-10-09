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
    alert('Vyhľadávanie pripravujeme. Čoskoro tu nájdeš výlety a podujatia.');
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
