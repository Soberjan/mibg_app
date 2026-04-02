import { handle_socket } from "../handle_socket.js";
import { add_voting_option } from "../votin/add_voting_option.js";
import { add_player_row } from "./add_player_row.js";
import { add_balance_to_selector } from "../transactions/add_balance_to_selector.js";
import { add_start_vote_ui } from "../votin/add_start_vote_ui.js";
import { save_player_state } from "./save_player_state.js";
import { state } from "../state.js";
import { role_dict } from "../dicts.js";

export async function add_player() {
    const input = document.getElementById("name_text");
    const name = input.value;

    const lobby_id = state.lobby_id;

    var response = await fetch(
        `/hostess/get_players?lobby_id=${lobby_id}`,
        {
            method: "GET"
        }
    );

    var res = await response.json();

    if (res.status == "ok") {
        for (const player of Object.values(res.players)) {
            save_player_state(player);

            add_player_row(state.players[player.id]);
            add_voting_option(state.players[player.id]);
            for (const balance_id of state.players[player.id].balance_ids)
            {
                add_balance_to_selector(state.balances[balance_id]);
            }
        }
    }

    response = await fetch(
        `/hostess/add_player?lobby_id=${lobby_id}&name=${name}`,
        {
            method: "POST"
        }
    );

    res = await response.json();

    if (res.status === "ok") {
        state.local_player_id = res.player.id;
        state.lobby_owner = res.player.lobby_owner;
        save_player_state(res.player);
        if (state.lobby_owner) {
            add_start_vote_ui();
        }
        else {
            const add_player_text = document.getElementById("add_player_text");
            add_player_text.innerHTML = "Вы зарегистрировались в системе, дождитесь начала голосования";
        }

        state.personal_balance_id = Object.values(res.player.balances)[0].id;

        const name_span = document.getElementById("name");
        name_span.innerHTML = res.player.name;

        const role_span = document.getElementById("role");
        role_span.id = `player_${res.player.id}_role`;
        role_span.innerHTML = role_dict[res.player.role];

        const personal_balance = state.balances[state.personal_balance_id];
        const balance_span = document.getElementById("balance");
        balance_span.id = `balance_${personal_balance.id}`;
        balance_span.innerHTML = personal_balance.money;

        state.ws = new WebSocket(
            `ws://${window.location.host}/lobby?lobby_id=${lobby_id}&player_id=${state.local_player_id}`
        );

        state.ws.onmessage = handle_socket;

        state.ws.onopen = () => {
            var msg = JSON.stringify({
                type: "player_joined",
                player_id: state.local_player_id
            });

            state.ws.send(msg);
        }

        const add_player_button = document.getElementById("add_player_button");
        add_player_button.disabled = true;
    } else {
        console.error(result.message);
    }
}
