// SETTINGS MODAL CONTROLLER

export function setupSettingsModal() {
    const modal = document.getElementById("settingsModal");
    const openBtn = document.getElementById("settingsBtn");
    const closeBtn = document.getElementById("closeSettingsBtn");

    // Open modal
    openBtn.addEventListener("click", () => {
        modal.classList.add("active");
    });

    // Close modal
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
    });

    // Click outside to close
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("active");
    });

    // Toggle switches
    const toggles = document.querySelectorAll(".toggle");

    toggles.forEach(toggle => {
        toggle.addEventListener("click", () => {
            toggle.classList.toggle("active");
        });
    });
}
