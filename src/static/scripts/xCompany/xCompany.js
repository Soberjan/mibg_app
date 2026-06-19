export async function changeBranchOwner(branchId) {
    const ownerSelector = document.getElementById(`branch${branchId}OwnerSelector`);
    const ownerId = ownerSelector.value;

    var response = await fetch(
        `/lobby/${state.lobbyId}/change_branch_owner?new_owner_id=${ownerId}&branch_id=${branchId}`,
        {
            method: "POST"
        }
    );
    var res = await response.json();
}
