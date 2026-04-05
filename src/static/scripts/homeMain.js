async function createLobby() {
    let response = await fetch("/hostess/create_lobby", {method:"POST"});
    let result = await response.json();
    if (result.status != "ok")
        return;

    joinLobby();
}

async function joinLobby() {
    const lobbyId = document.getElementById("lobbyId").value;
    response = await fetch(`/hostess/join_lobby?lobby_id=${lobby_id}`, {method:"POST"});
    result = await response.json();
    if (result.status != "ok") 
        return;

    window.location.href=`/lobby/${lobby_id}`;
}
