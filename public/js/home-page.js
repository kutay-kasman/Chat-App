async function fetchRooms() {
    try {
        const response = await fetch('/rooms');
        const rooms = await response.json();
        const roomsList = document.getElementById("rooms-list-ul");
        
        // Create the header
        const header = `<li><strong>Room</strong> | <strong>Users</strong></li>`;
        
        // Check if rooms exist and map over them
        roomsList.innerHTML = rooms.length 
            ? header + rooms.map((room) => {
                // Ensure both roomName and userNum are available
                return room.roomName && room.userNum ? 
                    `<li id="home-page-room-list"><div id="room">${room.roomName}</div><div id="users">${room.userNum}</li></div>
                    ` : '';
            }).join('') 
            : "<li>No active rooms</li>";
    } catch (error) {
        console.error("Error fetching rooms:", error);
    }
}

fetchRooms();
