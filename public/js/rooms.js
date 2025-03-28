let selectedRoom = null;
let selectedRoomPassword = null;

// Handle room type selection
document.querySelector('.room-type-selector').addEventListener('change', (e) => {
    const passwordField = document.getElementById('password-field');
    if (e.target.value === 'private') {
        passwordField.classList.remove('hidden');
        document.getElementById('room-password').required = true;
    } else {
        passwordField.classList.add('hidden');
        document.getElementById('room-password').required = false;
    }
});

// Handle room creation
document.getElementById('room-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const roomName = document.getElementById('room').value;
    const isPrivate = document.querySelector('input[name="roomType"]:checked').value === 'private';
    const password = isPrivate ? document.getElementById('room-password').value : null;
    const username = document.getElementById('username').value;

    try {
        const response = await fetch('/create-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomName,
                isPrivate,
                password
            })
        });

        if (response.ok) {
            // Include password in URL only when creating a private room
            const redirectUrl = isPrivate 
                ? `./chat.html?username=${encodeURIComponent(username)}&room=${encodeURIComponent(roomName)}&password=${encodeURIComponent(password)}`
                : `./chat.html?username=${encodeURIComponent(username)}&room=${encodeURIComponent(roomName)}`;
            window.location.href = redirectUrl;
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to create room');
        }
    } catch (error) {
        console.error('Error creating room:', error);
        alert('Failed to create room');
    }
});

// Handle password modal
const passwordModal = document.getElementById('password-modal');
const passwordForm = document.getElementById('password-form');
const cancelPasswordBtn = document.getElementById('cancel-password');

function showPasswordModal() {
    passwordModal.classList.remove('hidden');
}

function hidePasswordModal() {
    passwordModal.classList.add('hidden');
    selectedRoom = null;
    selectedRoomPassword = null;
}

cancelPasswordBtn.addEventListener('click', hidePasswordModal);

passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const enteredPassword = document.getElementById('modal-password').value;
    const username = document.getElementById('username').value;

    try {
        const response = await fetch('/verify-room-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomName: selectedRoom,
                password: enteredPassword
            })
        });

        const result = await response.json();

        if (response.ok && result.valid) {
            window.location.href = `./chat.html?username=${encodeURIComponent(username)}&room=${encodeURIComponent(selectedRoom)}&password=${encodeURIComponent(enteredPassword)}`;
        } else {
            alert(result.message || 'Incorrect password');
        }
    } catch (error) {
        console.error('Error verifying password:', error);
        alert('Failed to verify password');
    }
});

async function fetchRooms() {
    try {
        const response = await fetch('/rooms');
        const rooms = await response.json();
        const roomsList = document.getElementById("rooms-list-ul");
        
        // Create the header
        const header = `<li class="header">
            <div>Room Name</div>
            <div>Status</div>
            <div>Users</div>
        </li>`;
        
        // Check if rooms exist and map over them
        roomsList.innerHTML = rooms.length 
            ? header + rooms.map((room) => {
                return room.roomName && room.userNum ? 
                    `<li data-room="${room.roomName}" data-private="${room.isPrivate}">
                        <div class="room-info">
                            <div class="room-details">
                                <span class="room-name">${room.roomName}</span>
                                <span class="room-status ${room.isPrivate ? 'private' : 'public'}">
                                    ${room.isPrivate ? 'Private' : 'Public'}
                                </span>
                            </div>
                        </div>
                        <div class="room-users">${room.userNum} users</div>
                    </li>` : '';
            }).join('') 
            : "<li>No active rooms</li>";

        // Add click handlers to room items
        const roomItems = roomsList.querySelectorAll('li[data-room]');
        roomItems.forEach(item => {
            item.addEventListener('click', async () => {
                const roomName = item.dataset.room;
                const isPrivate = item.dataset.private === 'true';
                const username = document.getElementById('username').value;

                if (isPrivate) {
                    selectedRoom = roomName;
                    showPasswordModal();
                } else {
                    window.location.href = `./chat.html?username=${encodeURIComponent(username)}&room=${encodeURIComponent(roomName)}`;
                }
            });
        });
    } catch (error) {
        console.error("Error fetching rooms:", error);
        document.getElementById("rooms-list-ul").innerHTML = "<li>Error loading rooms</li>";
    }
}

// Initial fetch
fetchRooms();

// Refresh rooms list every 10 seconds
setInterval(fetchRooms, 10000); 