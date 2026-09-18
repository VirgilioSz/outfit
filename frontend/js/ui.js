// UI Helpers compartidos - Anime.js animations
// Se carga en todas las páginas después de anime.js y antes de los scripts específicos

const UI = (function () {
    // Detectar prefers-reduced-motion
    const prefiereReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Duraciones base
    const DURACION_RAPIDA = 150;
    const DURACION_NORMAL = 250;
    const DURACION_LENTA = 350;
    const EASING = 'cubicBezier(0.4, 0, 0.2, 1)';

    // Helper: animar entrada de overlay + panel (lightbox/modal)
    function abrirPanel(overlaySelector, panelSelector, onComplete) {
        const overlay = document.querySelector(overlaySelector);
        const panel = document.querySelector(panelSelector);
        if (!overlay || !panel) return Promise.resolve();

        if (prefiereReducido) {
            overlay.classList.add('abierto');
            document.body.style.overflow = 'hidden';
            onComplete?.();
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            overlay.classList.add('abierto');
            document.body.style.overflow = 'hidden';

            anime({
                targets: overlay,
                opacity: [0, 1],
                duration: DURACION_NORMAL,
                easing: EASING,
            });

            anime({
                targets: panel,
                scale: [0.9, 1],
                translateY: [20, 0],
                opacity: [0, 1],
                duration: DURACION_NORMAL,
                easing: EASING,
                complete: () => {
                    onComplete?.();
                    resolve();
                },
            });
        });
    }

    // Helper: animar salida de overlay + panel
    function cerrarPanel(overlaySelector, panelSelector, onComplete) {
        const overlay = document.querySelector(overlaySelector);
        const panel = document.querySelector(panelSelector);
        if (!overlay || !panel) return Promise.resolve();

        if (prefiereReducido) {
            overlay.classList.remove('abierto');
            document.body.style.overflow = '';
            onComplete?.();
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            anime({
                targets: overlay,
                opacity: [1, 0],
                duration: DURACION_RAPIDA,
                easing: EASING,
            });

            anime({
                targets: panel,
                scale: [1, 0.9],
                translateY: [0, 20],
                opacity: [1, 0],
                duration: DURACION_RAPIDA,
                easing: EASING,
                complete: () => {
                    overlay.classList.remove('abierto');
                    document.body.style.overflow = '';
                    onComplete?.();
                    resolve();
                },
            });
        });
    }

    // Helper: stagger entrance para grids de cards
    function staggerEntrada(gridSelector, itemSelector = '.card', opciones = {}) {
        const grid = document.querySelector(gridSelector);
        if (!grid) return;

        const items = grid.querySelectorAll(itemSelector);
        if (!items.length) return;

        const {
            duracion = DURACION_NORMAL,
            delayBase = 80,
            easing = EASING,
            direction = 'normal',
        } = opciones;

        if (prefiereReducido) {
            items.forEach((el) => (el.style.opacity = '1'));
            return;
        }

        // Reset inicial
        items.forEach((el) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
        });

        anime({
            targets: items,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: duracion,
            easing: easing,
            delay: anime.stagger(delayBase, { direction }),
        });
    }

    // Helper: shake animation para errores
    function shake(elemento, opciones = {}) {
        if (prefiereReducido) return Promise.resolve();

        const { duracion = 400, intensity = 8 } = opciones;

        return anime({
            targets: elemento,
            translateX: [0, -intensity, intensity, -intensity, intensity, 0],
            duration: duracion,
            easing: EASING,
        }).finished;
    }

    // Helper: fade in/out simple
    function fadeIn(elemento, duracion = DURACION_NORMAL) {
        if (prefiereReducido) {
            elemento.style.opacity = '1';
            elemento.style.display = '';
            return Promise.resolve();
        }
        elemento.style.display = '';
        return anime({
            targets: elemento,
            opacity: [0, 1],
            duration: duracion,
            easing: EASING,
        }).finished;
    }

    function fadeOut(elemento, duracion = DURACION_RAPIDA) {
        if (prefiereReducido) {
            elemento.style.opacity = '0';
            elemento.style.display = 'none';
            return Promise.resolve();
        }
        return anime({
            targets: elemento,
            opacity: [1, 0],
            duration: duracion,
            easing: EASING,
            complete: () => {
                elemento.style.display = 'none';
            },
        }).finished;
    }

    // Helper: toast notification con anime.js
    function mostrarToast(mensaje, tipo = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return Promise.resolve();

        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.role = 'alert';
        toast.ariaLive = 'assertive';

        const iconos = {
            exito: 'check-circle',
            error: 'alert-circle',
            info: 'info',
        };

        toast.innerHTML = `
            <i data-lucide="${iconos[tipo]}" class="toast-icon"></i>
            <span class="toast-mensaje">${mensaje}</span>
        `;

        container.appendChild(toast);
        if (typeof lucide !== 'undefined') lucide.createIcons();

        if (prefiereReducido) {
            toast.classList.add('visible');
            setTimeout(() => toast.remove(), 4000);
            return Promise.resolve();
        }

        // Animación entrada
        anime({
            targets: toast,
            translateX: ['120%', 0],
            opacity: [0, 1],
            duration: DURACION_NORMAL,
            easing: EASING,
        });

        // Auto-eliminar con animación salida
        setTimeout(() => {
            anime({
                targets: toast,
                translateX: [0, '120%'],
                opacity: [1, 0],
                duration: DURACION_NORMAL,
                easing: EASING,
                complete: () => toast.remove(),
            });
        }, 4000);

        return Promise.resolve();
    }

    // Helper: focus trap para modales/lightboxes
    function atraparFoco(overlaySelector) {
        const overlay = document.querySelector(overlaySelector);
        if (!overlay) return () => {};

        const enfocables = overlay.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const primerEnfocable = enfocables[0];
        const ultimoEnfocable = enfocables[enfocables.length - 1];

        function manejarTab(e) {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === primerEnfocable) {
                    e.preventDefault();
                    ultimoEnfocable?.focus();
                }
            } else {
                if (document.activeElement === ultimoEnfocable) {
                    e.preventDefault();
                    primerEnfocable?.focus();
                }
            }
        }

        overlay.addEventListener('keydown', manejarTab);
        primerEnfocable?.focus();

        // Retornar función de limpieza
        return () => {
            overlay.removeEventListener('keydown', manejarTab);
        };
    }

    // Helper: capitalizar primera letra
    function capitalizar(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // API pública
    return {
        abrirPanel,
        cerrarPanel,
        staggerEntrada,
        shake,
        fadeIn,
        fadeOut,
        mostrarToast,
        atraparFoco,
        capitalizar,
        prefiereReducido,
    };
})();

// Exportar globalmente para uso en otros scripts
window.UI = UI;