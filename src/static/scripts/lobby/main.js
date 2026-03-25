import { state } from "./state.js";
import { add_player } from "./add_player.js";
import { send_money } from "./send_money.js";

state.lobby_id = window.lobby_id;

window.add_player = add_player;
window.state = state;
window.send_money = send_money;
