import { state } from "./state.js";
import { handleSocket } from "./handleSocket.js";
import { sendMoney } from "./transactions/sendMoney.js";
import { vote } from "./voting/vote.js";
import { initLobbyUI } from "./lobby/initLobbyUI.js";
import { registerPlayer } from "./lobby/registerPlayer.js";

state.lobbyId = window.lobbyId;

window.registerPlayer = registerPlayer;
window.state = state;
window.sendMoney = sendMoney;
window.vote = vote;

async function initPage() {
    let response = await fetch(`/lobby/${state.lobbyId}/get_status`, {method:"post"});
    let result = await response.json();

    // улучшить обработку ошибок
    if (result.status != "ok")
        return;
    if (result.player_status === "new" && result.lobby_status != "registration")
    {
        console.log(result);
        console.log("you've made a grave mistake");

        const errorOverlay = document.getElementById("errorOverlay");
        errorOverlay.classList.remove("hidden");
        return; // заменить на попап с ошибкой
    }

    if (result.player_status === "new") {
        response = await fetch(`/hostess/join_lobby?lobby_id=${state.lobbyId}`, {method:"post"});
        result = await response.json();

        if (result.status != "ok") {
            console.log("failed to join lobby");
            return;
        }
        console.log("lobby joined, started registration");
    }

    response = await fetch(`/lobby/${state.lobbyId}/get_state`, {method:"get"});
    result = await response.json();

    if (result.status != "ok") {
        console.log("failed to get lobby state");
        return;
    }
    state.lobbyStatus = result.state.lobbyStatus;
    state.lobbyOwner = result.state.lobbyOwner;
    state.localPlayerId = result.state.localPlayerId;
    state.personalBalanceId = result.state.personalBalanceId;
    state.players = result.state.players;
    state.balances = result.state.balances;
    console.log("initialized game state");
    console.log(state);

    initLobbyUI();
    console.log("inititalized lobby UI");

    state.ws = new WebSocket(
        `ws://${window.location.host}/lobby?lobby_id=${lobbyId}&player_id=${state.localPlayerId}`
    );

    state.ws.onmessage = handleSocket;

    state.ws.onopen = () => {
        var msg = JSON.stringify({
            type: "player_joined",
            player_id: state.localPlayerId
        });

        state.ws.send(msg);
    }
    console.log("opened socket");
}

initPage();
