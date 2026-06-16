import { state } from "../state.js";

export async function registerPlayer() {
    const input = document.getElementById("nameText");
    const name = input.value;

    const response = await fetch(`/lobby/${state.lobbyId}/register_player?name=${name}`, {method:"POST"});
    const res = await response.json();
    const registerPlayerButton = document.getElementById("registerPlayerButton");
    const registerPlayerText = document.getElementById("registerPlayerText");
    if (res.status === "ok") {
        registerPlayerButton.disabled = true;
        if (!state.lobbyOwner)
            registerPlayerText.textContent = "Вы зарегистрировались в системе, дождитесь начала голосования";
    }
    else
        registerPlayerText.textContent = "Не удалось зарегистрироваться в системе";

}
