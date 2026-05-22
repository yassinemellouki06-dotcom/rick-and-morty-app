# Rick & Morty Explorer

Interactive single-page application for the Advanced Web project. The app uses the [Rick and Morty API](https://rickandmortyapi.com/) to let users browse characters and episodes, filter/search the data, sort results, open character details, and save favourites between sessions.

Repository: https://github.com/yassinemellouki06-dotcom/rick-and-morty-app

## Functionaliteiten

- Character browser with more than 800 API records through pagination.
- Grid view and list/table view. The list view shows 6+ fields: ID, name, status, species, gender, origin, and location.
- Episode browser with episode code, title, air date, and character count.
- Episode search by title, episode code, or air date.
- Live search by character name with debounce.
- Filters for status, species, and gender.
- Sorting by ID and name.
- Reset button to clear all character filters and sorting.
- Random character shortcut that opens a detail modal.
- Character detail modal with image, status, origin, location, type, and episode tags.
- Favourites saved in LocalStorage.
- Saved user preferences: dark/light theme, grid/list view mode, filters, search term, and sorting.
- Responsive design for mobile, tablet, and desktop.

## Gebruikte API

- API: [Rick and Morty API](https://rickandmortyapi.com/)
- Documentation: https://rickandmortyapi.com/documentation
- Base URL: `https://rickandmortyapi.com/api`
- API key: not required

Endpoints used:

- `GET /character` for paginated characters and filters.
- `GET /character/:id` for the random character shortcut.
- `GET /character/:ids` for multiple character helper.
- `GET /episode` for loading and searching episodes.

## Installatie

```bash
git clone https://github.com/yassinemellouki06-dotcom/rick-and-morty-app.git
cd rick-and-morty-app
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Folderstructuur

```text
rick-and-morty-app/
├── index.html
├── package.json
├── vite.config.js
├── docs/
│   └── screenshots/
├── src/
│   ├── css/
│   │   ├── animations.css
│   │   ├── components.css
│   │   ├── layout.css
│   │   ├── reset.css
│   │   └── variables.css
│   └── js/
│       ├── api.js
│       ├── main.js
│       ├── storage.js
│       └── ui.js
└── dist/                 # generated after npm run build
```

## Technische Vereisten

### DOM Manipulatie

| Vereiste | Waar toegepast |
|---|---|
| Elementen selecteren | `src/js/ui.js` lines 8-9: `$` and `$$` helpers use `querySelector` and `querySelectorAll`. |
| Elementen manipuleren | `src/js/ui.js` lines 20-24, 70, 155-167: `innerHTML`, `classList`, and `appendChild`. |
| Events koppelen | `src/js/main.js` lines 306-360 and `src/js/ui.js` lines 123-130. |

### Modern JavaScript

| Vereiste | Waar toegepast |
|---|---|
| Constanten | `src/js/main.js` line 24, `src/js/api.js` line 4. |
| Template literals | `src/js/api.js` line 20, `src/js/main.js` episode count text, `src/js/ui.js` lines 24, 70, 228. |
| Iteratie over arrays | `src/js/main.js` lines 43, 87, 207; `src/js/ui.js` lines 165, 200, 324. |
| Array methods | `filter` in API query building and episode search, `sort` in `src/js/main.js`, `map` in `src/js/ui.js`, `some`/`filter` in `src/js/storage.js`. |
| Arrow functions | Used throughout `src/js/main.js`, `src/js/ui.js`, `src/js/api.js`, and `src/js/storage.js`. |
| Ternary operator | `src/js/main.js` line 148, `src/js/ui.js` lines 56-57 and 263-264. |
| Callback functions | `src/js/main.js` lines 166-175 for debounce, and pagination callbacks on lines 77-81 and 128-131. |
| Promises | API wrapper functions in `src/js/api.js` return promises through `async` functions and `fetch`. |
| Async & Await | `src/js/main.js` lines 59 and 122; `src/js/api.js` lines 12, 43, 54, 66. |
| Observer API | `IntersectionObserver` in `src/js/main.js` lines 41-50. |

### Data & API

| Vereiste | Waar toegepast |
|---|---|
| Fetch | `src/js/api.js` for characters, one random character, all episodes, and multi-character helpers. |
| JSON manipuleren/weergeven | `response.json()` in `src/js/api.js` lines 34, 46, 57, 70; rendering in `src/js/ui.js`. |

### Opslag & Validatie

| Vereiste | Waar toegepast |
|---|---|
| Formulier/input-validatie | `validateFilter` in `src/js/main.js` lines 190-199. |
| LocalStorage | Favourites, theme, view mode, filters/search/sort in `src/js/storage.js` lines 18-19, 34, 46, 79, 89, 97, 105, 113, 121-139. |

### Styling & Layout

| Vereiste | Waar toegepast |
|---|---|
| Basis HTML layout | `index.html` contains header, controls, views, modal, and toast. |
| CSS Grid | `src/css/layout.css` lines 107 and 112; `src/css/components.css` lines 267, 286, 342, 415, 515. |
| Flexbox | `src/css/layout.css` header/controls; `src/css/components.css` buttons, cards, modal rows. |
| Responsive design | `src/css/layout.css` line 230 and `src/css/components.css` lines 622 and 638. |
| Gebruiksvriendelijke elementen | Favourite buttons, random character button, episode search, filter reset button, clear favourites button, theme toggle, grid/list toggle, pagination, skeleton loaders, and toast notifications. |

### Tooling & Structuur

| Vereiste | Waar toegepast |
|---|---|
| Vite setup | `package.json` scripts and `vite.config.js`. |
| Gescheiden bestanden | `index.html`, `src/css/*`, and `src/js/*`. |
| `src` folder | Present and used for all source code. |
| `dist` folder | Generated by `npm run build`. |

## Screenshots

Screenshots should be stored in `docs/screenshots/` before final submission.

Recommended screenshots:

- Character grid view.
- Character list/table view.
- Character detail modal.
- Favourites view with at least one saved favourite.

## Bronnen

- [Rick and Morty API](https://rickandmortyapi.com/)
- [Rick and Morty API documentation](https://rickandmortyapi.com/documentation)
- [Vite](https://vitejs.dev/)
- [Google Fonts](https://fonts.google.com/): Orbitron, Share Tech Mono, Exo 2
- AI assistance documented in [AI_CHATLOG.md](AI_CHATLOG.md)

## Build Check

Last verified locally:

```bash
npm install
npm run build
```
