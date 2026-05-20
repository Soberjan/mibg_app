import { state } from "../state.js";
import { closeDeposit } from "./closeDeposit.js";
import { startCountdown } from "../timer/countDownTimer.js";

function depositTimeout(depositTimer) {
	depositTimer.style.color = "green";
	depositTimer.textContent = "Время вернуть депозит с процентами)";
}

export function createObligationDeposit(id, depositSum, interest, endsAt) {
	const deposits = document.getElementById("obligationDeposits");

	const deposit = document.createElement("section");
	deposit.id = `deposit${id}`;

	const returnSum = depositSum * (100 + interest) / 100;
	const depositText = document.createElement("section");
	depositText.textContent = `Вы вложили ${depositSum} под процент ${interest} и банк вернет ${returnSum}`;

	const depositTimer = document.createElement("section");
	depositTimer.id = `deposit${id}Timer`;
    if (Date.now() < Date.parse(endsAt))
    {
        state.timers[depositTimer.id] = {}
        state.timers[depositTimer.id].endsAt = Date.parse(endsAt);
        startCountdown(depositTimer.id, () => depositTimeout(depositTimer));
    }
    else
        depositTimeout(depositTimer);

	deposit.appendChild(depositText);
	deposit.appendChild(depositTimer);

	deposits.appendChild(deposit);
}

export function createFinanceDeposit(id, balanceId, depositSum, interest, endsAt) {
	console.log("appeding shit to finance deposit");
    console.log(`end time from server looks like this: ${endsAt}`);
	const deposits = document.getElementById("financeDeposits");

	const deposit = document.createElement("section");
	deposit.id = `deposit${id}`;

	const depositText = document.createElement("section");
	const playerName = state.players[state.balances[balanceId].ownerId].name;
	const returnSum = depositSum * (100 + interest) / 100;
	depositText.textContent = `Игрок ${playerName} вложил ${depositSum} под процент ${interest} ему нужно вернуть ${returnSum}`;

	const depositTimer = document.createElement("section");
	depositTimer.id = `deposit${id}Timer`;

    if (Date.now() < Date.parse(endsAt))
    {
        state.timers[depositTimer.id] = {}
        state.timers[depositTimer.id].endsAt = Date.parse(endsAt);
        startCountdown(depositTimer.id, () => depositTimeout(depositTimer));
    }
    else
        depositTimeout(depositTimer);
	
	const depositButton = document.createElement("button");
	depositButton.id = `deposit${id}Button`;
	depositButton.textContent = `Закрыть депозит`;
	depositButton.addEventListener('click', () => closeDeposit(id));

	deposit.appendChild(depositText);
	deposit.appendChild(depositTimer);
	deposit.appendChild(depositButton);

	deposits.appendChild(deposit);
}
