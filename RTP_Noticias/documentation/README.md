
# RTP Notícias RSS Viewer

This project is a responsive web-based RSS reader for RTP (Rádio e Televisão de Portugal) news. It dynamically loads and displays news articles from various categories such as national, international, economy, sports, culture, videos, and audios.

## 📰 Features

- 📡 Fetches live RSS feeds from RTP using the [AllOrigins API](https://allorigins.win) to bypass CORS restrictions.
- 🧭 Navigation bar with clickable categories.
- 🔄 Automatically loads the "Últimas" (latest news) on startup.
- 🌙 Dark mode toggle with moon/sun icon.
- 🔍 Live search to filter news by title or description.
- 🧠 Caching mechanism to avoid re-fetching previously loaded categories.
- 📱 Fully responsive design with grid-based layout for news cards.

## 📁 Project Structure

```
project-folder/
│
├── rtp.html                                          # html (News dashboard)
├── rtp.css                                           # Stylesheet (light/dark themes, layout, responsiveness)
├── rtp.js                                            # JavaScript logic (RSS fetching, rendering, search, dark mode)
├── documentation-folder/
     └── README.md                                    # This file
     └── Project Documentation.pdf               # project description (technologies used and required dependencies)
```

## 🚀 Getting Started

1. Download the repository.
2. Open `rtp.html` in any modern web browser (no local server needed).
3. Click on the category buttons (e.g., Últimas, País, Mundo...) to load news.
4. Use the moon icon 🌙 in the navbar to switch to dark mode.
5. Use the search input to filter the articles as you type.

## 🛠️ Technologies Used

- **HTML5** – structure and semantic layout
- **CSS3** – styling and responsive design
- **JavaScript (ES6+)** – dynamic behavior, asynchronous requests
- **Font Awesome** – for dark mode toggle icon
- **AllOrigins API** – for CORS-compliant RSS fetching

## ⚠️ Notes

- This project relies on the availability of the RTP RSS feeds and the AllOrigins proxy service. If either service is down, fetching may fail.
- For production use, consider replacing AllOrigins with your own backend proxy.

## 📄 License

This project is provided for educational purposes and is not affiliated with RTP.
