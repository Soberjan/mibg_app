import { state } from "../state.js";

export async function startPersonalEvent() {
    console.log("начинаем ивент");
    console.log(state);
    const container = document.getElementById("playerEventSelector");
    const playerId = container.value;
    console.log(playerId);
    var response = await fetch(
        `/lobby/${state.lobbyId}/start_personal_event?player_id=${state.localPlayerId}&receiver_id=${playerId}`,
        {
            method: "POST"
        }
    );
    console.log(response);
    let msg = await response.json();
    console.log(msg);
}

export async function startGlobalEvent() {
    var response = await fetch(
        `/lobby/${state.lobbyId}/start_global_event?player_id=${state.localPlayerId}`,
        {
            method: "POST"
        }
    );
}

export async function startEventSocket(msg) {
    const eventOverlay = document.getElementById("eventOverlay");
    eventOverlay.classList.remove("hidden");
    const eventDescription = document.getElementById("eventDescription");
    eventDescription.textContent = msg.description;
    const eventEffect = document.getElementById("eventEffect");
    eventEffect.textContent = msg.effect;
}

export function hideEvent() {
    const eventOverlay = document.getElementById("eventOverlay");
    eventOverlay.classList.add("hidden");
}

export function initEventUI() {
    const container = document.getElementById("playerEventSelector");
    console.log("initing event UI");
    for (const player of Object.values(state.players)) {
        const option = document.createElement("option");
        option.id = `eventPlayer${player.id}Option`;
        option.value = player.id;
        option.textContent = player.name;
        container.appendChild(option);
    }
}
