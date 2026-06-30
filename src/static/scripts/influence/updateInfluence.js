import { state } from "../state.js";

export function updateInfluence(deltaInf) {
    state.influence = state.influence + deltaInf;
    state.players[state.localPlayerId].influence += deltaInf;
    if (state.influence < 0)
        state.influence = 0;
    const influenceSpan = document.getElementById("localInfluence");
    influenceSpan.textContent = state.influence;
}

export function updateInfluenceSocket(msg) {
    if (state.localPlayerId === msg.playerId) {
        return;
    }
    console.log(msg);
    console.log(state);
    state.players[msg.player_id].influence += msg.influence;
}
