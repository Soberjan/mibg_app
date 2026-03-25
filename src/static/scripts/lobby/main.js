import { state } from "./state.js";
import { add_player } from "./add_player.js";
import { add_player_row } from "./add_player_row.js";

state.lobby_id = window.lobby_id;

window.add_player = add_player;
window.state = state;
window.add_player_row = add_player_row;
