// api.js — Rick and Morty API wrapper
// API docs: https://rickandmortyapi.com/documentation

const BASE_URL = 'https://rickandmortyapi.com/api';

/**
 * Fetch a list of characters with optional filters.
 * Uses async/await + fetch (required concepts)
 * @param {Object} params - query params: page, name, status, species, gender
 * @returns {Promise<{info, results}>}
 */
export const fetchCharacters = async (params = {}) => {
  // Build query string from params object using URLSearchParams
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
    )
  ).toString();

  const url = `${BASE_URL}/character${query ? `?${query}` : ''}`;

  const response = await fetch(url);

  // Handle 404 (no results) gracefully
  if (response.status === 404) {
    return { info: { count: 0, pages: 0, next: null, prev: null }, results: [] };
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  // Parse JSON response
  const data = await response.json();
  return data;
};

/**
 * Fetch a single character by ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
export const fetchCharacterById = async (id) => {
  const response = await fetch(`${BASE_URL}/character/${id}`);
  if (!response.ok) throw new Error(`Character not found: ${id}`);
  return response.json();
};

/**
 * Fetch a list of episodes with optional page.
 * @param {number} page
 * @returns {Promise<{info, results}>}
 */
export const fetchEpisodes = async (page = 1) => {
  const response = await fetch(`${BASE_URL}/episode?page=${page}`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
};

/**
 * Fetch multiple characters by array of IDs (for modal episode cast).
 * Rick & Morty API supports comma-separated IDs.
 * @param {number[]} ids
 * @returns {Promise<Object[]>}
 */
export const fetchCharactersByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const response = await fetch(`${BASE_URL}/character/${ids.join(',')}`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  // API returns single object if only one ID, array otherwise
  return Array.isArray(data) ? data : [data];
};
