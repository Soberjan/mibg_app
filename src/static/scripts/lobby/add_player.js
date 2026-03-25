import { handle_socket } from "./handle_socket.js";
import { add_player_row } from "./add_player_row.js";
import { add_balance_to_selector } from "./add_balance_to_selector.js";
import { save_player_state } from "./save_player_state.js";
import { state } from "./state.js";

export async function add_player() {
    const overlay = document.getElementById("mypopit");
    overlay.classList.toggle("hidden");

    const input = document.getElementById("name_text");
    const name = input.value;

    const lobby_id = state.lobby_id;

    var response = await fetch(
        `http://127.0.0.1:8000/hostess/get_players?lobby_id=${lobby_id}`,
        {
            method: "GET"
        }
    );

    var res = await response.json();

    if (res.status == "ok") {
        for (const player of Object.values(res.players)) {
            save_player_state(player);
            console.log(state);

            add_player_row(state.players[player.id]);
            for (const balance_id of state.players[player.id].balance_ids)
            {
                add_balance_to_selector(state.balances[balance_id]);
            }
        }
    }

    response = await fetch(
        `http://127.0.0.1:8000/hostess/add_player?lobby_id=${lobby_id}&name=${name}`,
        {
            method: "POST"
        }
    );

    res = await response.json();

    if (res.status === "ok") {
        state.local_player_id = res.player.id;
        save_player_state(res.player);

        state.personal_balance_id = Object.values(res.player.balances)[0].id;

        const name_span = document.getElementById("name");
        name_span.innerHTML = res.player.name;

        const personal_balance = state.balances[state.personal_balance_id];
        const balance_span = document.getElementById("balance");
        balance_span.id = `balance_${personal_balance.id}`;
        balance_span.innerHTML = personal_balance.money;

        state.ws = new WebSocket(
            `ws://127.0.0.1:8000/lobby?lobby_id=${lobby_id}&player_id=${state.local_player_id}`
        );

        state.ws.onmessage = handle_socket;

        state.ws.onopen = () => {
            var msg = JSON.stringify({
                type: "player_joined",
                player_id: state.local_player_id
            });

            state.ws.send(msg);
        }


    } else {
        console.error(result.message);
    }
}
