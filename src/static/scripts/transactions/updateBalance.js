import { state } from "../state.js";

export function updateBalance(deltaMoney, balanceId) {
    self.balances[balanceId].money += deltaMoney;
    if (self.balances[balanceId].money < 0)
        self.balances[balanceId].money = 0;
    let balanceSpan;
    if (balanceId === state.localBalanceId)
        balanceSpan = document.getElementById(`personalBalanceId`);
    else
        balanceSpan = document.getElementById(`balance${balanceId}`);
    balanceSpan.textContent = self.balances[balanceId].money;
}
