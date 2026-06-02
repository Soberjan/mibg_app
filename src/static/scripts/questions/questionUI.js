import { state } from "../state.js";

export function showQuestionOverlay(question) {
    const questionOverlay = document.getElementById("questionOverlay");
    if (questionOverlay.classList.contains("hidden"))
        questionOverlay.classList.remove("hidden");

    const questionText = document.getElementById("questionText");
    const answerResult = document.getElementById("answerResult");
    const hideQuestionButton = document.getElementById("hideQuestionButton");

    if (!hideQuestionButton.disabled)
        hideQuestionButton.disabled = true;

    answerResult.textContent = "";
    questionText.textContent = question.text;
}

export function showApprovalOverlay(question) {
    const approvalOverlay = document.getElementById("approvalOverlay");
    if (approvalOverlay.classList.contains("hidden"))
        approvalOverlay.classList.remove("hidden");

    const questionText = document.getElementById("questionApprovalText");
    const questionAnswer = document.getElementById("questionAnswer");

    questionText.textContent = question.text;
    questionAnswer.textContent = question.answer;
}

export function initQuestionUI() {
    const container = document.getElementById("playerQuestionSelector");
    for (const player of Object.values(state.players)) {
        const option = document.createElement("option");
        option.id = `questionPlayer${player.id}Option`;
        option.value = player.id;
        option.textContent = player.name;
        container.appendChild(option);
    }
}
