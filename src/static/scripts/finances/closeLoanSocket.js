import { state } from "../state.js";

export function closeLoanSocket(msg) {
	const p = state.players[state.localPlayerId];

	if (p.role === "banker") {
		const financeLoans = document.getElementById("financeLoans");
		const loan = document.getElementById(`loan${msg.id}`);
		financeLoans.removeChild(loan);
	}

    const depositOwnerId = state.balances[msg.balance_id].ownerId;
    if (p.id != depositOwnerId)
        return;

	if (p.role === "worker" || p.role === "jobless") {
		const obligationLoans = document.getElementById("obligationLoans");
		const loan = document.getElementById(`loan${msg.id}`);
		obligationLoans.removeChild(loan);
	}

}
