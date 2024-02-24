function displayPopup(message) {
    var popup = document.getElementById("popup");
    var popupMessage = document.getElementById("popup-message");
    popupMessage.innerText = message;
    popup.style.display = "block";
}

// Function to close the pop-up
function closePopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "none";
}