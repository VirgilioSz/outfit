const botonGenerar = document.getElementById("btn-generar");
let generando = false;

botonGenerar.addEventListener("click", async () => {
    if (generando) {
        return;
    }
    generando = true;
    botonGenerar.disabled = true;
    const ocasion = document.getElementById("selector-ocasion").value;
    document.getElementById("mensaje-cargando").style.display = "block";
    document.getElementById("resultado-outfit").style.display = "none";
    document.getElementById("mensaje-error").style.display = "none";
    try {
        const outfit = await generarOutfit(ocasion);
        document.getElementById("descripcion-outfit").textContent = outfit.descripcion;
        const grid = document.getElementById("grid-outfit");
        grid.innerHTML = "";
        outfit.prendas.forEach((prenda, index) => {
            const card = crearCardOutfit(prenda);
            card.style.animationDelay = `${index * 80}ms`;
            grid.appendChild(card);
        });
        document.getElementById("resultado-outfit").style.display = "block";
        mostrarToast("Outfit generado correctamente", "exito");
    } catch (error) {
        document.getElementById("mensaje-error").style.display = "block";
        document.getElementById("mensaje-error").textContent = error.message;
        mostrarToast(error.message, "error");
    } finally {
        generando = false;
        botonGenerar.disabled = false;
        document.getElementById("mensaje-cargando").style.display = "none";
    }
});

function crearCardOutfit(prenda) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
        <img src="${obtenerUrlImagen(prenda.imagen_url)}" alt="${prenda.tipo}">
        <div class="card-info">
            <p class="card-tipo">${capitalizar(prenda.tipo)}</p>
            <p class="card-detalle">${capitalizar(prenda.color)} \u2022 ${capitalizar(prenda.estilo)}</p>
        </div>
    `;
    return div;
}

function capitalizar(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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

    requestAnimationFrame(() => {
        toast.classList.add("visible");
    });

    setTimeout(() => {
        toast.classList.remove("visible");
        toast.classList.add("exiting");
        toast.addEventListener("transitionend", () => toast.remove());
    }, 4000);
}