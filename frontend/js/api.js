// URL base del backend
const API_URL = "http://localhost:8000";

function obtenerUrlImagen(ruta) {
    const nombreArchivo = ruta.replace(/\\/g, "/").split("/").pop();
    return `${API_URL}/uploads/${encodeURIComponent(nombreArchivo)}`;
}

// ── Función central de fetch ───────────────────────────────────
async function apiRequest(endpoint, options = {}) {
    const ruta_completa = `${API_URL}${endpoint}`;
    const res = await fetch(ruta_completa, options);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail);
    }
    return res.json();
}

async function getPrendas(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.tipo && filtros.tipo !== "todos") params.append("tipo", filtros.tipo);
    if (filtros.color && filtros.color !== "todos") params.append("color", filtros.color);
    if (filtros.estilo && filtros.estilo !== "todos") params.append("estilo", filtros.estilo);
    if (filtros.temporada && filtros.temporada !== "todos") params.append("temporada", filtros.temporada);
    
    const queryString = params.toString();
    const endpoint = `/clothes/${queryString ? `?${queryString}` : ''}`;
    console.log('API call:', `${API_URL}${endpoint}`);
    return apiRequest(endpoint, { method: "GET" });
}

async function getOpcionesFiltros() {
    console.log('Fetching filter options from:', `${API_URL}/clothes/filtros/opciones`);
    return apiRequest(`/clothes/filtros/opciones`, { method: "GET" });
}

async function uploadPrenda(formData) {
    const res = await fetch(`${API_URL}/clothes/`, {
        method: "POST",
        body: formData
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail);
    }
    return res.json();
}

async function deletePrenda(id) {
    return apiRequest(`/clothes/${id}`, { method: "DELETE" });
}

// ── Outfits ────────────────────────────────────────────────────
async function generarOutfit(ocasion) {
    return apiRequest(`/outfits/generate`, { method: "POST", body: JSON.stringify({ ocasion }), headers: { "Content-Type": "application/json" } });
}

async function getHistorial() {
    return apiRequest(`/outfits/history`, { method: "GET" });
}

async function deleteOutfit(id) {
    return apiRequest(`/outfits/history/${id}`, { method: "DELETE" });
}

async function actualizarPrenda(id, datos) {
    const formData = new FormData();
    Object.entries(datos).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
            formData.append(key, value);
        }
    });
    const res = await fetch(`${API_URL}/clothes/${id}`, {
        method: "PUT",
        body: formData
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail);
    }
    return res.json();
}

async function getOutfitDetalle(id) {
    return apiRequest(`/outfits/history/${id}`, { method: "GET" });
}