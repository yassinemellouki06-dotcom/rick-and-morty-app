// main.js — Application entry point
// Integrates all JS concepts required for the assignment

import { fetchCharacters, fetchCharacterById, fetchAllEpisodes } from './api.js';
import {
  saveTheme, getTheme,
  saveViewMode, getViewMode,
  saveCharacterControls, getCharacterControls,
  getFavourites,
  clearFavourites,
} from './storage.js';
import {
  $, $$,
  showSkeletons, hideSkeletons,
  renderCharacters, renderEpisodes,
  renderFavourites,
  renderPagination,
  openModal, closeModal,
  showToast,
  updateFavCount,
  updateResultsCount,
} from './ui.js';

// ── APPLICATION STATE ────────────────────────────────────
// Using const for immutable references (modern JS requirement)
const state = {
  currentView: 'characters',
  characters: {
    page: 1,
    info: null,
    results: [],
    filters: { name: '', status: '', species: '', gender: '' },
    sort: 'id-asc',
  },
  episodes: {
    info: null,
    results: [],
    query: '',
  },
};

// ── OBSERVER API ─────────────────────────────────────────
// IntersectionObserver to lazy-load / animate cards as they enter viewport
const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        cardObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

// ── CHARACTERS ───────────────────────────────────────────

/**
 * Load and render characters.
 * Demonstrates: async/await, promises, fetch, JSON, array methods
 */
