import { state } from "../state.js";
import { addBalanceToSelector } from "../transactions/addBalanceToSelector.js";
import { addPlayerRow } from "./addPlayerRow.js";
import { addVotingOption } from "../voting/addVotingOption.js";
import { startVoting } from "../voting/startVoting.js";
import { loadGamePage } from "./loadGamePage.js";
import { startVoteText } from "../voting/startVoteText.js";
import { roleDict } from "../dicts.js";

function initLocalPlayerUI() {
    const player = state.players[state.localPlayerId];

    const nameSpan = document.getElementById("localName");
    const roleSpan = document.getElementById("localRole");
    const balanceSpan = document.getElementById("localBalance");
    const influenceSpan = document.getElementById("localInfluence");

    nameSpan.textContent = player.name;
    nameSpan.id = `player${player.id}Name`;
    roleSpan.textContent = roleDict[player.role];
    // КАКОГО ЪУЯ, ДЖАВА СКРИПТ? ПОЧЕМУ БЛЯТЬ?
    if (player.role === "marketer")
        roleSpan.textContent = "предприниматель";
    roleSpan.id = `player${player.id}Role`;
    balanceSpan.textContent = state.balances[state.personalBalanceId].money;
    balanceSpan.id = `balance${state.personalBalanceId}`;
}

function initOtherPlayersUI() {
    for (const player of Object.values(state.players)) {
        if (player.id === state.localPlayerId)
            continue;
        addPlayerRow(state.players[player.id]);
        for (const balanceId of state.players[player.id].balanceIds)
            addBalanceToSelector(state.balances[balanceId]);
    }
}

function initRegistrationUI() {
    const player = state.players[state.localPlayerId];
    const addPlayerButton = document.getElementById("addPlayerButton");
    const addPlayerText = document.getElementById("registerPlayerText");
    if (player.status === "registrated")
    {
        addPlayerButton.disabled = true;
        addPlayerText.textContent = "Дождитесь начала голосования";
    }
    if (state.lobbyOwner) {
        const container = document.getElementById("registrationOverlay");

        const voteDiv = document.createElement("div");
        voteDiv.id = `startVoteUI`;

        const startVoteButton = document.createElement("button");
        startVoteButton.id = `startVoteButton`;
        startVoteButton.textContent = "Начать голосование";
        startVoteButton.onclick = startVoting;

        const separator1 = document.createElement("span");
        separator1.textContent = " из ";

        const totalPlayers = Object.keys(state.players).length;
        const registratedPlayers = 0;
        for (const p of Object.values(state.players))
            if (p.status === "registrated")
                registratedPlayers += 1;

        const totalPlayersSpan = document.createElement("span");
        totalPlayersSpan.id = `totalPlayers`;
        totalPlayersSpan.textContent = `${totalPlayers}`;
        const registratedSpan = document.createElement("span");
        registratedSpan.id = `registratedPlayers`;
        registratedSpan.textContent = `${registratedPlayers}`;

        voteDiv.appendChild(startVoteButton);
        voteDiv.appendChild(registratedSpan);
        voteDiv.appendChild(separator1);
        voteDiv.appendChild(totalPlayersSpan);

        container.appendChild(voteDiv);

        startVoteText(registratedPlayers, totalPlayers);
    }

}

function initVotingUI() {
    for (const player of Object.values(state.players)) {
        if (player.id === state.localPlayerId)
            continue;
        addVotingOption(state.players[player.id]);
    }

    // добавить проверку на то, голосовали ли мы ДО загрузки UI
}

function initChoosingBankerUI() {

}

export function initLobbyUI() {
    initLocalPlayerUI();
    initOtherPlayersUI();

    initVotingUI();
    initRegistrationUI();
    initChoosingBankerUI();

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
