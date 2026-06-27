import { state } from "../state.js";
import { accountDict } from "../dicts.js";
import { closeDeposit } from "./closeDeposit.js";
import { startCountdown } from "../timer/countDownTimer.js";

function depositTimeout(depositTimer) {
	depositTimer.style.color = "green";
	depositTimer.textContent = "Время вернуть депозит с процентами)";
}

export function createObligationDeposit(id, depositSum, interest, endsAt) {
    const deposits = document.getElementById("obligationDeposits");
    deposits.classList.add("obligationList");

    const deposit = document.createElement("section");
    deposit.id = `deposit${id}`;
    deposit.classList.add("financeDeposit");
    deposit.classList.add("obligationItem");

    const returnSum = depositSum * (100 + interest) / 100;

    const depositText = document.createElement("section");
    depositText.classList.add("financeDepositInfo");
    depositText.classList.add("obligationText");

    const depositTitle = document.createElement("div");
    depositTitle.classList.add("financeDepositPlayer");
    depositTitle.textContent = "Ваш депозит";

    const depositMeta = document.createElement("div");
    depositMeta.classList.add("financeDepositMeta");
    depositMeta.textContent = `${depositSum} → ${returnSum} · ставка ${interest}%`;

    depositText.appendChild(depositTitle);
    depositText.appendChild(depositMeta);

    const depositTimer = document.createElement("section");
    depositTimer.id = `deposit${id}Timer`;
    depositTimer.classList.add("financeDepositTimer");
    depositTimer.classList.add("obligationTimer");

    if (Date.now() < Date.parse(endsAt)) {
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

export function createFinanceDeposit(id, balanceId, depositSum, interest, endsAt, depositState) {
    console.log("appeding shit to finance deposit");
    console.log(`end time from server looks like this: ${endsAt}`);

    const deposits = document.getElementById("financeDeposits");

    const deposit = document.createElement("section");
    deposit.id = `deposit${id}`;
    deposit.classList.add("financeDeposit");

    const depositText = document.createElement("section");
    depositText.classList.add("financeDepositInfo");

    const playerName = state.players[state.balances[balanceId].ownerId].name;
    const returnSum = depositSum * (100 + interest) / 100;

    const depositPlayer = document.createElement("div");
    depositPlayer.classList.add("financeDepositPlayer");
    depositPlayer.textContent = playerName;

    const depositMeta = document.createElement("div");
    depositMeta.classList.add("financeDepositMeta");
    depositMeta.textContent = `${depositSum} → ${returnSum} · ставка ${interest}%`;

    depositText.appendChild(depositPlayer);
    depositText.appendChild(depositMeta);

    const depositTimer = document.createElement("section");
    depositTimer.id = `deposit${id}Timer`;
    depositTimer.classList.add("financeDepositTimer");

    if (Date.now() < Date.parse(endsAt) && depositState != "frozen") {
        state.timers[depositTimer.id] = {}
        state.timers[depositTimer.id].endsAt = Date.parse(endsAt);
        startCountdown(depositTimer.id, () => depositTimeout(depositTimer));
    }
    else if (depositState != "frozen")
        depositTimeout(depositTimer);
    else {
        depositTimer.style.color = "blue";
        depositTimer.textContent = "Депозит заморожен";
    }

    if (depositState != "frozen") {
        const depositButton = document.createElement("button");
        depositButton.id = `deposit${id}Button`;
        depositButton.classList.add("financeDepositButton");
        depositButton.textContent = `Закрыть`;
        depositButton.addEventListener('click', () => closeDeposit(id));
        deposit.appendChild(depositButton);
    }

    deposit.appendChild(depositText);
    deposit.appendChild(depositTimer);

    deposits.appendChild(deposit);
}
