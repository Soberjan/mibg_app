export function hideMenu() {
    const assetsMenu = document.getElementById("assets");
    const obligationsMenu = document.getElementById("obligations");
    const messagesMenu = document.getElementById("messenger");
    const financesMenu = document.getElementById("finances");
    const managmentMenu = document.getElementById("managment");
    assetsMenu.classList.add("hidden");
    obligationsMenu.classList.add("hidden");
    messagesMenu.classList.add("hidden");
    financesMenu.classList.add("hidden");
    managmentMenu.classList.add("hidden");
}
