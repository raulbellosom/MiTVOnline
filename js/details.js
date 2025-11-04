const detailsPage = {
  showId: null,
  showData: null,

  // Inicializar página de detalles
  async init() {
    console.log("Iniciando página de detalles...");

    // Obtener ID de la URL
    this.showId = this.getShowIdFromURL();

    if (!this.showId) {
      this.showError("ID de serie no válido");
      return;
    }

    // Inicializar módulos
    favorites.init();
    this.setupEvents();

    // Cargar datos
    await this.loadShowDetails();
  },

  // Obtener ID de la serie desde la URL
  getShowIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    return id ? parseInt(id) : null;
  },

  // Configurar eventos
  setupEvents() {
    // Botón de favoritos
    const favoriteButton = document.getElementById("favoriteButton");
    if (favoriteButton) {
      favoriteButton.addEventListener("click", () => {
        this.handleFavoriteToggle();
      });
    }

    // Selector de temporadas
    const seasonSelect = document.getElementById("seasonSelect");
    if (seasonSelect) {
      seasonSelect.addEventListener("change", (e) => {
        this.filterEpisodesBySeason(e.target.value);
      });
    }
  },

  // Cargar todos los detalles de la serie
  async loadShowDetails() {
    try {
      this.showLoading();

      // Cargar detalles básicos
      console.log(`Cargando detalles para serie ID: ${this.showId}`);
      this.showData = await api.getShowDetails(this.showId);
      this.renderShowDetails();
      this.updateFavoriteButton();

      // Cargar datos adicionales en paralelo
      const [castData, episodesData] = await Promise.all([
        api.getShowCast(this.showId),
        api.getShowEpisodes(this.showId),
      ]);

      // Renderizar reparto si hay datos
      if (castData && castData.length > 0) {
        this.renderCast(castData);
        this.showSection("castSection");
      }

      // Renderizar episodios si hay datos
      if (episodesData && episodesData.length > 0) {
        this.renderEpisodes(episodesData);
        this.showSection("episodesSection");
      }

      this.hideLoading();

      // Actualizar título de la página
      if (this.showData.name) {
        document.title = `${this.showData.name} - TVMaze Explorer`;
      }
    } catch (error) {
      console.error("Error cargando detalles:", error);
      this.showError(
        error.message || "Error al cargar los detalles de la serie"
      );
    }
  },

  // Renderizar detalles principales de la serie
  renderShowDetails() {
    if (!this.showData) return;

    const show = this.showData;

    // Imagen
    const showImage = document.getElementById("showImage");
    if (showImage) {
      const imageUrl = show.image
        ? show.image.original || show.image.medium
        : "https://via.placeholder.com/300x400?text=Sin+Imagen";
      showImage.src = imageUrl;
      showImage.alt = `Poster de ${show.name || "Serie"}`;
    }

    // Título
    this.setText("showTitle", show.name || "Título no disponible");

    // Géneros
    const genresText =
      show.genres && show.genres.length > 0
        ? show.genres.join(", ")
        : "Géneros no disponibles";
    this.setText("showGenres", genresText);

    // Rating
    const ratingText =
      show.rating && show.rating.average
        ? `${show.rating.average}/10`
        : "Sin calificación";
    this.setText("showRating", ratingText);

    // Estado
    this.setText("showStatus", show.status || "Estado desconocido");

    // Resumen
    const showSummary = document.getElementById("showSummary");
    if (showSummary) {
      if (show.summary) {
        showSummary.innerHTML = show.summary;
      } else {
        showSummary.innerHTML = "<p>No hay descripción disponible.</p>";
      }
    }

    // Red de televisión
    let networkText = "Red no disponible";
    if (show.network && show.network.name) {
      networkText = show.network.name;
    } else if (show.webChannel && show.webChannel.name) {
      networkText = show.webChannel.name;
    }
    this.setText("showNetwork", networkText);

    // Fecha de estreno
    const premieredText = show.premiered
      ? new Date(show.premiered).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Fecha no disponible";
    this.setText("showPremiered", premieredText);

    // Duración
    let runtimeText = "Duración no disponible";
    if (show.runtime) {
      runtimeText = `${show.runtime} minutos`;
    } else if (show.averageRuntime) {
      runtimeText = `~${show.averageRuntime} minutos`;
    }
    this.setText("showRuntime", runtimeText);

    // Idioma
    this.setText("showLanguage", show.language || "Idioma no disponible");

    // Sitio oficial
    const officialSite = document.getElementById("officialSite");
    if (officialSite) {
      if (show.officialSite) {
        officialSite.href = show.officialSite;
        officialSite.style.display = "inline-flex";
      } else {
        officialSite.style.display = "none";
      }
    }

    // Mostrar la sección de detalles
    this.showSection("showDetails");
  },

  // Renderizar reparto
  renderCast(castData) {
    const castGrid = document.getElementById("castGrid");
    if (!castGrid) return;

    castGrid.innerHTML = "";

    // Mostrar solo reparto principal (primeros 12)
    const mainCast = castData.slice(0, 12);

    mainCast.forEach((castMember) => {
      const castCard = this.createCastCard(castMember);
      castGrid.appendChild(castCard);
    });
  },

  // Crear tarjeta de actor
  createCastCard(castMember) {
    const card = document.createElement("div");
    card.className = "cast-card";

    const person = castMember.person;
    const character = castMember.character;

    const imageUrl = person.image
      ? person.image.medium
      : "https://via.placeholder.com/150x200?text=Sin+Foto";
    const personName = person.name || "Nombre no disponible";
    const characterName = character
      ? character.name
      : "Personaje no disponible";

    card.innerHTML = `
      <img src="${imageUrl}" alt="${personName}" class="cast-card__image" loading="lazy">
      <div class="cast-card__info">
        <div class="cast-card__name">${personName}</div>
        <div class="cast-card__character">como ${characterName}</div>
      </div>
    `;

    return card;
  },

  // Renderizar episodios
  renderEpisodes(episodesData) {
    // Crear selector de temporadas
    this.createSeasonSelector(episodesData);

    // Mostrar todos los episodios inicialmente
    this.displayEpisodes(episodesData);
  },

  // Crear selector de temporadas
  createSeasonSelector(episodes) {
    const seasonSelect = document.getElementById("seasonSelect");
    if (!seasonSelect) return;

    // Obtener temporadas únicas
    const seasons = [...new Set(episodes.map((ep) => ep.season))].sort(
      (a, b) => a - b
    );

    // Limpiar opciones existentes
    seasonSelect.innerHTML = '<option value="">Todas las temporadas</option>';

    seasons.forEach((season) => {
      const option = document.createElement("option");
      option.value = season;
      option.textContent = `Temporada ${season}`;
      seasonSelect.appendChild(option);
    });
  },

  // Mostrar episodios
  displayEpisodes(episodes) {
    const episodesGrid = document.getElementById("episodesGrid");
    if (!episodesGrid) return;

    episodesGrid.innerHTML = "";

    if (!episodes || episodes.length === 0) {
      episodesGrid.innerHTML = "<p>No hay episodios disponibles.</p>";
      return;
    }

    episodes.forEach((episode) => {
      const episodeCard = this.createEpisodeCard(episode);
      episodesGrid.appendChild(episodeCard);
    });
  },

  // Crear tarjeta de episodio
  createEpisodeCard(episode) {
    const card = document.createElement("div");
    card.className = "episode-card card";

    const episodeNumber = `T${episode.season}E${episode.number}`;
    const name = episode.name || "Episodio sin título";
    const summary = episode.summary
      ? this.stripHtml(episode.summary).substring(0, 200) + "..."
      : "No hay descripción disponible.";
    const runtime = episode.runtime ? `${episode.runtime} min` : "";
    const airdate = episode.airdate ? this.formatDate(episode.airdate) : "";

    card.innerHTML = `
      <div class="card__content">
        <div class="episode-card__header">
          <span class="episode-card__number">${episodeNumber}</span>
          ${
            runtime
              ? `<span class="episode-card__runtime">${runtime}</span>`
              : ""
          }
        </div>
        <h4 class="card__title">${name}</h4>
        ${
          airdate
            ? `<div class="card__meta"><span>Emisión: ${airdate}</span></div>`
            : ""
        }
        <div class="card__summary">${summary}</div>
      </div>
    `;

    return card;
  },

  // Filtrar episodios por temporada
  filterEpisodesBySeason(seasonNumber) {
    if (!this.episodesData) return;

    let filteredEpisodes = this.episodesData;

    if (seasonNumber) {
      const season = parseInt(seasonNumber);
      filteredEpisodes = this.episodesData.filter((ep) => ep.season === season);
    }

    this.displayEpisodes(filteredEpisodes);
  },

  // Manejar toggle de favoritos
  handleFavoriteToggle() {
    if (!this.showData) return;

    try {
      const isNowFavorite = favorites.toggleFavorite(this.showData);
      this.updateFavoriteButton();

      const message = isNowFavorite
        ? "Añadido a favoritos ♥"
        : "Quitado de favoritos";
      favorites.showFeedback(message);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      favorites.showFeedback("Error al actualizar favoritos", true);
    }
  },

  // Actualizar botón de favoritos
  updateFavoriteButton() {
    const favoriteButton = document.getElementById("favoriteButton");
    if (!favoriteButton || !this.showData) return;

    const isFavorite = favorites.isFavorite(this.showData.id);
    const icon = isFavorite ? "♥" : "♡";
    const text = isFavorite ? "Quitar de favoritos" : "Añadir a favoritos";

    favoriteButton.innerHTML = `<span class="btn__icon">${icon}</span> ${text}`;

    if (isFavorite) {
      favoriteButton.classList.add("btn--favorite");
    } else {
      favoriteButton.classList.remove("btn--favorite");
    }
  },

  // Utilidades
  setText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
    }
  },

  showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = "block";
    }
  },

  showLoading() {
    const loading = document.getElementById("loadingSpinner");
    if (loading) {
      loading.style.display = "flex";
    }
  },

  hideLoading() {
    const loading = document.getElementById("loadingSpinner");
    if (loading) {
      loading.style.display = "none";
    }
  },

  showError(message) {
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) {
      errorDiv.style.display = "block";
      const errorText = errorDiv.querySelector("p");
      if (errorText) {
        errorText.textContent = message;
      }
    }
    this.hideLoading();
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
};

// Inicializar cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  detailsPage.init();
});
