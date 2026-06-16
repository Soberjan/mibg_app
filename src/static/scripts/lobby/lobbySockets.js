import { state } from "../state.js"
import { addVotingOption } from "../voting/addVotingOption.js";
import { startVoteText } from "../voting/startVoteText.js";
import { addBalanceToSelector } from "../transactions/addBalanceToSelector.js";
import { addPlayerRow } from "../lobby/addPlayerRow.js";

export function otherPlayerJoinedSocket(res) {
    state.players[res.player.id] = res.player;
    state.balances[res.balance.id] = res.balance;
    addBalanceToSelector(res.balance);
    addPlayerRow(res.player);

    const totalPlayersSpan = document.getElementById("totalPlayers");
    if (totalPlayersSpan) {
        const numberOfPlayers = Object.keys(state.players).length;
        totalPlayersSpan.innerHTML = `${numberOfPlayers}`;
    }
    addVotingOption(state.players[res.player.id]);

    if (state.lobbyOwner) {
        let registeredPlayers = 0;
        for (const p of Object.values(state.players))
            if (p.status === "registered")
                registeredPlayers += 1;
        startVoteText(registeredPlayers, Object.keys(state.players).length);
    }

    console.log('added all the shit because other player joined');
}

export function playerRegisteredSocket(res) {
    console.log(res);
    console.log(state);
    state.players[res.player_id].status = "registered";
    state.players[res.player_id].name = res.name;

    const nameSpan = document.getElementById(`player${res.player_id}Name`);
    nameSpan.textContent = res.name;

    let pb;
    for (const pbb of Object.values(state.balances))
        if (pbb.ownerId === res.player_id && pbb.type === "personal")
            pb = pbb;
    if (pb) {
        const balanceOption = document.getElementById(`balance${pb.id}Option`);
        const senderOption = document.getElementById(`senderBalance${pb.id}Option`);
        if (balanceOption)
            balanceOption.textContent = res.name;
        if (senderOption)
            senderOption.textContent = res.name;
    }
    else
        console.log("niger");

    const votingOption = document.getElementById(`player${res.player_id}VotingOption`);
    if (votingOption)
        votingOption.textContent = res.name;
    if (!state.lobbyOwner)
        return;

    registeredPlayers = 0;
    for (const p of Object.values(state.players))
        if (p.status === "registered")
            registeredPlayers += 1;
    const registeredText = document.getElementById(`registeredPlayers`);
    registeredText.innerHTML = registeredPlayers;

    startVoteText(registeredPlayers, Object.keys(state.players).length);
}
