const api = {
  baseURL: "https://api.tvmaze.com",

  async request(endpoint) {
    try {
      console.log(`Fetching: ${this.baseURL}${endpoint}`);
      const response = await axios.get(`${this.baseURL}${endpoint}`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);

      if (error.code === "ECONNABORTED") {
        throw new Error("La conexión tardó demasiado. Intenta de nuevo.");
      }

      if (!navigator.onLine) {
        throw new Error("No hay conexión a internet. Verifica tu conexión.");
      }

      if (error.response && error.response.status === 404) {
        throw new Error("No se encontraron resultados.");
      }

      throw new Error("Error al conectar con el servidor. Intenta más tarde.");
    }
  },

  async searchShows(query) {
    if (!query || query.trim().length === 0) {
      throw new Error("El término de búsqueda no puede estar vacío");
    }

    const data = await this.request(
      `/search/shows?q=${encodeURIComponent(query.trim())}`
    );
    return data.map((item) => item.show);
  },

  async getShowDetails(showId) {
    return await this.request(`/shows/${showId}`);
  },

  async getShowCast(showId) {
    try {
      return await this.request(`/shows/${showId}/cast`);
    } catch (error) {
      console.warn("No se pudo obtener el reparto:", error.message);
      return [];
    }
  },

  async getShowEpisodes(showId) {
    try {
      return await this.request(`/shows/${showId}/episodes`);
    } catch (error) {
      console.warn("No se pudieron obtener los episodios:", error.message);
      return [];
    }
  },

  // Obtener series populares (simulado con las primeras páginas)
  async getPopularShows() {
    try {
      const shows = await this.request("/shows?page=0");

      // Filtrar series con buena calificación e imagen
      return shows
        .filter(
          (show) =>
            show.rating &&
            show.rating.average &&
            show.rating.average >= 7.0 &&
            show.image &&
            show.image.medium
        )
        .sort((a, b) => (b.rating.average || 0) - (a.rating.average || 0))
        .slice(0, 12);
    } catch (error) {
      console.error("Error getting popular shows:", error);
      return [];
    }
  },
};
