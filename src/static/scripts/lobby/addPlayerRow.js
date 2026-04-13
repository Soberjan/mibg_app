import { roleDict, accountDict } from "../dicts.js";
import { state } from "../state.js"

export function addPlayerRow(player) {
    const container = document.getElementById("otherPlayers");

    const row = document.createElement("div");
    row.classList.add("player");
    row.id = `player${player.id}Row`;

    const nameSpan = document.createElement("span");
    nameSpan.id = `player${player.id}Name`;
    nameSpan.classList.add("playerField");
    nameSpan.textContent = player.name;

    const roleSpan = document.createElement("span");
    roleSpan.id = `player${player.id}Role`;
    roleSpan.classList.add("playerField");
    roleSpan.textContent = roleDict[player.role];

    row.appendChild(nameSpan);
    row.appendChild(roleSpan);

    const balances = []
    for (const balanceId of player.balanceIds)
        balances.push(state.balances[balanceId])

    console.log("adding another player");
    console.log(state);

    for (const balance of balances) {
        const balanceSpan = document.createElement("span");
        balanceSpan.id = `balance${balance.id}`;
        balanceSpan.classList.add("playerField");
        balanceSpan.textContent = accountDict[balance.type] + " " + balance.money;

        row.appendChild(balanceSpan);
    }

    container.appendChild(row);
}
