export function add_player_row(player) {
    const container = document.getElementById("other_players");

    const row = document.createElement("div");
    row.id = `${player.player_id}_row`;

    const nameSpan = document.createElement("span");
    nameSpan.id = `${player.player_id}_name`;
    nameSpan.textContent = player.player_name;

    const separator1 = document.createElement("span");
    separator1.textContent = " | ";

    const roleSpan = document.createElement("span");
    roleSpan.id = `${player.player_id}_role`;
    roleSpan.textContent = player.player_role;

    const separator2 = document.createElement("span");
    separator2.textContent = " | ";

    const moneySpan = document.createElement("span");
    moneySpan.id = `${player.balance_id}_money`;
    moneySpan.textContent = player.money;

    row.appendChild(nameSpan);
    row.appendChild(separator1);
    row.appendChild(roleSpan);
    row.appendChild(separator2);
    row.appendChild(moneySpan);

    container.appendChild(row);
}
