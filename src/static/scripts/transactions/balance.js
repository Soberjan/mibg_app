export function balanceOwnerName(balance) {
    let ownerName = null;
    if (balance.type === "gov")
        ownerName = "Государство";
    else if (balance.type === "personal")
        ownerName = state.players[balance.ownerId].name;
    return ownerName;
}
