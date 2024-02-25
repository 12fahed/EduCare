const io = require('socket.io')();
// Your socket.io server logic here

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const roomName = getParameterByName('name');

if (roomName) {
    document.write(`<p>This is the room for ${roomName}.</p>`);
    document.getElementById('discussion').innerHTML = `<h3>Discussion for ${roomName}</h3><p>Discuss your topics here.</p>`;
} else {
    document.write('<p>Error: Room name not found in the URL.</p>');
}