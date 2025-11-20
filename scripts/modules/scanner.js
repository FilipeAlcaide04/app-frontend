// scripts/modules/scanner.js
import { capitalize } from "./utils.js";

export function setupScanner(app) {
    const buttons = {
        fullScanBtn: "FullScan",
        sqlInjectionBtn: "SqlInjection",
        xssTestBtn: "XssTest",
        headersBtn: "Headers",
        endpointsBtn: "Endpoints",
        clearBtn: "Clear"
    };

    Object.entries(buttons).forEach(([btnId, fnName]) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        btn.addEventListener("click", () => {
            if (typeof app[fnName] === "function") {
                app[fnName]();
            } else {
                console.error(`Function ${fnName}() is not defined in controller`);
            }
        });
    });
}
