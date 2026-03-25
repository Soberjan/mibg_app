import { state } from "./state.js";

export async function send_money() {
    const balance_selector = document.getElementById("balances");
    const money_amount_field = document.getElementById("money_amount");

    const receiver_id = balance_selector.value;
    const amount = money_amount_field.value;
    const sender_id = state.personal_balance_id;

    if (amount > state.money) {
        console.log("Нельзя отправить больше денег, чем у вас есть!")
        return;
    }


    var response = await fetch(
        `http://127.0.0.1:8000/hostess/send_money?lobby_id=${lobby_id}&sender_id=${sender_id}&receiver_id=${receiver_id}&amount=${amount}`,
        {
            method: "PUT"
        }
    );

    var res = await response.json();

    if (res.status === "ok") {
        console.log(res);
        res = res.result;
        console.log(`balance_${res.sender_id}`);
        const local_balance_span = document.getElementById(`balance_${res.sender_id}`);
        const local_receiver_span = document.getElementById(`balance_${res.receiver_id}`);

        local_balance_span.innerHTML = res.sender_money;
        local_receiver_span.innerHTML = res.receiver_money;

        state.balances[res.sender_id].money = res.sender_money;
        state.balances[res.receiver_id].money = res.receiver_money;
    }


    console.log("faggot!");
}
