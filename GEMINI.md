# Project Rules: Offline-First Static Web Apps

This project is a static web application (HTML/JS/CSS) hosted on GitHub Pages. To ensure a robust user experience and avoid downtime caused by external API failures (such as timeouts from public APIs):

1. **Bundle Critical Data**: For core features that rely on text data (e.g., Quran text, configuration files), ALWAYS bundle the data locally as JSON or JS files (like `quran_data.js`). Do not rely on `fetch()` to external third-party APIs for critical text data.
2. **Stable CDNs for Media**: For large media files (like audio or images) that cannot be bundled due to size limits, strictly use highly available and stable CDNs (like EveryAyah.com or Quran.com) rather than less reliable third-party APIs.
3. **Graceful Fallbacks**: Ensure that if a network request does fail, the UI gracefully informs the user rather than halting or breaking layout.
4. **Avoid Heavy CSS Filters**: Avoid using `mix-blend-overlay` and heavy `blur` filters on elements as they cause severe performance drops on mobile devices.
