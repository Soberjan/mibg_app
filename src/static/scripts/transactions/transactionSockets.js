import { state } from "../state.js";
import { accountDict } from "../dicts.js";

export function moneyChangedSocket(res) {
    const data = res.result;
    console.log(data);
    const localSenderSpan = document.getElementById(`balance${data.sender_id}Value`);
    const localReceiverSpan = document.getElementById(`balance${data.receiver_id}Value`);

    localSenderSpan.innerHTML = data.sender_money;
    localReceiverSpan.innerHTML = data.receiver_money;

    state.balances[data.sender_id].money = data.sender_money;
    state.balances[data.receiver_id].money = data.receiver_money;
}
