import { state } from "./state.js";
import { handleSocket } from "./handleSocket.js";
import { sendMoney } from "./transactions/sendMoney.js";
import { vote } from "./voting/vote.js";
import { chooseBankerAndStartGame } from "./voting/chooseBankerAndStartGame.js";
import { initLobbyUI } from "./lobby/initLobbyUI.js";
import { registerPlayer } from "./lobby/registerPlayer.js";
import { roleDict } from "./dicts.js";
import { giveLoan } from "./finances/giveLoan.js";
import { giveDeposit } from "./finances/giveDeposit.js";
import { buyLuxury } from "./luxuries/buyLuxury.js";
import { startPersonalEvent, startGlobalEvent, hideEvent } from "./events/events.js";
import { askQuestion, approveAnswer, disapproveAnswer } from "./questions/question.js";
import { hideQuestion } from "./questions/questionUI.js";
import { answerQuestion } from "./questions/question.js";
import { startVoting } from "./voting/startVoting.js";
import { sendMessage } from "./messenger/message.js";
import { changeRole } from "./role/role.js";
import { endGame } from "./gameEnded/gameEnded.js";
import { updateRoleControllerRoleSelector } from "./role/roleUI.js";
import { startSocketWatcher } from "./socketWatcher/socketWatcher.js";
import { showOtherPlayers, hideOtherPlayers } from "./lobby/showOtherPlayers.js";
import { hideTransactionHistory, showTransactionHistory } from "./transactions/transactionUI.js";

state.lobbyId = window.lobbyId;


async function chooseRole(role) {
    let response = await fetch(`/lobby/-1/is_free?role=${role}`, {method:"get"});
    let result = await response.json();

    if (!result.free) {
        console.log("Роль занята");
        return;
    }

    response = await fetch(`/lobby/-1/assign_client_key?role=${role}`, {method:"post"});
    result = await response.json();
    if (result.status != "ok")
        return;

    const testServerOverlay = document.getElementById("testServerOverlay");
    testServerOverlay.classList.add("hidden");
    await initPage();
}

export function chooseJobless() {
    chooseRole("jobless");
}
export function choosePolitician() {
    chooseRole("politician");
}
export function chooseBanker() {
    chooseRole("banker");
}

window.registerPlayer = registerPlayer;
window.state = state;
window.sendMoney = sendMoney;
window.vote = vote;
window.chooseBankerAndStartGame = chooseBankerAndStartGame;
window.chooseJobless = chooseJobless;
window.choosePolitician = choosePolitician;
window.chooseBanker = chooseBanker;
window.giveLoan = giveLoan;
window.giveDeposit = giveDeposit;
window.buyLuxury = buyLuxury;
window.startPersonalEvent = startPersonalEvent;
window.startGlobalEvent = startGlobalEvent;
window.hideEvent = hideEvent;
window.askQuestion = askQuestion;
window.approveAnswer = approveAnswer;
window.disapproveAnswer = disapproveAnswer;
window.hideQuestion = hideQuestion;
window.answerQuestion = answerQuestion;
window.startVoting = startVoting;
window.sendMessage = sendMessage;
window.updateRoleControllerRoleSelector = updateRoleControllerRoleSelector;
window.changeRole = changeRole;
window.endGame = endGame;
window.hideOtherPlayers = hideOtherPlayers;
window.showOtherPlayers = showOtherPlayers;
window.hideTransactionHistory = hideTransactionHistory;
window.showTransactionHistory = showTransactionHistory;

export async function initPage() {
    document.getElementById("lobbyIdBadge").textContent = `id лобби: ${state.lobbyId}`;

    let response = await fetch(`/lobby/${state.lobbyId}/get_status`, {method:"post"});
    let result = await response.json();
    const errorOverlay = document.getElementById("errorOverlay");;
    const loadingOverlay = document.getElementById("loadingOverlay");
    // улучшить обработку ошибок
    if (result.status != "ok") {
        errorOverlay.classList.remove("hidden");
        loadingOverlay.classList.add("hidden");
        return;
    }


    const playerStatus = result.player_status;
    if (playerStatus === "new" && result.lobby_status != "registration")
    {
        console.log(result);
        console.log("you've made a grave mistake");

        errorOverlay.classList.remove("hidden");
        return;
    }

    if (playerStatus === "new") {
        response = await fetch(`/hostess/join_lobby?lobby_id=${state.lobbyId}`, {method:"post"});
        result = await response.json();

        if (result.status != "ok") {
            console.log("failed to join lobby");
            return;
        }
        console.log("lobby joined, started registration");
    }
    else
        console.log("already registered in lobby");

    response = await fetch(`/lobby/${state.lobbyId}/get_state`, {method:"get"});
    result = await response.json();

    if (result.status != "ok") {
        errorOverlay.classList.remove("hidden");
        console.log("failed to get lobby state");
        return;
    }


    state.lobbyStatus = result.state.lobbyStatus;
    state.termEndsAt = result.state.termEndsAt;
    state.startedAt = result.state.startedAt;
    state.lobbyOwner = result.state.lobbyOwner;
    state.localPlayerId = result.state.localPlayerId;
    state.personalBalanceId = result.state.personalBalanceId;
    state.govBalanceId = result.state.govBalanceId;
    state.bankBalanceId = result.state.bankBalanceId;
    state.players = result.state.players;
    state.balances = result.state.balances;
    state.luxuries = result.state.luxuries;
    state.properties = result.state.properties;
    state.messages = result.state.messages;
    state.branches = result.state.branches;
    console.log("initialized game state");
    console.log(state);
    console.log(result.state.transactionHistory);

    await initLobbyUI(result.state.playerLuxuries, result.state.transactionHistory);
    if (playerStatus === "new") {
        response = await fetch(`/hostess/confirm_join?lobby_id=${state.lobbyId}&player_id=${state.localPlayerId}`, {method:"post"});
    }
    console.log("opened socket");
    console.log("inititalized lobby UI");

    startSocketWatcher(handleSocket);

}

console.log(state.lobbyId);

if (state.lobbyId === "-1") {
    const testServerOverlay = document.getElementById("testServerOverlay");
    testServerOverlay.classList.remove("hidden");
    const loadingOverlay = document.getElementById("loadingOverlay");
    loadingOverlay.classList.add("hidden");
}
else
    await initPage();

