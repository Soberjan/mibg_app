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

        case "game_started":
            console.log(`round ${res.round}`);
            break;

        case "error":
            console.error(res.message);
            break;
    }
}
