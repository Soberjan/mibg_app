import { handleSocket } from "../handleSocket.js";
import { addVotingOption } from "../voting/addVotingOption.js";
import { addPlayerRow } from "./addPlayerRow.js";
import { addBalanceToSelector } from "../transactions/addBalanceToSelector.js";
import { addStartVoteUI } from "../voting/addStartVoteUI.js";
import { savePlayerState } from "./savePlayerState.js";
import { state } from "../state.js";
import { roleDict } from "../dicts.js";

export async function addPlayer() {
    const input = document.getElementById("nameText");
    const name = input.value;

    const lobbyId = state.lobbyId;

    var response = await fetch(
        `/hostess/get_players?lobby_id=${lobbyId}`,
        {
            method: "GET"
        }
    );

    var res = await response.json();

    if (res.status == "ok") {
        for (const player of Object.values(res.players)) {
            savePlayerState(player);

            addPlayerRow(state.players[player.id]);
            addVotingOption(state.players[player.id]);
            for (const balance_id of state.players[player.id].balanceIds)
            {
                addBalanceToSelector(state.balances[balance_id]);
            }
        }
    }

    response = await fetch(
        `/hostess/add_player?lobby_id=${lobbyId}&name=${name}`,
        {
            method: "POST"
        }
    );

    res = await response.json();

    if (res.status === "ok") {
        state.localPlayerId = res.player.id;
        state.lobbyOwner = res.player.lobby_owner;
        savePlayerState(res.player);
        if (state.lobbyOwner) {
            addStartVoteUI();
        }
        else {
            const addPlayerText = document.getElementById("addPlayerText");
            addPlayerText.innerHTML = "Вы зарегистрировались в системе, дождитесь начала голосования";
        }

        state.personalBalanceId = Object.values(res.player.balances)[0].id;

        const name_span = document.getElementById("name");
        name_span.innerHTML = res.player.name;

        const role_span = document.getElementById("role");
        role_span.id = `player${res.player.id}Role`;
        role_span.innerHTML = roleDict[res.player.role];

        const personal_balance = state.balances[state.personalBalanceId];
        const balance_span = document.getElementById("balance");
        balance_span.id = `balance_${personal_balance.id}`;
        balance_span.innerHTML = personal_balance.money;

        state.ws = new WebSocket(
            `ws://${window.location.host}/lobby?lobby_id=${lobbyId}&player_id=${state.localPlayerId}`
        );

        state.ws.onmessage = handleSocket;

        state.ws.onopen = () => {
            var msg = JSON.stringify({
                type: "player_joined",
                player_id: state.localPlayerId
            });

            state.ws.send(msg);
        }

        const addPlayerButton = document.getElementById("addPlayerButton");
        addPlayerButton.disabled = true;
    } else {
        console.error(result.message);
    }
}
