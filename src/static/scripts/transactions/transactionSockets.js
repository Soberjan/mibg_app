import { state } from "./state.js";

export function moneyChangedSocket(res) {
    const data = res.result;
    console.log(data);
    const localSenderSpan = document.getElementById(`balance${data.sender_id}`);
    const localReceiverSpan = document.getElementById(`balance${data.receiver_id}`);

    if (state.localPlayerId === state.balances[data.sender_id].owner_id)
        localSenderSpan.innerHTML = data.sender_money;
    else
        localSenderSpan.innerHTML = accountDict[state.balances[data.sender_id].type] + " " + data.sender_money;

    if (state.localPlayerId === state.balances[data.receiver_id].owner_id)
        localReceiverSpan.innerHTML = data.receiver_money;
    else
        localReceiverSpan.innerHTML = accountDict[state.balances[data.receiver_id].type] + " " + data.receiver_money;

    state.balances[data.sender_id].money = data.sender_money;
    state.balances[data.receiver_id].money = data.receiver_money;
}
