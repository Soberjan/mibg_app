import { state } from "../state.js";

export async function vote() {
    const electedId = document.getElementById("votingOptions").value;
    const response = await fetch(
        `/lobby/${state.lobbyId}/vote?voter_id=${state.localPlayerId}&elected_id=${electedId}`,
        {
            method: "POST"
        }
    );
    const voteButton = document.getElementById("voteButton");
    voteButton.disabled = true;
}
