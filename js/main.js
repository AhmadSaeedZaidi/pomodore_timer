import { AudioController, TimerState, CYCLE_END_STAGE } from './state.js';
import { UIController } from './ui.js';

const App = {
    init() {
        AudioController.init();
        TimerState.init();
        UIController.init();
        UIController.bindEvents(
            () => this.toggleTimer(),
            () => this.resetTimer(),
            () => this.skipBreak(),
            () => AudioController.silence()
        );
    },

    toggleTimer() {
        const status = TimerState.status;

        if (status.isRunning) {
            this.pauseTimer();
        } else {
            status.isRunning = true;
            if (UIController.elements.startBtn) {
                UIController.elements.startBtn.textContent = 'Pause';
            }

            if (status.currentMode === 'focus' && TimerState.history.cycleStage % 2 === 0) {
                TimerState.advanceCycle();
                UIController.updateDots();
            }

            status.intervalId = setInterval(() => {
                if (status.secondsRemaining > 0) {
                    status.secondsRemaining--;
                    UIController.updateDisplay(status.secondsRemaining);
                } else {
                    this.switchMode();
                }
            }, 1000);
        }
    },

    pauseTimer() {
        const status = TimerState.status;
        clearInterval(status.intervalId);
        status.isRunning = false;
        if (UIController.elements.startBtn) {
            UIController.elements.startBtn.textContent = 'Start';
        }
    },

    switchMode(skippedDuration = null) {
        const state = TimerState;
        const status = state.status;

        if (status.currentMode === 'focus') {
            state.logSession('focus', state.settings.focus);
            state.advanceCycle();

            const isLongBreak = (state.history.cycleStage === CYCLE_END_STAGE);

            status.currentMode = 'break';
            status.secondsRemaining = isLongBreak ? state.settings.longBreak : state.settings.break;
            UIController.setModeDisplay('break', isLongBreak);
            AudioController.trigger(isLongBreak ? 'longBreak' : 'break');
        } else {
            const isLongBreak = (state.history.cycleStage === CYCLE_END_STAGE);
            const expectedDuration = isLongBreak ? state.settings.longBreak : state.settings.break;
            const actualDuration = skippedDuration !== null ? skippedDuration : expectedDuration;

            state.logSession(isLongBreak ? 'long break' : 'short break', actualDuration);

            if (isLongBreak) {
                state.resetCycle();
                this.pauseTimer();
            }

            status.currentMode = 'focus';
            status.secondsRemaining = state.settings.focus;
            UIController.setModeDisplay('focus', false);

            if (status.isRunning) {
                state.advanceCycle();
                UIController.updateDots();
            }

            if (skippedDuration === null) {
                AudioController.trigger('focus');
            }
        }

        UIController.renderHistory();
        UIController.updateDisplay(status.secondsRemaining);
    },

    skipBreak() {
        AudioController.silence();

        const wasRunning = TimerState.status.isRunning;
        if (wasRunning) {
            clearInterval(TimerState.status.intervalId);
            TimerState.status.isRunning = false;
        }

        const isLongBreak = (TimerState.history.cycleStage === CYCLE_END_STAGE);
        const expectedDuration = isLongBreak ? TimerState.settings.longBreak : TimerState.settings.break;
        const actualDuration = expectedDuration - TimerState.status.secondsRemaining;

        this.switchMode(actualDuration);

        if (wasRunning && !isLongBreak) {
            TimerState.status.isRunning = true;
            if (UIController.elements.startBtn) {
                UIController.elements.startBtn.textContent = 'Pause';
            }

            TimerState.advanceCycle();
            UIController.updateDots();

            TimerState.status.intervalId = setInterval(() => {
                if (TimerState.status.secondsRemaining > 0) {
                    TimerState.status.secondsRemaining--;
                    UIController.updateDisplay(TimerState.status.secondsRemaining);
                } else {
                    this.switchMode();
                }
            }, 1000);
        }
    },

    resetTimer() {
        this.pauseTimer();
        AudioController.silence();

        TimerState.status.currentMode = 'focus';
        TimerState.status.secondsRemaining = TimerState.settings.focus;
        TimerState.history.cycleStage = 0;
        TimerState.saveHistory();

        UIController.setModeDisplay('focus', false);
        UIController.renderHistory();
        UIController.updateDisplay(TimerState.status.secondsRemaining);
    }
};

App.init();
