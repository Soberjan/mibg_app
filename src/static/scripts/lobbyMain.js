import { state } from "./state.js";
import { handleSocket } from "./handleSocket.js";
import { sendMoney } from "./transactions/sendMoney.js";
import { vote } from "./voting/vote.js";
import { chooseBankerAndStartGame } from "./voting/chooseBankerAndStartGame.js";
import { initLobbyUI } from "./lobby/initLobbyUI.js";
import { registerPlayer } from "./lobby/registerPlayer.js";
import { roleDict } from "./dicts.js";
import { chooseJobless, choosePolitician, chooseBanker } from "./testLobby/chooseRole.js";
import { giveLoan } from "./finances/giveLoan.js";
import { giveDeposit } from "./finances/giveDeposit.js";
import { buyLuxury } from "./luxuries/buyLuxury.js";
import { startPersonalEvent, startGlobalEvent, hideEvent } from "./events/events.js";

state.lobbyId = window.lobbyId;

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

export async function initPage() {
    let response = await fetch(`/lobby/${state.lobbyId}/get_status`, {method:"post"});
    let result = await response.json();
    const errorOverlay = document.getElementById("errorOverlay");;
    // улучшить обработку ошибок
    if (result.status != "ok") {
        errorOverlay.classList.remove("hidden");
        return;
    }
    const playerStatus = result.player_status;
    if (playerStatus === "new" && result.lobby_status != "registration")
    {
        console.log(result);
        console.log("you've made a grave mistake");

        errorOverlay.classList.remove("hidden");
        return; // заменить на попап с ошибкой
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
    console.log("initialized game state");
    console.log(state);

    await initLobbyUI(result.state.playerLuxuries);
    console.log("inititalized lobby UI");

    state.ws = new WebSocket(
        `ws://${window.location.host}/lobby?lobby_id=${state.lobbyId}&player_id=${state.localPlayerId}`
    );

    state.ws.onmessage = handleSocket;

    if (playerStatus === "new") {
        state.ws.onopen = () => {
            var msg = JSON.stringify({
                type: "player_joined",
                player_id: state.localPlayerId
            });

            state.ws.send(msg);
        }
    }
    console.log("opened socket");
}

console.log(state.lobbyId);

if (state.lobbyId === "-1") {
    const testServerOverlay = document.getElementById("testServerOverlay");
    testServerOverlay.classList.remove("hidden");
}
else
    await initPage();
