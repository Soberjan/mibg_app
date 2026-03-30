import { start_voting } from "./start_voting.js";
import { state } from "../state.js";

export function add_start_vote_ui() {
    const container = document.getElementById("registration_overlay");

    const vote_div = document.createElement("div");
    vote_div.id = `start_vote_ui`;

    const startVoteButton = document.createElement("button");
    startVoteButton.id = `start_vote_button`;
    startVoteButton.textContent = "Начать голосование";
    startVoteButton.onclick = start_voting;

    const separator1 = document.createElement("span");
    separator1.textContent = " | ";

    const numberOfPlayersSpan = document.createElement("span");
    numberOfPlayersSpan.id = `vote_number_of_players`;
    const numberOfPlayers = Object.keys(state.players).length;
    numberOfPlayersSpan.textContent = `${numberOfPlayers}/6`;

    vote_div.appendChild(startVoteButton);
    vote_div.appendChild(separator1);
    vote_div.appendChild(numberOfPlayersSpan);

    container.appendChild(vote_div);
}
