const timerDisplay = document.getElementById('timer');
const modalTimer = document.getElementById('modalTimer');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const modeTitle = document.getElementById('modeTitle');
const breakModal = document.getElementById('breakModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const historyList = document.getElementById('historyList');

const alarm = new Audio('miku_ringtone.mp3');

const studyDuration = 11 / 60;
const breakDuration = 11 / 60;

let timerInterval = null;
let alarmTimeout = null;
let secondsRemaining = studyDuration * 60;
let isRunning = false;
let currentMode = 'study';

let historyData = {
    date: new Date().toDateString(),
    sessions: []
};

function loadHistory() {
    const saved = localStorage.getItem('pomodoroHistory');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.date === new Date().toDateString()) {
                historyData = parsed;
            } else {
                localStorage.removeItem('pomodoroHistory');
            }
        } catch (e) {
            console.error("Error parsing focus history: ", e);
        }
    }
    renderHistory();
}

function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = '';

    if (historyData.sessions.length === 0) {
        historyList.innerHTML = '<li class="empty-history">No sessions completed today yet.</li>';
        return;
    }

    historyData.sessions.forEach(session => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${session.text}</span><span>${session.time}</span>`;
        historyList.appendChild(li);
    });
}

function logSession(type, duration) {
    const totalSeconds = Math.round(duration * 60);
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    const durationText = `${mins}:${secs}`;

    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeText = `${hours}:${minutes}${ampm}`;

    historyData.sessions.push({
        text: `✓ ${durationText} ${type}`,
        time: timeText
    });

    historyData.date = new Date().toDateString();
    localStorage.setItem('pomodoroHistory', JSON.stringify(historyData));
    renderHistory();
}

function updateDisplay() {
    const minutes = Math.floor(secondsRemaining / 60).toString().padStart(2, '0');
    const seconds = (secondsRemaining % 60).toString().padStart(2, '0');
    const timeString = `${minutes}:${seconds}`;

    timerDisplay.textContent = timeString;

    if (modalTimer) {
        modalTimer.textContent = timeString;
    }
}

function triggerAlarm() {
    alarm.currentTime = 0;
    alarm.play().catch(err => console.log("Audio deferred: requires first user interaction."));

    clearTimeout(alarmTimeout);
    alarmTimeout = setTimeout(() => {
        alarm.pause();
        alarm.currentTime = 0;
    }, 11000);
}

function silenceAlarm() {
    alarm.pause();
    alarm.currentTime = 0;
    clearTimeout(alarmTimeout);
}

function switchMode() {
    if (currentMode === 'study') {
        logSession('focus', studyDuration);
        currentMode = 'break';
        secondsRemaining = breakDuration * 60;
        modeTitle.textContent = 'Break';

        document.body.classList.add('break-mode');
        breakModal.style.display = 'flex';
    } else {
        logSession('break', breakDuration);
        currentMode = 'study';
        secondsRemaining = studyDuration * 60;
        modeTitle.textContent = 'Study';

        document.body.classList.remove('break-mode');
        breakModal.style.display = 'none';
    }

    triggerAlarm();
    updateDisplay();
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.textContent = 'Start';
    } else {
        isRunning = true;
        startBtn.textContent = 'Pause';

        timerInterval = setInterval(() => {
            if (secondsRemaining > 0) {
                secondsRemaining--;
                updateDisplay();
            } else {
                switchMode();
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    silenceAlarm();
    isRunning = false;
    currentMode = 'study';
    secondsRemaining = studyDuration * 60;
    modeTitle.textContent = 'Study';
    startBtn.textContent = 'Start';
    document.body.classList.remove('break-mode');
    breakModal.style.display = 'none';
    updateDisplay();
}

closeModalBtn.addEventListener('click', () => {
    silenceAlarm();
    currentMode = 'study';
    secondsRemaining = studyDuration * 60;
    modeTitle.textContent = 'Study';
    document.body.classList.remove('break-mode');
    breakModal.style.display = 'none';

    updateDisplay();
});

startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);

loadHistory();
updateDisplay();
