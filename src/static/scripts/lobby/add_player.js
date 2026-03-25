import { handle_socket } from "./handle_socket.js";
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
            state.players[player.player_id] = {
                player_id: player.player_id,
                player_name: player.player_name,
                player_role: player.player_role,
                balance_id: player.player_balance_id,
                money: player.money
            };

            add_player_row(state.players[player.player_id]);
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
        const name_span = document.getElementById("name");
        name_span.innerHTML = res.player_name;
        const balance_span = document.getElementById("balance");
        balance_span.innerHTML = res.money;
        state.local_player_id = res.player_id;

        state.players[res.player_id] = {
            player_id: res.player_id,
            player_name: res.player_name,
            player_role: res.player_role,
            balance_id: res.assigned_balance_id,
            money: res.money
        };

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
