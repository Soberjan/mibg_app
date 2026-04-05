import { handleSocket } from "../handleSocket.js";
import { addVotingOption } from "../voting/addVotingOption.js";
import { addPlayerRow } from "./addPlayerRow.js";
import { addBalanceToSelector } from "../transactions/addBalanceToSelector.js";
import { addStartVoteUI } from "../voting/addStartVoteUI.js";
import { savePlayerState } from "./savePlayerState.js";
import { state } from "../state.js";
import { roleDict } from "../dicts.js";

export async function registerPlayer() {
    const input = document.getElementById("nameText");
    const name = input.value;

    const response = await fetch(`lobby/${state.lobbyId}/register_player?name=${name}`, {method:"POST"});
}
