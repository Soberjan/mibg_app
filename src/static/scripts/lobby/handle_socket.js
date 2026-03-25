import { add_player_row } from "./add_player_row.js";
import { add_balance_to_selector } from "./add_balance_to_selector.js";
import { save_player_state } from "./save_player_state.js";

export function handle_socket(event) {
    const res = JSON.parse(event.data);

    switch (res.type) {
        case "other_player_joined":
            const player = res.player;
            save_player_state(player);

            add_player_row(state.players[player.id]);
            for (const balance_id of state.players[player.id].balance_ids)
                add_balance_to_selector(state.balances[balance_id]);
            break;

        case "money_changed":
            console.log("received_shit");
            console.log(res.result);
            const data = res.result;
            const local_balance_span = document.getElementById(`balance_${data.sender_id}`);
            const local_receiver_span = document.getElementById(`balance_${data.receiver_id}`);

            local_balance_span.innerHTML = data.sender_money;
            local_receiver_span.innerHTML = data.receiver_money;

            state.balances[data.sender_id].money = data.sender_money;
            state.balances[data.receiver_id].money = data.receiver_money;
            break;

        case "error":
            console.error(res.message);
            break;
    }
}
