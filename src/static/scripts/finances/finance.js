import { state } from "../state.js";
import { accountDict } from "../dicts.js";
import { createObligationLoan, createFinanceLoan } from "./loanElements.js";
import { createObligationDeposit, createFinanceDeposit } from "./depositElements.js";

export async function fillObligationPage() {
    const result = await fetch(`/lobby/${state.lobbyId}/finance/get_loans_and_deposits`);
	const res = await result.json();
	console.log("initing obligations");
    console.log(res);
	for (var loan of Object.values(res.loans)) {
		const loanOwnerId = state.balances[loan.balance_id].ownerId;
		if (loanOwnerId === state.localPlayerId)
			createObligationLoan(loan.id, loan.sum, loan.interest, loan.ends_at);
	}
	for (var deposit of Object.values(res.deposits)) {
		const depositOwnerId = state.balances[deposit.balance_id].ownerId;
		if (depositOwnerId === state.localPlayerId)
			createObligationDeposit(deposit.id, deposit.sum, deposit.interest, deposit.ends_at);
	}
}

export async function fillFinancePage() {
    console.log("initing finance page");
    const borrowerBalances = document.getElementById("borrowerBalances");
    borrowerBalances.replaceChildren();
    for (const balance of Object.values(state.balances)) {
        if (balance.type != "personal")
            continue;
        if (state.players[balance.ownerId].role === "politician" || state.players[balance.ownerId].role === "banker")
            continue;
        const option = document.createElement("option");
        option.id = `loan${balance.id}Option`;
        option.value = `${balance.id}`;
        option.textContent = `${accountDict[balance.type]} ${state.players[balance.ownerId].name}`;
		borrowerBalances.appendChild(option);
    }
    const depositBalances = document.getElementById("depositBalances");
    depositBalances.replaceChildren();
    for (const balance of Object.values(state.balances)) {
        if (balance.type != "personal")
            continue;
        if (state.players[balance.ownerId].role === "politician" || state.players[balance.ownerId].role === "banker")
            continue;
        const option = document.createElement("option");
        option.id = `loan${balance.id}Option`;
        option.value = `${balance.id}`;
        option.textContent = `${accountDict[balance.type]} ${state.players[balance.ownerId].name}`;
        depositBalances.appendChild(option);
    }

    const result = await fetch(`/lobby/${state.lobbyId}/finance/get_loans_and_deposits`);
    const res = await result.json();
    console.log("initfinancepage");
    console.log(result);
    const loans = document.getElementById("financeLoans");
    loans.replaceChildren();
    for (const loan of Object.values(res.loans)) {
        console.log("creating finance loans");
        console.log(loan);
        createFinanceLoan(loan.id, loan.balance_id, loan.sum, loan.interest, loan.ends_at, loan.state);
    }
    const deposits = document.getElementById("financeDeposits");
    deposits.replaceChildren();
    for (const deposit of Object.values(res.deposits)) {
        console.log("creating finance deposits");
        console.log(deposit);
        createFinanceDeposit(deposit.id, deposit.balance_id, deposit.sum, deposit.interest, deposit.ends_at, deposit.state);
    }
}
