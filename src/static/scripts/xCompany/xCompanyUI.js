import { state } from "../state.js";
import { changeBranchOwner } from "./xCompany.js";
import { balanceOwnerName } from "../transactions/balance.js";

export function addXCompanyBranchToManagment(branch) {
    const xCompany = document.getElementById("xCompanyManagment");

    const branchDiv = document.createElement('div');
    branchDiv.id = `branch${branch.id}Managment`;
    branchDiv.classList.add("xCompanyBranch");
    const branchName = document.createElement('div');
    branchName.textContent = branch.name;
    branchName.classList.add("branchAsset");
    const branchOwnerText = document.createElement('div');
    branchOwnerText.textContent = "Владелец";
    branchOwnerText.classList.add("branchOwnerLabel");
    const branchOwner = document.createElement('div');
    branchOwner.id = `${branch.id}Owner`;
    branchOwner.classList.add("branchOwnerName");
    const branchOwnerName = balanceOwnerName(state.balances[branch.ownerId]);
    branchOwner.textContent = `${branchOwnerName}`;

    const ownerSelector = document.createElement("select");
    ownerSelector.id = `branch${branch.id}OwnerSelector`;
    for (const balance of Object.values(state.balances)) {
        let ownerName = balanceOwnerName(balance);
        if (ownerName === null)
            continue;

        const option = document.createElement("option");
        option.id = `branch${branch.id}Owner${balance.id}Option`;
        option.value = balance.id;
        option.textContent = ownerName;
        ownerSelector.appendChild(option);
    }

    const changeOwnerButton = document.createElement("button");
    changeOwnerButton.id = `changeBranch${branch.id}OwnerButton`;
    changeOwnerButton.textContent = "Изменить владельца";
    changeOwnerButton.onclick = () => changeBranchOwner(branch.id);

    const branchInfo = document.createElement("div");
    branchInfo.classList.add("branchInfo");

    branchInfo.appendChild(branchName);
    branchInfo.appendChild(branchOwnerText);
    branchInfo.appendChild(branchOwner);

    branchDiv.appendChild(branchInfo);
    branchDiv.appendChild(ownerSelector);
    branchDiv.appendChild(changeOwnerButton);

    xCompany.appendChild(branchDiv);
}

export function addXCompanyBranchToAssets(branch) {
    if (branch.ownerId != state.personalBalanceId)
        return;

    const xCompany = document.getElementById("xCompanyAssets");

    const branchDiv = document.createElement('div');
    branchDiv.id = `branch${branch.id}Assets`;
    branchDiv.classList.add("propertyAssetCard");
    const branchName = document.createElement('div');
    branchName.textContent = branch.name;

    branchDiv.appendChild(branchName);

    xCompany.appendChild(branchDiv);
}

export function initXManagmentUI() {
    for (const branch of Object.values(state.branches))
        addXCompanyBranchToManagment(branch);
}

export function initXAssetsUI() {
    for (const branch of Object.values(state.branches))
        addXCompanyBranchToAssets(branch);
}
