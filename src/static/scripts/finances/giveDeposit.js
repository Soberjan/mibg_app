import { state } from "../state.js";

export async function giveDeposit() {
    const borrowerBalancesInput = document.getElementById("depositBalances");
    const borrowerBalanceId = borrowerBalancesInput.value;

    const depositSumInput = document.getElementById("depositSum");
    const depositSum = depositSumInput.value;

    const depositInterestInput = document.getElementById("depositInterest");
    const depositInterest = depositInterestInput.value;

    const depositTimeInputMin = document.getElementById("depositTimeMin");
    console.log(depositTimeInputMin);
    const depositTimeInputSec = document.getElementById("depositTimeSec");
    const depositTime = parseInt(depositTimeInputMin.value, 10) * 60 + parseInt(depositTimeInputSec.value, 10);

    var response = await fetch(`/lobby/${state.lobbyId}/give_deposit?borrower_balance_id=${borrowerBalanceId}&deposit_sum=${depositSum}&deposit_interest=${depositInterest}&deposit_time=${depositTime}`, {method: "POST"});
}
