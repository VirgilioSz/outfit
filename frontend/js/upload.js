const formulario = document.getElementById("form-upload");
const inputImagen = document.getElementById("input-imagen");
const preview = document.getElementById("preview");
const botonSubir = formulario.querySelector('button[type="submit"]');
const ICONO_SUBIR = '<i data-lucide="plus"></i> Subir prenda';
const ICONO_SUBIENDO = '<i data-lucide="loader" class="icono-girar"></i> Subiendo...';
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
    const archivo = inputImagen.files[0];
    if (!archivo) {
        UI.mostrarToast("Selecciona una imagen antes de subir la prenda.", "error");
        return;
    }

    subiendo = true;
    botonSubir.disabled = true;
    botonSubir.innerHTML = ICONO_SUBIENDO;
    if (typeof lucide !== "undefined") lucide.createIcons();
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
        UI.mostrarToast("Prenda subida correctamente", "exito");
    } catch (error) {
        UI.mostrarToast(error.message || "Error al subir la prenda.", "error");
    } finally {
        subiendo = false;
        botonSubir.disabled = false;
        botonSubir.innerHTML = ICONO_SUBIR;
        if (typeof lucide !== "undefined") lucide.createIcons();
    }
});