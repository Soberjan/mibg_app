import { addPlayerRow } from "./lobby/addPlayerRow.js";
import { startGame } from "./lobby/startGame.js";
import { chooseBankerUI } from "./voting/chooseBankerUI.js";
import { addBalanceToSelector } from "./transactions/addBalanceToSelector.js";
import { addBalanceToSender } from "./transactions/addBalanceToSender.js";
import { savePlayerState } from "./lobby/savePlayerState.js";
import { addVotingOption } from "./voting/addVotingOption.js";
import { state } from "./state.js";
import { accountDict } from "./dicts.js";
import { startVoteText } from "./voting/startVoteText.js";
import { giveLoanSocket } from "./finances/giveLoanSocket.js";
import { closeLoanSocket } from "./finances/closeLoanSocket.js";
import { giveDepositSocket } from "./finances/giveDepositSocket.js";
import { closeDepositSocket } from "./finances/closeDepositSocket.js";
import { pauseGameSocket, resumeGameSocket } from "./lobby/pauseGame.js";
import { startEventSocket } from "./events/events.js";
import { upgradePropertySocket, givePropertySocket } from "./property/property.js";
import { questionAskedSocket, approvedSocket, disapprovedSocket } from "./questions/question.js";

export function handleSocket(event) {
    const res = JSON.parse(event.data);
    let playerRoleText;
    let votingOverlay;
    let registeredPlayers;
    let playerRow;
    let upperRight;
    let govBalanceOption;
    let bankBalanceOption;
    let balanceSpan;
    let govSenderBalanceOption;
    let bankSenderBalanceOption;
    console.log(res);

    switch (res.type) {
        case "other_player_joined":
            state.players[res.player.id] = res.player;
            state.balances[res.balance.id] = res.balance;
            addBalanceToSelector(res.balance);
            addPlayerRow(res.player);

            const totalPlayersSpan = document.getElementById("totalPlayers");
            if (totalPlayersSpan) {
                const numberOfPlayers = Object.keys(state.players).length;
                totalPlayersSpan.innerHTML = `${numberOfPlayers}`;
            }
            addVotingOption(state.players[res.player.id]);

            if (state.lobbyOwner) {
                registeredPlayers = 0;
                for (const p of Object.values(state.players))
                    if (p.status === "registered")
                        registeredPlayers += 1;
                startVoteText(registeredPlayers, Object.keys(state.players).length);
            }

            console.log('added all the shit because other player joined');
            break;

        case "player_registered":
            console.log(res);
            console.log(state);
            state.players[res.player_id].status = "registered";
            state.players[res.player_id].name = res.name;

            const nameSpan = document.getElementById(`player${res.player_id}Name`);
            nameSpan.textContent = res.name;

            let pb;
            for (const pbb of Object.values(state.balances))
                if (pbb.ownerId === res.player_id && pbb.type === "personal")
                    pb = pbb;
            if (pb) {
                const balanceOption = document.getElementById(`balance${pb.id}Option`);
                const senderOption = document.getElementById(`senderBalance${pb.id}Option`);
                if (balanceOption)
                    balanceOption.textContent = res.name;
                if (senderOption)
                    senderOption.textContent = res.name;
            }
            else
                console.log("niger");

            const votingOption = document.getElementById(`player${res.player_id}VotingOption`);
            if (votingOption)
                votingOption.textContent = res.name;
            if (!state.lobbyOwner)
                break;

            registeredPlayers = 0;
            for (const p of Object.values(state.players))
                if (p.status === "registered")
                    registeredPlayers += 1;
            const registeredText = document.getElementById(`registeredPlayers`);
            registeredText.innerHTML = registeredPlayers;

            startVoteText(registeredPlayers, Object.keys(state.players).length);

            break;

        case "money_changed":
            const data = res.result;
            console.log(data);
            const localSenderSpan = document.getElementById(`balance${data.sender_id}`);
            const localReceiverSpan = document.getElementById(`balance${data.receiver_id}`);

            if (state.localPlayerId === state.balances[data.sender_id].owner_id)
                localSenderSpan.innerHTML = data.sender_money;
            else
                localSenderSpan.innerHTML = accountDict[state.balances[data.sender_id].type] + " " + data.sender_money;

            if (state.localPlayerId === state.balances[data.receiver_id].owner_id)
                localReceiverSpan.innerHTML = data.receiver_money;
            else
                localReceiverSpan.innerHTML = accountDict[state.balances[data.receiver_id].type] + " " + data.receiver_money;

            state.balances[data.sender_id].money = data.sender_money;
            state.balances[data.receiver_id].money = data.receiver_money;
            break;

        case "start_voting_round":
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

            break;

        case "end_voting":
            votingOverlay = document.getElementById("votingOverlay");
            if (!votingOverlay.classList.contains("hidden")) {
                votingOverlay.classList.add("hidden");
            }

            state.lobbyOwner = state.localPlayerId === res.winner_id;

            state.players[res.winner_id].role = "politician";
            let govBalance;
            for (const bbbb of Object.values(state.balances))
                if (bbbb.type === "gov")
                    govBalance = bbbb;

            playerRow = document.getElementById(`player${res.winner_id}Row`);
            upperRight = document.getElementById(`upperRight`);
            govBalanceOption = document.getElementById(`balance${govBalance.id}Option`);
            govSenderBalanceOption = document.getElementById(`senderBalance${govBalance.id}Option`);
            if (govBalance.ownerId === 1 && state.localPlayerId != res.winner_id) {
                govBalance.ownerId = res.winner_id;

                if (govSenderBalanceOption)
                    govSenderBalanceOption.remove()

                if (!govBalanceOption)
                    addBalanceToSelector(govBalance);

                balanceSpan = document.createElement("span");
                balanceSpan.id = `balance${govBalance.id}`;
                balanceSpan.classList.add("playerField");
                balanceSpan.textContent = accountDict[govBalance.type] + " " + govBalance.money;

                playerRow.appendChild(balanceSpan);
            }
            else if (govBalance.ownerId === 1 && state.localPlayerId === res.winner_id) {
                govBalance.ownerId = res.winner_id;

                if (!govSenderBalanceOption)
                    addBalanceToSender(govBalance);

                if (govBalanceOption)
                    govBalance.remove();

                balanceSpan = document.createElement("span");
                balanceSpan.id = `balance${govBalance.id}`;
                balanceSpan.textContent = accountDict[govBalance.type] + " " + govBalance.money;

                upperRight.appendChild(balanceSpan);
            }
            else if (govBalance.ownerId != 1 && state.localPlayerId != res.winner_id) {
                govBalance.ownerId = res.winner_id;

                if (govSenderBalanceOption)
                    govSenderBalanceOption.remove()

                if (!govBalanceOption)
                    addBalanceToSelector(govBalance);

                balanceSpan = document.getElementById(`balance${govBalance.id}`);
                balanceSpan.classList.add("playerField");
                balanceSpan.textContent = accountDict[govBalance.type] + " " + govBalance.money;

                playerRow.appendChild(balanceSpan);
            }
            else if (govBalance.ownerId != 1 && state.localPlayerId === res.winner_id) {
                govBalance.ownerId = res.winner_id;

                if (!govSenderBalanceOption)
                    addBalanceToSender(govBalance);

                if (govBalanceOption)
                    govBalance.remove();

                balanceSpan = document.getElementById(`balance${govBalance.id}`);
                balanceSpan.classList.remove("playerField");
                balanceSpan.textContent = accountDict[govBalance.type] + " " + govBalance.money;

                upperRight.appendChild(balanceSpan);
            }

            playerRoleText = document.getElementById(`player${res.winner_id}Role`);
            if (playerRoleText)
            {
                playerRoleText.innerHTML = "политик";
            }
            chooseBankerUI();

            break;

        case "banker_chosen":
            state.players[res.banker_id].role = "banker";

            let bankBalance;
            for (const bbbbb of Object.values(state.balances))
                if (bbbbb.type === "bank")
                    bankBalance = bbbbb;

            playerRow = document.getElementById(`player${res.banker_id}Row`);
            upperRight = document.getElementById(`upperRight`);
            bankBalanceOption = document.getElementById(`balance${bankBalance.id}Option`);
            bankSenderBalanceOption = document.getElementById(`senderBalance${bankBalance.id}Option`);
            if (bankBalance.ownerId === 1 && state.localPlayerId != res.banker_id) {
                bankBalance.ownerId = res.banker_id;

                if (bankSenderBalanceOption)
                    bankSenderBalanceOption.remove()

                if (!bankBalanceOption)
                    addBalanceToSelector(bankBalance);

                balanceSpan = document.createElement("span");
                balanceSpan.id = `balance${bankBalance.id}`;
                balanceSpan.classList.add("playerField");
                balanceSpan.textContent = accountDict[bankBalance.type] + " " + bankBalance.money;

                playerRow.appendChild(balanceSpan);
            }
            else if (bankBalance.ownerId === 1 && state.localPlayerId === res.banker_id) {
                bankBalance.ownerId = res.banker_id;

                if (!bankSenderBalanceOption)
                    addBalanceToSender(bankBalance);

                if (bankBalanceOption)
                    bankBalance.remove();

                balanceSpan = document.createElement("span");
                balanceSpan.id = `balance${bankBalance.id}`;
                balanceSpan.textContent = accountDict[bankBalance.type] + " " + bankBalance.money;

                upperRight.appendChild(balanceSpan);
            }
            else if (bankBalance.ownerId != 1 && state.localPlayerId != res.banker_id) {
                bankBalance.ownerId = res.banker_id;

                if (bankSenderBalanceOption)
                    bankSenderBalanceOption.remove()

                if (!bankBalanceOption)
                    addBalanceToSelector(bankBalance);

                balanceSpan = document.getElementById(`balance${bankBalance.id}`);
                balanceSpan.classList.add("playerField");
                balanceSpan.textContent = accountDict[bankBalance.type] + " " + bankBalance.money;

                playerRow.appendChild(balanceSpan);
            }
            else if (bankBalance.ownerId != 1 && state.localPlayerId === res.banker_id) {
                bankBalance.ownerId = res.banker_id;

                if (!bankSenderBalanceOption)
                    addBalanceToSender(bankBalance);

                if (bankBalanceOption)
                    bankBalance.remove();

                balanceSpan = document.getElementById(`balance${bankBalance.id}`);
                balanceSpan.classList.remove("playerField");
                balanceSpan.textContent = accountDict[bankBalance.type] + " " + bankBalance.money;

                upperRight.appendChild(balanceSpan);
            }

            playerRoleText = document.getElementById(`player${res.banker_id}Role`);
            if (playerRoleText)
                playerRoleText.innerHTML = "банкир";
            break;

	case "loan_given":
	    console.log("niger! loan is given");
	    giveLoanSocket(res);
	    break;

	case "loan_closed":
	    console.log("faggot! loan is closed");
	    closeLoanSocket(res);
	    break;

	case "deposit_given":
	    console.log("niger! deposit is given");
	    giveDepositSocket(res);
	    break;

	case "deposit_closed":
	    console.log("faggot! deposit is closed");
	    closeDepositSocket(res);
	    break;

    case "game_paused":
        pauseGameSocket();
        break;

    case "game_resumed":
        resumeGameSocket(res);
        break;

    case "start_game":
        console.log("game started");
        startGame();
        break;

    case "start_event":
        startEventSocket(res);
        break;

    case "give_property":
        givePropertySocket(res);
        break;

    case "upgrade_property":
        upgradePropertySocket(res);
        break;

    case "question_asked":
        questionAskedSocket(res);
        break;

    case "question_approved":
        approvedSocket(res);
        break;

    case "question_disapproved":
        disapprovedSocket(res);
        break;

    case "error":
        console.error(res.message);
        break;
    }
}
