// Preview de imagen antes de subir
document.getElementById("input-imagen").addEventListener("change", (e) => {
    const archivo = e.target.files[0]
    const url = URL.createObjectURL(archivo)
    const preview = document.getElementById("preview");
    preview.src = url;
    preview.style.display = "block";
});

// Submit del formulario
document.getElementById("form-upload").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    try {
        formData.append("imagen", document.getElementById("input-imagen").files[0]);
        formData.append("tipo", document.getElementById("input-tipo").value);
        formData.append("color", document.getElementById("input-color").value);
        formData.append("estilo", document.getElementById("input-estilo").value);
        formData.append("temporada", document.getElementById("input-temporada").value);
        formData.append("notas", document.getElementById("input-notas").value);
        await uploadPrenda(formData);
        document.getElementById("form-upload").reset();
        document.getElementById("mensaje-exito").style.display = "block";
    } catch (error) {
        const mensajeError = document.getElementById("mensaje-error");
        mensajeError.textContent = "Error al subir la prenda.";
        mensajeError.style.display = "block";
    }
});