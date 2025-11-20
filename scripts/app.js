import { setupSettingsModal } from "./modules/modal.js";
import * as Navigation from "./modules/navigation.js";
import * as Scanner from "./modules/scanner.js";
import * as Tests from "./modules/tests.js";
import * as Reports from "./modules/reports.js";
import * as Logs from "./modules/logs.js";
import * as Settings from "./modules/settings.js";
import * as Utils from "./modules/utils.js";


setupSettingsModal();

export class VulnerabilityExplorer {
    constructor() {
        console.log("Controller loaded!");

        this.currentSection = "scanner";
        this.logs = [];
        this.settings = Settings.loadSettings();
        this.scanData = { critical: 0, high: 0, medium: 0, low: 0, findings: [] };

        this.init();
    }

    init() {
        Navigation.setupNavigation(this);
        Scanner.setupScanner(this);
        Tests.setupTests(this);
        Reports.setupReports(this);
        Logs.setupLogFilter(this);

        // Bind log & message functions to controller context
        this.addLog = Logs.addLog.bind(this);
        this.addBotMessage = Logs.addBotMessage.bind(this);
        this.addUserMessage = Logs.addUserMessage.bind(this);

        // Bind analysis utilities
        this.updateAnalysisDashboard = Utils.updateAnalysisDashboard.bind(this);
        this.getTotalVulnerabilities = Utils.getTotalVulnerabilities.bind(this);

        this.addLog("System initialized", "info");
    }

    /*===============================
      SCANNER TOOL ACTIONS
    ===============================*/
    FullScan() {
        this.addLog("Starting full scan...", "scan");
        this.addBotMessage("Full scan in progress...");
    }

    SqlInjection() {
        this.addLog("Running SQL Injection tests...", "scan");
        this.addBotMessage("Testing for SQL Injection vulnerabilities...");
    }

    XssTest() {
        this.addLog("Running XSS tests...", "scan");
        this.addBotMessage("Running cross-site scripting checks...");
    }

    Headers() {
        this.addLog("Checking security headers...", "scan");
        this.addBotMessage("Evaluating security headers...");
    }

    Endpoints() {
        this.addLog("Enumerating endpoints...", "scan");
        this.addBotMessage("Mapping API endpoints...");
    }

    Clear() {
        const chat = document.getElementById("chatMessages");
        if (chat) chat.innerHTML = "";
        this.addLog("Logs cleared", "info");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new VulnerabilityExplorer();
});
