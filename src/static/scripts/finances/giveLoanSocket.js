import { state } from "../state.js";
import { closeLoan } from "./closeLoan.js";

export function giveLoanSocket(msg) {
    const p = state.players[state.localPlayerId];

    if (p.role === "banker") {
	const loans = document.getElementById("financeLoans");

	const loan = document.createElement("section");
	loan.id = `loan{msg.id}`;

	const loanText = document.createElement("section");
	const playerName = state.players[state.balances[msg.balance_id].ownerId].name;
	loanText.textContent = `Игрок {playerName} занял {msg.loan_sum} под процент {msg.interest} должен вернуть {msg.return_sum}`;

	// как-то добавить запуск таймера
	const loanTimer = document.createElement("section");
	loanTimer.id = `loan{msg.id}Timer`;
	loanTimer.textContent = `Осталось времени: {msg.deadline}`;
	
	const loanButton = document.createElement("button");
	loanButton.id = `loan{msg.id}Button`;
	loanButton.textContent = `Закрыть кредит`;
	loanButton.addEventListener('click', () => closeLoan(msg.id));

	loan.appendChild(loanText);
	loan.appendChild(loanTimer);
	loan.appendChild(loanButton);

	loans.appendChild(loan);
    }
    else if (p.role === "jobless" || p.role == "worker") {
	const loans = document.getElementById("obligationLoans");

	const loan = document.createElement("section");
	loan.id = `loan{msg.id}`;

	const loanText = document.createElement("section");
	loanText.textContent = `Вы заняли {msg.loanSum} под процент {msg.interest} и должны вернуть банку {msg.returnSum}`;

	// как-то добавить запуск таймера
	const loanTimer = document.createElement("section");
	loanTimer.id = `loan{msg.id}Timer`;
	loanTimer.textContent = `Осталось времени: {msg.deadline}`;

	loan.appendChild(loanText);
	loan.appendChild(loanTimer);

	loans.appendChild(loan);
    }
}
