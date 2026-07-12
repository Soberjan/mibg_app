import { state } from "../state.js";
import { loadGamePage } from "./loadGamePage.js";
import { initMessenger } from "./initLobbyUI.js";
import { fillFinancePage, fillObligationPage } from "../finances/finance.js";
import { initTransactions, initTransactionHistory } from "../transactions/transactionUI.js";

export function startGame(res) {
    const chooseBankerOverlay = document.getElementById("chooseBankerOverlay");
    if (!chooseBankerOverlay.classList.contains("hidden")) {
        chooseBankerOverlay.classList.add("hidden");
    }

    state.lobbyStatus = "game";

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

    initTransactions();
    initTransactionHistory(res.transaction_history);
}
