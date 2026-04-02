import { state } from "../state.js";

export async function vote() {
    const elected_id = document.getElementById("voting_options").value;
    const response = await fetch(
        `/hostess/vote?lobby_id=${state.lobby_id}&voter_id=${state.local_player_id}&elected_id=${elected_id}`,
        {
            method: "POST"
        }
    );
    const voteButton = document.getElementById("vote_button");
    voteButton.disabled = true;
}
