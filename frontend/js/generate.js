const botonGenerar = document.getElementById("btn-generar");
let generando = false;
const ICONO_GENERAR = '<i data-lucide="sparkles"></i> Generar outfit';
const ICONO_GENERANDO = '<i data-lucide="loader" class="icono-girar"></i> Generando...';

function getCustomSelectValue(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return "trabajo";
    const trigger = select.querySelector('.custom-select-trigger');
    if (!trigger) return "trabajo";
    const valueSpan = trigger.querySelector('.custom-select-value');
    return valueSpan ? valueSpan.textContent.toLowerCase() : "trabajo";
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

botonGenerar.addEventListener("click", async () => {
    if (generando) {
        return;
    }
    generando = true;
    botonGenerar.disabled = true;
    botonGenerar.innerHTML = ICONO_GENERANDO;
    if (typeof lucide !== "undefined") lucide.createIcons();
    const ocasion = getCustomSelectValue("selector-ocasion");
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

// Initialize custom selects
document.addEventListener("DOMContentLoaded", () => {
    initCustomSelect('selector-ocasion');
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