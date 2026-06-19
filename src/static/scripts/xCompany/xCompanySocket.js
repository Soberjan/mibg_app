import { state } from "../state.js";
import { addXCompanyBranchToAssets } from "./xCompanyUI.js";
import { balanceOwnerName } from "../transactions/balance.js";

export function branchOwnerChangedSocket(res) {
    const branch = {id: res.branch.id, ownerId: res.branch.owner_id, lobbyId: res.branch.lobby_id, name: res.branch.name};
    console.log("changed bracnh owner fuck shit");
    console.log(state);
    console.log(branch);

    if (state.players[state.localPlayerId].role === "politician") {
        const branchOwner = document.getElementById(`${branch.id}Owner`);
        const branchOwnerName = balanceOwnerName(state.balances[branch.ownerId]);
        branchOwner.textContent = `${branchOwnerName}`;
    }

    if (state.branches[branch.id].ownerId === state.personalBalanceId) {
        const xCompany = document.getElementById("xCompanyAssets");
        const branchDiv = document.getElementById(`branch${branch.id}Assets`);

        xCompany.removeChild(branchDiv);
    }

    if (branch.ownerId === state.personalBalanceId)
        addXCompanyBranchToAssets(branch);
    if (branch.ownerId === state.localPlayerId)
        console.log("niger shit should add this fucker");

    state.branches[branch.id].ownerId = branch.ownerId;
}
