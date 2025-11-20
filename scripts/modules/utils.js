// scripts/modules/utils.js

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function updateAnalysisDashboard() {
    document.getElementById("criticalCount").textContent = this.scanData.critical;
    document.getElementById("highCount").textContent = this.scanData.high;
    document.getElementById("mediumCount").textContent = this.scanData.medium;
    document.getElementById("lowCount").textContent = this.scanData.low;
}

export function getTotalVulnerabilities() {
    return (
        this.scanData.critical +
        this.scanData.high +
        this.scanData.medium +
        this.scanData.low
    );
}