const loadCharacters = async () => {
  showSkeletons(20);
  $('#empty-state').classList.add('hidden');

  try {
    const { filters, page, sort } = state.characters;

    // Fetch from API (Promise-based with async/await)
    const data = await fetchCharacters({ page, ...filters });

    state.characters.info = data.info;
    state.characters.results = data.results;

    // Sort results using array method + arrow function + ternary
    const sorted = sortCharacters(data.results, sort);

    hideSkeletons();
    renderCharacters(sorted, handleCardClick, handleFavToggle);
    renderPagination(data.info, page, (p) => {
      state.characters.page = p;
      loadCharacters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Update results count display
    updateResultsCount(data.results.length, data.info.count);
    updateExplorerStats();

    // Observe cards that enter viewport (Observer API)
    $$('.char-card').forEach((card) => cardObserver.observe(card));

  } catch (err) {
    hideSkeletons();
    console.error('Failed to load characters:', err);
    showToast('Error loading characters. Please try again.');
  }
};

/**
 * Sort array of characters by chosen field.
 * Uses array spread, sort method, arrow function, ternary.
 * @param {Object[]} chars
 * @param {string} sortKey
 * @returns {Object[]}
 */
const sortCharacters = (chars, sortKey) => {
  // Spread to avoid mutating original array
  const sorted = [...chars];

  sorted.sort((a, b) => {
    switch (sortKey) {
      case 'id-asc':  return a.id - b.id;
      case 'id-desc': return b.id - a.id;
      case 'name-asc':  return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      default: return 0;
    }
  });

  return sorted;
};

// ── EPISODES ─────────────────────────────────────────────

const loadEpisodes = async () => {
  try {
    const data = await fetchAllEpisodes();
    state.episodes.info = data.info;
    state.episodes.results = data.results;

    renderFilteredEpisodes();
  } catch (err) {
    console.error('Failed to load episodes:', err);
    showToast('Error loading episodes.');
  }
};

const renderFilteredEpisodes = () => {
  const query = state.episodes.query.trim().toLowerCase();
  const filtered = query
    ? state.episodes.results.filter((episode) => (
        episode.name.toLowerCase().includes(query)
        || episode.episode.toLowerCase().includes(query)
        || episode.air_date.toLowerCase().includes(query)
      ))
    : state.episodes.results;

  renderEpisodes(filtered);
  $('#episode-count').textContent = `${filtered.length} episode${filtered.length !== 1 ? 's' : ''}`;
};

// ── EVENT HANDLERS ───────────────────────────────────────

const handleCardClick = (character) => {
  openModal(character, handleFavToggle);
};

const handleFavToggle = (character, nowFav) => {
  updateFavCount();
  updateExplorerStats();
  // Ternary operator for toast message
  const msg = nowFav
    ? `♥ ${character.name} added to favourites`
    : `${character.name} removed from favourites`;
  showToast(msg);

  // If on favourites view, re-render it
  if (state.currentView === 'favourites') {
    renderFavourites(handleCardClick, handleFavToggle);
  }
};

const handleRandomCharacter = async () => {
  const btn = $('#random-character');
  const maxId = state.characters.info?.count || 826;
  const randomId = Math.floor(Math.random() * maxId) + 1;

  btn.disabled = true;
  try {
    const character = await fetchCharacterById(randomId);
    openModal(character, handleFavToggle);
  } catch (err) {
    console.error('Failed to load random character:', err);
    showToast('Could not open a random character.');
  } finally {
    btn.disabled = false;
  }
};

const applyPortalPreset = (preset) => {
  const presets = {
    'alive-humans': { status: 'alive', species: 'Human', gender: '' },
    aliens: { status: '', species: 'Alien', gender: '' },
    dead: { status: 'dead', species: '', gender: '' },
    unknown: { status: 'unknown', species: '', gender: '' },
  };
  const selected = presets[preset];
  if (!selected) return;

  state.characters.filters = { name: '', ...selected };
  state.characters.page = 1;

  $('#search-input').value = '';
  $('#filter-status').value = selected.status;
  $('#filter-species').value = selected.species;
  $('#filter-gender').value = selected.gender;

  syncCharacterControls();
  loadCharacters();
};

const exportFavourites = () => {
  const favs = getFavourites();
  if (favs.length === 0) {
    showToast('No favourites to export yet.');
    return;
  }

  const file = new Blob([JSON.stringify(favs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'rick-and-morty-favourites.json';
  link.click();
  URL.revokeObjectURL(url);
  showToast('Favourites export ready.');
};

// ── SEARCH (debounced) ───────────────────────────────────

/**
 * Debounce utility — callback function pattern.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
const debounce = (fn, delay) => {
  let timer;
  // Returns a callback function
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const handleSearch = debounce((value) => {
  state.characters.filters.name = value;
  state.characters.page = 1;
  syncCharacterControls();
  loadCharacters();
}, 400);

const handleEpisodeSearch = debounce((value) => {
  state.episodes.query = value;
  renderFilteredEpisodes();
}, 250);

// ── FILTER FORM VALIDATION ───────────────────────────────

/**
 * Validate that filter values are within allowed options.
 * Demonstrates form/input validation concept.
 * @param {string} field
 * @param {string} value
 * @returns {boolean}
 */
const validateFilter = (field, value) => {
  const allowed = {
    status: ['', 'alive', 'dead', 'unknown'],
    gender: ['', 'Male', 'Female', 'Genderless', 'unknown'],
  };
  if (allowed[field]) {
    return allowed[field].includes(value);
  }
  return true; // no validation needed for free-text fields
};

// ── VIEW SWITCHING ───────────────────────────────────────

const switchView = (view) => {
  state.currentView = view;

  // Update nav buttons — iterating over NodeList
  $$('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  // Show/hide view sections
  $('#view-characters').classList.toggle('hidden', view !== 'characters');
  $('#view-episodes').classList.toggle('hidden', view !== 'episodes');
  $('#view-favourites').classList.toggle('hidden', view !== 'favourites');
  $('#controls-bar').classList.toggle('hidden', view !== 'characters');
  $('#results-info').classList.toggle('hidden', view !== 'characters');

  // Load data for the view
  if (view === 'episodes' && !state.episodes.info) {
    loadEpisodes();
  }

  if (view === 'favourites') {
    renderFavourites(handleCardClick, handleFavToggle);
  }
};

// ── THEME ────────────────────────────────────────────────

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  saveTheme(theme);
};

const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  // Ternary for theme toggle
  applyTheme(current === 'dark' ? 'light' : 'dark');
};

// ── VIEW MODE (grid / list) ───────────────────────────────

const applyViewMode = (mode) => {
  const grid = $('#card-grid');
  const favGrid = $('#fav-grid');
  grid.classList.toggle('list-mode', mode === 'list');
  favGrid.classList.toggle('list-mode', mode === 'list');
  $('#view-grid').classList.toggle('active', mode === 'grid');
  $('#view-list').classList.toggle('active', mode === 'list');
  saveViewMode(mode);
};

// ── SAVED CHARACTER CONTROLS ─────────────────────────────

const syncCharacterControls = () => {
  saveCharacterControls({
    filters: state.characters.filters,
    sort: state.characters.sort,
  });
};

const applySavedCharacterControls = () => {
  const controls = getCharacterControls();
  state.characters.filters = controls.filters;
  state.characters.sort = controls.sort;

  $('#search-input').value = controls.filters.name;
  $('#filter-status').value = controls.filters.status;
  $('#filter-species').value = controls.filters.species;
  $('#filter-gender').value = controls.filters.gender;
  $('#sort-select').value = controls.sort;
};

const updateExplorerStats = () => {
  const activeFilters = Object.values(state.characters.filters)
    .filter((value) => value.trim() !== '')
    .length;

  $('#stat-total').textContent = state.characters.info?.count || '—';
  $('#stat-favourites').textContent = getFavourites().length;
  $('#stat-filters').textContent = activeFilters;
  $('#stat-page').textContent = state.characters.page;
};

// ── RESET FILTERS ─────────────────────────────────────────

export const resetFilters = () => {
  state.characters.filters = { name: '', status: '', species: '', gender: '' };
  state.characters.sort = 'id-asc';
  state.characters.page = 1;
  $('#search-input').value = '';
  $('#filter-status').value = '';
  $('#filter-species').value = '';
  $('#filter-gender').value = '';
  $('#sort-select').value = 'id-asc';
  syncCharacterControls();
  loadCharacters();
};

// ── INITIALISE ───────────────────────────────────────────

const init = () => {
  // Apply saved preferences from localStorage
  applyTheme(getTheme());
  applyViewMode(getViewMode());
  applySavedCharacterControls();
  updateFavCount();
  updateExplorerStats();

  // Initial data load
  loadCharacters();

  // ── BIND EVENTS TO DOM ELEMENTS ──

  // Navigation
  $$('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Search
  $('#search-input').addEventListener('input', (e) => handleSearch(e.target.value));
  $('#episode-search').addEventListener('input', (e) => handleEpisodeSearch(e.target.value));

  // Filters — using event delegation pattern
  $('#filter-status').addEventListener('change', (e) => {
    if (!validateFilter('status', e.target.value)) return;
    state.characters.filters.status = e.target.value;
    state.characters.page = 1;
    syncCharacterControls();
    loadCharacters();
  });

  $('#filter-species').addEventListener('change', (e) => {
    state.characters.filters.species = e.target.value;
    state.characters.page = 1;
    syncCharacterControls();
    loadCharacters();
  });

  $('#filter-gender').addEventListener('change', (e) => {
    if (!validateFilter('gender', e.target.value)) return;
    state.characters.filters.gender = e.target.value;
    state.characters.page = 1;
    syncCharacterControls();
    loadCharacters();
  });

  // Sort
  $('#sort-select').addEventListener('change', (e) => {
    state.characters.sort = e.target.value;
    syncCharacterControls();
    const sorted = sortCharacters(state.characters.results, e.target.value);
    renderCharacters(sorted, handleCardClick, handleFavToggle);
  });

  // Reset filters
  $('#reset-filters').addEventListener('click', resetFilters);

  // Random character shortcut
  $('#random-character').addEventListener('click', handleRandomCharacter);

  // Portal preset filters
  $$('.preset-chip').forEach((btn) => {
    btn.addEventListener('click', () => applyPortalPreset(btn.dataset.preset));
  });

  // View mode toggle
  $('#view-grid').addEventListener('click', () => applyViewMode('grid'));
  $('#view-list').addEventListener('click', () => applyViewMode('list'));

  // Theme toggle
  $('#theme-toggle').addEventListener('click', toggleTheme);

  // Modal close
  $('#modal-close').addEventListener('click', closeModal);
  $('#modal-overlay').addEventListener('click', (e) => {
    if (e.target === $('#modal-overlay')) closeModal();
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Clear favourites
  $('#export-favs').addEventListener('click', exportFavourites);

  $('#clear-favs').addEventListener('click', () => {
    if (confirm('Clear all favourites?')) {
      clearFavourites();
      renderFavourites(handleCardClick, handleFavToggle);
      updateFavCount();
      updateExplorerStats();
      showToast('All favourites cleared.');
    }
  });
};

// Expose resetFilters globally for the empty state button
window.app = { resetFilters };

// Start the app
init();
