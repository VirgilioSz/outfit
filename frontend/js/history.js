document.addEventListener("DOMContentLoaded", () => {
    cargarHistorial();
});

async function cargarHistorial() {
    try {
        const historial = await getHistorial();
        if (historial.length === 0) {
            document.getElementById("mensaje-vacio").style.display = "block";
        } else {
            renderHistorial(historial);
        }
    } catch (error) {
        console.error("Error al cargar el historial:", error);
    }
}

function renderHistorial(outfits) {
    const lista = document.getElementById("lista-historial");
    lista.innerHTML = "";
    outfits.forEach(outfit => {
        // Para cada outfit crea un div con:
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <h3>${outfit.ocasion}</h3>
            <p>${outfit.descripcion}</p>
            <p style="color: var(--color-secundario)">
                ${new Date(outfit.created_at).toLocaleDateString("es-MX")}
            </p>
            <button class="btn-peligro" onclick="eliminarOutfit(${outfit.id})">Eliminar</button>
        `;
        lista.appendChild(div);
    });
}

async function eliminarOutfit(id) {
    try {
        if (confirm("¿Eliminar este outfit?")) {
            await deleteOutfit(id);
            await cargarHistorial();
        }
    } catch (error) {
        console.error("Error al eliminar el outfit:", error);
    }
}