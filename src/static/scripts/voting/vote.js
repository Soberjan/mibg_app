import { state } from "../state.js";

export async function vote() {
    const electedId = document.getElementById("votingOptions").value;
    const response = await fetch(
        `/hostess/vote?lobby_id=${state.lobbyId}&voter_id=${state.localPlayerId}&elected_id=${elected_id}`,
        {
            method: "POST"
        }
    );
    const voteButton = document.getElementById("voteButton");
    voteButton.disabled = true;
}
