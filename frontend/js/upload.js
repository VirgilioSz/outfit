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

function getCustomSelectValue(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return "todas";
    const trigger = select.querySelector('.custom-select-trigger');
    if (!trigger) return "todas";
    const valueSpan = trigger.querySelector('.custom-select-value');
    return valueSpan ? valueSpan.textContent.toLowerCase() : "todas";
}

function initCustomSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const trigger = select.querySelector('.custom-select-trigger');
    const panel = select.querySelector('.custom-select-panel');
    const options = panel.querySelectorAll('.custom-select-option');
    
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = !panel.hidden;
        
        document.querySelectorAll('.custom-select-panel').forEach(p => {
            if (p !== panel) p.hidden = true;
        });
        document.querySelectorAll('.custom-select').forEach(s => {
            if (s !== select) s.setAttribute('aria-expanded', 'false');
        });
        
        if (isOpen) {
            panel.hidden = true;
            select.setAttribute('aria-expanded', 'false');
        } else {
            panel.hidden = false;
            select.setAttribute('aria-expanded', 'true');
        }
    });
    
const dropdownOptions = panel.querySelectorAll('.custom-select-option');
        dropdownOptions.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            const selectId = option.closest('.custom-select').id;
            const trigger = select.querySelector('.custom-select-trigger');
            const valueSpan = trigger.querySelector('.custom-select-value');
            valueSpan.textContent = option.textContent;
            
            select.querySelectorAll('.custom-select-option').forEach(opt => {
                opt.setAttribute('aria-selected', 'false');
            });
            option.setAttribute('aria-selected', 'true');
            
            panel.hidden = true;
            select.setAttribute('aria-expanded', 'false');
        });
        
        option.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                option.click();
            }
        });
    });
    
    document.addEventListener('click', (e) => {
        if (!select.contains(e.target)) {
            panel.hidden = true;
            select.setAttribute('aria-expanded', 'false');
        }
    });
    
    trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            trigger.click();
        } else if (e.key === 'Escape') {
            panel.hidden = true;
            select.setAttribute('aria-expanded', 'false');
        }
    });
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

// Initialize custom selects
document.addEventListener("DOMContentLoaded", () => {
    initCustomSelect('input-temporada');
});

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
        formData.append("temporada", getCustomSelectValue("input-temporada"));
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