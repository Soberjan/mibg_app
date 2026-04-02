import { formatSeconds } from "./formatSeconds.js";

export function updateGameTimer(timerId) {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - gameStartTime) / 1000);
    const formattedTime = formatSeconds(elapsedSeconds);
    document.getElementById(timerId).textContent = formattedTime;
}
