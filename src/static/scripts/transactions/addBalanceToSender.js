import { state } from "../state.js";

export function addBalanceToSender(balance) {
    const container = document.getElementById("senderBalances");

    const option = document.createElement("option");
    option.id = `senderBalance${balance.id}Option`;

    option.value = balance.id;
    if (balance.type === "personal")
        option.textContent = state.players[balance.ownerId].name;
    if (balance.type === "gov")
        option.textContent = "государство"
    if (balance.type === "bank")
        option.textContent = "банк"

    container.appendChild(option);
}
