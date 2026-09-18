document.addEventListener("DOMContentLoaded", () => {
    cargarPrendas();
    inicializarLightbox();
});

async function cargarPrendas() {
    try {
        const prendas = await getPrendas();
        renderPrendas(prendas);
        document.getElementById("mensaje-vacio").style.display = prendas.length === 0 ? "block" : "none";
    } catch (error) {
        console.error("Error al cargar las prendas:", error);
        UI.mostrarToast("Error al cargar las prendas", "error");
    }
}

function renderPrendas(prendas) {
    const grid = document.getElementById("grid-prendas");
    grid.innerHTML = "";
    prendas.forEach((prenda) => {
        const card = crearCard(prenda);
        grid.appendChild(card);
    });
    // Stagger animation using UI helper
    UI.staggerEntrada("#grid-prendas", ".card", { delayBase: 80 });
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
            <p class="card-detalle">${prenda.color} \u2022 ${prenda.estilo}</p>
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
let limpiarFocusTrap = null;
let lightboxAbierto = false;
let lightboxCerrando = false;

function inicializarLightbox() {
    const overlay = document.getElementById("lightbox-prenda");
    const cerrarBtn = document.getElementById("lightbox-cerrar");
    const editarBtn = document.getElementById("lightbox-editar");
    const eliminarBtn = document.getElementById("lightbox-eliminar");
    const cancelarBtn = document.getElementById("lightbox-cancelar");

    cerrarBtn.onclick = (e) => {
        e.stopPropagation();
        cerrarLightbox();
    };
    overlay.onclick = (e) => {
        if (e.target === overlay) cerrarLightbox();
    };
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("abierto")) {
            cerrarLightbox();
        }
    });

    editarBtn.onclick = () => activarEdicion();
    eliminarBtn.onclick = () => confirmarEliminar();
    cancelarBtn.onclick = () => cancelarEdicion();
}

function abrirLightbox(prenda) {
    if (lightboxAbierto || lightboxCerrando) return;
    
    prendaActual = prenda;
    lightboxAbierto = true;
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
            <span class="lightbox-campo-valor">${UI.capitalizar(prenda.tipo)}</span>
        </div>
        <div class="lightbox-campo">
            <span class="lightbox-campo-label">Color</span>
            <span class="lightbox-campo-valor">${UI.capitalizar(prenda.color)}</span>
        </div>
        <div class="lightbox-campo">
            <span class="lightbox-campo-label">Estilo</span>
            <span class="lightbox-campo-valor">${UI.capitalizar(prenda.estilo)}</span>
        </div>
        <div class="lightbox-campo">
            <span class="lightbox-campo-label">Temporada</span>
            <span class="lightbox-campo-valor">${UI.capitalizar(prenda.temporada)}</span>
        </div>
    `;

    notas.textContent = prenda.notas || "\u2014";

    // Usar UI helper para animación + focus trap
    UI.abrirPanel("#lightbox-prenda", ".lightbox-panel", () => {
        limpiarFocusTrap = UI.atraparFoco("#lightbox-prenda");
        document.getElementById("lightbox-cerrar").focus();
    });
}

function cerrarLightbox() {
    if (!lightboxAbierto || lightboxCerrando) return;
    
    lightboxCerrando = true;
    const overlay = document.getElementById("lightbox-prenda");
    UI.cerrarPanel("#lightbox-prenda", ".lightbox-panel", () => {
        prendaActual = null;
        restaurarVistaLectura();
        if (limpiarFocusTrap) {
            limpiarFocusTrap();
            limpiarFocusTrap = null;
        }
        lightboxAbierto = false;
        lightboxCerrando = false;
    });
}

// --- Edición dentro del lightbox ---
function activarEdicion() {
    if (!prendaActual) return;

    const infoGrid = document.getElementById("lightbox-info");
    const notas = document.getElementById("lightbox-notas");
    const editarBtn = document.getElementById("lightbox-editar");
    const eliminarBtn = document.getElementById("lightbox-eliminar");
    const cancelarBtn = document.getElementById("lightbox-cancelar");

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
    
    // Mostrar botón cancelar, ocultar eliminar
    eliminarBtn.style.display = "none";
    cancelarBtn.style.display = "inline-flex";
    cancelarBtn.onclick = cancelarEdicion;

    document.getElementById("edit-tipo").focus();
    inicializarIconos();
}

function inicializarIconos() {
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}

function restaurarVistaLectura() {
    const infoGrid = document.getElementById("lightbox-info");
    const notas = document.getElementById("lightbox-notas");
    const editarBtn = document.getElementById("lightbox-editar");
    const eliminarBtn = document.getElementById("lightbox-eliminar");
    const cancelarBtn = document.getElementById("lightbox-cancelar");

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
    eliminarBtn.style.display = "inline-flex";
    cancelarBtn.style.display = "none";
}

async function guardarEdicion() {
    if (!prendaActual) return;

    const tipo = document.getElementById("edit-tipo").value.trim();
    const color = document.getElementById("edit-color").value.trim();
    const estilo = document.getElementById("edit-estilo").value.trim();
    const temporada = document.getElementById("edit-temporada").value;
    const notas = document.getElementById("edit-notas").value.trim();

    if (!tipo || !color || !estilo) {
        UI.mostrarToast("Tipo, color y estilo son obligatorios", "error");
        return;
    }

    try {
        const prendaActualizada = await actualizarPrenda(prendaActual.id, {
            tipo, color, estilo, temporada, notas: notas || null
        });

        prendaActual = prendaActualizada;
        UI.mostrarToast("Prenda actualizada correctamente", "exito");
        restaurarVistaLectura();
        await cargarPrendas();
    } catch (error) {
        console.error("Error al actualizar:", error);
        UI.mostrarToast(error.message || "Error al actualizar la prenda", "error");
    }
}

function cancelarEdicion() {
    restaurarVistaLectura();
}

// --- Eliminar ---
function confirmarEliminar() {
    if (!prendaActual) return;
    if (confirm("\u00bfEliminar esta prenda?")) {
        eliminarPrendaActual();
    }
}

async function eliminarPrendaActual() {
    if (!prendaActual) return;
    const id = prendaActual.id;
    try {
        await deletePrenda(id);
        UI.mostrarToast("Prenda eliminada", "exito");
        cerrarLightbox();
        await cargarPrendas();
    } catch (error) {
        console.error("Error al eliminar:", error);
        UI.mostrarToast("Error al eliminar la prenda", "error");
    }
}