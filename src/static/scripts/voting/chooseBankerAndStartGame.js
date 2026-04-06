export async function chooseBankerAndStartGame() {
    const electedId = document.getElementById("banker_options").value;
    let response = await fetch(
        `/lobby/${state.lobbyId}/choose_banker?voter_id=${state.localPlayerId}&elected_id=${electedId}`,
        {
            method: "POST"
        }
    );
    const res = await response.json();
    if (res.status === "ok") {
        response = await fetch(
            `/lobby/${state.lobbyId}/start_game?player_id=${state.localPlayerId}`,
            {
                method: "POST"
            }
        );
    }
}
