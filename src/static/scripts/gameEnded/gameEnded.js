import { state } from "../state.js";
import { showGameEndedUI } from "./gameEndedUI.js";

export async function endGame() {
    if (!state.lobbyOwner)
        return;

    var response = await fetch(
        `/lobby/${state.lobbyId}/end_game?player_id=${state.localPlayerId}`,
        {
            method: "POST"
        }
    );
}

export function gameEndedSocket(msg) {
    state.lobbyStatus = "gameEnded";

    showGameEndedUI();
}
