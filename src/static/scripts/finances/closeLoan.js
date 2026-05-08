import { state } from "../state.js";

export async function closeLoan(loanId) {
	const response = await fetch(`/lobby/${state.lobbyId}/close_loan?loan_id=${loanId}`, {method : "POST"});
}
