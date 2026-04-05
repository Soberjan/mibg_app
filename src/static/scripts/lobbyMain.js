import { state } from "./state.js";
import { addPlayer } from "./lobby/addPlayer.js";
import { sendMoney } from "./transactions/sendMoney.js";
import { vote } from "./voting/vote.js";
import { loadLobbyUI } from "./lobby/loadLobbyUI.js";

state.lobbyId = window.lobbyId;

window.addPlayer = addPlayer;
window.state = state;
window.sendMoney = sendMoney;
window.vote = vote;

const response = await fetch(`lobby/${state.lobbyId}/get_state`, {method:"POST"});
const result = await response.json();
if (result.status != "ok")
    return;

state.lobbyStatus = result.state.lobbyStatus;
state.lobbyOwner = result.state.lobbyOwner;
state.localPlayerId = result.state.localPlayerId;
state.personalBalanceId = result.state.personalBalanceId;
state.players = result.state.players;
state.balances = result.state.balances;

loadLobbyUI();

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
