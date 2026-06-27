import { state } from "../state.js";
import { addOtherPlayer } from "../lobby/addOtherPlayer.js";
import { chooseBankerUI } from "../voting/chooseBankerUI.js";
import { addBalanceToSelector } from "../transactions/addBalanceToSelector.js";
import { addBalanceToSender } from "../transactions/addBalanceToSender.js";
import { accountDict } from "../dicts.js";
import { initFinancePage, initManagmentPage, addPauseButton } from "../lobby/initLobbyUI.js";
import { startCountdown } from "../timer/countDownTimer.js";
import { addBalanceToUpperMenu, addBalanceToOtherPlayer } from "../transactions/balance.js";

export function startVotingRoundSocket(res) {
    console.log("starting voting round");
    console.log(res);
    if (res.voting_round === "1") {
        console.log("entered first voting round");
        const pauseButton = document.getElementById("pauseButton");
        console.log("shit1");
        if (pauseButton)
            pauseButton.remove();

        console.log("shit2");
        state.lobbyOwner = false;

        const registrationOverlay = document.getElementById("registrationOverlay");
        if (!registrationOverlay.classList.contains("hidden"))
            registrationOverlay.classList.add("hidden");

        console.log("shit3");
        state.timers = {};
        console.log(state);
        if (state.players[state.localPlayerId].role === "banker") {
            console.log("removing stuff");
            const financeLoans = document.getElementById("financeLoans");
            financeLoans.replaceChildren();
            const financeDeposits = document.getElementById("financeDeposits");
            financeDeposits.replaceChildren();
        }

        if (state.players[state.localPlayerId].role != "banker" && state.players[state.localPlayerId].role != "politician") {
            const obligationLoans = document.getElementById("obligationLoans");
            obligationLoans?.replaceChildren();
            const obligationDeposits = document.getElementById("obligationDeposits");
            obligationDeposits?.replaceChildren();
        }
    }

    for (const player of Object.values(state.players)) {
        console.log(player);
        if (state.players[player.id].role === "politician" || state.players[player.id].role === "banker") {
            state.players[player.id].role = "jobless";
            console.log("updated role");
            const playerRoleText = document.getElementById(`player${player.id}Role`);
            if (playerRoleText)
                playerRoleText.innerHTML = "безработный";
        }
    }

    console.log('shit fuck started voting round');

    console.log('shit fuck started voting round');
    const votingOverlay = document.getElementById("votingOverlay");
    if (votingOverlay.classList.contains("hidden")) {
        votingOverlay.classList.remove("hidden");
    }

    const roundNumberText = document.getElementById("roundNumberText");
    roundNumberText.innerHTML = res.voting_round;

    console.log('shit fuck started voting round');
    const voteButton = document.getElementById("voteButton");
    voteButton.removeAttribute('disabled');
    voteButton.disabled = false;
    console.log(voteButton.disabled);
    console.log('shit fuck started voting round');
}

export function endVotingSocket(res) {
    const votingOverlay = document.getElementById("votingOverlay");
    if (!votingOverlay.classList.contains("hidden")) {
        votingOverlay.classList.add("hidden");
    }

    state.termEndsAt = res.term_ends_at;

    state.timers["politicianTimer"] = {}
    state.timers["politicianTimer"].endsAt = Date.parse(state.termEndsAt);
    startCountdown("politicianTimer");

    state.lobbyStatus = "choosingBanker";

    console.log("finished voting, now i need to choose the banker");
    console.log(res);
    console.log(state);

    state.players[res.winner_id].role = "politician";
    state.lobbyOwner = state.localPlayerId === res.winner_id;

    changeBalanceOwner("gov", res.winner_id);

    const playerRoleText = document.getElementById(`player${res.winner_id}Role`);
    if (playerRoleText)
        playerRoleText.innerHTML = "политик";
    chooseBankerUI();

    if (state.localPlayerId === res.winner_id) {
        addPauseButton();
        initManagmentPage();
    }
}

export async function bankerChosenSocket(res) {
    state.players[res.banker_id].role = "banker";

    changeBalanceOwner("bank", res.banker_id);

    const playerRoleText = document.getElementById(`player${res.banker_id}Role`);
    if (playerRoleText)
        playerRoleText.innerHTML = "банкир";
    if (res.banker_id === state.localPlayerId)
        await initFinancePage();
}

function changeBalanceOwner(balanceType, newOwnerId) {
    let balance;
    for (const b of Object.values(state.balances))
        if (b.type === balanceType)
            balance = b;

    const playerRow = document.getElementById(`player${newOwnerId}Row`);
    const upperRight = document.getElementById(`upperRight`);
    const balanceOption = document.getElementById(`balance${balance.id}Option`);
    const govSenderBalanceOption = document.getElementById(`senderBalance${balance.id}Option`);

    if (state.localPlayerId != newOwnerId) {
        if (govSenderBalanceOption)
            govSenderBalanceOption.remove()

        if (!balanceOption)
            addBalanceToSelector(balance);
    }
    else if (state.localPlayerId === newOwnerId) {
        if (!govSenderBalanceOption)
            addBalanceToSender(balance);
        if (balanceOption)
            balanceOption.remove();
    }

    let balanceSpan;
    balanceSpan = document.getElementById(`balance${balance.id}`);
    if (balanceSpan)
        balanceSpan.remove();

    if (newOwnerId === state.localPlayerId)
        addBalanceToUpperMenu(balance);
    else
        addBalanceToOtherPlayer(balance, newOwnerId);
}
