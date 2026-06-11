## Description

A Vue 3 frontend for [rss-feed-reader-backend](https://github.com/Swunci/rss-feed-reader-backend). Can be run standalone in development, paired with the backend via Docker, or bundled as a single Windows executable.

---

## Features

- Organize feeds into collections via drag-and-drop
- Fuzzy search across items list
- Filter items by unread or favorited status
- Infinite scroll for items list
- Newly fetched items appear automatically in active list without refreshing
- Mark items as read or favorite

---

## How to Run

### Development

1. Clone the repository:

```bash
git clone https://github.com/Swunci/rss-feed-reader-frontend.git
cd rss-feed-frontend
```

2. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

---

### Docker

See the [rss-feed-reader-backend](https://github.com/Swunci/rss-feed-reader-backend) README for instructions on running the full stack with Docker Compose.

---

### Windows Executable

See the [rss-feed-reader-backend](https://github.com/Swunci/rss-feed-reader-backend) README for instructions on building and running the bundled desktop executable.

---

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

**Vue DevTools**

- Chrome/Edge/Brave: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- Firefox: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

---
