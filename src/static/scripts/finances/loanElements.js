import { state } from "../state.js";
import { closeLoan } from "./closeLoan.js";
import { startCountdown } from "../timer/countDownTimer.js";

function loanTimeout(loanTimer) {
	loanTimer.style.color = "red";
	loanTimer.textContent = "Время уплаты долга вышло";
}

export function createObligationLoan(id, loanSum, interest, endsAt) {
	const loans = document.getElementById("obligationLoans");
    loans.classList.add("obligationList");

	const loan = document.createElement("section");
	loan.id = `loan${id}`;
    loan.classList.add("obligationItem");
    loan.classList.add("financeDeposit");

	const returnSum = loanSum * (100 + interest) / 100;

	const loanText = document.createElement("section");
    loanText.classList.add("obligationText");
    loanText.classList.add("financeDepositInfo");

    const loanTitle = document.createElement("div");
    loanTitle.classList.add("financeDepositPlayer");
    loanTitle.textContent = "Ваш кредит";

    const loanMeta = document.createElement("div");
    loanMeta.classList.add("financeDepositMeta");
    loanMeta.textContent = `${loanSum} → ${returnSum} · ставка ${interest}%`;

    loanText.appendChild(loanTitle);
    loanText.appendChild(loanMeta);

	const loanTimer = document.createElement("section");
	loanTimer.id = `loan${id}Timer`;
    loanTimer.classList.add("obligationTimer");
    loanTimer.classList.add("financeDepositTimer");

    if (Date.now() < Date.parse(endsAt))
    {
        state.timers[loanTimer.id] = {}
        state.timers[loanTimer.id].endsAt = Date.parse(endsAt);
        startCountdown(loanTimer.id, () => loanTimeout(loanTimer));
    }
    else
        loanTimeout(loanTimer);

	loan.appendChild(loanText);
	loan.appendChild(loanTimer);

	loans.appendChild(loan);
}

export function createFinanceLoan(id, balanceId, loanSum, interest, endsAt, loanState) {
    console.log("appeding shit to finance loan");
    console.log(`end time from server looks like this: ${endsAt}`);

    const loans = document.getElementById("financeLoans");

    const loan = document.createElement("section");
    loan.id = `loan${id}`;
    loan.classList.add("financeLoan");

    const loanText = document.createElement("section");
    loanText.classList.add("financeLoanInfo");

    const playerName = state.players[state.balances[balanceId].ownerId].name;
    const returnSum = loanSum * (100 + interest) / 100;

    const loanPlayer = document.createElement("div");
    loanPlayer.classList.add("financeLoanPlayer");
    loanPlayer.textContent = playerName;

    const loanMeta = document.createElement("div");
    loanMeta.classList.add("financeLoanMeta");
    loanMeta.textContent = `${loanSum} → ${returnSum} · ставка ${interest}%`;

    loanText.appendChild(loanPlayer);
    loanText.appendChild(loanMeta);

    const loanTimer = document.createElement("section");
    loanTimer.id = `loan${id}Timer`;
    loanTimer.classList.add("financeLoanTimer");

    if (Date.now() < Date.parse(endsAt) && loanState != "frozen") {
        state.timers[loanTimer.id] = {}
        state.timers[loanTimer.id].endsAt = Date.parse(endsAt);
        startCountdown(loanTimer.id, () => loanTimeout(loanTimer));
    }
    else if (loanState != "frozen")
        loanTimeout(loanTimer);
    else {
        loanTimer.style.color = "blue";
        loanTimer.textContent = "Кредит заморожен";
    }

    if (loanState != "frozen") {
        const loanButton = document.createElement("button");
        loanButton.id = `loan${id}Button`;
        loanButton.classList.add("financeLoanButton");
        loanButton.textContent = `Закрыть`;
        loanButton.addEventListener('click', () => closeLoan(id));
        loan.appendChild(loanButton);
    }

    loan.appendChild(loanText);
    loan.appendChild(loanTimer);

    loans.appendChild(loan);
}
