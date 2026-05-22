// ui.js — DOM manipulation & component rendering
// Covers: element selection, manipulation, event binding, template literals

import { isFavourite, toggleFavourite, getFavourites, clearFavourites } from './storage.js';
import { fetchCharacterById } from './api.js';

// ── DOM ELEMENT REFERENCES ──────────────────────────────
// Selecting elements from the DOM
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

// ── SKELETON LOADERS ────────────────────────────────────

/**
 * Show skeleton loading placeholders.
 * @param {number} count
 */
export const showSkeletons = (count = 20) => {
  const grid = $('#skeleton-grid');
  const cardGrid = $('#card-grid');
  cardGrid.innerHTML = '';
  cardGrid.classList.add('hidden');

  // Template literal to build skeleton HTML
  grid.innerHTML = Array.from({ length: count }, () => `
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `).join('');

  grid.classList.remove('hidden');
};

export const hideSkeletons = () => {
  $('#skeleton-grid').classList.add('hidden');
  $('#card-grid').classList.remove('hidden');
};

// ── CHARACTER CARD ───────────────────────────────────────

/**
 * Build and return a character card element.
 * Uses template literals, arrow functions, ternary operators.
 * @param {Object} character
 * @param {Function} onCardClick
 * @param {Function} onFavToggle
 * @returns {HTMLElement}
 */
export const createCharacterCard = (character, onCardClick, onFavToggle) => {
  const { id, name, status, species, gender, origin, image } = character;

  // Ternary operator for status class
  const statusClass = status.toLowerCase() === 'alive' ? 'alive'
    : status.toLowerCase() === 'dead' ? 'dead'
    : 'unknown';

  const fav = isFavourite(id);

  // Create element via DOM manipulation
  const article = document.createElement('article');
  article.className = `char-card${fav ? ' is-fav' : ''}`;
  article.setAttribute('role', 'listitem');
  article.setAttribute('aria-label', `Character: ${name}`);
  article.dataset.id = id;

  // Template literal for inner HTML
  article.innerHTML = `
    <div class="char-card__img-wrap">
      <img
        class="char-card__img"
        src="${image}"
        alt="${name}"
        loading="lazy"
      />
      <div class="char-card__status">
        <span class="status-dot ${statusClass}" aria-hidden="true"></span>
        ${status}
      </div>
      <button
        class="char-card__fav-btn${fav ? ' active' : ''}"
        aria-label="${fav ? 'Remove from favourites' : 'Add to favourites'}"
        data-id="${id}"
      >${fav ? '♥' : '♡'}</button>
    </div>
    <div class="char-card__body">
      <p class="char-card__name" title="${name}">${name}</p>
      <p class="char-card__meta">${species} · ${gender}</p>
      <p class="char-card__meta">${origin.name !== 'unknown' ? origin.name : '—'}</p>
    </div>
    <span class="char-card__id">#${id}</span>
  `;

  // Attach events to elements
  article.addEventListener('click', (e) => {
    // Don't open modal if fav button was clicked
    if (e.target.closest('.char-card__fav-btn')) return;
    onCardClick(character);
  });

  const favBtn = article.querySelector('.char-card__fav-btn');
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const nowFav = toggleFavourite(character);
    // Manipulate element classes and content
    favBtn.classList.toggle('active', nowFav);
    favBtn.textContent = nowFav ? '♥' : '♡';
    favBtn.setAttribute('aria-label', nowFav ? 'Remove from favourites' : 'Add to favourites');
    article.classList.toggle('is-fav', nowFav);
    onFavToggle(character, nowFav);
  });

  return article;
};

// ── RENDER CHARACTER GRID ────────────────────────────────

/**
 * Render all character cards into the grid.
 * Iterates over array using forEach (array method).
 * @param {Object[]} characters
 * @param {Function} onCardClick
 * @param {Function} onFavToggle
 */
export const renderCharacters = (characters, onCardClick, onFavToggle) => {
  const grid = $('#card-grid');
  grid.innerHTML = '';

  if (characters.length === 0) {
    $('#empty-state').classList.remove('hidden');
    return;
  }

  $('#empty-state').classList.add('hidden');

  // Iterate over array and append each card
  characters.forEach((char) => {
    const card = createCharacterCard(char, onCardClick, onFavToggle);
    grid.appendChild(card);
  });
};

// ── EPISODE CARD ────────────────────────────────────────

/**
 * Build an episode row element.
 * @param {Object} episode
 * @returns {HTMLElement}
 */
export const createEpisodeCard = (episode) => {
  const { episode: code, name, air_date, characters } = episode;

  const div = document.createElement('div');
  div.className = 'ep-card';
  div.setAttribute('role', 'listitem');

  div.innerHTML = `
    <span class="ep-badge">${code}</span>
    <div>
      <p class="ep-name">${name}</p>
      <p class="ep-date">${air_date}</p>
    </div>
    <span class="ep-chars">${characters.length} chars</span>
  `;

  return div;
};

export const renderEpisodes = (episodes) => {
  const list = $('#episode-list');
  list.innerHTML = '';
  episodes.forEach((ep) => list.appendChild(createEpisodeCard(ep)));
};

// ── CHARACTER MODAL ──────────────────────────────────────

/**
 * Open character detail modal.
 * @param {Object} character
 * @param {Function} onFavToggle
 */
