import { formatSeconds } from "./formatSeconds.js";

export function startCountdown(timerId, countdownDurationSec, onEnd = null) {
    const countdownStartTime = Date.now();

	console.log("starting timer!");
    const intervalId = setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - countdownStartTime) / 1000);
        let remainingSeconds = countdownDurationSec - elapsedSeconds;

        if (remainingSeconds < 0) {
            remainingSeconds = 0;
        }

		const timer = document.getElementById(timerId);

		if (timer === null) {
			clearInterval(intervalId);
			return;
		}

        timer.textContent = formatSeconds(remainingSeconds);

		console.log(remainingSeconds);

        if (remainingSeconds <= 0) {
            clearInterval(intervalId);
			if (typeof(onEnd) === "function") onEnd();
        }
    }, 200);
}
