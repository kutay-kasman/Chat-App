async function fetchRooms() {
    try {
        const response = await fetch('/rooms');
        const rooms = await response.json();
        const roomsList = document.getElementById("rooms-list-ul");
        
        
        // Check if rooms exist and map over them
        roomsList.innerHTML = rooms.length 
            ? rooms.map((room) => {
                // Make sure to return the <li> element
                return room.userNum ? `<li>${room.roomName} - ${room.userNum}</li>` : '';
            }).join('') 
            : "<li>No active rooms</li>";
    } catch (error) {
        console.error("Error fetching rooms:", error);
    }
}

fetchRooms();
