export function startVoteText(registeredPlayers, totalPlayers) {
    const startVoteButton = document.getElementById("startVoteButton");
    const registerPlayerText = document.getElementById("registerPlayerText");

    if (totalPlayers < 3) {
        registerPlayerText.textContent = "Дождитесь, пока подключится хотя бы 3 игрока, чтобы начать голосование";
        startVoteButton.disabled = true;
        return;
    }
    if (totalPlayers != registeredPlayers) {
        registerPlayerText.textContent = "Дождитесь, пока все игроки зарегистрируются, чтобы начать голосование";
        startVoteButton.disabled = true;
    }
    if (totalPlayers >= 3 && totalPlayers === registeredPlayers) {
        registerPlayerText.textContent = "Можете начать голосование";
        startVoteButton.disabled = false;
    }
}
