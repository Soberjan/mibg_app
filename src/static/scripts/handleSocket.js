import { startGame } from "./lobby/startGame.js";
import { startVoting } from "./voting/startVoting.js";
import { state } from "./state.js";
import { giveLoanSocket } from "./finances/giveLoanSocket.js";
import { closeLoanSocket } from "./finances/closeLoanSocket.js";
import { giveDepositSocket } from "./finances/giveDepositSocket.js";
import { closeDepositSocket } from "./finances/closeDepositSocket.js";
import { pauseGameSocket, resumeGameSocket } from "./lobby/pauseGame.js";
import { startEventSocket } from "./events/events.js";
import { upgradePropertySocket, givePropertySocket } from "./property/property.js";
import { questionAskedSocket, approvedSocket, disapprovedSocket } from "./questions/question.js";
import { otherPlayerJoinedSocket, playerRegisteredSocket } from "./lobby/lobbySockets.js";
import { startVotingRoundSocket, endVotingSocket, bankerChosenSocket } from "./voting/votingSockets.js";
import { moneyChangedSocket } from "./transactions/transactionSockets.js";
import { messageSentSocket } from "./messenger/messageSocket.js";
import { branchOwnerChangedSocket } from "./xCompany/xCompanySocket.js";
import { roleChangedSocket } from "./role/role.js";

export async function handleSocket(event) {
    const res = JSON.parse(event.data);
    console.log(res);

    switch (res.type) {
        case "other_player_joined":
            otherPlayerJoinedSocket(res);
            break;

        case "player_registered":
            playerRegisteredSocket(res);
            break;

        case "money_changed":
            moneyChangedSocket(res);
            break;

        case "start_voting_round":
            startVotingRoundSocket(res);
            break;

        case "end_voting":
            endVotingSocket(res);
            break;

        case "term_ended":
            startVoting();
            console.log("politician term ended!");
            break;

        case "banker_chosen":
            await bankerChosenSocket(res);
            break;

        case "loan_given":
            giveLoanSocket(res);
            break;

        case "loan_closed":
            closeLoanSocket(res);
            break;

        case "deposit_given":
            giveDepositSocket(res);
            break;

        case "deposit_closed":
            closeDepositSocket(res);
            break;

        case "game_paused":
            pauseGameSocket();
            break;

        case "game_resumed":
            resumeGameSocket(res);
            break;

        case "start_game":
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
            await approvedSocket(res);
            break;

        case "question_disapproved":
            disapprovedSocket(res);
            break;

        case "message_sent":
            messageSentSocket(res);
            break;

        case "branch_owner_changed":
            branchOwnerChangedSocket(res);
            break;

        case "role_changed":
            roleChangedSocket(res);
            break;

        case "error":
            console.error(res.message);
            break;
    }
}
