import { state } from "../state.js";

export async function startVoting() {
    if (Object.keys(state.players).length < 3) {
        console.log("not enough players to start voting!");
        return;
    }

    console.log("gonna start voting");
    console.log(state);

    if (!state.lobbyOwner)
        return;

    state.lobbyOwner = false;

    const response = await fetch(
        `/lobby/${state.lobbyId}/start_voting?player_id=${state.localPlayerId}`,
        {
            method: "POST"
        }
    );
}
