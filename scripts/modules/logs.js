// scripts/modules/logs.js

export function addLog(message, type = "info") {
    if (!this.logs) this.logs = [];

    this.logs.push({
        time: new Date().toLocaleTimeString(),
        type,
        msg: message
    });

    const logsList = document.getElementById("logsList");
    if (logsList) {
        const entry = document.createElement("div");
        entry.classList.add("log-entry");
        entry.innerHTML = `
            <span class="log-time">${new Date().toLocaleTimeString()}</span>
            <span class="log-type ${type}">${type.toUpperCase()}</span>
            <span class="log-message">${message}</span>
        `;
        logsList.appendChild(entry);
    }
}

export function addUserMessage(text) {
    const area = document.getElementById("chatMessages");
    if (!area) return;

    const msg = document.createElement("div");
    msg.className = "message user";
    msg.innerHTML = `<div class="message-content">${text}</div>`;
    area.appendChild(msg);
}

export function addBotMessage(text) {
    const area = document.getElementById("chatMessages");
    if (!area) return;

    const msg = document.createElement("div");
    msg.className = "message bot";
    msg.innerHTML = `<div class="message-content">${text}</div>`;
    area.appendChild(msg);
}

export function setupLogFilter(app) {
    const filter = document.getElementById("logFilter");
    if (!filter) return;

    filter.addEventListener("change", () => {
        const type = filter.value;
        filterLogsByType(app, type);
    });
}

function filterLogsByType(app, type) {
    const logsList = document.getElementById("logsList");
    if (!logsList) return;

    logsList.innerHTML = "";

    app.logs
        .filter(log => type === "all" || log.type === type)
        .forEach(log => {
            const entry = document.createElement("div");
            entry.classList.add("log-entry");
            entry.innerHTML = `
                <span class="log-time">${log.time}</span>
                <span class="log-type ${log.type}">${log.type.toUpperCase()}</span>
                <span class="log-message">${log.msg}</span>
            `;
            logsList.appendChild(entry);
        });
}
