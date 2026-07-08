// URL base del backend
const API_URL = "http://localhost:8000";

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

// ── Prendas ────────────────────────────────────────────────────
async function getPrendas() {
    return apiRequest(`/clothes/`, { method: "GET" });
}

async function getPrenda(id) {
    return apiRequest(`/clothes/${id}`, { method: "GET" });
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