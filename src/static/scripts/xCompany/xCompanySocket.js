import { state } from "../state.js";
import { addXCompanyBranchToAssets } from "./xCompanyUI.js";
import { balanceOwnerName } from "../transactions/balance.js";

export function branchOwnerChangedSocket(res) {
    const branch = {id: res.branch.id, ownerId: res.branch.owner_id, lobbyId: res.branch.lobby_id, name: res.branch.name};

    if (state.players[state.localPlayerId].role === "politician") {
        const branchOwner = document.getElementById(`${branch.id}Owner`);
        const branchOwnerName = balanceOwnerName(state.balances[branch.ownerId]);
        branchOwner.textContent = `${branchOwnerName}`;
    }

    if (state.branches[branch.id].ownerId === state.localPlayerId) {
        const xCompany = document.getElementById("xCompanyAssets");
        const branchDiv = document.getElementById(`branch${branch.id}Assets`);

        xCompany.removeChild(branchDiv);
    }

    if (branch.ownerId === state.localPlayerId)
        addXCompanyBranchToAssets(branch);

    state.branches[branch.id].ownerId = branch.ownerId;
}
