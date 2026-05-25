const timerDisplay = document.getElementById('timer');
const modalTimer = document.getElementById('modalTimer');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const modeTitle = document.getElementById('modeTitle');
const breakModal = document.getElementById('breakModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const historyList = document.getElementById('historyList');

const alarm = new Audio('assets/miku_ringtone.mp3');
const longBreakAlarm = new Audio('assets/session_complete.mp3');

const studyDuration = 25 * 60;
const shortBreakDuration = 5 * 60;
const longBreakDuration = 15 * 60;

let timerInterval = null;
let alarmTimeout = null;
let secondsRemaining = studyDuration;
let isRunning = false;
let currentMode = 'study';

let historyData = {
    date: new Date().toDateString(),
    sessions: [],
    completedSessions: 0,
    totalFocusCount: 0
};

function loadHistory() {
    const saved = localStorage.getItem('pomodoroHistory');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.date === new Date().toDateString()) {
                historyData = parsed;
                if (historyData.completedSessions === undefined) {
                    historyData.completedSessions = 0;
                }
                if (historyData.totalFocusCount === undefined || isNaN(historyData.totalFocusCount)) {
                    historyData.totalFocusCount = 0;
                }
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

    const historyTitle = document.getElementById('historyTitle');
    if (historyTitle) {
        const count = historyData.totalFocusCount || 0;
        historyTitle.textContent = `History — ${count} Focus Session${count === 1 ? '' : 's'} Today`;
    }

    if (historyData.sessions.length === 0) {
        historyList.innerHTML = '<li class="empty-history">No sessions completed today yet.</li>';
        updateDots();
        return;
    }

    historyData.sessions.forEach(session => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${session.text}</span><span>${session.time}</span>`;
        historyList.appendChild(li);
    });

    updateDots();
}

function updateDots() {
    const dots = document.querySelectorAll('#sessionDots .dot');
    dots.forEach((dot, index) => {
        if (index < historyData.completedSessions) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function logSession(type, duration) {
    const totalSeconds = Math.round(duration);
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

    let text = '';
    if (type === 'focus') {
        historyData.totalFocusCount++;
        text = `✓ Focus Session #${historyData.totalFocusCount} (${durationText})`;
    } else if (type === 'long break') {
        text = `★ Pomodoro Cycle Complete (${durationText})`;
    } else {
        text = `✓ Break (${durationText})`;
    }

    historyData.sessions.push({
        text: text,
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

function triggerAlarm(isLongBreak) {
    if (isLongBreak) {
        longBreakAlarm.loop = false;
        longBreakAlarm.currentTime = 0;
        longBreakAlarm.play().catch(err => console.log("Audio deferred: requires first user interaction."));
    } else {
        alarm.currentTime = 0;
        alarm.play().catch(err => console.log("Audio deferred: requires first user interaction."));

        clearTimeout(alarmTimeout);
        alarmTimeout = setTimeout(() => {
            alarm.pause();
            alarm.currentTime = 0;
        }, 11000);
    }
}

function silenceAlarm() {
    alarm.pause();
    alarm.currentTime = 0;
    longBreakAlarm.pause();
    longBreakAlarm.currentTime = 0;
    clearTimeout(alarmTimeout);
}

function switchMode() {
    const modalTitleElement = document.querySelector('#breakModal h2');
    let isLongBreak = false;

    if (currentMode === 'study') {
        logSession('focus', studyDuration);

        historyData.completedSessions++;
        localStorage.setItem('pomodoroHistory', JSON.stringify(historyData));

        currentMode = 'break';
        document.body.classList.add('break-mode');
        breakModal.style.display = 'flex';

        if (historyData.completedSessions === 4) {
            isLongBreak = true;
            secondsRemaining = longBreakDuration;
            modeTitle.textContent = 'Long Break';
            if (modalTitleElement) modalTitleElement.textContent = 'Long Break Time!';
        } else {
            secondsRemaining = shortBreakDuration;
            modeTitle.textContent = 'Break';
            if (modalTitleElement) modalTitleElement.textContent = 'Break Time!';
        }
    } else {
        if (historyData.completedSessions === 4) {
            logSession('long break', longBreakDuration);
            historyData.completedSessions = 0;
        } else {
            logSession('short break', shortBreakDuration);
        }
        localStorage.setItem('pomodoroHistory', JSON.stringify(historyData));

        currentMode = 'study';
        secondsRemaining = studyDuration;
        modeTitle.textContent = 'Study';
        document.body.classList.remove('break-mode');
        breakModal.style.display = 'none';
    }

    triggerAlarm(isLongBreak);
    renderHistory();
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
    secondsRemaining = studyDuration;
    modeTitle.textContent = 'Study';
    startBtn.textContent = 'Start';

    historyData.completedSessions = 0;
    localStorage.setItem('pomodoroHistory', JSON.stringify(historyData));

    document.body.classList.remove('break-mode');
    breakModal.style.display = 'none';

    renderHistory();
    updateDisplay();
}

closeModalBtn.addEventListener('click', () => {
    silenceAlarm();

    if (historyData.completedSessions === 4) {
        historyData.completedSessions = 0;
        localStorage.setItem('pomodoroHistory', JSON.stringify(historyData));
    }

    currentMode = 'study';
    secondsRemaining = studyDuration;
    modeTitle.textContent = 'Study';
    document.body.classList.remove('break-mode');
    breakModal.style.display = 'none';

    renderHistory();
    updateDisplay();
});

startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);

loadHistory();
updateDisplay();
