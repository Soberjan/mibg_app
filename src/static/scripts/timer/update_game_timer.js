import { formatSeconds } from "./format_seconds.js";

export function update_game_timer(timer_id) {
    const now = Date.now();
    const elapsed_seconds = Math.floor((now - game_start_time) / 1000);
    const formatted_time = formatSeconds(elapsed_seconds);
    document.getElementById(timer_id).textContent = formatted_time;
}
