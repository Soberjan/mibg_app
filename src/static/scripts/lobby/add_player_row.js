import { role_dict, account_dict } from "../dicts.js";

export function add_player_row(player) {
    const container = document.getElementById("other_players");

    const row = document.createElement("div");
    row.classList.add("player");
    row.id = `player_${player.id}_row`;

    const nameSpan = document.createElement("span");
    nameSpan.id = `player_${player.id}_name`;
    nameSpan.classList.add("player_field");
    nameSpan.textContent = player.name;

    const roleSpan = document.createElement("span");
    roleSpan.id = `player_${player.id}_role`;
    roleSpan.classList.add("player_field");
    roleSpan.textContent = role_dict[player.role];

    row.appendChild(nameSpan);
    row.appendChild(roleSpan);

    const balances = []
    for (const balance_id of player.balance_ids)
        balances.push(state.balances[balance_id])

    for (const balance of balances) {
        const balance_span = document.createElement("span");
        balance_span.id = `balance_${balance.id}`;
        balance_span.classList.add("player_field");
        balance_span.textContent = account_dict[balance.type] + " " + balance.money;

        row.appendChild(balance_span);
    }

    container.appendChild(row);
}
