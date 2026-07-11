document.addEventListener("DOMContentLoaded", () => {
    cargarPrendas();
});

async function cargarPrendas() {
    try {
        const prendas = await getPrendas();
        if (prendas.length === 0) {
            document.getElementById("mensaje-vacio").style.display = "block";
        } else {
            renderPrendas(prendas);
        }
    } catch (error) {
        console.error("Error al cargar las prendas:", error);
    }
}

function renderPrendas(prendas) {
    const grid = document.getElementById("grid-prendas");
    grid.innerHTML = "";
    prendas.forEach(prenda => {
        const card = crearCard(prenda);
        grid.appendChild(card);
    });
}

function crearCard(prenda) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
        <img src="${API_URL}/${prenda.imagen_url}" alt="${prenda.tipo}">
        <div class="card-info">
            <p class="card-tipo">${prenda.tipo}</p>
        </div>
        <button class="btn-peligro" onclick="eliminarPrenda(${prenda.id})">Eliminar</button>
    `;
    return div;
}

async function eliminarPrenda(id) {
    try {
        if (confirm("¿Eliminar esta prenda?")) {
            await deletePrenda(id);
            await cargarPrendas();
        }
    } catch (error) {
        console.error("Error al eliminar la prenda:", error);
    }
}