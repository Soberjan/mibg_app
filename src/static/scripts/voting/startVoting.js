import { state } from "../state.js";

export async function startVoting() {
    if (Object.keys(state.players).length < 3) {
        console.log("not enough players to start voting!");
        return;
    }

    const response = await fetch(
        `/hostess/start_voting?lobby_id=${state.lobbyId}&player_id=${state.localPlayerId}`,
        {
            method: "POST"
        }
    );
}
