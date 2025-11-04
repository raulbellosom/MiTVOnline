const ui = {
  elements: {
    searchForm: document.getElementById("searchForm"),
    searchInput: document.getElementById("searchInput"),
    loadingSpinner: document.getElementById("loadingSpinner"),
    errorMessage: document.getElementById("errorMessage"),
    noResults: document.getElementById("noResults"),
    searchResults: document.getElementById("searchResults"),
    featuredShows: document.getElementById("featuredShows"),
    featuredSection: document.getElementById("featuredSection"),
  },

  init() {
    this.elements.searchForm = document.getElementById("searchForm");
    this.elements.searchInput = document.getElementById("searchInput");
    this.elements.loadingSpinner = document.getElementById("loadingSpinner");
    this.elements.errorMessage = document.getElementById("errorMessage");
    this.elements.noResults = document.getElementById("noResults");
    this.elements.searchResults = document.getElementById("searchResults");
    this.elements.featuredShows = document.getElementById("featuredShows");
    this.elements.featuredSection = document.getElementById("featuredSection");
  },

  showLoading() {
    if (this.elements.loadingSpinner) {
      this.elements.loadingSpinner.style.display = "flex";
    }
    this.hideError();
    this.hideNoResults();
  },

  hideLoading() {
    if (this.elements.loadingSpinner) {
      this.elements.loadingSpinner.style.display = "none";
    }
  },

  showError(message = "Ha ocurrido un error. Por favor, intenta de nuevo.") {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.style.display = "block";
      const errorText = this.elements.errorMessage.querySelector("p");
      if (errorText) {
        errorText.textContent = message;
      }
    }
    this.hideLoading();
    this.hideNoResults();
  },

  hideError() {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.style.display = "none";
    }
  },

  showNoResults() {
    if (this.elements.noResults) {
      this.elements.noResults.style.display = "block";
    }
    this.hideLoading();
    this.hideError();
  },

  hideNoResults() {
    if (this.elements.noResults) {
      this.elements.noResults.style.display = "none";
    }
  },

  createShowCard(show) {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-show-id", show.id);

    const imageUrl = show.image
      ? show.image.medium
      : "https://via.placeholder.com/300x400?text=Sin+Imagen";
    const imageAlt = show.name
      ? `Poster de ${show.name}`
      : "Poster no disponible";

    const rating =
      show.rating && show.rating.average
        ? show.rating.average.toFixed(1)
        : "N/A";

    const genres =
      show.genres && show.genres.length > 0
        ? show.genres
            .slice(0, 3)
            .map((genre) => `<span class="genre-tag">${genre}</span>`)
            .join("")
        : '<span class="genre-tag">Sin género</span>';

    const summary = show.summary
      ? this.stripHtml(show.summary).substring(0, 150) + "..."
      : "No hay descripción disponible.";

    const status = show.status || "Desconocido";

    card.innerHTML = `
      <img src="${imageUrl}" alt="${imageAlt}" class="card__image" loading="lazy">
      <div class="card__content">
        <h3 class="card__title">${show.name || "Título no disponible"}</h3>
        <div class="card__meta">
          <span class="card__rating">${rating}</span>
          <span class="card__status">${status}</span>
        </div>
        <div class="card__genres">
          ${genres}
        </div>
        <div class="card__summary">
          ${summary}
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      this.navigateToDetails(show.id);
    });

    return card;
  },

  renderShows(shows, container) {
    if (!container) return;

    container.innerHTML = "";

    if (!shows || shows.length === 0) {
      this.showNoResults();
      return;
    }

    shows.forEach((show) => {
      const card = this.createShowCard(show);
      container.appendChild(card);
    });

    this.hideNoResults();
    this.hideError();
    this.hideLoading();
  },

  navigateToDetails(showId) {
    window.location.href = `details.html?id=${showId}`;
  },

  getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  },

  stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  },

  formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  },

  toggleFeaturedSection(show) {
    if (this.elements.featuredSection) {
      this.elements.featuredSection.style.display = show ? "block" : "none";
    }
  },

  clearSearchResults() {
    if (this.elements.searchResults) {
      this.elements.searchResults.innerHTML = "";
    }
    this.hideError();
    this.hideNoResults();
    this.hideLoading();
  },

  debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },
};
