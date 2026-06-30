import { state } from "../state.js";
import { addBalanceToSender, addBalanceToReceiver } from "../transactions/transactionUI.js";
import { addOtherPlayer } from "./addOtherPlayer.js";
import { addVotingOption } from "../voting/addVotingOption.js";
import { startVoting } from "../voting/startVoting.js";
import { loadGamePage } from "./loadGamePage.js";
import { startVoteText } from "../voting/startVoteText.js";
import { roleDict, accountDict } from "../dicts.js";
import { chooseBankerUI } from "../voting/chooseBankerUI.js";
import { startGameTimer } from "../timer/gameTimer.js";
import { fillObligationPage, fillFinancePage } from "../finances/finance.js";
import { startCountdown } from "../timer/countDownTimer.js";
import { pauseGame, pauseGameSocket } from "./pauseGame.js";
import { initLuxuryUI } from "../luxuries/luxuryUI.js";
import { updateInfluence } from "../influence/updateInfluence.js";
import { initEventUI } from "../events/events.js";
import { setupCompanyRegister, addPropertyToAssets } from "../property/propertyUI.js";
import { showQuestionOverlay, showApprovalOverlay, initQuestionUI } from "../questions/questionUI.js";
import { initChatSelector, openChat, addMessageCount } from "../messenger/messageUI.js";
import { initXManagmentUI, initXAssetsUI } from "../xCompany/xCompanyUI.js";
import { addBalanceToUpperMenu } from "../transactions/balance.js";
import { initRoleControllerUI } from "../role/roleUI.js";
import { initTransactions } from "../transactions/transactionUI.js";
import { showGameEndedUI } from "../gameEnded/gameEndedUI.js";

export function addPauseButton() {
    const timers = document.getElementById("bigGameTimer");
    const pauseButton = document.createElement("Button");
    pauseButton.id = `pauseButton`;
    pauseButton.textContent = `Пауза`;
    pauseButton.onclick = pauseGame;

    timers.appendChild(pauseButton);
}

function initLocalPlayerUI(playerLuxuries) {
    const player = state.players[state.localPlayerId];

    initLuxuryUI(playerLuxuries);
    initXAssetsUI();

    startGameTimer("gameTimer");

    if (state.termEndsAt) {
        state.timers["politicianTimer"] = {}
        state.timers["politicianTimer"].endsAt = Date.parse(state.termEndsAt);
        startCountdown("politicianTimer");
    }

    const nameSpan = document.getElementById("localName");
    const roleSpan = document.getElementById("localRole");
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

    addBalanceToUpperMenu(state.balances[state.personalBalanceId]);

    for (const balanceId of state.players[player.id].balanceIds)
        addBalanceToSender(state.balances[balanceId]);

    if (player.role === "politician")
        addBalanceToUpperMenu(state.balances[state.govBalanceId]);

    if (player.role === "banker")
        addBalanceToUpperMenu(state.balances[state.bankBalanceId]);

    if (state.lobbyOwner)
        addPauseButton();

    for (const property of Object.values(state.properties))
        if (property.ownerId === state.personalBalanceId)
            addPropertyToAssets(property);
}

function initOtherPlayersUI() {
    for (const player of Object.values(state.players)) {
        if (player.id === state.localPlayerId)
            continue;
        addOtherPlayer(player);
        for (const balanceId of state.players[player.id].balanceIds)
            addBalanceToReceiver(state.balances[balanceId]);
    }
}

export function initMessenger() {
    initChatSelector();
    for (const player of Object.values(state.players))
        if (player.id != state.localPlayerId) {
            openChat(player.id);
            break;
        }
    addMessageCount();
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
    await fillFinancePage();
}

export function initManagmentPage() {
    initQuestionUI();
    initEventUI();
    setupCompanyRegister();
    initXManagmentUI();
    initRoleControllerUI();
}

export async function initObligationPage() {
    await fillObligationPage();
}

export async function initLobbyUI(playerLuxuries) {
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (state.lobbyStatus === "gameEnded") {
        loadingOverlay.classList.add("hidden");
        showGameEndedUI();
        return;
    }
    initLocalPlayerUI(playerLuxuries);
    initOtherPlayersUI();

    if (state.lobbyStatus != "registration")
        initMessenger();

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
    if (state.lobbyStatus === "game")
        initTransactions();

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

    loadingOverlay.classList.add("hidden");
}
