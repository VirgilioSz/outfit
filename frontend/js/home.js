document.addEventListener("DOMContentLoaded", () => {
    // Stagger animation for home cards
    UI.staggerEntrada("#home-grid", ".home-card", { delayBase: 120 });
    lucide.createIcons();
});