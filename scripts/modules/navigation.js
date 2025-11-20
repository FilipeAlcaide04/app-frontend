// scripts/modules/navigation.js

export function setupNavigation(app) {


    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(btn => {
        btn.addEventListener("click", () => {
            const section = btn.dataset.section;
            if (!section) return;

            // Remove active from ALL nav buttons
            navItems.forEach(b => b.classList.remove("active"));

            // Add active to the clicked button
            btn.classList.add("active");

            // Switch page
            switchPage(section);

            app.currentSection = section;
           // app.addLog(`Switched to ${section} page`, "info");
        });
    });
}

function switchPage(sectionName) {

    const pages = document.querySelectorAll(".page-section");
    const title = document.getElementById("pageTitle");
    const subtitle = document.getElementById("pageSubtitle");

    // Remove active from all pages
    pages.forEach(page => page.classList.remove("active"));

    const selected = document.getElementById(`${sectionName}-page`);
    if (selected) {
        selected.classList.add("active");
    }

    // Update header text
    title.textContent = capitalize(sectionName);
    subtitle.textContent = `${capitalize(sectionName)} module`;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
