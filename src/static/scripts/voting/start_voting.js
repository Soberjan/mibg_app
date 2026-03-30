import { state } from "../state.js";

export async function start_voting() {
    if (Object.keys(state.players).length < 3) {
        console.log("not enough players to start voting!");
        return;
    }

    const response = await fetch(
        `http://127.0.0.1:8000/hostess/start_voting?lobby_id=${state.lobby_id}&player_id=${state.local_player_id}`,
        {
            method: "POST"
        }
    );
}
