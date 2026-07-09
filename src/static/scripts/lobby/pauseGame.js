import { state } from "../state.js";

export async function pauseGame() {
    if (!state.lobbyOwner)
        return;
    const result = await fetch(`/lobby/${state.lobbyId}/pause?player_id=${state.localPlayerId}`,
        {
            method: "POST"
        }
    );
}

export function pauseGameSocket() {
    state.lobbyStatus = "paused";
    const pausePopup = document.getElementById("pauseOverlay");

    pausePopup.classList.remove("hidden");
    
    var resumeButton = document.getElementById("resumeButton");
    if (resumeButton != null)
        pausePopup.removeChild(resumeButton);
    if (state.lobbyOwner)
    {
        resumeButton = document.createElement("button");
        resumeButton.id = `resumeButton`;
        resumeButton.textContent = "Продолжить игру";
        resumeButton.onclick = resumeGame;

        pausePopup.appendChild(resumeButton);
    }
    const assetsMenu = document.getElementById("assets");
    const obligationsMenu = document.getElementById("obligations");
    const messagesMenu = document.getElementById("messenger");
    const financesMenu = document.getElementById("finances");
    const managmentMenu = document.getElementById("managment");
    assetsMenu.classList.add("hidden");
    obligationsMenu.classList.add("hidden");
    messagesMenu.classList.add("hidden");
    financesMenu.classList.add("hidden");
    managmentMenu.classList.add("hidden");
}

export async function resumeGame() {
    if (!state.lobbyOwner)
        return;
    const result = await fetch(`/lobby/${state.lobbyId}/resume?player_id=${state.localPlayerId}`,
        {
            method: "POST"
        }
    );
}

export function resumeGameSocket(msg) {
    state.termEndsAt = msg.term_ends_at;
    state.timers["politicianTimer"].endsAt = Date.parse(state.termEndsAt);

    state.lobbyStatus = "game";
    state.startedAt = msg.started_at;
    for (const loan of Object.values(msg.loans)) {
        if (state.timers[`loan${loan.id}Timer`] != null)
            state.timers[`loan${loan.id}Timer`].endsAt = Date.parse(loan.ends_at);
    }
    const pausePopup = document.getElementById("pauseOverlay");

    pausePopup.classList.add("hidden");

    const assetsMenu = document.getElementById("assets");
    assetsMenu.classList.remove("hidden");
}
