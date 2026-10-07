document.addEventListener("DOMContentLoaded", () => {
    cargarHistorial();
});

async function cargarHistorial() {
    try {
        const historial = await getHistorial();
        renderHistorial(historial);
        document.getElementById("mensaje-vacio").style.display = historial.length === 0 ? "block" : "none";
    } catch (error) {
        console.error("Error al cargar el historial:", error);
        UI.mostrarToast("Error al cargar el historial", "error");
    }
}

function renderHistorial(outfits) {
    const lista = document.getElementById("lista-historial");
    lista.innerHTML = "";

    outfits.forEach((outfit) => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <div class="card-info">
                <h3>${UI.capitalizar(outfit.ocasion)}</h3>
                <p style="color: var(--color-secundario)">
                    ${new Date(outfit.created_at).toLocaleDateString("es-MX")}
                </p>
                <p>${outfit.descripcion}</p>
            </div>
            <div class="grid-prendas" style="margin-top: var(--espaciado-md);">
                ${outfit.prendas.map(prenda => `
                    <div class="card">
                        <img src="${obtenerUrlImagen(prenda.imagen_url)}" alt="${prenda.tipo}">
                        <div class="card-info">
                            <span class="card-tipo">${UI.capitalizar(prenda.tipo)}</span>
                            <span class="card-detalle">${UI.capitalizar(prenda.color)}</span>
                        </div>
                    </div>
                `).join("")}
            </div>
            <div style="display: flex; justify-content: center; margin-top: var(--espaciado-md);">
                <button class="btn-peligro" onclick="eliminarOutfitDirecto(${outfit.id})">
                    <span>Eliminar outfit</span>
                </button>
            </div>
        `;
        lista.appendChild(div);
    });

    UI.staggerEntrada("#lista-historial", ".card", { delayBase: 80 });
    if (typeof lucide !== "undefined") lucide.createIcons();
}

async function eliminarOutfitDirecto(id) {
    if (confirm("¿Eliminar este outfit del historial?")) {
        try {
            await deleteOutfit(id);
            UI.mostrarToast("Outfit eliminado", "exito");
            cargarHistorial();
        } catch (error) {
            UI.mostrarToast("Error al eliminar el outfit", "error");
        }
    }
}