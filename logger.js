let logs = [];
let gpsInterval = null;

// センサー値
let sensorData = { ax: null, ay: null, az: null, alpha: null, beta: null, gamma: null };

// DeviceMotion / DeviceOrientation の許可取得
async function requestSensorPermission() {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
        const motionPerm = await DeviceMotionEvent.requestPermission();
        if (motionPerm !== "granted") return false;
        const orientationPerm = await DeviceOrientationEvent.requestPermission();
        if (orientationPerm !== "granted") return false;
    }
    return true;
}

// センサーイベント登録
function setupSensors() {
    window.addEventListener("devicemotion", (e) => {
        sensorData.ax = e.acceleration.x;
        sensorData.ay = e.acceleration.y;
        sensorData.az = e.acceleration.z;
    });

    window.addEventListener("deviceorientation", (e) => {
        sensorData.alpha = e.alpha;
        sensorData.beta = e.beta;
        sensorData.gamma = e.gamma;
    });
}

// GPS + センサー記録開始
async function startLogging() {
    document.getElementById("status").innerText = "Logging...";
    const interval = parseInt(document.getElementById("intervalInput").value)*1000;

    const perm = await requestSensorPermission();
    if (!perm) {
        alert("Sensor permission denied");
        return;
    }

    setupSensors();

    if (!navigator.geolocation) {
        alert("Geolocation is not supported");
        return;
    }

    gpsInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                if (pos && pos.coords) {
                    const data = {
                        lat: pos.coords.latitude || 0,
                        lon: pos.coords.longitude || 0,
                        accuracy: pos.coords.accuracy || null,
                        time: new Date().toISOString(),
                        ax: sensorData.ax,
                        ay: sensorData.ay,
                        az: sensorData.az,
                        alpha: sensorData.alpha,
                        beta: sensorData.beta,
                        gamma: sensorData.gamma
                    };
                    logs.push(data);
                    console.log(data);
                }
            },
            (err) => console.error("GPS acquisition error:", err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, interval);
}

// 記録停止
function stopLogging() {
    if (gpsInterval) {
    clearInterval(gpsInterval);
    gpsInterval = null;
    document.getElementById("status").innerText = "Logging stopped";
    }
}

// CSVダウンロード
function downloadCSV() {
    if (logs.length === 0) {
        alert("No logs available");
        return;
    }

    const header = "lat,lon,accuracy,time,ax,ay,az,alpha,beta,gamma\n";
    const rows = logs.map(d =>
    `${d.lat},${d.lon},${d.accuracy},${d.time},${d.ax},${d.ay},${d.az},${d.alpha},${d.beta},${d.gamma}`
    ).join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sensor_log.csv";
    a.click();
    URL.revokeObjectURL(url);
}
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("start").addEventListener("click", startLogging);
    document.getElementById("stop").addEventListener("click", stopLogging);
    document.getElementById("download").addEventListener("click", downloadCSV);
});