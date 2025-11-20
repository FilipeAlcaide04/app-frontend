
export function loadSettings() {
    return JSON.parse(localStorage.getItem("veSettings")) || {
        deepScan: false,
        autoLogging: true,
        sslVerify: true,
        alerts: true,
        stealthMode: false
    };
}

export function saveSettings(settings) {
    localStorage.setItem("veSettings", JSON.stringify(settings));
}
