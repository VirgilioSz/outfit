const formulario = document.getElementById("form-upload");
const inputImagen = document.getElementById("input-imagen");
const preview = document.getElementById("preview");
const botonSubir = formulario.querySelector('button[type="submit"]');
const mensajeError = document.getElementById("mensaje-error");
const mensajeExito = document.getElementById("mensaje-exito");
let urlPreview = null;
let subiendo = false;

function limpiarPreview() {
    preview.removeAttribute("src");
    preview.style.display = "none";
    if (urlPreview) {
        URL.revokeObjectURL(urlPreview);
        urlPreview = null;
    }
}

inputImagen.addEventListener("change", () => {
    limpiarPreview();
    mensajeError.style.display = "none";
    mensajeExito.style.display = "none";
    const archivo = inputImagen.files[0];
    if (!archivo) {
        return;
    }
    urlPreview = URL.createObjectURL(archivo);
    preview.src = urlPreview;
    preview.style.display = "block";
});

window.addEventListener("pagehide", limpiarPreview);

formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (subiendo) {
        return;
    }
    mensajeError.style.display = "none";
    mensajeExito.style.display = "none";
    const archivo = inputImagen.files[0];
    if (!archivo) {
        mensajeError.textContent = "Selecciona una imagen antes de subir la prenda.";
        mensajeError.style.display = "block";
        return;
    }

    const textoBoton = botonSubir.textContent;
    subiendo = true;
    botonSubir.disabled = true;
    botonSubir.textContent = "Subiendo prenda...";
    try {
        const formData = new FormData();
        formData.append("imagen", archivo);
        formData.append("tipo", document.getElementById("input-tipo").value);
        formData.append("color", document.getElementById("input-color").value);
        formData.append("estilo", document.getElementById("input-estilo").value);
        formData.append("temporada", document.getElementById("input-temporada").value);
        formData.append("notas", document.getElementById("input-notas").value);
        await uploadPrenda(formData);
        formulario.reset();
        limpiarPreview();
        mensajeError.style.display = "none";
        mensajeExito.style.display = "block";
    } catch (error) {
        mensajeError.textContent = error.message || "Error al subir la prenda.";
        mensajeError.style.display = "block";
    } finally {
        subiendo = false;
        botonSubir.disabled = false;
        botonSubir.textContent = textoBoton;
    }
});
