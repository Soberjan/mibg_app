export function add_player_row(player) {
    const container = document.getElementById("other_players");

    const row = document.createElement("div");
    row.id = `player_${player.id}_row`;

    const nameSpan = document.createElement("span");
    nameSpan.id = `player_${player.id}_name`;
    nameSpan.textContent = player.name;

    const separator1 = document.createElement("span");
    separator1.textContent = " | ";

    const roleSpan = document.createElement("span");
    roleSpan.id = `player_${player.id}_role`;
    roleSpan.textContent = player.role;

    const separator2 = document.createElement("span");
    separator2.textContent = " | ";

    row.appendChild(nameSpan);
    row.appendChild(separator1);
    row.appendChild(roleSpan);
    row.appendChild(separator2);

    const balances = []
    for (const balance_id of player.balance_ids)
        balances.push(state.balances[balance_id])

    for (const balance of balances) {
        const balance_span = document.createElement("span");
        balance_span.id = `balance_${balance.id}`;
        balance_span.textContent = balance.money;

        const balance_separator = document.createElement("span");
        separator2.textContent = " | ";
        row.appendChild(balance_span);
        row.appendChild(balance_separator);
    }

    container.appendChild(row);
}
