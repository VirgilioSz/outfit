document.addEventListener("DOMContentLoaded", () => {
    cargarPrendas();
    inicializarLightbox();
});

async function cargarPrendas() {
    try {
        const prendas = await getPrendas();
        renderPrendas(prendas);
        document.getElementById("mensaje-vacio").style.display = prendas.length === 0 ? "block" : "none";
        lucide.createIcons();
    } catch (error) {
        console.error("Error al cargar las prendas:", error);
        mostrarToast("Error al cargar las prendas", "error");
    }
}

function renderPrendas(prendas) {
    const grid = document.getElementById("grid-prendas");
    grid.innerHTML = "";
    prendas.forEach((prenda, index) => {
        const card = crearCard(prenda);
        card.style.animationDelay = `${index * 80}ms`;
        grid.appendChild(card);
    });
}

function crearCard(prenda) {
    const div = document.createElement("div");
    div.className = "card";
    div.tabIndex = 0;
    div.role = "button";
    div.setAttribute("aria-label", `Ver detalle de ${prenda.tipo} ${prenda.color}`);
    div.dataset.prendaId = prenda.id;
    div.innerHTML = `
        <img src="${obtenerUrlImagen(prenda.imagen_url)}" alt="${prenda.tipo}">
        <div class="card-info">
            <p class="card-tipo">${prenda.tipo}</p>
            <p class="card-detalle">${prenda.color} • ${prenda.estilo}</p>
        </div>
    `;
    div.addEventListener("click", () => abrirLightbox(prenda));
    div.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrirLightbox(prenda);
        }
    });
    return div;
}

let prendaActual = null;

function inicializarLightbox() {
    const overlay = document.getElementById("lightbox-prenda");
    const cerrarBtn = document.getElementById("lightbox-cerrar");
    const editarBtn = document.getElementById("lightbox-editar");
    const eliminarBtn = document.getElementById("lightbox-eliminar");

    cerrarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        cerrarLightbox();
    });
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) cerrarLightbox();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("abierto")) {
            cerrarLightbox();
        }
    });

    editarBtn.addEventListener("click", () => activarEdicion());
    eliminarBtn.addEventListener("click", () => confirmarEliminar());
}

function abrirLightbox(prenda) {
    prendaActual = prenda;
    const overlay = document.getElementById("lightbox-prenda");
    const imagen = document.getElementById("lightbox-imagen");
    const infoGrid = document.getElementById("lightbox-info");
    const notas = document.getElementById("lightbox-notas");
    const titulo = document.getElementById("lightbox-titulo");

    imagen.src = obtenerUrlImagen(prenda.imagen_url);
    imagen.alt = prenda.tipo;
    titulo.textContent = `${prenda.tipo} ${prenda.color}`;

    infoGrid.innerHTML = `
        <div class="lightbox-campo">
            <span class="lightbox-campo-label">Tipo</span>
            <span class="lightbox-campo-valor">${capitalizar(prenda.tipo)}</span>
        </div>
        <div class="lightbox-campo">
            <span class="lightbox-campo-label">Color</span>
            <span class="lightbox-campo-valor">${capitalizar(prenda.color)}</span>
        </div>
        <div class="lightbox-campo">
            <span class="lightbox-campo-label">Estilo</span>
            <span class="lightbox-campo-valor">${capitalizar(prenda.estilo)}</span>
        </div>
        <div class="lightbox-campo">
            <span class="lightbox-campo-label">Temporada</span>
            <span class="lightbox-campo-valor">${capitalizar(prenda.temporada)}</span>
        </div>
    `;

    notas.textContent = prenda.notas || "—";

    overlay.classList.add("abierto");
    document.body.style.overflow = "hidden";
    cerrarBtn.focus();
}

function cerrarLightbox() {
    const overlay = document.getElementById("lightbox-prenda");
    overlay.classList.remove("abierto");
    document.body.style.overflow = "";
    prendaActual = null;
    // Restaurar vista de solo lectura si estaba en edición
    restaurarVistaLectura();
}

