import { state } from "../state.js";
import { showQuestionOverlay, showApprovalOverlay } from "./questionUI.js";
import { updateInfluence } from "../influence/updateInfluence.js";
import { updateBalance } from "../transactions/updateBalance.js";

export async function askQuestion() {
    const playerQuestionSelector = document.getElementById(`playerQuestionSelector`);

    const playerId = playerQuestionSelector.value;
    var response = await fetch(
        `/lobby/${state.lobbyId}/ask_question?asker_id=${state.localPlayerId}&player_id=${playerId}`,
        {
            method: "POST"
        }
    );
}

export async function approveAnswer() {
    const [player_status, question_id] = state.players[state.localPlayerId].status.split("_");
    console.log(question_id);
    var response = await fetch(
        `/lobby/${state.lobbyId}/approve_answer?asker_id=${state.localPlayerId}&question_id=${question_id}`,
        {
            method: "POST"
        }
    );
}

export async function disapproveAnswer() {
    const [player_status, question_id] = state.players[state.localPlayerId].status.split("_");
    var response = await fetch(
        `/lobby/${state.lobbyId}/disapprove_answer?asker_id=${state.localPlayerId}&question_id=${question_id}`,
        {
            method: "POST"
        }
    );
}

export function questionAskedSocket(msg) {
    if (msg.asker_id === state.localPlayerId) {
        showApprovalOverlay(msg.question);
        state.players[state.localPlayerId].status = msg.approverState;
    }

    if (msg.player_id === state.localPlayerId) {
        showQuestionOverlay(msg.question);
        state.players[state.localPlayerId].status = msg.answererState;
    }
}

export function approvedSocket(msg) {
    if (msg.askerId === state.localPlayerId) {
        const approvalOverlay = document.getElementById("approvalOverlay");
        approvalOverlay.classList.add("hidden");
        state.players[state.localPlayerId].status = 'game';
    }
    else if (state.localPlayerId === msg.player_id) {
        if (msg.question.reward_type === "money") {
            updateBalance(question.reward, state.personalBalanceId);
            updateBalance(-1 * question.reward, state.govBalanceId);
        }
        if (question.reward_type === "influence") {
            updateInfluence(question.reward);
        }
        state.players[state.localPlayerId].status = 'game';

        const hideQuestionButton = document.getElementById("hideQuestionButton");
        hideQuestionButton.disabled = false;
    }
}

export function disapprovedSocket(msg) {
    if (msg.askerId === state.localPlayerId) {
        const approvalOverlay = document.getElementById("approvalOverlay");
        approvalOverlay.classList.add("hidden");
        state.players[state.localPlayerId].status = 'game';
    }
    else if (state.localPlayerId === msg.player_id) {
        if (msg.question.reward_type === "money") {
            updateBalance(-1 * question.reward, state.personalBalanceId);
            updateBalance(question.reward, state.govBalanceId);
        }
        if (question.reward_type === "influence") {
            updateInfluence(-1 * question.reward);
        }

        state.players[state.localPlayerId].status = 'game';

        const hideQuestionButton = document.getElementById("hideQuestionButton");
        hideQuestionButton.disabled = false;
    }
}
