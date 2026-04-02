import { state } from "./state.js";
import { addPlayer } from "./lobby/addPlayer.js";
import { sendMoney } from "./transactions/sendMoney.js";
import { vote } from "./voting/vote.js";

state.lobbyId = window.lobbyId;

window.addPlayer = addPlayer;
window.state = state;
window.sendMoney = sendMoney;
window.vote = vote;
