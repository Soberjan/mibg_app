import { loadGamePage } from "./loadGamePage.js";

export function startGame() {
    const chooseBankerOverlay = document.getElementById("chooseBankerOverlay");
    if (!chooseBankerOverlay.classList.contains("hidden")) {
        chooseBankerOverlay.classList.add("hidden");
    }
    loadGamePage();
}
