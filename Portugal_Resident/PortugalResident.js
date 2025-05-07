// Dictionary containing RSS feeds for each category from Portugal Resident
const feeds = {
  'ultimaHora': 'https://www.portugalresident.com/feed', // Latest news feed
  'algarve': 'https://www.portugalresident.com/category/algarve/feed/', // Algarve region news feed
  'portugal': 'https://www.portugalresident.com/category/portugal/feed/', // Portugal news feed
  'world': 'https://www.portugalresident.com/category/world/feed/', // World news feed
  'opinion': 'https://www.portugalresident.com/category/opinion/feed/', // Opinion articles feed
  'lifestyle': 'https://www.portugalresident.com/category/lifestyle/feed/', // Lifestyle news feed
  'environment': 'https://www.portugalresident.com/category/nature/feed/', // Environment/Nature news feed
  'business': 'https://www.portugalresident.com/category/business/feed/' // Business news feed
};

// Object to store loaded news categories to avoid redundant API calls
const loadedCategories = {};

// Asynchronously loads news for a given category
async function loadCategory(category) {
  // Display the loading indicator
  document.getElementById('loading').style.display = 'block';

  // Remove the 'active' class from all navigation links
  document.querySelectorAll('.navbar a').forEach(link => link.classList.remove('active'));
  // Add the 'active' class to the clicked category's navigation link
  const activeLink = document.getElementById('menu-' + category);
  if (activeLink) activeLink.classList.add('active');

  // If the category is already loaded, display the cached content and hide the loading indicator
  if (loadedCategories[category]) {
      document.getElementById('news-section').innerHTML = loadedCategories[category];
      document.getElementById('loading').style.display = 'none';
      return;
  }

  // Construct the URL to fetch the RSS feed using a CORS proxy
  const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(feeds[category])}`;

  try {
      // Fetch the RSS feed data
      const res = await fetch(url);
      const text = await res.text();

      // Parse the XML content of the RSS feed
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'application/xml');
      // Select the first 25 news items from the feed
      const items = Array.from(xml.querySelectorAll('item')).slice(0, 25);

      // Map each news item to its HTML representation
      const html = items.map(item => {
          // Extract the title, description, and link from the item, providing defaults if they are missing
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '') || ''; // Remove HTML tags from the description
          const link = item.querySelector('link')?.textContent || '#';

          // Return the HTML structure for a single news card
          return `
              <div class="news-card" onclick="window.open('${link}', '_blank')">
                  <div class="news-title">${title}</div>
                  <div class="news-description">${description.slice(0, 150)}...</div>
                  <div class="news-source">Portugal Resident - ${category.charAt(0).toUpperCase() + category.slice(1)}</div>
              </div>`;
      }).join(''); // Join all news card HTML strings together

      // Cache the loaded HTML for the category
      loadedCategories[category] = html;
      // Update the news section with the fetched and formatted news
      document.getElementById('news-section').innerHTML = html;
      // Hide the loading indicator
      document.getElementById('loading').style.display = 'none';

  } catch (err) {
      // If an error occurs during fetching or processing, display an error message with a reload button
      document.getElementById('news-section').innerHTML = `<p>Error loading news. <button onclick="loadCategory('${category}')">Reload</button></p>`;
      // Log the error to the console
      console.error('RSS Error:', err);
  }
}

// Event listener for the dark mode toggle button
document.getElementById('toggle-dark-mode').addEventListener('click', () => {
  const body = document.body;
  const icon = document.getElementById('toggle-dark-mode');

  // Toggle the 'dark-mode' class on the body
  body.classList.toggle('dark-mode');

  // Update the icon and color based on the dark mode state
  if (body.classList.contains('dark-mode')) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
      icon.style.color = '#ffd700'; // Gold color for the sun icon
  } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
      icon.style.color = '#fff'; // White color for the moon icon
  }
});

// Function to search news based on the user's input
function searchNews() {
  const query = document.getElementById('search-input').value.toLowerCase(); // Get the search query and convert it to lowercase
  const newsCards = document.querySelectorAll('.news-card'); // Select all news card elements

  // Iterate through each news card
  newsCards.forEach(card => {
      // Get the title and description text content and convert them to lowercase
      const title = card.querySelector('.news-title').textContent.toLowerCase();
      const description = card.querySelector('.news-description').textContent.toLowerCase();

      // Display the card if the title or description includes the search query, otherwise hide it
      card.style.display = (title.includes(query) || description.includes(query)) ? 'block' : 'none';
  });
}

// Load the latest news ('ultimaHora') by default when the page loads
loadCategory('ultimaHora');
  