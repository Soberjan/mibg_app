import { state } from "../state.js";
import { createObligationLoan, createFinanceLoan } from "./loanElements.js";

export function giveLoanSocket(msg) {
    const p = state.players[state.localPlayerId];

    if (p.role === "banker") {
		createFinanceLoan(msg.id, msg.balance_id, msg.loan_sum, msg.interest, msg.ends_at);
    }
    else if (p.role === "jobless" || p.role == "worker") {
		createObligationLoan(msg.id, msg.loan_sum, msg.interest, msg.deadline, msg.ends_at);
    }
}
