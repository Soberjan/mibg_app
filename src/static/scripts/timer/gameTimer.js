import { formatSeconds } from "./formatSeconds.js";
import { state } from "../state.js";

export function startGameTimer(timerId) {
    const intervalId = setInterval(() => {
        const now = Date.now();
        const startedAtSeconds = new Date(state.startedAt).getTime();
        const elapsedSeconds = Math.floor((now - startedAtSeconds) / 1000);

		const timer = document.getElementById(timerId);
        if (state.lobbyStatus != "paused")
            timer.textContent = formatSeconds(elapsedSeconds);
    }, 200);
}
