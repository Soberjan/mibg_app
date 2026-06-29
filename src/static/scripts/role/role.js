import { state } from "../state.js";
import { roleDict } from "../dicts.js";
import { updateRoleControllerRoleSelector } from "./roleUI.js";


export async function changeRole() {
    const playerSelector = document.getElementById("roleControllerPlayerSelector");
    const playerId = playerSelector.value;
    const roleSelector = document.getElementById("roleControllerRoleSelector");
    const newRole = roleSelector.value;

    var response = await fetch(
        `/lobby/${state.lobbyId}/change_role?changer_id=${state.localPlayerId}&player_id=${playerId}&new_role=${newRole}`,
        {
            method: "POST"
        }
    );
}

export function roleChangedSocket(msg) {
    const roleSpan = document.getElementById(`player${msg.player_id}Role`);
    roleSpan.textContent = roleDict[msg.role];

    state.players[msg.player_id].role = msg.role;
    if (state.lobbyOwner)
        updateRoleControllerRoleSelector();
}
