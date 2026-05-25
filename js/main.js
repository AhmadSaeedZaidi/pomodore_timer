const timerDisplay = document.getElementById('timer');
const modalTimer = document.getElementById('modalTimer');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const modeTitle = document.getElementById('modeTitle');
const breakModal = document.getElementById('breakModal');
const closeModalBtn = document.getElementById('closeModalBtn');

const alarm = new Audio('miku_ringtone.mp3');

const studyDuration = 11 / 60;
const breakDuration = 11 / 60;

let timerInterval = null;
let alarmTimeout = null;
let secondsRemaining = studyDuration * 60;
let isRunning = false;
let currentMode = 'study';

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
        currentMode = 'break';
        secondsRemaining = breakDuration * 60;
        modeTitle.textContent = 'Break';

        document.body.classList.add('break-mode');

        breakModal.style.display = 'flex';
    } else {
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

updateDisplay();
