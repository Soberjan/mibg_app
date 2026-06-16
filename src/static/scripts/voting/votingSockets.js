import { state } from "./state.js";

export function startVotingRoundSocket(res) {
    const registrationOverlay = document.getElementById("registrationOverlay");
    if (!registrationOverlay.classList.contains("hidden")) {
        registrationOverlay.classList.add("hidden");
    }

    votingOverlay = document.getElementById("votingOverlay");
    if (votingOverlay.classList.contains("hidden")) {
        votingOverlay.classList.remove("hidden");
    }

    const round_number_text = document.getElementById("roundNumberText");
    round_number_text.innerHTML = res.voting_round;

    const voteButton = document.getElementById("voteButton");
    voteButton.disabled = false;
}

export function endVotingSocket(res) {
    const votingOverlay = document.getElementById("votingOverlay");
    if (!votingOverlay.classList.contains("hidden")) {
        votingOverlay.classList.add("hidden");
    }

    state.players[res.winner_id].role = "politician";
    state.lobbyOwner = state.localPlayerId === res.winner_id;

    changeBalanceOwner("gov", res.winner_id);

    playerRoleText = document.getElementById(`player${res.winner_id}Role`);
    if (playerRoleText)
    {
        playerRoleText.innerHTML = "политик";
    }
    chooseBankerUI();
}

export function bankerChosenSocket(res) {
    state.players[res.banker_id].role = "banker";

    changeBalanceOwner("bank", res.banker_id);

    playerRoleText = document.getElementById(`player${res.banker_id}Role`);
    if (playerRoleText)
        playerRoleText.innerHTML = "банкир";
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
            balance.remove();
    }

    let balanceSpan;
    if (balance.ownerId === 1) {
        balanceSpan = document.createElement("span");
        balanceSpan.id = `balance${balance.id}`;
    }
    else
        balanceSpan = document.getElementById(`balance${balance.id}`);

    balanceSpan.textContent = accountDict[balance.type] + " " + balance.money;

    if (state.localPlayerId != newOwnerId) {
        balanceSpan.classList.add("playerField");
        playerRow.appendChild(balanceSpan);
    }
    else {
        balanceSpan.classList.remove("playerField");
        upperRight.appendChild(balanceSpan);
    }

    balance.ownerId = newOwnerId;
}