export const openModal = async (character, onFavToggle) => {
  const overlay = $('#modal-overlay');
  const content = $('#modal-content');

  const { id, name, status, species, gender, type, origin, location, image, episode } = character;

  const fav = isFavourite(id);

  const statusClass = status.toLowerCase() === 'alive' ? 'alive'
    : status.toLowerCase() === 'dead' ? 'dead'
    : 'unknown';

  // Extract episode codes from URLs using array map method
  const episodeCodes = episode.map((url) => {
    const parts = url.split('/');
    return `EP${parts[parts.length - 1]}`;
  });

  content.innerHTML = `
    <div class="modal-header">
      <img class="modal-avatar" src="${image}" alt="${name}" />
      <div class="modal-info">
        <h2 class="modal-name">${name}</h2>
        <div class="modal-status-row">
          <span class="status-dot ${statusClass}" aria-hidden="true"></span>
          ${status} · ${species}
        </div>
        <div class="modal-stats">
          <div class="modal-stat">
            <p class="modal-stat__label">Gender</p>
            <p class="modal-stat__value">${gender}</p>
          </div>
          <div class="modal-stat">
            <p class="modal-stat__label">Type</p>
            <p class="modal-stat__value">${type || '—'}</p>
          </div>
          <div class="modal-stat">
            <p class="modal-stat__label">Origin</p>
            <p class="modal-stat__value">${origin.name}</p>
          </div>
          <div class="modal-stat">
            <p class="modal-stat__label">Location</p>
            <p class="modal-stat__value">${location.name}</p>
          </div>
        </div>
      </div>
    </div>

    <h3 class="modal-section-title">Appears in ${episodeCodes.length} episode${episodeCodes.length !== 1 ? 's' : ''}</h3>
    <div class="modal-episodes">
      ${episodeCodes.map((code) => `<span class="modal-ep-tag">${code}</span>`).join('')}
    </div>

    <button class="modal-fav-btn${fav ? ' active' : ''}" id="modal-fav-btn">
      ${fav ? '♥ Remove from favourites' : '♡ Add to favourites'}
    </button>
  `;

  // Attach event to modal fav button
  const modalFavBtn = content.querySelector('#modal-fav-btn');
  modalFavBtn.addEventListener('click', () => {
    const nowFav = toggleFavourite(character);
    modalFavBtn.classList.toggle('active', nowFav);
    modalFavBtn.textContent = nowFav ? '♥ Remove from favourites' : '♡ Add to favourites';
    // Update card in background if visible
    onFavToggle(character, nowFav);
    // Also update the card in the grid
    const card = $(`[data-id="${id}"]`);
    if (card) {
      card.classList.toggle('is-fav', nowFav);
      const btn = card.querySelector('.char-card__fav-btn');
      if (btn) {
        btn.classList.toggle('active', nowFav);
        btn.textContent = nowFav ? '♥' : '♡';
      }
    }
  });

  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

export const closeModal = () => {
  $('#modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
};

// ── PAGINATION ───────────────────────────────────────────

/**
 * Render pagination buttons.
 * @param {Object} info - API info object {pages, next, prev}
 * @param {number} currentPage
 * @param {Function} onPageChange
 * @param {string} containerId
 */
export const renderPagination = (info, currentPage, onPageChange, containerId = 'pagination') => {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (!info || info.pages <= 1) return;

  const { pages } = info;

  // Prev button
  const prev = document.createElement('button');
  prev.className = 'page-btn';
  prev.textContent = '←';
  prev.disabled = currentPage === 1;
  prev.addEventListener('click', () => onPageChange(currentPage - 1));
  container.appendChild(prev);

  // Page number buttons — show a window around current page
  const pageNumbers = getPageNumbers(currentPage, pages);
  pageNumbers.forEach((p) => {
    if (p === '...') {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'page-btn';
      ellipsis.textContent = '…';
      ellipsis.style.cursor = 'default';
      container.appendChild(ellipsis);
      return;
    }
    const btn = document.createElement('button');
    btn.className = `page-btn${p === currentPage ? ' active' : ''}`;
    btn.textContent = p;
    btn.addEventListener('click', () => onPageChange(p));
    container.appendChild(btn);
  });

  // Next button
  const next = document.createElement('button');
  next.className = 'page-btn';
  next.textContent = '→';
  next.disabled = currentPage === pages;
  next.addEventListener('click', () => onPageChange(currentPage + 1));
  container.appendChild(next);
};

/**
 * Calculate which page numbers to show.
 * @param {number} current
 * @param {number} total
 * @returns {Array}
 */
const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
};

// ── FAVOURITES VIEW ──────────────────────────────────────

export const renderFavourites = (onCardClick, onFavToggle) => {
  const favs = getFavourites();
  const grid = $('#fav-grid');
  const empty = $('#fav-empty');

  grid.innerHTML = '';

  if (favs.length === 0) {
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  favs.forEach((char) => grid.appendChild(createCharacterCard(char, onCardClick, onFavToggle)));
};

// ── RESULTS COUNT ────────────────────────────────────────

export const updateResultsCount = (count, total) => {
  const el = $('#results-count');
  // Template literal
  el.textContent = count > 0
    ? `Showing ${count} of ${total} characters`
    : '';
};

// ── TOAST NOTIFICATION ───────────────────────────────────

let toastTimer = null;

export const showToast = (message) => {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.remove('hidden');

  // Clear existing timer using callback pattern
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
};

// ── FAV COUNT BADGE ──────────────────────────────────────

export const updateFavCount = () => {
  const count = getFavourites().length;
  $('#fav-count').textContent = count;
};
