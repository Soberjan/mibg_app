import { state } from "../state.js";

export function updateInfluence(deltaInf) {
    state.influence = state.influence + deltaInf;
    if (state.influence < 0)
        state.influence = 0;
    const influenceSpan = document.getElementById("localInfluence");
    influenceSpan.textContent = state.influence;
}
