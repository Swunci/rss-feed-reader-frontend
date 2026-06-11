## Description

A Vue 3 frontend for [rss-feed-backend](https://github.com/Swunci/rss-feed-backend). Can be run standalone in development, paired with the backend via Docker, or bundled as a single Windows executable.

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
git clone https://github.com/Swunci/rss-feed-frontend.git
cd rss-feed-frontend
```

2. Copy the example env file and configure it:

```bash
cp .env.example .env
```

3. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

---

### Docker

```bash
docker compose up --build -d
```

The frontend will be available at `http://localhost:38472`. Expects the backend to be running at the URL configured in your env.

---

### Windows Executable

See the [rss-feed-backend](https://github.com/Swunci/rss-feed-backend) README for instructions on building and running the bundled desktop executable.

---

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

**Vue DevTools**

- Chrome/Edge/Brave: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- Firefox: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

---
