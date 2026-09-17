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
        outfit.prendas.forEach(prenda => {
            const div = document.createElement("div");
            div.classList.add("card-prenda");
            div.innerHTML = `
                <img src="${obtenerUrlImagen(prenda.imagen_url)}" alt="${prenda.tipo}">
                <p>${prenda.tipo} — ${prenda.color}</p>
                <p style="color: var(--color-secundario)">${prenda.estilo}</p>
            `;
            grid.appendChild(div);
        });
        document.getElementById("resultado-outfit").style.display = "block";
    } catch (error) {
        document.getElementById("mensaje-error").style.display = "block";
        document.getElementById("mensaje-error").textContent = error.message;
    } finally {
        generando = false;
        botonGenerar.disabled = false;
        document.getElementById("mensaje-cargando").style.display = "none";
    }
});