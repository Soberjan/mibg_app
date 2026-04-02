import { state } from "../state.js";

export function addBalanceToSelector(balance) {
    const container = document.getElementById("balances");

    const option = document.createElement("option");
    option.value = balance.id;
    option.textContent = state.players[balance.ownerId].name;

    container.appendChild(option);
}
