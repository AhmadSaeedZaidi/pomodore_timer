import { TimerState, CYCLE_END_STAGE, formatTime } from './state.js';

export const UIController = {
    elements: {},

    init() {
        this.elements = {
            timerDisplay: document.getElementById('timer'),
            modalTimer: document.getElementById('modalTimer'),
            startBtn: document.getElementById('startBtn'),
            resetBtn: document.getElementById('resetBtn'),
            stopAudioBtn: document.getElementById('stopAudioBtn'),
            modeTitle: document.getElementById('modeTitle'),
            breakModal: document.getElementById('breakModal'),
            closeModalBtn: document.getElementById('closeModalBtn'),
            historyList: document.getElementById('historyList'),
            historyTitle: document.getElementById('historyTitle'),
            dots: document.querySelectorAll('#sessionDots .dot'),
            modalTitle: document.querySelector('#modalTitle'),
            inputs: {
                focusMin: document.getElementById('focusMin'),
                focusSec: document.getElementById('focusSec'),
                breakMin: document.getElementById('breakMin'),
                breakSec: document.getElementById('breakSec'),
                longBreakMin: document.getElementById('longBreakMin'),
                longBreakSec: document.getElementById('longBreakSec')
            }
        };

        this.populateSettings(TimerState.settings);
        this.renderHistory();
        this.updateDisplay(TimerState.status.secondsRemaining);
    },

    bindEvents(onToggleTimer, onResetTimer, onSkipBreak, onStopAudio) {
        const { inputs, startBtn, resetBtn, closeModalBtn, stopAudioBtn } = this.elements;

        Object.values(inputs).forEach(el => {
            if (!el) return;
            el.addEventListener('change', (e) => {
                this.clampInput(e.target);
                this.handleSettingsChange();
            });
            el.addEventListener('input', () => this.handleSettingsChange());
        });

        if (startBtn) startBtn.addEventListener('click', onToggleTimer);
        if (resetBtn) resetBtn.addEventListener('click', onResetTimer);
        if (closeModalBtn) closeModalBtn.addEventListener('click', onSkipBreak);
        if (stopAudioBtn) stopAudioBtn.addEventListener('click', onStopAudio);
    },

    clampInput(el) {
        let val = parseInt(el.value, 10);
        if (isNaN(val) || val < 0) val = 0;

        if (el.id.includes('Sec')) {
            val = Math.min(59, val);
        }
        el.value = String(val).padStart(2, '0');
    },

    handleSettingsChange() {
        const { inputs } = this.elements;
        const focus = (parseInt(inputs.focusMin.value) || 0) * 60 + (parseInt(inputs.focusSec.value) || 0);
        const shortBreak = (parseInt(inputs.breakMin.value) || 0) * 60 + (parseInt(inputs.breakSec.value) || 0);
        const longBreak = (parseInt(inputs.longBreakMin.value) || 0) * 60 + (parseInt(inputs.longBreakSec.value) || 0);
        
        TimerState.saveSettings(focus, shortBreak, longBreak);
        this.updateDisplay(TimerState.status.secondsRemaining);
    },

    populateSettings(settings) {
        const { inputs } = this.elements;
        if (!inputs.focusMin) return;

        const setVals = (minEl, secEl, totalSecs) => {
            minEl.value = String(Math.floor(totalSecs / 60)).padStart(2, '0');
            secEl.value = String(Math.round(totalSecs % 60)).padStart(2, '0');
        };

        setVals(inputs.focusMin, inputs.focusSec, settings.focus);
        setVals(inputs.breakMin, inputs.breakSec, settings.break);
        setVals(inputs.longBreakMin, inputs.longBreakSec, settings.longBreak);
    },

    updateDisplay(seconds) {
        const formatted = formatTime(seconds);
        if (this.elements.timerDisplay) this.elements.timerDisplay.textContent = formatted;
        if (this.elements.modalTimer) this.elements.modalTimer.textContent = formatted;
    },

    renderHistory() {
        const { historyList, historyTitle } = this.elements;
        if (!historyList) return;

        historyList.innerHTML = '';

        if (historyTitle) {
            const count = TimerState.history.totalFocusCount || 0;
            historyTitle.textContent = `History — ${count} Focus Session${count === 1 ? '' : 's'} Today`;
        }

        if (TimerState.history.sessions.length === 0) {
            historyList.innerHTML = '<li class="empty-history">No sessions completed today yet.</li>';
            this.updateDots();
            return;
        }

        TimerState.history.sessions.forEach(session => {
            const li = document.createElement('li');
            if (session.text.includes('Focus')) li.classList.add('focus-item');
            else if (session.text.includes('Long Break')) li.classList.add('long-break-item');
            else li.classList.add('break-item');
            
            li.innerHTML = `<span>${session.text}</span><span>${session.time}</span>`;
            historyList.appendChild(li);
        });

        this.updateDots();
    },

    updateDots() {
        if (!this.elements.dots) return;
        
        this.elements.dots.forEach((dot, index) => {
            dot.classList.remove('active', 'focus-dot', 'break-dot', 'long-break-dot');
            
            if (index === CYCLE_END_STAGE - 1) dot.classList.add('long-break-dot');
            else if (index % 2 === 0) dot.classList.add('focus-dot');
            else dot.classList.add('break-dot');

            if (index < TimerState.history.cycleStage) {
                dot.classList.add('active');
            }
        });
    },

    setModeDisplay(mode, isLongBreak) {
        const { modeTitle, breakModal, modalTitle, startBtn } = this.elements;
        
        if (mode === 'focus') {
            if (modeTitle) modeTitle.textContent = 'Study';
            document.body.classList.remove('break-mode');
            if (breakModal) breakModal.style.display = 'none';
        } else {
            const titleText = isLongBreak ? 'Long Break' : 'Break';
            if (modeTitle) modeTitle.textContent = titleText;
            if (modalTitle) modalTitle.textContent = `${titleText} Time!`;
            document.body.classList.add('break-mode');
            if (breakModal) breakModal.style.display = 'flex';
        }
        
        if (startBtn) {
            startBtn.textContent = TimerState.status.isRunning ? 'Pause' : 'Start';
        }
    }
};
