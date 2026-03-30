export function add_voting_option(player) {
    const container = document.getElementById("voting_options");

    const option = document.createElement("option");
    option.value = player.id;
    option.textContent = player.name;

    container.appendChild(option);
}
