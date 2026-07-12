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

export async function answerQuestion() {
    const questionAnswer = document.getElementById("questionAnswer");
    const [playerStatus, questionId] = state.players[state.localPlayerId].status.split("_");

    var response = await fetch(
        `/lobby/${state.lobbyId}/answer_question?answerer_id=${state.localPlayerId}&question_id=${questionId}&answer=${questionAnswer.value}`,
        {
            method: "POST"
        }
    );

    var res = await response.json();
    const answerResult = document.getElementById("answerResult");
    if (res.answered) {
        var response = await fetch(
            `/lobby/${state.lobbyId}/send_money?sender_id=${state.govBalanceId}&receiver_id=${state.personalBalanceId}&amount=${res.reward}`,
            {
                method: "PUT"
            }
        );
        answerResult.textContent = `Вы правильно ответили на вопрос! Ваша награда ${res.reward} у.е.`;
        answerResult.style.color = "green";
    }
    else {
        answerResult.textContent = `Вы неправильно ответили на вопрос!`;
        answerResult.style.color = "red";
    }

    const answerButton = document.getElementById("answerQuestionButton");
    answerButton.disabled = true;

    const hideQuestionButton = document.getElementById("hideQuestionButton");
    hideQuestionButton.disabled = false;
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
    if (msg.asker_id === state.localPlayerId && msg.question.type === "soft") {
        showApprovalOverlay(msg.question);
        state.players[state.localPlayerId].status = msg.approverState;
    }

    if (msg.player_id === state.localPlayerId) {
        showQuestionOverlay(msg.question);
        state.players[state.localPlayerId].status = msg.answererState;
    }
}

export async function approvedSocket(msg) {
    if (msg.asker_id === state.localPlayerId) {
        const approvalOverlay = document.getElementById("approvalOverlay");
        approvalOverlay.classList.add("hidden");
        state.players[state.localPlayerId].status = 'game';

    }
    else if (state.localPlayerId === msg.player_id) {
        const answerResult = document.getElementById("answerResult");
        if (state.lobbyOwner)
            answerResult.textContent = `Ваш ответ одобрили! Ваша награда ${msg.question.reward} очков влияния`;
        else
            answerResult.textContent = `Политик одобрил ваш ответ! Ваша награда ${msg.question.reward} очков влияния`;

        answerResult.style.color = "green";

        if (msg.question.reward_type === "influence") {
            updateInfluence(msg.question.reward);
        }
        state.players[state.localPlayerId].status = 'game';

        const hideQuestionButton = document.getElementById("hideQuestionButton");
        hideQuestionButton.disabled = false;
    }
}

export function disapprovedSocket(msg) {
    if (msg.asker_id === state.localPlayerId) {
        const approvalOverlay = document.getElementById("approvalOverlay");
        approvalOverlay.classList.add("hidden");
        state.players[state.localPlayerId].status = 'game';
    }
    else if (state.localPlayerId === msg.player_id) {
        const answerResult = document.getElementById("answerResult");
        answerResult.textContent = `Политик не одобрил ваш ответ!`;
        answerResult.style.color = "red";

        if (msg.question.reward_type === "influence") {
            updateInfluence(-1 * msg.question.reward);
        }

        state.players[state.localPlayerId].status = 'game';

        const hideQuestionButton = document.getElementById("hideQuestionButton");
        hideQuestionButton.disabled = false;
    }
}
