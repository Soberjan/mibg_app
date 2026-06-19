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
import { createObligationLoan, createFinanceLoan } from "../finances/loanElements.js";
import { createObligationDeposit, createFinanceDeposit } from "../finances/depositElements.js";
import { startGameTimer } from "../timer/gameTimer.js";
import { pauseGame, pauseGameSocket } from "./pauseGame.js";
import { initLuxuryUI } from "../luxuries/luxuryUI.js";
import { updateInfluence } from "../influence/updateInfluence.js";
import { initEventUI } from "../events/events.js";
import { addPropertyToManagment, addPropertyToAssets } from "../property/propertyUI.js";
import { showQuestionOverlay, showApprovalOverlay, initQuestionUI } from "../questions/questionUI.js";
import { initChatSelector, openChat } from "../messenger/messageUI.js";
import { initXManagmentUI, initXAssetsUI } from "../xCompany/xCompanyUI.js";

export function addPauseButton() {
    console.log("adding pause button");
    const managmentMenu = document.getElementById("managment");
    const pauseButton = document.createElement("Button");
    pauseButton.id = `pauseButton`;
    pauseButton.textContent = `Пауза`;
    pauseButton.onclick = pauseGame;

    upperRight.appendChild(pauseButton);
}

function initLocalPlayerUI(playerLuxuries) {
    const player = state.players[state.localPlayerId];

    initLuxuryUI(playerLuxuries);
    initXAssetsUI();

    startGameTimer("gameTimer");

    const nameSpan = document.getElementById("localName");
    const roleSpan = document.getElementById("localRole");
    const balanceSpan = document.getElementById("localBalance");
    console.log('updating influence');
    console.log(player);
    updateInfluence(player.influence);

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
    if (state.lobbyOwner) {
        addPauseButton();
    }

    for (const property of Object.values(state.properties))
        if (property.ownerId === state.personalBalanceId)
            addPropertyToAssets(property);
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

function initMessanger() {
    initChatSelector();
    for (const player of Object.values(state.players))
        if (player.id != state.localPlayerId) {
            openChat(player.id);
            break;
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
    if (state.lobbyStatus != "voting")
        return;

    const voteButton = document.getElementById("voteButton");
    const result = await fetch(`/lobby/${state.lobbyId}/has_voted?player_id=${state.localPlayerId}`);
    const res = await result.json();

    const roundNumberText = document.getElementById("roundNumberText");
    roundNumberText.innerHTML = res.voting_round;

    if (res.status != "ok")
        return;
    if (res.has_voted)
        voteButton.disabled = true;
}

function initChoosingBankerUI() {
    // работает и ладно, чтобы было красиво, нужно по другому скрипты раскидать
    chooseBankerUI();
}

export async function initFinancePage() {
    console.log("initing finance page");
    const borrowerBalances = document.getElementById("borrowerBalances");
    for (const balance of Object.values(state.balances)) {
		console.log("adding balance");
        const option = document.createElement("option");
        option.id = `loan${balance.id}Option`;
        option.value = `${balance.id}`;
        option.textContent = `${accountDict[balance.type]} ${state.players[balance.ownerId].name}`;
		borrowerBalances.appendChild(option);
    }
    const depositBalances = document.getElementById("depositBalances");
    for (const balance of Object.values(state.balances)) {
        console.log("adding balance");
        const option = document.createElement("option");
        option.id = `loan${balance.id}Option`;
        option.value = `${balance.id}`;
        option.textContent = `${accountDict[balance.type]} ${state.players[balance.ownerId].name}`;
        depositBalances.appendChild(option);
    }

    const result = await fetch(`/lobby/${state.lobbyId}/finance/get_loans_and_deposits`);
	const res = await result.json();
	console.log("initfinancepage");
	console.log(result);
	for (const loan of Object.values(res.loans)) {
		createFinanceLoan(loan.id, loan.balance_id, loan.sum, loan.interest, loan.ends_at);
	}
	for (const deposit of Object.values(res.deposits)) {
		createFinanceDeposit(deposit.id, deposit.balance_id, deposit.sum, deposit.interest, deposit.ends_at);
	}
}

export function initManagmentPage() {
    initQuestionUI();
    initEventUI();
    for (const property of Object.values(state.properties))
        addPropertyToManagment(property);

    initXManagmentUI();
}

export async function initObligationPage() {
    const result = await fetch(`/lobby/${state.lobbyId}/finance/get_loans_and_deposits`);
	const res = await result.json();
	console.log("initing obligations");
    console.log(res);
	for (var loan of Object.values(res.loans)) {
		const loanOwnerId = state.balances[loan.balance_id].ownerId;
		if (loanOwnerId === state.localPlayerId)
			createObligationLoan(loan.id, loan.sum, loan.interest, loan.ends_at);
	}
	for (var deposit of Object.values(res.deposits)) {
		const depositOwnerId = state.balances[deposit.balance_id].ownerId;
		if (depositOwnerId === state.localPlayerId)
			createObligationDeposit(deposit.id, deposit.sum, deposit.interest, deposit.ends_at);
	}
}

export async function initLobbyUI(playerLuxuries) {
    initLocalPlayerUI(playerLuxuries);
    initOtherPlayersUI();

    initMessanger();
    initVotingUI();
    initRegistrationUI();
    initChoosingBankerUI();

    const registrationOverlay = document.getElementById("registrationOverlay");
    const votingOverlay = document.getElementById("votingOverlay");
    const chooseBankerOverlay = document.getElementById("chooseBankerOverlay");
    const pausePopup = document.getElementById("pauseOverlay");

    if (state.lobbyStatus === "registration") {
        registrationOverlay.classList.remove("hidden");
        votingOverlay.classList.add("hidden");
        chooseBankerOverlay.classList.add("hidden");
        pausePopup.classList.add("hidden");
    }
    if (state.lobbyStatus === "voting") {
        registrationOverlay.classList.add("hidden");
        votingOverlay.classList.remove("hidden");
        chooseBankerOverlay.classList.add("hidden");
        pausePopup.classList.add("hidden");
    }
    if (state.lobbyStatus === "choosing_banker") {
        registrationOverlay.classList.add("hidden");
        votingOverlay.classList.add("hidden");
        chooseBankerOverlay.classList.remove("hidden");
        pausePopup.classList.add("hidden");
    }
    if (state.lobbyStatus === "game") {
        registrationOverlay.classList.add("hidden");
        votingOverlay.classList.add("hidden");
        chooseBankerOverlay.classList.add("hidden");
        pausePopup.classList.add("hidden");
    }
    if (state.lobbyStatus === "paused") {
        registrationOverlay.classList.add("hidden");
        votingOverlay.classList.add("hidden");
        chooseBankerOverlay.classList.add("hidden");
        pauseGameSocket();
    }

    loadGamePage();

    if (state.players[state.localPlayerId].role === "banker")
        await initFinancePage();

    if (state.players[state.localPlayerId].role === "politician")
        initManagmentPage();

    if (state.players[state.localPlayerId].role === "jobless" || state.players[state.localPlayerId].role === "worker")
        await initObligationPage();

    if (state.players[state.localPlayerId].status === null)
        return;
    const [playerStatus, questionId] = state.players[state.localPlayerId].status.split("_");
    if (playerStatus === "asked") {
        const result = await fetch(`/lobby/${state.lobbyId}/get_question?question_id=${questionId}`);
        const q = await result.json();
        showQuestionOverlay(q.question);
    }
    if (playerStatus === "approve") { 
        const result = await fetch(`/lobby/${state.lobbyId}/get_question?question_id=${questionId}`);
        const q = await result.json();
        console.log(q.question);
        showApprovalOverlay(q.question);
    }
}
