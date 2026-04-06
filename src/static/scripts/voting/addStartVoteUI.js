import { startVoting } from "./startVoting.js";
import { state } from "../state.js";

export function addStartVoteUI() {
    const container = document.getElementById("registrationOverlay");

    const voteDiv = document.createElement("div");
    voteDiv.id = `startVoteUI`;

    const startVoteButton = document.createElement("button");
    startVoteButton.id = `startVoteButton`;
    startVoteButton.textContent = "Начать голосование";
    startVoteButton.onclick = startVoting;
    startVoteButton.disabled = true;

    const separator1 = document.createElement("span");
    separator1.textContent = " | ";

    const numberOfPlayersSpan = document.createElement("span");
    numberOfPlayersSpan.id = `voteNumberOfPlayers`;
    const numberOfPlayers = Object.keys(state.players).length;
    numberOfPlayersSpan.textContent = `${numberOfPlayers}/6`;

    voteDiv.appendChild(startVoteButton);
    voteDiv.appendChild(separator1);
    voteDiv.appendChild(numberOfPlayersSpan);

    container.appendChild(voteDiv);
}
