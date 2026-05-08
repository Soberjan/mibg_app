import { state } from "../state.js";

export async function giveLoan() {
    const borrowerBalancesInput = document.getElementById("borrowerBalances");
    const borrowerBalanceId = borrowerBalancesInput.value;

    const loanSumInput = document.getElementById("loanSum");
    const loanSum = loanSumInput.value;
    
    const loanInterestInput = document.getElementById("loanInterest");
    const loanInterest = loanInterestInput.value;

    const loanTimeInput = document.getElementById("loanTime");
    const loanTime = loanTimeInput.value;

    console.log("niger");
    console.log(borrowerBalanceId);

    var response = await fetch(`/lobby/${state.lobbyId}/give_loan?borrower_balance_id=${borrowerBalanceId}&loan_sum=${loanSum}&loan_interest=${loanInterest}&loan_time=${loanTime}`, {method: "POST"});
}
