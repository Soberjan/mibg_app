export async function chooseBankerAndStartGame() {
    const electedId = document.getElementById("banker_options").value;
    let response = await fetch(
        `/hostess/choose_banker?lobby_id=${state.lobby_id}&voter_id=${state.localPlayerId}&elected_id=${electedId}`,
        {
            method: "POST"
        }
    );
    const res = await response.json();
    if (res.status === "ok") {
        response = await fetch(
            `/hostess/start_game?lobby_id=${state.lobby_id}&player_id=${state.localPlayerId}`,
            {
                method: "POST"
            }
        );
    }
}
