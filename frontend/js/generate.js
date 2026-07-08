document.getElementById("btn-generar").addEventListener("click", async () => {
    const ocasion = document.getElementById("selector-ocasion").value;
    document.getElementById("mensaje-cargando").style.display = "block";
    document.getElementById("resultado-outfit").style.display = "none";
    document.getElementById("mensaje-error").style.display = "none";
    try {
        const outfit = await generarOutfit(ocasion);
        document.getElementById("mensaje-cargando").style.display = "none";
        document.getElementById("descripcion-outfit").textContent = outfit.descripcion;
        const grid = document.getElementById("grid-outfit");
        grid.innerHTML = "";
        outfit.prendas.forEach(prenda => {
            const div = document.createElement("div");
            div.classList.add("card-prenda");
            div.innerHTML = `
                <img src="${API_URL}/uploads/${prenda.imagen_url.split('\\').pop()}" alt="${prenda.tipo}">
                <p>${prenda.tipo} — ${prenda.color}</p>
                <p style="color: var(--color-secundario)">${prenda.estilo}</p>
            `;
            grid.appendChild(div);
        });
        document.getElementById("resultado-outfit").style.display = "block";
    } catch (error) {
        document.getElementById("mensaje-cargando").style.display = "none";
        document.getElementById("mensaje-error").style.display = "block";
        document.getElementById("mensaje-error").textContent = error.message;
    }
});