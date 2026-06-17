import { state } from "../state.js";

export async function vote() {
    const electedId = document.getElementById("votingOptions").value;
    // окей, я включаю кнопку в startVotingRound и иногда это происходит раньше, чем это отключение
    // кнопки, поэтому я не буду ебать себе мозги и засуну отключение перед дерганьем ручки
    const voteButton = document.getElementById("voteButton");
    voteButton.disabled = true;
    // окей, это не помогло, но оставлю коммент себе на будущее
    const response = await fetch(
        `/lobby/${state.lobbyId}/vote?voter_id=${state.localPlayerId}&elected_id=${electedId}`,
        {
            method: "POST"
        }
    );
}
