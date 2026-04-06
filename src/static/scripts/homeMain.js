async function createLobby() {
    let response = await fetch("/hostess/create_lobby", {method:"POST"});
    let result = await response.json();
    if (result.status != "ok")
        return;

    window.location.href=`/lobby/${result.lobby_id}/`;
}

async function joinLobby() {
    const lobbyId = document.getElementById("lobbyId").value;

    window.location.href=`/lobby/${lobbyId}/`;
}

window.createLobby = createLobby;
window.joinLobby = joinLobby;
