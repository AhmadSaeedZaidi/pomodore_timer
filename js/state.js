export const CYCLE_END_STAGE = 8; 

export function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.round(totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function getCurrentTimeString() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}:${minutes}${ampm}`;
}

export const AudioController = {
    alarms: {
        break: new Audio('assets/miku_ringtone.mp3'),
        longBreak: new Audio('assets/session_complete.mp3'),
        focus: new Audio('assets/nuclear_alarm.mp3')
    },
    init() {
        Object.values(this.alarms).forEach(a => a.loop = false);
    },
    silence() {
        Object.values(this.alarms).forEach(a => {
            a.pause();
            a.currentTime = 0;
        });
    },
    trigger(type) {
        this.silence();
        const activeAlarm = this.alarms[type] || this.alarms.break;
        activeAlarm.play().catch(err => {
            console.log("Audio deferred: requires first user interaction.");
        });
    }
};

export const TimerState = {
    settings: {
        focus: 25 * 60,
        break: 5 * 60,
        longBreak: 15 * 60
    },
    status: {
        intervalId: null,
        isRunning: false,
        currentMode: 'focus', 
        secondsRemaining: 25 * 60
    },
    history: {
        date: new Date().toDateString(),
        sessions: [],
        cycleStage: 0,
        currentSessionNum: 1,
        totalFocusCount: 0
    },

    init() {
        this.loadSettings();
        this.loadHistory();
    },

    loadSettings() {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                
                if (config.focus !== undefined) {
                    this.settings.focus = config.focus;
                } else if (config.study !== undefined) {
                    this.settings.focus = config.study;
                    delete config.study;
                    config.focus = this.settings.focus;
                    localStorage.setItem('pomodoroSettings', JSON.stringify(config));
                }

                if (config.break !== undefined) this.settings.break = config.break;
                if (config.longBreak !== undefined) this.settings.longBreak = config.longBreak;
            } catch (e) {
                console.error("Error parsing settings: ", e);
            }
        }
        this.status.secondsRemaining = this.settings.focus;
    },

    saveSettings(focus, shortBreak, longBreak) {
        this.settings.focus = focus;
        this.settings.break = shortBreak;
        this.settings.longBreak = longBreak;

        localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));

        if (!this.status.isRunning) {
            if (this.status.currentMode === 'focus') {
                this.status.secondsRemaining = this.settings.focus;
            } else {
                this.status.secondsRemaining = (this.history.cycleStage === CYCLE_END_STAGE) 
                    ? this.settings.longBreak 
                    : this.settings.break;
            }
        }
    },

    loadHistory() {
        const saved = localStorage.getItem('pomodoroHistory');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.date === new Date().toDateString()) {
                    this.history = parsed;
                    if (this.history.cycleStage === undefined) this.history.cycleStage = 0;
                    if (this.history.currentSessionNum === undefined) this.history.currentSessionNum = 1;
                    if (this.history.totalFocusCount === undefined || isNaN(this.history.totalFocusCount)) {
                        this.history.totalFocusCount = 0;
                    }
                } else {
                    localStorage.removeItem('pomodoroHistory');
                }
            } catch (e) {
                console.error("Error parsing focus history: ", e);
                alert("Warning: Local history data is corrupted and could not be loaded.");
            }
        }
    },

    saveHistory() {
        this.history.date = new Date().toDateString();
        localStorage.setItem('pomodoroHistory', JSON.stringify(this.history));
    },

    logSession(type, durationSeconds) {
        const durationText = formatTime(durationSeconds);
        const timeText = getCurrentTimeString();
        const sessionNum = this.history.currentSessionNum || 1;
        let text = '';

        if (type === 'focus') {
            this.history.totalFocusCount++;
            const focusIndex = Math.ceil(this.history.cycleStage / 2); 
            text = `✓ Session #${sessionNum} — Focus #${focusIndex} (${durationText})`;
        } else if (type === 'long break') {
            text = `★ Session #${sessionNum} — Long Break (${durationText})`;
        } else {
            const breakIndex = Math.floor(this.history.cycleStage / 2); 
            text = `✓ Session #${sessionNum} — Break #${breakIndex} (${durationText})`;
        }

        this.history.sessions.push({ text, time: timeText });
        this.saveHistory();
    },

    advanceCycle() {
        this.history.cycleStage++;
        this.saveHistory();
    },

    resetCycle() {
        this.history.cycleStage = 0;
        this.history.currentSessionNum++;
        this.saveHistory();
    }
};
