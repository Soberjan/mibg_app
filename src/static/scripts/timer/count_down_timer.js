import { formatSeconds } from "./format_seconds.js";

export function start_countdown(timer_id, countdownDurationSec) {
    const countdownStartTime = Date.now();

    const intervalId = setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - countdownStartTime) / 1000);
        let remainingSeconds = countdownDurationSec - elapsedSeconds;

        if (remainingSeconds < 0) {
            remainingSeconds = 0;
        }

        document.getElementById(timer_id).textContent = formatSeconds(remainingSeconds);

        if (remainingSeconds <= 0) {
            clearInterval(intervalId);
            console.log("oh shit, you've run out of time");
        }
    }, 200);

    return intervalId;
}
