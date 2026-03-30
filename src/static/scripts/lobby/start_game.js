export function start_game() {
    const choose_banker_overlay = document.getElementById("choose_banker_overlay");
    if (!choose_banker_overlay.classList.contains("hidden")) {
        choose_banker_overlay.classList.add("hidden");
    }
}
