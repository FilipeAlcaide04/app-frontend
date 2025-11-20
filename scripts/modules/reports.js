export function setupReports(app) {
    document.getElementById("generateReportBtn")?.addEventListener("click", () => {
        app.generateReport();
    });
}
