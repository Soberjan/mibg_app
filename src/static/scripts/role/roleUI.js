import { state } from "../state.js";
import { roleDict } from "../dicts.js";

export function initRoleControllerUI() {
    updateRoleControllerPlayerSelector();
    updateRoleControllerRoleSelector();
}

export function updateRoleControllerPlayerSelector() {
    const playerSelector = document.getElementById("roleControllerPlayerSelector");
    playerSelector.replaceChildren();

    for (const player of Object.values(state.players)) {
        if (player.role === "politician" || player.role === "banker")
            continue;

        const option = document.createElement("option");
        option.value = player.id;
        option.textContent = player.name;

        playerSelector.appendChild(option);
    }
}

export function updateRoleControllerRoleSelector() {
    const playerSelector = document.getElementById("roleControllerPlayerSelector");
    const selectedPlayerId = playerSelector.value;

    const roleSelector = document.getElementById("roleControllerRoleSelector");
    roleSelector.replaceChildren();

    const roles = ["marketer", "jobless", "worker"];
    for (const role of roles) {
        if (state.players[selectedPlayerId].role === role)
            continue;

        const option = document.createElement("option");
        option.value = role;
        option.textContent = roleDict[role];

        roleSelector.appendChild(option);
    }
}
