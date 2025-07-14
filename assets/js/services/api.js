/*
configurar api
 */

const API_BASE_URL = "https://dummyjson.com";
const API_BBDD_TOKEN =
  "patgV8kdS4L1lnsZD.0e9fd832ce92c653002b01c426d5af4914e48bf38ade74140f2513d22996f794";
const BASE_ID = "appVfqoj0Cy2ysT41";
const API_BBDD_URL = `https://api.airtable.com/v0/${BASE_ID}`;

const headers = {
  Authorization: `Bearer ${API_BBDD_TOKEN}`,
  "Content-Type": "application/json",
};

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
   * Realiza una petición GET a la API de Airtable
   * @param {string} table - El nombre de la tabla
   * @param {string} filterByFormula - Fórmula de filtro opcional
   * @returns {Promise} - La respuesta de la API
   */
  static async getTable(table, filterByFormula = null) {
    try {
      if (!["product", "user", "cart", "detalle_compras"].includes(table))
        throw "no se encontro la informacion";

      let url = `${API_BBDD_URL}/${table}`;
      if (filterByFormula) {
        url += `?filterByFormula=${encodeURIComponent(filterByFormula)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
      });
      return await response.json();
    } catch (error) {
      console.error("Error en la petición GET:", error);
      throw error;
    }
  }

  /**
   * Busca un usuario por email en la base de datos
   * @param {string} email - El email del usuario
   * @returns {Promise} - La respuesta de la API con los datos del usuario
   */
  static async getUserByEmail(email) {
    const filterFormula = `{email} = '${email}'`;
    return await this.getTable("user", filterFormula);
  }

  /**
   * Busca un producto por dummyjson id en la base de datos de Airtable
   * @param {number|string} dummyId - El id del producto en dummyjson
   * @returns {Promise} - La respuesta de la API con los datos del producto
   */
  static async getProductByDummyId(dummyId) {
    const filterFormula = `{dummy_id} = '${dummyId}'`;
    return await this.getTable("product", filterFormula);
  }

  /**
   * Realiza una petición POST a la API
   * @param {string} table - El table de la API
   * @param {Object} data - Los datos a enviar
   * @returns {Promise} - La respuesta de la API
   */
  static async postTable(table, data) {
    try {
      if (!["product", "user", "cart", "detalle_compras"].includes(table))
        throw "no se encontro la informacion";

      const response = await fetch(`${API_BBDD_URL}/${table}`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Error en la petición POST:", error);
      throw error;
    }
  }

  /**
   * Realiza una petición PATCH a la API
   * @param {string} table - El table de la API
   * @param {Object} data - Los datos a enviar
   * @returns {Promise} - La respuesta de la API
   */
  static async patchTable(table, data) {
    try {
      if (!["product", "user", "cart", "detalle_compras"].includes(table))
        throw "no se encontro la informacion";

      const response = await fetch(`${API_BBDD_URL}/${table}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Error en la petición POST:", error);
      throw error;
    }
  }

  /**
   * Realiza una petición DELETE a la API
   * @param {string} table - El table de la API
   * @returns {Promise} - La respuesta de la API
   */
  static async deleteTable(table) {
    try {
      if (!["product", "user", "cart", "detalle_compras"].includes(table))
        throw "no se encontro la informacion";

      const response = await fetch(`${API_BBDD_URL}/${table}`, {
        method: "DELETE",
        headers,
      });
      return await response.json();
    } catch (error) {
      console.error("Error en la petición POST:", error);
      throw error;
    }
  }
}

export default ApiService;
