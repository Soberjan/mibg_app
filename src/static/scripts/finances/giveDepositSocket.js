import { state } from "../state.js";
import { createObligationDeposit, createFinanceDeposit } from "./depositElements.js";

export function giveDepositSocket(msg) {
    const p = state.players[state.localPlayerId];

    if (p.role === "banker") {
		createFinanceDeposit(msg.id, msg.balance_id, msg.deposit_sum, msg.interest, msg.ends_at);
    }

    const depositOwnerId = state.balances[msg.balance_id].ownerId;
    if (p.id != depositOwnerId)
        return;

    else if (p.role === "jobless" || p.role == "worker") {
		createObligationDeposit(msg.id, msg.deposit_sum, msg.interest, msg.ends_at);
    }
}
