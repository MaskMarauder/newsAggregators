// Dictionary of RSS feed categories and their corresponding Notícias ao Minuto URLs
const feeds = {
  'ultimaHora': 'https://www.noticiasaominuto.com/rss/ultima-hora',   // URL for the latest news feed
  'politica': 'https://www.noticiasaominuto.com/rss/politica',        // URL for politics news
  'economia': 'https://www.noticiasaominuto.com/rss/economia',        // URL for economics news
  'desporto': 'https://www.noticiasaominuto.com/rss/desporto',        // URL for sports news
  'fama': 'https://www.noticiasaominuto.com/rss/fama',                // URL for celebrity news
  'pais': 'https://www.noticiasaominuto.com/rss/pais',                // URL for news about Portugal (country)
  'mundo': 'https://www.noticiasaominuto.com/rss/mundo',              // URL for world news
  'tecnologia': 'https://www.noticiasaominuto.com/rss/tech',          // URL for technology news
  'cultura': 'https://www.noticiasaominuto.com/rss/cultura',          // URL for culture news
  'lifestyle': 'https://www.noticiasaominuto.com/rss/lifestyle',      // URL for lifestyle news
  'auto': 'https://www.noticiasaominuto.com/rss/auto'                 // URL for automotive news
};

// Object to cache (store temporarily) previously loaded categories to improve performance.
// This avoids making redundant (unnecessary) API calls if the user revisits the same category.
const loadedCategories = {};

// Asynchronous function to load news for a given category.
// 'async' allows the use of 'await' inside the function for handling promises.
async function loadCategory(category) {
  // Show the loading spinner element to indicate that data is being fetched.
  document.getElementById('loading').style.display = 'block';

  // Remove the "active" class from all navigation bar links.
  // This ensures that only the currently selected category's link is visually highlighted.
  document.querySelectorAll('.navbar a').forEach(link => link.classList.remove('active'));

  // Add the "active" class to the navigation link of the selected category.
  // This visually indicates to the user which category they are currently viewing.
  const activeLink = document.getElementById('menu-' + category);
  if (activeLink) activeLink.classList.add('active');

  // If the news for this category has already been loaded and stored in the cache,
  // display the cached HTML and hide the loading spinner.
  if (loadedCategories[category]) {
      document.getElementById('news-section').innerHTML = loadedCategories[category];
      document.getElementById('loading').style.display = 'none';
      return; // Exit the function early since the content is already available.
  }

  // Use the AllOrigins API as a CORS proxy to bypass Cross-Origin Resource Sharing (CORS) restrictions
  // when fetching the external RSS feed from Notícias ao Minuto. 'encodeURIComponent' ensures the URL is properly formatted.
  const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(feeds[category])}`;
  try {
      // Fetch the RSS feed data from the constructed URL.
      // 'await' pauses the execution of this function until the Promise returned by 'fetch' resolves.
      const res = await fetch(url);
      // Get the response body as text (which will be the XML content of the RSS feed).
      const text = await res.text();

      // Parse the XML response using the DOMParser API.
      // This converts the XML text into a Document Object Model (DOM) tree that can be easily traversed.
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'application/xml');
      // Select the first 25 '<item>' elements from the XML, which typically represent individual news articles.
      // 'querySelectorAll' returns a NodeList, which is converted to an Array using 'Array.from'
      // so that we can use the 'slice' method to take only the first 25 items.
      const items = Array.from(xml.querySelectorAll('item')).slice(0, 25); // Take the first 25 items

      // Build the HTML structure for each news item extracted from the RSS feed.
      // The 'map' function iterates over the 'items' array and creates a new array of HTML strings.
      const html = items.map(item => {
          // Extract the title of the news article from the '<title>' element.
          // The '?' (optional chaining) handles cases where the element might be missing.
          // 'textContent' gets the text content of the element, and '|| '' ensures an empty string if no title is found.
          const title = item.querySelector('title')?.textContent || '';
          // Extract the description of the news article from the '<description>' element and remove any HTML tags within it.
          const description = item.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '') || '';
          // Extract the link (URL) of the news article from the '<link>' element, defaulting to '#' if no link is found.
          const link = item.querySelector('link')?.textContent || '#';

          // Return the HTML structure for a single news card, which includes the title, a truncated description, and the source.
          // The 'onclick' event handler will open the news link in a new browser tab when the card is clicked.
          return `
              <div class="news-card" onclick="window.open('${link}', '_blank')">
                  <div class="news-title">${title}</div>
                  <div class="news-description">${description.slice(0, 150)}...</div>
                  <div class="news-source">Noticias ao minuto - ${category.charAt(0).toUpperCase() + category.slice(1)}</div>
              </div>`;
      }).join(''); // Join all the individual news card HTML strings together into a single HTML string.

      // Cache the generated HTML for the loaded category.
      loadedCategories[category] = html;
      // Set the inner HTML of the 'news-section' element to display the fetched and formatted news.
      document.getElementById('news-section').innerHTML = html;
      // Hide the loading spinner since the news has been successfully loaded and displayed.
      document.getElementById('loading').style.display = 'none';

  } catch (err) {
      // Error handling block that runs if any error occurs during the fetching or processing of the RSS feed.
      // Display an error message to the user with a button to retry loading the category.
      document.getElementById('news-section').innerHTML = `<p>Error loading news. <button onclick="loadCategory('${category}')">Reload</button></p>`;
      // Log the error to the browser's console for debugging purposes.
      console.error('RSS Error:', err);
  }
}

// Load the "ultimaHora" (latest news) category by default when the page first loads.
loadCategory('ultimaHora');

// Event listener for the dark mode toggle button.
// When the button is clicked, the provided function will be executed.
document.getElementById('toggle-dark-mode').addEventListener('click', () => {
  // Get references to the body element and the toggle icon element.
  const body = document.body;
  const icon = document.getElementById('toggle-dark-mode');

  // Toggle the 'dark-mode' class on the body element.
  // This will apply or remove the dark mode styles defined in the CSS.
  body.classList.toggle('dark-mode');

  // Check if the body element now contains the 'dark-mode' class.
  if (body.classList.contains('dark-mode')) {
      // If dark mode is enabled, remove the moon icon class and add the sun icon class
      // (assuming a library like Font Awesome is being used for icons).
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
      // Set the color of the sun icon to gold.
      icon.style.color = '#ffd700'; // Sun color
  } else {
      // If dark mode is disabled (light mode), remove the sun icon class
      // and add the moon icon class.
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
      // Set the color of the moon icon to white (or the default moon color).
      icon.style.color = '#fff'; // Default moon color
  }
});

// Search functionality to filter news articles based on the user's input in the search bar.
function searchNews() {
  // Get the value from the search input field, convert it to lowercase for case-insensitive searching.
  const query = document.getElementById('search-input').value.toLowerCase();
  // Select all elements with the class 'news-card', which represent individual news articles in the UI.
  const newsCards = document.querySelectorAll('.news-card');

  // Iterate over each news card element.
  newsCards.forEach(card => {
      // Get the text content of the news title and convert it to lowercase.
      const title = card.querySelector('.news-title').textContent.toLowerCase();
      // Get the text content of the news description and convert it to lowercase.
      const description = card.querySelector('.news-description').textContent.toLowerCase();

      // Show the news card only if the search query is found in either the title or the description.
      // 'includes()' returns true if the string contains the specified substring.
      card.style.display = (title.includes(query) || description.includes(query)) ? 'block' : 'none';
  });
}