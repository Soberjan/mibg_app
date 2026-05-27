import { state } from "../state.js";
import { accountDict } from "../dicts.js";

export async function sendMoney() {
    const balanceSelector = document.getElementById("balances");
    const senderSelector = document.getElementById("senderBalances");
    const moneyAmount_field = document.getElementById("moneyAmount");

    const receiverId = balanceSelector.value;
    const amount = moneyAmount_field.value;
    const senderId = senderSelector.value;

    if (amount > state.money) {
        console.log("Нельзя отправить больше денег, чем у вас есть!")
        return;
    }

    var response = await fetch(
        `/lobby/${state.lobbyId}/send_money?sender_id=${senderId}&receiver_id=${receiverId}&amount=${amount}`,
        {
            method: "PUT"
        }
    );

    var res = await response.json();

    if (res.status === "ok") {
        console.log("money sent");
    }
}
