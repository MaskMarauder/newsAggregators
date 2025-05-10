// Object that stores the RSS feed URLs for different news categories from the Expresso website.
// The 'key' represents the category name (in Portuguese), and the 'value' is the corresponding RSS feed URL.
const feeds = {
  'Geral': 'https://feeds.feedburner.com/expresso-geral' // RSS feed with the latest news from the "Geral" (General) category. 
};

// Object to store the HTML content of news categories that have already been loaded.
// This serves as a 'cache' to avoid making repeated API (server) calls
// if the user clicks on the same category again, improving performance.
const loadedCategories = {};

// Asynchronous function (async) to load the news for a given category.
// The keyword 'async' indicates that this function may contain operations that take time,
// and that JavaScript should not stop executing while waiting for them.
async function loadCategory(category) {
  // Displays the visual 'loading...' indicator to inform the user
  // that something is happening in the background.
  document.getElementById('loading').style.display = 'block';

  // Removes the 'active' class from all navigation links in the menu bar.
  // This is done to unmark any category that was previously selected.
  document.querySelectorAll('.navbar a').forEach(link => link.classList.remove('active'));

  // Adds the 'active' class to the navigation link of the category that was clicked.
  // This visually highlights the category that the user is viewing.
  const activeLink = document.getElementById('menu-' + category);
  if (activeLink) activeLink.classList.add('active');

  // Checks if the HTML content for this category has already been loaded and is in the 'cache'.
  if (loadedCategories[category]) {
      // If it's already loaded, simply displays the stored content
      // in the news section and hides the loading indicator.
      document.getElementById('news-section').innerHTML = loadedCategories[category];
      document.getElementById('loading').style.display = 'none';
      // The 'return' statement here makes the function stop executing,
      // as we already have what we need.
      return;
  }

  // Constructs the URL to fetch the RSS feed for the category.
  // As some websites may block requests from other domains (Cross-Origin),
  // we use a 'CORS proxy' (api.allorigins.win) to mediate the request.
  // 'encodeURIComponent' ensures that the feed URL is correctly encoded
  // to be used within another URL.
  const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(feeds[category])}`;

  try {
      // 'fetch' is a modern function for making HTTP requests (fetching data from the web).
      // 'await' pauses the execution of this function until the Promise returned by 'fetch' is resolved
      // (i.e., the server's response arrives).
      const res = await fetch(url);
      // 'res.text()' also returns a Promise that resolves to the content of the response as text (XML in this case).
      const text = await res.text();

      // Creates a 'DOMParser' object to analyze the XML content of the RSS feed.
      // The DOM (Document Object Model) represents the structure of the XML as a tree of objects.
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'application/xml');

      // Selects the first 25 '<item>' elements from the XML, which represent the news articles.
      // 'querySelectorAll' returns a list of all elements that match the selector ('item').
      // 'Array.from' converts this list into an array so that we can use array methods like 'slice'.
      // 'slice(0, 25)' gets the elements from index 0 up to (but not including) index 25.
      const items = Array.from(xml.querySelectorAll('item')).slice(0, 25);

      // 'map' is an array method that creates a new array with the results of calling a function
      // on each element of the original array. Here, we transform each news item into its HTML.
      const html = items.map(item => {
          // Extracts the title of the news article from the '<title>' element.
          // The '?' operator (optional chaining) prevents errors if the '<title>' element does not exist.
          // If the title does not exist, we use an empty string ('').
          const title = item.querySelector('title')?.textContent || '';

          // Extracts the description of the news article from the '<description>' element.
          // 'textContent' gets only the text inside the HTML tags.
          // 'replace(/<[^>]*>/g, '')' uses a regular expression to remove any HTML tags
          // that might be inside the description.
          // Again, we use '?' to prevent errors and '' as a default value.
          const description = item.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '') || '';

          // Extracts the link of the news article from the '<link>' element.
          // If the link does not exist, we use '#' as a default link that goes nowhere.
          const link = item.querySelector('link')?.textContent || '#';

          // Returns the HTML structure to display a single news article in a 'card'.
          // The 'onclick' function makes the browser window open the news link
          // in a new tab ('_blank') when the card is clicked.
          return `
              <div class="news-card" onclick="window.open('${link}', '_blank')">
                  <div class="news-title">${title}</div>
                  <div class="news-description">${description.slice(0, 150)}...</div>
                  <div class="news-source">Expresso - ${category.charAt(0).toUpperCase() + category.slice(1)}</div>
              </div>`;
      }).join(''); // 'join('')' concatenates all the HTML strings in the array into a single string.

      // Stores the generated HTML for this category in the 'loadedCategories' object (cache).
      loadedCategories[category] = html;

      // Updates the content of the news section ('news-section') in the HTML
      // with the news HTML that we just fetched and formatted.
      document.getElementById('news-section').innerHTML = html;

      // Hides the 'loading...' indicator since the data has been loaded.
      document.getElementById('loading').style.display = 'none';

  } catch (err) {
      // If any error occurs during the fetching or processing of the data (for example,
      // if the server does not respond or if there is a problem with the XML),
      // this 'catch' block will be executed.

      // Displays an error message in the news section, including a button to try reloading.
      document.getElementById('news-section').innerHTML = `<p>Error loading news. <button onclick="loadCategory('${category}')">Reload</button></p>`;

      // Prints the error to the browser's console to help with debugging (finding and fixing problems).
      console.error('RSS Error:', err);
  }
}

// Adds an 'event listener' to the dark mode toggle button.
// When the button is clicked ('click'), the function inside '{}' will be executed.
document.getElementById('toggle-dark-mode').addEventListener('click', () => {
  // Gets a reference to the 'body' element of the HTML document.
  const body = document.body;
  // Gets a reference to the icon element (presumably a moon or sun icon).
  const icon = document.getElementById('toggle-dark-mode');

  // 'classList' allows you to manipulate the CSS classes of an element.
  // 'toggle('dark-mode')' adds the 'dark-mode' class if it doesn't exist,
  // and removes it if it already exists, toggling the dark mode.
  body.classList.toggle('dark-mode');

  // Checks if the body of the page now contains the 'dark-mode' class.
  if (body.classList.contains('dark-mode')) {
      // If in dark mode, removes the 'fa-moon' class (moon icon)
      // and adds the 'fa-sun' class (sun icon), assuming we are using
      // an icon library like Font Awesome.
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
      // Sets the color of the icon to gold to represent the sun.
      icon.style.color = '#ffd700';
  } else {
      // If not in dark mode (light mode), removes the 'fa-sun' class
      // and adds the 'fa-moon' class.
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
      // Sets the color of the icon to white to represent the moon.
      icon.style.color = '#fff';
  }
});

// Function to search news based on what the user types in the search bar.
function searchNews() {
  // Gets the text typed in the input box with the ID 'search-input'.
  // '.value' gets the current value of the input, and '.toLowerCase()' converts it to lowercase
  // so that the search is not case-sensitive.
  const query = document.getElementById('search-input').value.toLowerCase();

  // Selects all HTML elements with the class 'news-card', which are the containers
  // for each displayed news article.
  const newsCards = document.querySelectorAll('.news-card');

  // 'forEach' is an array method that allows you to execute a function for each element of the array.
  // Here, we iterate through each 'news-card'.
  newsCards.forEach(card => {
      // Inside each card, we select the element with the class 'news-title' (news title)
      // and get its text, converting it to lowercase.
      const title = card.querySelector('.news-title').textContent.toLowerCase();

      // We do the same for the element with the class 'news-description' (news description).
      const description = card.querySelector('.news-description').textContent.toLowerCase();

      // Checks if the title OR the description of the news article (using the '||' - OR logical operator)
      // includes the 'query' (the text the user typed).
      // 'includes()' is a string method that returns 'true' if the string contains the specified substring.

      // If the title or the description contains the query, we set the 'display' style of the card to 'block',
      // making it visible. Otherwise, we set it to 'none', hiding it.
      card.style.display = (title.includes(query) || description.includes(query)) ? 'block' : 'none';
  });
}

// This function toggles the visibility of the navigation links on small screens.
// It selects the element with the ID 'nav-links' and adds or removes the 'show' class.
// The 'show' class is used to control whether the menu is visible (e.g., when the hamburger icon is clicked).
function toggleMenu() {
  const navLinks = document.getElementById('nav-links');
  navLinks.classList.toggle('show'); // toggle between showing and hiding
}

// Close the menu when a category link is clicked (on small screens)
document.querySelectorAll('#nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    const navLinks = document.getElementById('nav-links');
    if (navLinks.classList.contains('show')) {
      navLinks.classList.remove('show');
    }
  });
});

// Calls the 'loadCategory' function with the 'ultimaHora' category when the page loads.
// This makes the latest news appear by default as soon as the user accesses the page.
loadCategory('Geral');