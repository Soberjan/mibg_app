import { state } from "../state.js";

export async function closeDeposit(depositId) {
	const response = await fetch(`/lobby/${state.lobbyId}/close_deposit?deposit_id=${depositId}`, {method : "POST"});
}
