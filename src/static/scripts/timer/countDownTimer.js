import { formatSeconds } from "./formatSeconds.js";
import { state } from "../state.js";

export function startCountdown(timerId, onEnd = null) {
    const countdownStartTime = Date.now();

    const intervalId = setInterval(() => {
        console.log(state.timers[timerId].endsAt);
        let remainingSeconds = Math.floor((state.timers[timerId].endsAt - Date.now())/1000);

        if (remainingSeconds < 0) {
            remainingSeconds = 0;
        }

		const timer = document.getElementById(timerId);

		if (timer === null) {
			clearInterval(intervalId);
			return;
		}

        timer.textContent = formatSeconds(remainingSeconds);

        if (remainingSeconds <= 0) {
            clearInterval(intervalId);
			if (typeof(onEnd) === "function") onEnd();
        }
    }, 200);
}
