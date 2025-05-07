// Dictionary of RSS feed categories and their corresponding Notícias ao Minuto URLs
const feeds = {
  'ultimaHora': 'https://www.noticiasaominuto.com/rss/ultima-hora',
  'politica': 'https://www.noticiasaominuto.com/rss/politica',
  'economia': 'https://www.noticiasaominuto.com/rss/economia',
  'desporto': 'https://www.noticiasaominuto.com/rss/desporto',
  'fama': 'https://www.noticiasaominuto.com/rss/fama',
  'pais': 'https://www.noticiasaominuto.com/rss/pais',
  'mundo': 'https://www.noticiasaominuto.com/rss/mundo',
  'tecnologia': 'https://www.noticiasaominuto.com/rss/tech',
  'cultura': 'https://www.noticiasaominuto.com/rss/cultura',
  'lifestyle': 'https://www.noticiasaominuto.com/rss/lifestyle',
  'auto': 'https://www.noticiasaominuto.com/rss/auto'
};

// Object to cache previously loaded categories
const loadedCategories = {};

// Function to load news for a given category
async function loadCategory(category) {
  // Show loading spinner
  document.getElementById('loading').style.display = 'block';

  // Remove "active" class from all navbar links
  document.querySelectorAll('.navbar a').forEach(link => link.classList.remove('active'));

  // Add "active" class to the selected category
  const activeLink = document.getElementById('menu-' + category);
  if (activeLink) activeLink.classList.add('active');

  // If category has already been loaded, show cached HTML
  if (loadedCategories[category]) {
    document.getElementById('news-section').innerHTML = loadedCategories[category];
    document.getElementById('loading').style.display = 'none';
    return;
  }

  // Use AllOrigins API to bypass CORS when fetching external RSS
  const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(feeds[category])}`;
  try {
    const res = await fetch(url);
    const text = await res.text();

    // Parse XML response
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'application/xml');
    const items = Array.from(xml.querySelectorAll('item')).slice(0, 25); // Pegar os primeiros 25 itens

    // Build HTML for each news item
    const html = items.map(item => {
      const title = item.querySelector('title')?.textContent || '';
      const description = item.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '') || '';
      const link = item.querySelector('link')?.textContent || '#';

      return `
        <div class="news-card" onclick="window.open('${link}', '_blank')">
          <div class="news-title">${title}</div>
          <div class="news-description">${description.slice(0, 150)}...</div>
          <div class="news-source">Noticias ao minuto - ${category.charAt(0).toUpperCase() + category.slice(1)}</div>
        </div>`;
    }).join('');

    // Cache and display generated HTML
    loadedCategories[category] = html;
    document.getElementById('news-section').innerHTML = html;
    document.getElementById('loading...').style.display = 'none';

  } catch (err) {
    // Error handling: show retry button and log error
    document.getElementById('news-section').innerHTML = `<p>Error loading news. <button onclick="loadCategory('${category}')">Reload</button></p>`;
    console.error('RSS Error:', err);
  }
}

// Load the "Última Hora" category on first page load
loadCategory('ultimaHora');

// Toggle Dark Mode (and swap the icon between moon and sun)
document.getElementById('toggle-dark-mode').addEventListener('click', () => {
  const body = document.body;
  const icon = document.getElementById('toggle-dark-mode');

  body.classList.toggle('dark-mode');

  if (body.classList.contains('dark-mode')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    icon.style.color = '#ffd700'; // Sun color
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
    icon.style.color = '#fff'; // Default moon color
  }
});

// Search functionality to filter news by title or description
function searchNews() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const newsCards = document.querySelectorAll('.news-card');

  newsCards.forEach(card => {
    const title = card.querySelector('.news-title').textContent.toLowerCase();
    const description = card.querySelector('.news-description').textContent.toLowerCase();

    // Show card only if query matches title or description
    card.style.display = (title.includes(query) || description.includes(query)) ? 'block' : 'none';
  });
}
