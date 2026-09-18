document.addEventListener("DOMContentLoaded", () => {
    cargarHistorial();
    inicializarLightboxOutfit();
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
        div.dataset.outfitId = outfit.id;
        div.tabIndex = 0;
        div.role = "button";
        div.setAttribute("aria-label", `Ver detalle de outfit para ${outfit.ocasion}`);
        div.innerHTML = `
            <h3>${UI.capitalizar(outfit.ocasion)}</h3>
            <p>${outfit.descripcion}</p>
            <p style="color: var(--color-secundario)">
                ${new Date(outfit.created_at).toLocaleDateString("es-MX")}
            </p>
        `;
        div.addEventListener("click", () => abrirLightboxOutfit(outfit.id));
        div.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                abrirLightboxOutfit(outfit.id);
            }
        });
        lista.appendChild(div);
    });
    // Stagger animation using UI helper
    UI.staggerEntrada("#lista-historial", ".card", { delayBase: 80 });
}

let outfitActualId = null;
let limpiarFocusTrapOutfit = null;

function inicializarLightboxOutfit() {
    const overlay = document.getElementById("lightbox-outfit");
    const cerrarBtn = document.getElementById("lightbox-outfit-cerrar");
    const eliminarBtn = document.getElementById("lightbox-outfit-eliminar");

    cerrarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        cerrarLightboxOutfit();
    });
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) cerrarLightboxOutfit();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("abierto")) {
            cerrarLightboxOutfit();
        }
    });

    eliminarBtn.addEventListener("click", () => confirmarEliminarOutfit());
}

async function abrirLightboxOutfit(id) {
    const overlay = document.getElementById("lightbox-outfit");
    const ocasionEl = document.getElementById("lightbox-outfit-ocasion");
    const fechaEl = document.getElementById("lightbox-outfit-fecha");
    const descripcionEl = document.getElementById("lightbox-outfit-descripcion");
    const prendasGrid = document.getElementById("lightbox-outfit-prendas");
    const titulo = document.getElementById("lightbox-outfit-titulo");

    try {
        const outfit = await getOutfitDetalle(id);
        outfitActualId = id;

        ocasionEl.textContent = UI.capitalizar(outfit.ocasion);
        fechaEl.textContent = new Date(outfit.created_at).toLocaleDateString("es-MX", {
            year: "numeric", month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
        descripcionEl.textContent = outfit.descripcion || "Sin descripción";
        titulo.textContent = `Outfit — ${UI.capitalizar(outfit.ocasion)}`;

        prendasGrid.innerHTML = "";
        outfit.prendas.forEach((prenda) => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <img src="${obtenerUrlImagen(prenda.imagen_url)}" alt="${prenda.tipo}">
                <div class="card-info">
                    <p class="card-tipo">${UI.capitalizar(prenda.tipo)}</p>
                    <p class="card-detalle">${UI.capitalizar(prenda.color)} \u2022 ${UI.capitalizar(prenda.estilo)}</p>
                </div>
            `;
            prendasGrid.appendChild(card);
        });

        // Usar UI helper para animación + focus trap
        UI.abrirPanel("#lightbox-outfit", ".lightbox-panel", () => {
            limpiarFocusTrapOutfit = UI.atraparFoco("#lightbox-outfit");
            document.getElementById("lightbox-outfit-cerrar").focus();
        });
    } catch (error) {
        console.error("Error al cargar detalle del outfit:", error);
        UI.mostrarToast("Error al cargar el outfit", "error");
    }
}

function cerrarLightboxOutfit() {
    const overlay = document.getElementById("lightbox-outfit");
    UI.cerrarPanel("#lightbox-outfit", ".lightbox-panel", () => {
        outfitActualId = null;
        if (limpiarFocusTrapOutfit) {
            limpiarFocusTrapOutfit();
            limpiarFocusTrapOutfit = null;
        }
    });
}

async function confirmarEliminarOutfit() {
    if (!outfitActualId) return;
    if (confirm("\u00bfEliminar este outfit del historial?")) {
        await eliminarOutfitActual();
    }
}

async function eliminarOutfitActual() {
    if (!outfitActualId) return;
    const id = outfitActualId;
    try {
        await deleteOutfit(id);
        UI.mostrarToast("Outfit eliminado del historial", "exito");
        cerrarLightboxOutfit();
        await cargarHistorial();
    } catch (error) {
        console.error("Error al eliminar outfit:", error);
        UI.mostrarToast("Error al eliminar el outfit", "error");
    }
}