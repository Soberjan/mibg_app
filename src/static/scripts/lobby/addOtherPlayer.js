import { roleDict, accountDict } from "../dicts.js";
import { addBalanceToOtherPlayer } from "../transactions/balance.js";
import { state } from "../state.js";

export function addOtherPlayer(player) {
    const container = document.getElementById("otherPlayers");

    const oldRow = document.getElementById(`player${player.id}Row`);
    if (oldRow) oldRow.remove();

    const row = document.createElement("div");
    row.classList.add("player");
    row.id = `player${player.id}Row`;

    const header = document.createElement("div");
    header.classList.add("playerHeader");

    const nameSpan = document.createElement("span");
    nameSpan.id = `player${player.id}Name`;
    nameSpan.classList.add("playerName");
    nameSpan.textContent = player.name;

    const roleSpan = document.createElement("span");
    roleSpan.id = `player${player.id}Role`;
    roleSpan.classList.add("playerRole");
    roleSpan.textContent = roleDict[player.role] ?? player.role;

    header.appendChild(nameSpan);
    header.appendChild(roleSpan);

    const balancesBlock = document.createElement("div");
    balancesBlock.id = `player${player.id}BalancesBlock`;
    balancesBlock.classList.add("playerBalances");
    row.appendChild(header);
    row.appendChild(balancesBlock);

    container.appendChild(row);

    for (const balanceId of player.balanceIds) {
        const balance = state.balances[balanceId];

        if (!balance) continue;
        addBalanceToOtherPlayer(balance, player.id);
    }

}
