import { state } from "./state.js";

export function add_balance_to_selector(balance) {
    const container = document.getElementById("balances");

    const option = document.createElement("option");
    option.value = balance.id;
    option.textContent = state.players[balance.owner_id].name;

    container.appendChild(option);
}
