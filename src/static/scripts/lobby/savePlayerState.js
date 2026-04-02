export function savePlayerState(player) {
    state.players[player.id] = {
        id: player.id,
        name: player.name,
        role: player.role,
        balanceIds: []
    };

    for (const balance of Object.values(player.balances)) {
        state.balances[balance.id] = {
            id: balance.id,
            type: balance.type,
            money: balance.money,
            owner_id: player.id
        };

        state.players[player.id].balanceIds.push(balance.id);
    }
}
