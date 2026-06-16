import { state } from "../state.js";

export function updateBalance(deltaMoney, balanceId) {
    state.balances[balanceId].money += deltaMoney;
    if (state.balances[balanceId].money < 0)
        state.balances[balanceId].money = 0;
    let balanceSpan;
    if (balanceId === state.localBalanceId)
        balanceSpan = document.getElementById(`personalBalanceId`);
    else
        balanceSpan = document.getElementById(`balance${balanceId}`);
    balanceSpan.textContent = state.balances[balanceId].money;
}