function capitalizar(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Edición dentro del lightbox ---
function activarEdicion() {
    if (!prendaActual) return;

    const infoGrid = document.getElementById("lightbox-info");
    const notas = document.getElementById("lightbox-notas");
    const editarBtn = document.getElementById("lightbox-editar");
    const eliminarBtn = document.getElementById("lightbox-eliminar");

    // Guardar valores originales para cancelar
    infoGrid.dataset.originalHtml = infoGrid.innerHTML;
    notas.dataset.originalText = notas.textContent;

    infoGrid.innerHTML = `
        <div class="lightbox-campo" style="grid-column: 1 / -1;">
            <label for="edit-tipo">Tipo</label>
            <input type="text" id="edit-tipo" value="${prendaActual.tipo}" required>
        </div>
        <div class="lightbox-campo" style="grid-column: 1 / -1;">
            <label for="edit-color">Color</label>
            <input type="text" id="edit-color" value="${prendaActual.color}" required>
        </div>
        <div class="lightbox-campo" style="grid-column: 1 / -1;">
            <label for="edit-estilo">Estilo</label>
            <input type="text" id="edit-estilo" value="${prendaActual.estilo}" required>
        </div>
        <div class="lightbox-campo" style="grid-column: 1 / -1;">
            <label for="edit-temporada">Temporada</label>
            <select id="edit-temporada">
                <option value="todas" ${prendaActual.temporada === "todas" ? "selected" : ""}>Todas</option>
                <option value="primavera" ${prendaActual.temporada === "primavera" ? "selected" : ""}>Primavera</option>
                <option value="verano" ${prendaActual.temporada === "verano" ? "selected" : ""}>Verano</option>
                <option value="otoño" ${prendaActual.temporada === "otoño" ? "selected" : ""}>Otoño</option>
                <option value="invierno" ${prendaActual.temporada === "invierno" ? "selected" : ""}>Invierno</option>
            </select>
        </div>
    `;

    notas.innerHTML = `
        <label for="edit-notas">Notas</label>
        <textarea id="edit-notas" rows="3">${prendaActual.notas || ""}</textarea>
    `;

    editarBtn.innerHTML = `<i data-lucide="save"></i> Guardar`;
    editarBtn.onclick = guardarEdicion;
    eliminarBtn.innerHTML = `<i data-lucide="x"></i> Cancelar`;
    eliminarBtn.onclick = cancelarEdicion;
    eliminarBtn.classList.remove("btn-peligro");
    eliminarBtn.classList.add("btn-primario");

    lucide.createIcons();
    document.getElementById("edit-tipo").focus();
}

function restaurarVistaLectura() {
    const infoGrid = document.getElementById("lightbox-info");
    const notas = document.getElementById("lightbox-notas");
    const editarBtn = document.getElementById("lightbox-editar");
    const eliminarBtn = document.getElementById("lightbox-eliminar");

    if (infoGrid.dataset.originalHtml) {
        infoGrid.innerHTML = infoGrid.dataset.originalHtml;
        delete infoGrid.dataset.originalHtml;
    }
    if (notas.dataset.originalText) {
        notas.textContent = notas.dataset.originalText;
        delete notas.dataset.originalText;
    }

    editarBtn.innerHTML = `<i data-lucide="edit-2"></i> Editar`;
    editarBtn.onclick = activarEdicion;
    eliminarBtn.innerHTML = `<i data-lucide="trash-2"></i> Eliminar`;
    eliminarBtn.onclick = confirmarEliminar;
    eliminarBtn.classList.remove("btn-primario");
    eliminarBtn.classList.add("btn-peligro");

    lucide.createIcons();
}

async function guardarEdicion() {
    if (!prendaActual) return;

    const tipo = document.getElementById("edit-tipo").value.trim();
    const color = document.getElementById("edit-color").value.trim();
    const estilo = document.getElementById("edit-estilo").value.trim();
    const temporada = document.getElementById("edit-temporada").value;
    const notas = document.getElementById("edit-notas").value.trim();

    if (!tipo || !color || !estilo) {
        mostrarToast("Tipo, color y estilo son obligatorios", "error");
        return;
    }

    try {
        const prendaActualizada = await actualizarPrenda(prendaActual.id, {
            tipo, color, estilo, temporada, notas: notas || null
        });

        prendaActual = prendaActualizada;
        mostrarToast("Prenda actualizada correctamente", "exito");
        restaurarVistaLectura();
        await cargarPrendas();
    } catch (error) {
        console.error("Error al actualizar:", error);
        mostrarToast(error.message || "Error al actualizar la prenda", "error");
    }
}

function cancelarEdicion() {
    restaurarVistaLectura();
}

// --- Eliminar ---
function confirmarEliminar() {
    if (!prendaActual) return;
    if (confirm("¿Eliminar esta prenda?")) {
        eliminarPrendaActual();
    }
}

async function eliminarPrendaActual() {
    if (!prendaActual) return;
    const id = prendaActual.id;
    try {
        await deletePrenda(id);
        mostrarToast("Prenda eliminada", "exito");
        cerrarLightbox();
        await cargarPrendas();
    } catch (error) {
        console.error("Error al eliminar:", error);
        mostrarToast("Error al eliminar la prenda", "error");
    }
}

// --- Toast notifications ---
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

    // Forzar reflow para animación
    requestAnimationFrame(() => {
        toast.classList.add("visible");
    });

    setTimeout(() => {
        toast.classList.remove("visible");
        toast.classList.add("exiting");
        toast.addEventListener("transitionend", () => toast.remove());
    }, 4000);
}