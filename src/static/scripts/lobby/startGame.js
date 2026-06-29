import { state } from "../state.js";
import { loadGamePage } from "./loadGamePage.js";
import { initMessenger } from "./initLobbyUI.js";
import { fillFinancePage, fillObligationPage } from "../finances/finance.js";

export function startGame() {
    const chooseBankerOverlay = document.getElementById("chooseBankerOverlay");
    if (!chooseBankerOverlay.classList.contains("hidden")) {
        chooseBankerOverlay.classList.add("hidden");
    }
    loadGamePage();

    const chatSelector = document.getElementById("chatSelect");
    if (chatSelector.children.length === 0)
        initMessenger();

    if (state.players[state.localPlayerId].role === "banker") {
        fillFinancePage();
    }

    if (state.players[state.localPlayerId].role != "banker" && state.players[state.localPlayerId].role != "politician") {
        fillObligationPage();
    }
}
