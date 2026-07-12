import { state } from "../state.js";

export function addBalanceToSender(balance) {
    const balanceOwner = state.players[balance.ownerId];
    console.log("adding balance");
    console.log(balance);
    console.log(balance.type);
    if (balanceOwner != null && balanceOwner.id != state.localPlayerId) {
        console.log(balanceOwner.id);
        console.log(state.localPlayerId);
        return;
    }
    if (balanceOwner != null && balanceOwner.role === "politician" && balance.type === "personal")
        return;


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

export function addBalanceToReceiver(balance) {
    const balanceOwner = state.players[balance.ownerId];
    console.log("adding balance");
    console.log(balance);
    console.log(balance.type);
    if (balanceOwner != null && balanceOwner.id === state.localPlayerId && balance.type != "bank")
        return;
    if (balanceOwner != null && balanceOwner.role === "politician" && balance.type === "personal")
        return;

    const container = document.getElementById("receiverBalances");

    const option = document.createElement("option");
    option.id = `balance${balance.id}Option`;
    option.value = balance.id;
    if (balance.type === "personal")
        option.textContent = state.players[balance.ownerId].name;
    if (balance.type === "gov")
        option.textContent = "государство"
    if (balance.type === "bank")
        option.textContent = "банк"

    container.appendChild(option);
}

export function initTransactions() {
    console.log(state);

    const receiverBalances = document.getElementById("receiverBalances");
    receiverBalances.replaceChildren();
    const senderBalances = document.getElementById("senderBalances");
    senderBalances.replaceChildren();

    for (const balance of Object.values(state.balances)) {
        addBalanceToReceiver(balance);
        addBalanceToSender(balance);
    }
}
