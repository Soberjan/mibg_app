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
import { otherPlayerJoinedSocket, playerRegisteredSocket } from "./lobby/lobbySockets.js";
import { startVotingRoundSocket, endVotingSocket, bankerChosenSocket } from "./voting/votingSockets.js";

export function handleSocket(event) {
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

        case "banker_chosen":
            bankerChosenSocket(res);
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
