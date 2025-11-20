export function setupTests(app) {
    document.querySelectorAll(".btn-run-test").forEach(btn => {
        btn.addEventListener("click", () => app.runTest(btn.dataset.test));
    });
}
