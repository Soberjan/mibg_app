import { state } from "../state.js";

export async function closeLoan(loanId) {
	const response = await fetch(`/lobby/{state.lobbyId}/close_lone?loan_id={loanId}`);
}
