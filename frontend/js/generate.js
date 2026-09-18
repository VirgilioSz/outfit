const botonGenerar = document.getElementById("btn-generar");
let generando = false;
const ICONO_GENERAR = '<i data-lucide="sparkles"></i> Generar outfit';
const ICONO_GENERANDO = '<i data-lucide="loader" class="icono-girar"></i> Generando...';

botonGenerar.addEventListener("click", async () => {
    if (generando) {
        return;
    }
    generando = true;
    botonGenerar.disabled = true;
    botonGenerar.innerHTML = ICONO_GENERANDO;
    if (typeof lucide !== "undefined") lucide.createIcons();
    const ocasion = document.getElementById("selector-ocasion").value;
    document.getElementById("mensaje-cargando").style.display = "block";
    document.getElementById("resultado-outfit").style.display = "none";
    document.getElementById("mensaje-error").style.display = "none";
    try {
        const outfit = await generarOutfit(ocasion);
        document.getElementById("descripcion-outfit").textContent = outfit.descripcion;
        const grid = document.getElementById("grid-outfit");
        grid.innerHTML = "";
        outfit.prendas.forEach((prenda) => {
            const card = crearCardOutfit(prenda);
            grid.appendChild(card);
        });
        document.getElementById("resultado-outfit").style.display = "block";
        // Stagger animation using UI helper
        UI.staggerEntrada("#grid-outfit", ".card", { delayBase: 80 });
        UI.mostrarToast("Outfit generado correctamente", "exito");
    } catch (error) {
        document.getElementById("mensaje-error").style.display = "block";
        document.getElementById("mensaje-error").textContent = error.message;
        UI.mostrarToast(error.message, "error");
    } finally {
        generando = false;
        botonGenerar.disabled = false;
        botonGenerar.innerHTML = ICONO_GENERAR;
        if (typeof lucide !== "undefined") lucide.createIcons();
        document.getElementById("mensaje-cargando").style.display = "none";
    }
});

function crearCardOutfit(prenda) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
        <img src="${obtenerUrlImagen(prenda.imagen_url)}" alt="${prenda.tipo}">
        <div class="card-info">
            <p class="card-tipo">${UI.capitalizar(prenda.tipo)}</p>
            <p class="card-detalle">${UI.capitalizar(prenda.color)} \u2022 ${UI.capitalizar(prenda.estilo)}</p>
        </div>
    `;
    return div;
}