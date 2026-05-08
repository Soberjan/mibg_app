import { state } from "../state.js";
import { closeLoan } from "./closeLoan.js";

export function createObligationLoan(id, loanSum, interest, durationTime, startTime) {
	const loans = document.getElementById("obligationLoans");

	const loan = document.createElement("section");
	loan.id = `loan${id}`;

	const returnSum = loanSum * (100 + interest) / 100;
	const loanText = document.createElement("section");
	loanText.textContent = `Вы заняли ${loanSum} под процент ${interest} и должны вернуть банку ${returnSum}`;

	// как-то добавить запуск таймера
	const loanTimer = document.createElement("section");
	loanTimer.id = `loan${id}Timer`;
	loanTimer.textContent = `Осталось времени: ${durationTime}`;

	loan.appendChild(loanText);
	loan.appendChild(loanTimer);

	loans.appendChild(loan);
}

export function createFinanceLoan(id, balanceId, loanSum, interest, durationTime, startTime) {
	console.log("appeding shit to finance loan");
	const loans = document.getElementById("financeLoans");

	const loan = document.createElement("section");
	loan.id = `loan${id}`;

	const loanText = document.createElement("section");
	const playerName = state.players[state.balances[balanceId].ownerId].name;
	const returnSum = loanSum * (100 + interest) / 100;
	loanText.textContent = `Игрок ${playerName} занял ${loanSum} под процент ${interest} должен вернуть ${returnSum}`;

	// как-то добавить запуск таймера
	const loanTimer = document.createElement("section");
	loanTimer.id = `loan${id}Timer`;
	loanTimer.textContent = `Осталось времени: ${durationTime}`;
	
	const loanButton = document.createElement("button");
	loanButton.id = `loan${id}Button`;
	loanButton.textContent = `Закрыть кредит`;
	loanButton.addEventListener('click', () => closeLoan(id));

	loan.appendChild(loanText);
	loan.appendChild(loanTimer);
	loan.appendChild(loanButton);

	loans.appendChild(loan);
}
