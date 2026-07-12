import { state } from "../state.js";

export async function giveLoan() {
    const borrowerBalancesInput = document.getElementById("borrowerBalances");
    const borrowerBalanceId = borrowerBalancesInput.value;

    const loanSumInput = document.getElementById("loanSum");
    const loanSum = loanSumInput.value;

    const loanInterestInput = document.getElementById("loanInterest");
    const loanInterest = loanInterestInput.value;

    const loanTimeInputMin = document.getElementById("loanTimeMin");
    const loanTimeInputSec = document.getElementById("loanTimeSec");
    const loanTime = parseInt(loanTimeInputMin.value, 10) * 60 + parseInt(loanTimeInputSec.value, 10);

    if (Number(loanSum) > state.balances[state.bankBalanceId].money)
        return;

    var response = await fetch(`/lobby/${state.lobbyId}/give_loan?borrower_balance_id=${borrowerBalanceId}&loan_sum=${loanSum}&loan_interest=${loanInterest}&loan_time=${loanTime}`, {method: "POST"});

    let msg = await response.json();
    if (msg.res === "ok") {
        response = await fetch(
            `/lobby/${state.lobbyId}/send_money?sender_id=${state.bankBalanceId}&receiver_id=${borrowerBalanceId}&amount=${loanSum}`,
            {
                method: "PUT"
            }
        );
    }
}
