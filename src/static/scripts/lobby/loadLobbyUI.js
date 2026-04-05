import { state } from "../state.js";
import { addBalanceToSelector } from "../transactions/addBalanceToSelector.js";
import { startVoteUI } from "../voting/addStartVoteUI.js";
import { addPlayerRow } from "./addPlayerRow.js";
import { addVotingOption } from "./addVotingOption.js";
import { loadGamePage } from "./loadGamePage.js";

export function loadLobbyUI {
    for (const player of Object.values(state.players)) {
        if (player.id === state.localPlayerId)
            continue;
        addPlayerRow(state.players[player.id]);
        addVotingOption(state.players[player.id]);
        for (const balance_id of state.players[player.id].balanceIds)
            addBalanceToSelector(state.balances[balance_id]);
    }
    if (state.lobbyOwner) {
        addStartVoteUI();
    }
    else {
        const addPlayerText = document.getElementById("addPlayerText");
        addPlayerText.innerHTML = "Вы зарегистрировались в системе, дождитесь начала голосования";
    }
    const name_span = document.getElementById("name");
    name_span.innerHTML = res.player.name;

    const role_span = document.getElementById("role");
    role_span.id = `player${res.player.id}Role`;
    role_span.innerHTML = roleDict[res.player.role];

    const personal_balance = state.balances[state.personalBalanceId];
    const balance_span = document.getElementById("balance");
    balance_span.id = `balance_${personal_balance.id}`;
    balance_span.innerHTML = personal_balance.money;

    const registrationOverlay = document.getElementById("registrationOverlay");
    const votingOverlay = document.getElementById("votingOverlay");
    const chooseBankerOverlay = document.getElementById("chooseBankerOverlay");

    if (state.lobbyStatus === "registration") {
        registrationOverlay.classList.remove("hidden");
        votingOverlay.classList.add("hidden");
        chooseBankerOverlay.classList.add("hidden");
    }
    if (state.lobbyStatus === "voting") {
        registrationOverlay.classList.add("hidden");
        votingOverlay.classList.remove("hidden");
        chooseBankerOverlay.classList.add("hidden");
    }
    if (state.lobbyStatus === "game") {
        registrationOverlay.classList.add("hidden");
        votingOverlay.classList.remove("hidden");
        chooseBankerOverlay.classList.add("hidden");
    }

    loadGamePage();
}
