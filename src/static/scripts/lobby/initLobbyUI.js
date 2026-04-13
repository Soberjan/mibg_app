import { state } from "../state.js";
import { addBalanceToSelector } from "../transactions/addBalanceToSelector.js";
import { addBalanceToSender } from "../transactions/addBalanceToSender.js";
import { addPlayerRow } from "./addPlayerRow.js";
import { addVotingOption } from "../voting/addVotingOption.js";
import { startVoting } from "../voting/startVoting.js";
import { loadGamePage } from "./loadGamePage.js";
import { startVoteText } from "../voting/startVoteText.js";
import { roleDict, accountDict } from "../dicts.js";
import { chooseBankerUI } from "../voting/chooseBankerUI.js";

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

    for (const balanceId of state.players[player.id].balanceIds)
        addBalanceToSender(state.balances[balanceId]);

    const upperRight = document.getElementById("upperRight");
    if (player.role === "politician") {
        const govBalance = state.balances[state.govBalanceId];
        const govBalanceSpan = document.createElement("span");
        govBalanceSpan.id = `balance${govBalance.id}`;
        govBalanceSpan.textContent = accountDict[govBalance.type] + " " + govBalance.money;

        upperRight.appendChild(govBalanceSpan);
    }
    if (player.role === "banker") {
        const bankBalance = state.balances[state.bankBalanceId];
        const bankBalanceSpan = document.createElement("span");
        bankBalanceSpan.id = `balance${bankBalance.id}`;
        bankBalanceSpan.textContent = accountDict[bankBalance.type] + " " + bankBalance.money;

        upperRight.appendChild(bankBalanceSpan);
    }

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
    const registerPlayerButton = document.getElementById("registerPlayerButton");
    const registerPlayerText = document.getElementById("registerPlayerText");
    console.log("entered player registration init");
    console.log(state);
    if (player.status === "registered")
    {
    console.log("should've turned off the button");
        registerPlayerButton.disabled = true;
        registerPlayerText.textContent = "Дождитесь начала голосования";
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
        let registeredPlayers = 0;
        for (const p of Object.values(state.players))
            if (p.status === "registered")
                registeredPlayers += 1;

        const totalPlayersSpan = document.createElement("span");
        totalPlayersSpan.id = `totalPlayers`;
        totalPlayersSpan.textContent = `${totalPlayers}`;
        const registeredSpan = document.createElement("span");
        registeredSpan.id = `registeredPlayers`;
        registeredSpan.textContent = `${registeredPlayers}`;

        voteDiv.appendChild(startVoteButton);
        voteDiv.appendChild(registeredSpan);
        voteDiv.appendChild(separator1);
        voteDiv.appendChild(totalPlayersSpan);

        container.appendChild(voteDiv);

        startVoteText(registeredPlayers, totalPlayers);
    }

}

async function initVotingUI() {
    for (const player of Object.values(state.players)) {
        if (player.id === state.localPlayerId)
            continue;
        addVotingOption(state.players[player.id]);
    }

    const voteButton = document.getElementById("voteButton");
    const result = await fetch(`/lobby/${state.lobbyId}/has_voted?player_id=${state.localPlayerId}`);
    const res = await result.json();
    if (res.status != "ok")
	return;
    if (res.has_voted)
	voteButton.disabled = true;
}

function initChoosingBankerUI() {
    // работает и ладно, чтобы было красиво, нужно по другому скрипты раскидать
    chooseBankerUI()
}

export async function initLobbyUI() {
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
    if (state.lobbyStatus === "choosing_banker") {
        registrationOverlay.classList.add("hidden");
        votingOverlay.classList.add("hidden");
        chooseBankerOverlay.classList.remove("hidden");
    }
    if (state.lobbyStatus === "game") {
        registrationOverlay.classList.add("hidden");
        votingOverlay.classList.add("hidden");
        chooseBankerOverlay.classList.add("hidden");
    }

    loadGamePage();
}
