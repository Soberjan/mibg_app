import { state } from "../state.js";

export function closeDepositSocket(msg) {
	const p = state.players[state.localPlayerId];

	if (p.role === "banker") {
		const financeDeposits = document.getElementById("financeDeposits");
		const deposit = document.getElementById(`deposit${msg.id}`);
		financeDeposits.removeChild(deposit);
	}

    const depositOwnerId = state.balances[msg.balance_id].ownerId;
    if (p.id != depositOwnerId)
        return;

	if (p.role === "worker" || p.role === "jobless") {
		const obligationDeposits = document.getElementById("obligationDeposits");
		const deposit = document.getElementById(`deposit${msg.id}`);
		obligationDeposits.removeChild(deposit);
	}

}
