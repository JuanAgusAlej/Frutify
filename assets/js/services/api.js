/*
configurar api
 */

const API_BASE_URL = "https://dummyjson.com";

class ApiService {
  /**
   * Realiza una petición GET a la API
   * @param {string} endpoint - El endpoint de la API
   * @returns {Promise} - La respuesta de la API
   */
  static async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      return await response.json();
    } catch (error) {
      console.error("Error en la petición GET:", error);
      throw error;
    }
  }

  /**
   * Realiza una petición POST a la API
   * @param {string} endpoint - El endpoint de la API
   * @param {Object} data - Los datos a enviar
   * @returns {Promise} - La respuesta de la API
   */
  static async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Error en la petición POST:", error);
      throw error;
    }
  }
}

export default ApiService;
