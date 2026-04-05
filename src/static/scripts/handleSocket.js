import { addPlayerRow } from "./lobby/addPlayerRow.js";
import { startGame } from "./lobby/startGame.js";
import { chooseBankerUI } from "./voting/chooseBankerUI.js";
import { addBalanceToSelector } from "./transactions/addBalanceToSelector.js";
import { savePlayerState } from "./lobby/savePlayerState.js";
import { addVotingOption } from "./voting/addVotingOption.js";
import { startCountdown } from "./timer/count_down_timer.js";
import { state } from "./state.js";
import { accountDict } from "./dicts.js";

export function handleSocket(event) {
    const res = JSON.parse(event.data);
    let playerRoleText;
    let votingOverlay;

    switch (res.type) {
        case "other_player_joined":
            const player = res.player;
            savePlayerState(player);

            addPlayerRow(state.players[player.id]);
            for (const balanceId of state.players[player.id].balanceIds)
                addBalanceToSelector(state.balances[balanceId]);
            const numberOfPlayersSpan = document.getElementById("voteNumberOfPlayers");
            if (numberOfPlayersSpan) {
                let votedPlayers = 0;
                const numberOfPlayers = Object.keys(state.players).length;
                numberOfPlayersSpan.innerHTML = `${numberOfPlayers}/6`;
            }
            addVotingOption(state.players[player.id]);
            break;

        case "other_player_registered":
            state.players[player_id].isRegistered = true;
            if (!state.lobbyOwner)
                break;

            let registeredPlayers = 0;
            for (const p of state.players)
                if (p.isRegistered)
                    registeredPlayers += 1;
            const registeredText = document.getElementById(`registeredPlayers`);
            registeredText.innerHTML = registeredPlayers;
            break;

        case "money_changed":
            const data = res.result;
            const localSenderSpan = document.getElementById(`balance_${data.sender_id}`);
            const localReceiverSpan = document.getElementById(`balance_${data.receiver_id}`);

            if (state.localPlayerId === state.balances[data.sender_id].owner_id)
                localSenderSpan.innerHTML = data.sender_money;
            else
                localSenderSpan.innerHTML = accountDict[state.balances[data.sender_id].type] + " " + data.sender_money;

            if (state.localPlayerId === state.balances[data.receiver_id].owner_id)
                localReceiverSpan.innerHTML = data.receiver_money;
            else
                localReceiverSpan.innerHTML = accountDict[state.balances[data.receiver_id].type] + " " + data.receiver_money;

            state.balances[data.sender_id].money = data.sender_money;
            state.balances[data.receiver_id].money = data.receiver_money;
            break;

        case "start_voting_round":
            const registrationOverlay = document.getElementById("registrationOverlay");
            if (!registrationOverlay.classList.contains("hidden")) {
                registrationOverlay.classList.add("hidden");
            }

            votingOverlay = document.getElementById("votingOverlay");
            if (votingOverlay.classList.contains("hidden")) {
                votingOverlay.classList.remove("hidden");
            }

            const round_number_text = document.getElementById("round_number_text");
            round_number_text.innerHTML = res.voting_round;

            startCountdown("votingTimer", 30);
            const voteButton = document.getElementById("voteButton");
            voteButton.disabled = false;

            break;

        case "end_voting":
            votingOverlay = document.getElementById("votingOverlay");
            if (!votingOverlay.classList.contains("hidden")) {
                votingOverlay.classList.add("hidden");
            }

            state.lobbyOwner = state.localPlayerId === res.winner_id;

            state.players[res.winner_id].role = "politician";
            playerRoleText = document.getElementById(`player${res.winner_id}Role`);
            if (playerRoleText)
            {
                console.log("niger");
                playerRoleText.innerHTML = "политик";
            }
            chooseBankerUI();

            break;

        case "banker_chosen":
            state.players[res.banker_id].role = "banker";
            playerRoleText = document.getElementById(`player${res.banker_id}Role`);
            if (playerRoleText)
                playerRoleText.innerHTML = "банкир";
            break;

        case "start_game":
            console.log("game started");
            startGame();
            break;

        case "error":
            console.error(res.message);
            break;
    }
}
