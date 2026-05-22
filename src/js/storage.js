// storage.js — LocalStorage helpers
// Persists favourites and user preferences between sessions

const KEYS = {
  FAVOURITES: 'ram_favourites',
  THEME: 'ram_theme',
  VIEW_MODE: 'ram_view_mode',
  CHARACTER_CONTROLS: 'ram_character_controls',
};

// ── FAVOURITES ──────────────────────────────────────────

/**
 * Get all saved favourite characters.
 * @returns {Object[]} array of character objects
 */
export const getFavourites = () => {
  try {
    const raw = localStorage.getItem(KEYS.FAVOURITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Add a character to favourites.
 * @param {Object} character
 */
export const addFavourite = (character) => {
  const favs = getFavourites();
  // Prevent duplicates using array method .some()
  if (!favs.some((f) => f.id === character.id)) {
    favs.push(character);
    localStorage.setItem(KEYS.FAVOURITES, JSON.stringify(favs));
  }
};

/**
 * Remove a character from favourites by ID.
 * @param {number} id
 */
export const removeFavourite = (id) => {
  const favs = getFavourites();
  // Array filter method — returns new array without removed item
  const updated = favs.filter((f) => f.id !== id);
  localStorage.setItem(KEYS.FAVOURITES, JSON.stringify(updated));
};

/**
 * Toggle favourite status for a character.
 * @param {Object} character
 * @returns {boolean} true if now a favourite
 */
export const toggleFavourite = (character) => {
  const favs = getFavourites();
  const isFav = favs.some((f) => f.id === character.id);
  if (isFav) {
    removeFavourite(character.id);
    return false;
  } else {
    addFavourite(character);
    return true;
  }
};

/**
 * Check if a character is in favourites.
 * @param {number} id
 * @returns {boolean}
 */
export const isFavourite = (id) => {
  return getFavourites().some((f) => f.id === id);
};

/**
 * Clear all favourites.
 */
export const clearFavourites = () => {
  localStorage.removeItem(KEYS.FAVOURITES);
};

// ── PREFERENCES ─────────────────────────────────────────

/**
 * Save theme preference ('dark' or 'light').
 * @param {string} theme
 */
export const saveTheme = (theme) => {
  localStorage.setItem(KEYS.THEME, theme);
};

/**
 * Get saved theme preference.
 * @returns {string}
 */
export const getTheme = () => {
  return localStorage.getItem(KEYS.THEME) || 'dark';
};

/**
 * Save grid/list view mode.
 * @param {string} mode - 'grid' | 'list'
 */
export const saveViewMode = (mode) => {
  localStorage.setItem(KEYS.VIEW_MODE, mode);
};

/**
 * Get saved view mode.
 * @returns {string}
 */
export const getViewMode = () => {
  return localStorage.getItem(KEYS.VIEW_MODE) || 'grid';
};

/**
 * Save character filters and sorting preference.
 * @param {{filters: Object, sort: string}} controls
 */
export const saveCharacterControls = (controls) => {
  localStorage.setItem(KEYS.CHARACTER_CONTROLS, JSON.stringify(controls));
};

/**
 * Get saved character filters and sorting preference.
 * @returns {{filters: Object, sort: string}}
 */
export const getCharacterControls = () => {
  const defaults = {
    filters: { name: '', status: '', species: '', gender: '' },
    sort: 'id-asc',
  };

  try {
    const raw = localStorage.getItem(KEYS.CHARACTER_CONTROLS);
    const saved = raw ? JSON.parse(raw) : {};
    return {
      filters: { ...defaults.filters, ...(saved.filters || {}) },
      sort: saved.sort || defaults.sort,
    };
  } catch {
    return defaults;
  }
};
