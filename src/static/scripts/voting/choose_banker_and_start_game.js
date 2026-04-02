export async function choose_banker_and_start_game() {
    const elected_id = document.getElementById("banker_options").value;
    let response = await fetch(
        `/hostess/choose_banker?lobby_id=${state.lobby_id}&voter_id=${state.local_player_id}&elected_id=${elected_id}`,
        {
            method: "POST"
        }
    );
    const res = await response.json();
    if (res.status === "ok") {
        response = await fetch(
            `/hostess/start_game?lobby_id=${state.lobby_id}&player_id=${state.local_player_id}`,
            {
                method: "POST"
            }
        );
    }
}
