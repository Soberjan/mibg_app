import { add_player_row } from "./lobby/add_player_row.js";
import { start_game } from "./lobby/start_game.js";
import { choose_banker_ui } from "./voting/choose_banker_ui.js";
import { add_balance_to_selector } from "./transactions/add_balance_to_selector.js";
import { save_player_state } from "./lobby/save_player_state.js";
import { add_voting_option } from "./voting/add_voting_option.js";
import { start_countdown } from "./timer/count_down_timer.js";
import { state } from "./state.js";

export function handle_socket(event) {
    const res = JSON.parse(event.data);
    let player_role_text;
    let voting_overlay;

    switch (res.type) {
        case "other_player_joined":
            const player = res.player;
            save_player_state(player);

            add_player_row(state.players[player.id]);
            for (const balance_id of state.players[player.id].balance_ids)
                add_balance_to_selector(state.balances[balance_id]);
            const numberOfPlayersSpan = document.getElementById("vote_number_of_players");
            if (numberOfPlayersSpan) {
                const numberOfPlayers = Object.keys(state.players).length;
                numberOfPlayersSpan.innerHTML = `${numberOfPlayers}/6`;
            }
            add_voting_option(state.players[player.id]);
            break;

        case "money_changed":
            const data = res.result;
            const local_balance_span = document.getElementById(`balance_${data.sender_id}`);
            const local_receiver_span = document.getElementById(`balance_${data.receiver_id}`);

            local_balance_span.innerHTML = data.sender_money;
            local_receiver_span.innerHTML = data.receiver_money;

            state.balances[data.sender_id].money = data.sender_money;
            state.balances[data.receiver_id].money = data.receiver_money;
            break;

        case "start_voting_round":
            const registration_overlay = document.getElementById("registration_overlay");
            if (!registration_overlay.classList.contains("hidden")) {
                registration_overlay.classList.add("hidden");
            }

            voting_overlay = document.getElementById("voting_overlay");
            if (voting_overlay.classList.contains("hidden")) {
                voting_overlay.classList.remove("hidden");
            }

            const round_number_text = document.getElementById("round_number_text");
            round_number_text.innerHTML = res.voting_round;

            start_countdown("voting_timer", 30);
            const voteButton = document.getElementById("vote_button");
            voteButton.disabled = false;

            break;

        case "end_voting":
            voting_overlay = document.getElementById("voting_overlay");
            if (!voting_overlay.classList.contains("hidden")) {
                voting_overlay.classList.add("hidden");
            }

            state.lobby_owner = state.local_player_id === res.winner_id;

            state.players[res.winner_id].role = "politician";
            player_role_text = document.getElementById(`player_${res.winner_id}_role`);
            if (player_role_text)
                player_role_text.innerHTML = "политик";
            choose_banker_ui();

            break;

        case "banker_chosen":
            console.log("выбрали банкира");
            state.players[res.banker_id].role = "banker";
            player_role_text = document.getElementById(`player_${res.banker_id}_role`);
            if (player_role_text)
                player_role_text.innerHTML = "банкир";
            break;

        case "start_game":
            console.log("game started");
            start_game();
            break;

        case "error":
            console.error(res.message);
            break;
    }
}
