const questions = [
    { text: "あなたの体調チェック！", options: [""] },
    { text: "今日の体調は？", options: ["元気！", "だるい", "頭痛がする", "悪い", "その他"] },
    { text: "今日の痛みはどれくらい？", options: ["1", "2", "3", "4", "5"] },
    { text: "どんな痛み？", options: ["ズキズキ", "ガンガン", "ギュー", "〇〇", "△△"] },
    { text: "終了です！良い一日を！", options: [""] }
];
let index = 0;
const questionContainer = document.getElementById("question-container");
const optionsContainer = document.getElementById("options-container");
const nextButton = document.getElementById("next-btn");
function showQuestion() {
    questionContainer.textContent = questions[index].text;
    optionsContainer.innerHTML = "";
    questions[index].options.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.classList.add("survey-option");
        optionsContainer.appendChild(btn);
    });
}
nextButton.addEventListener("click", () => {
    if (index < questions.length - 1) {
        index++;
        showQuestion();
    }
});
showQuestion();
const tabs = document.querySelectorAll(".tab-btn");
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".page").forEach(page => page.style.display = "none");
        document.getElementById(tab.dataset.target).style.display = "flex";
    });
});
const CSV_URL = "https://www.data.jma.go.jp/obd/stats/data/mdrr/pre_rct/alltable.csv";
let weatherChart;
async function fetchWeatherData() {
    try {
        const response = await fetch(CSV_URL);
        const text = await response.text();
        const data = parseCSV(text);
        updateChart(data);
    } catch (error) {
        document.getElementById("update-time").textContent = "データ取得に失敗しました";
    }
}
function parseCSV(csvText) {
    const rows = csvText.split("\n").slice(1);
    const labels = [];
    const temperatures = [];
    rows.forEach(row => {
        const cols = row.split(",");
        if (cols.length > 2) {
            labels.push(cols[0]);
            temperatures.push(parseFloat(cols[1]));
        }
    });
    return { labels, temperatures };
}
function updateChart(data) {
    const ctx = document.getElementById("weatherChart").getContext("2d");
    if (weatherChart) weatherChart.destroy();
    weatherChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.labels,
            datasets: [{ label: "気温 (℃)", data: data.temperatures, borderColor: "red", fill: false }]
        },
        options: { responsive: true }
    });
    document.getElementById("update-time").textContent = "最終更新: " + new Date().toLocaleTimeString();
}
fetchWeatherData();
setInterval(fetchWeatherData, 12 * 60 * 60 * 1000);
