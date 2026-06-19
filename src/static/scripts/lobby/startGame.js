import { loadGamePage } from "./loadGamePage.js";
import { initMessenger } from "./initLobbyUI.js";

export function startGame() {
    const chooseBankerOverlay = document.getElementById("chooseBankerOverlay");
    if (!chooseBankerOverlay.classList.contains("hidden")) {
        chooseBankerOverlay.classList.add("hidden");
    }
    loadGamePage();

    const chatSelector = document.getElementById("chatSelector");
    if (chatSelector.children.length === 0)
        initMessenger();
}
