import { add_player_row } from "./add_player_row.js";

export function handle_socket(event) {
    const res = JSON.parse(event.data);

    switch (res.type) {
        case "other_player_joined":
            // player = {
            //     player_id: res.player_id,
            //     player_name: res.player_name,
            //     player_role: res.player_role,
            //     balance_id: res.assigned_balance_id,
            //     money: res.money
            // };

            state.players[res.player_id] = {
                player_id: res.player_id,
                player_name: res.player_name,
                player_role: res.player_role,
                balance_id: res.assigned_balance_id,
                money: res.money
            };
            console.log(`joined: ${res.player_name}`);
            add_player_row(state.players[res.player_id]);
            break;

        case "game_started":
            console.log(`round ${res.round}`);
            break;

        case "error":
            console.error(res.message);
            break;
    }
}
