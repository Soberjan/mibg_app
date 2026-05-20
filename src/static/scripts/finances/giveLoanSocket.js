import { state } from "../state.js";
import { createObligationLoan, createFinanceLoan } from "./loanElements.js";

export function giveLoanSocket(msg) {
    const p = state.players[state.localPlayerId];

    if (p.role === "banker") {
		createFinanceLoan(msg.id, msg.balance_id, msg.loan_sum, msg.interest, msg.ends_at);
    }

    const loanOwnerId = state.balances[msg.balance_id].ownerId;
    if (p.id != loanOwnerId)
        return;

    else if (p.role === "jobless" || p.role == "worker") {
		createObligationLoan(msg.id, msg.loan_sum, msg.interest, msg.ends_at);
    }
}
