document.addEventListener("DOMContentLoaded", () => {
    cargarHistorial();
    inicializarLightboxOutfit();
});

async function cargarHistorial() {
    try {
        const historial = await getHistorial();
        renderHistorial(historial);
        document.getElementById("mensaje-vacio").style.display = historial.length === 0 ? "block" : "none";
        lucide.createIcons();
    } catch (error) {
        console.error("Error al cargar el historial:", error);
        mostrarToast("Error al cargar el historial", "error");
    }
}

function renderHistorial(outfits) {
    const lista = document.getElementById("lista-historial");
    lista.innerHTML = "";
    outfits.forEach((outfit, index) => {
        const div = document.createElement("div");
        div.className = "card";
        div.style.animationDelay = `${index * 80}ms`;
        div.dataset.outfitId = outfit.id;
        div.tabIndex = 0;
        div.role = "button";
        div.setAttribute("aria-label", `Ver detalle de outfit para ${outfit.ocasion}`);
        div.innerHTML = `
            <h3>${capitalizar(outfit.ocasion)}</h3>
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
}

let outfitActualId = null;

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

        ocasionEl.textContent = capitalizar(outfit.ocasion);
        fechaEl.textContent = new Date(outfit.created_at).toLocaleDateString("es-MX", {
            year: "numeric", month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
        descripcionEl.textContent = outfit.descripcion || "Sin descripción";
        titulo.textContent = `Outfit — ${capitalizar(outfit.ocasion)}`;

        prendasGrid.innerHTML = "";
        outfit.prendas.forEach((prenda, index) => {
            const card = document.createElement("div");
            card.className = "card";
            card.style.animationDelay = `${index * 60}ms`;
            card.innerHTML = `
                <img src="${obtenerUrlImagen(prenda.imagen_url)}" alt="${prenda.tipo}">
                <div class="card-info">
                    <p class="card-tipo">${capitalizar(prenda.tipo)}</p>
                    <p class="card-detalle">${capitalizar(prenda.color)} • ${capitalizar(prenda.estilo)}</p>
                </div>
            `;
            prendasGrid.appendChild(card);
        });

        overlay.classList.add("abierto");
        document.body.style.overflow = "hidden";
        cerrarBtn.focus();
    } catch (error) {
        console.error("Error al cargar detalle del outfit:", error);
        mostrarToast("Error al cargar el outfit", "error");
    }
}

function cerrarLightboxOutfit() {
    const overlay = document.getElementById("lightbox-outfit");
    overlay.classList.remove("abierto");
    document.body.style.overflow = "";
    outfitActualId = null;
}

function capitalizar(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function confirmarEliminarOutfit() {
    if (!outfitActualId) return;
    if (confirm("¿Eliminar este outfit del historial?")) {
        await eliminarOutfitActual();
    }
}

async function eliminarOutfitActual() {
    if (!outfitActualId) return;
    const id = outfitActualId;
    try {
        await deleteOutfit(id);
        mostrarToast("Outfit eliminado del historial", "exito");
        cerrarLightboxOutfit();
        await cargarHistorial();
    } catch (error) {
        console.error("Error al eliminar outfit:", error);
        mostrarToast("Error al eliminar el outfit", "error");
    }
}

// --- Toast notifications (reutilizada de closet.js) ---
function mostrarToast(mensaje, tipo = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;
    toast.role = "alert";
    toast.ariaLive = "assertive";

    const iconos = {
        exito: "check-circle",
        error: "alert-circle",
        info: "info"
    };

    toast.innerHTML = `
        <i data-lucide="${iconos[tipo]}" class="toast-icon"></i>
        <span class="toast-mensaje">${mensaje}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    requestAnimationFrame(() => {
        toast.classList.add("visible");
    });

    setTimeout(() => {
        toast.classList.remove("visible");
        toast.classList.add("exiting");
        toast.addEventListener("transitionend", () => toast.remove());
    }, 4000);
}