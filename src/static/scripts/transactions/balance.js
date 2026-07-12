import { accountDict } from "../dicts.js";

export function balanceOwnerName(balance) {
    let ownerName = null;
    if (balance.type === "gov")
        ownerName = "Государство";
    else if (balance.type === "personal")
        ownerName = state.players[balance.ownerId].name;
    else if (balance.type === "bank")
        ownerName = "Банк";
    return ownerName;
}

export function addBalanceToUpperMenu(balance) {
    const localBalance = document.getElementById("localBalance");

    const row = document.createElement("div");
    row.id = `balance${balance.id}`;
    row.classList.add("balanceRow");

    const name = document.createElement("span");
    name.id = `balance${balance.id}Name`;
    name.classList.add("balanceName");
    name.textContent = accountDict[balance.type];

    const value = document.createElement("span");
    value.id = `balance${balance.id}Value`;
    value.classList.add("balanceValue");
    value.textContent = balance.money;

    row.appendChild(name);
    row.appendChild(value);

    localBalance.appendChild(row);
}

export function addBalanceToOtherPlayer(balance, playerId) {
    const balancesBlock = document.getElementById(`player${playerId}BalancesBlock`);

    const balanceRow = document.createElement("div");
    balanceRow.id = `balance${balance.id}`;
    balanceRow.classList.add("playerBalance");

    const balanceType = document.createElement("span");

    balanceType.classList.add("balanceType");
    balanceType.textContent = accountDict[balance.type] ?? balance.type;

    const balanceValue = document.createElement("span");
    balanceValue.id = `balance${balance.id}Value`;
    balanceValue.classList.add("balanceValue");
    balanceValue.textContent = balance.money.toLocaleString("ru-RU");

    balanceRow.appendChild(balanceType);
    balanceRow.appendChild(balanceValue);

    balancesBlock.appendChild(balanceRow);
}
