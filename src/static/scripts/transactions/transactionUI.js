import { state } from "../state.js";
import { hideMenu } from "../lobby/hideMenu.js";
import { balanceOwnerName } from "./balance.js";

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

export function initTransactions(transactionHistory) {
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

export function initTransactionHistory(transactionHistory) {
    const transactionHistoryMenu = document.getElementById("transactionHistory");
    transactionHistoryMenu.replaceChildren();

    console.log("TRANSACTION HISTORY INIT");
    console.log(transactionHistory);

    const sortedTransactions = Object.values(transactionHistory).sort(
        (a, b) => new Date(a.sent_at) - new Date(b.sent_at)
    );

    for (const transaction of sortedTransactions)
        addTransactionToHistory(transaction);

}

export function addTransactionToHistory(res) {
    console.log("adding to history!!!");
    console.log(res);
    const data = res.result ?? res;
    console.log(data);

    const transactionHistory = document.getElementById("transactionHistory");
    if (!transactionHistory)
        return;

    console.log(state.balances);

    const senderBalance = state.balances[data.sent_from];
    const receiverBalance = state.balances[data.sent_to];
    console.log(senderBalance);

    if (senderBalance.ownerId != state.localPlayerId && receiverBalance.ownerId != state.localPlayerId)
        return;

    const senderName = balanceOwnerName(senderBalance);
    const receiverName = balanceOwnerName(receiverBalance);

    const transactionItem = document.createElement("div");
    transactionItem.classList.add("transactionHistoryItem");

    const transactionTime = document.createElement("div");
    transactionTime.classList.add("transactionHistoryTime");
    transactionTime.textContent = formatTransactionTime(data.sent_at);

    const transactionRoute = document.createElement("div");
    transactionRoute.classList.add("transactionHistoryRoute");

    const senderSpan = document.createElement("span");
    senderSpan.classList.add("transactionHistoryBalance");
    senderSpan.textContent = senderName;

    const arrowSpan = document.createElement("span");
    arrowSpan.classList.add("transactionHistoryArrow");
    arrowSpan.textContent = "→";

    const receiverSpan = document.createElement("span");
    receiverSpan.classList.add("transactionHistoryBalance");
    receiverSpan.textContent = receiverName;

    transactionRoute.append(senderSpan, arrowSpan, receiverSpan);

    const transactionAmount = document.createElement("div");
    transactionAmount.classList.add("transactionHistoryAmount");
    transactionAmount.textContent = `${formatMoney(data.money)} у.е.`;

    transactionItem.append(
        transactionTime,
        transactionRoute,
        transactionAmount
    );

    // Новые переводы будут появляться сверху.
    transactionHistory.prepend(transactionItem);
}

function formatTransactionTime(value) {
    if (!value)
        return "Время неизвестно";

    const date = new Date(value);

    if (Number.isNaN(date.getTime()))
        return String(value);

    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatMoney(value) {
    const number = Number(value);

    if (Number.isNaN(number))
        return value;

    return number.toLocaleString("ru-RU");
}

export function showTransactionHistory() {
    const transactionHistoryOverlay = document.getElementById("transactionHistoryOverlay");
    transactionHistoryOverlay.classList.remove("hidden");
    hideMenu();
}

export function hideTransactionHistory() {
    const transactionHistoryOverlay = document.getElementById("transactionHistoryOverlay");
    transactionHistoryOverlay.classList.add("hidden");

    const assetsMenu = document.getElementById("assets");
    assetsMenu.classList.remove("hidden");
}
