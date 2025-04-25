let profiles = [];
let currentProfileIndex = 0;
let chatRooms = [];
let messagesByRoom = {};
let currentRoomId = null;

window.onload = function() {
    const savedProfiles = localStorage.getItem("profiles");
    try {
        profiles = savedProfiles ? JSON.parse(savedProfiles) : [];
        if (profiles.length === 0) {
            document.getElementById("noProfileSection").style.display = "flex";
            document.getElementById("chatListSection").style.display = "none";
            document.getElementById("chatRoomSection").style.display = "none";
        } else {
            currentProfileIndex = 0;
            document.getElementById("noProfileSection").style.display = "none";
            document.getElementById("chatListSection").style.display = "block";
            document.getElementById("chatRoomSection").style.display = "none";
            loadChatRooms();
            renderChatRoomList();
            updateDogChatSection();
        }
    } catch (e) {
        console.error("Failed to parse profiles:", e);
        window.location.href = "MYP001.html";
    }
};

function sanitizeInput(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}

function updateDogChatSection() {
    const profile = profiles[currentProfileIndex];
    if (profile) {
        document.getElementById("dogChatName").textContent = `${profile.dogName}와 대화`;
    }
}

function loadChatRooms() {
    chatRooms = JSON.parse(localStorage.getItem("chatRooms") || "[]");
    messagesByRoom = JSON.parse(localStorage.getItem("messagesByRoom") || "{}");
    // 예시: 채팅방 없으면 기본방 추가
    if (chatRooms.length === 0) {
        chatRooms = [
            { id: 1, name: "홍길동", lastMsg: "잘지구있냐용용", unread: 2, lastTime: "오후 4:32" },
            { id: 2, name: "[ 서울 ] 클밍성지 정규방", lastMsg: "성지 오늘 입월하나", unread: 0, lastTime: "오후 4:19" }
        ];
        localStorage.setItem("chatRooms", JSON.stringify(chatRooms));
    }
    chatRooms.forEach(room => {
        if (!messagesByRoom[room.id]) messagesByRoom[room.id] = [];
    });
    // 반려견 채팅방 메시지 초기화
    if (!messagesByRoom["dogChat"]) messagesByRoom["dogChat"] = [];
    localStorage.setItem("messagesByRoom", JSON.stringify(messagesByRoom));
}

function renderChatRoomList() {
    const list = document.getElementById("chatRoomList");
    list.innerHTML = "";
    chatRooms.forEach(room => {
        const div = document.createElement("div");
        div.className = "chat-room-list-item";
        div.onclick = () => openChatRoom(room.id);
        div.innerHTML = `
            <div class="chat-room-avatar"></div>
            <div class="chat-room-info">
                <div class="chat-room-name">${room.name}</div>
                <div class="chat-room-lastmsg">${room.lastMsg || ""}</div>
            </div>
            <div class="chat-room-meta">
                <div class="chat-room-time">${room.lastTime || ""}</div>
                ${room.unread > 0 ? `<span class="chat-room-unread">${room.unread}</span>` : ""}
            </div>
        `;
        list.appendChild(div);
    });
}

function openChatRoom(roomId) {
    currentRoomId = roomId;
    const room = chatRooms.find(r => r.id === roomId);
    document.getElementById("chatListSection").style.display = "none";
    document.getElementById("chatRoomSection").style.display = "flex";
    document.getElementById("chatRoomTitle").textContent = room ? room.name : "";
    renderMessages();
    setTimeout(() => {
        document.getElementById("chatList").scrollTop = document.getElementById("chatList").scrollHeight;
    }, 10);
}

function openDogChat() {
    currentRoomId = "dogChat";
    const profile = profiles[currentProfileIndex];
    document.getElementById("chatListSection").style.display = "none";
    document.getElementById("chatRoomSection").style.display = "flex";
    document.getElementById("chatRoomTitle").textContent = profile ? profile.dogName : "반려견";
    renderMessages();
    setTimeout(() => {
        document.getElementById("chatList").scrollTop = document.getElementById("chatList").scrollHeight;
    }, 10);
}

function goToChatList() {
    document.getElementById("chatListSection").style.display = "block";
    document.getElementById("chatRoomSection").style.display = "none";
    currentRoomId = null;
    renderChatRoomList();
    updateDogChatSection();
}

function renderMessages() {
    const chatList = document.getElementById("chatList");
    chatList.innerHTML = "";
    const msgs = messagesByRoom[currentRoomId] || [];
    const myProfile = profiles[currentProfileIndex];
    if (msgs.length === 0) {
        chatList.innerHTML = "<div style='color:#888'>메시지가 없습니다.</div>";
        return;
    }
    msgs.forEach(msg => {
        const item = document.createElement("div");
        item.classList.add("message-item");
        if (msg.authorId === myProfile.id) {
            item.classList.add("own");
        } else if (msg.authorId === "dog") {
            item.classList.add("dog");
        }
        item.innerHTML = `
            <div class="message-author">${msg.author}</div>
            <div class="message-text">${msg.text}</div>
            <div class="message-timestamp">${new Date(msg.timestamp).toLocaleString()}</div>
        `;
        chatList.appendChild(item);
    });
}

function sendMessage(event) {
    event.preventDefault();
    if (!currentRoomId) return;
    const messageInput = document.getElementById("messageInput");
    const messageText = sanitizeInput(messageInput.value.trim());
    if (!messageText) return;
    const profileData = profiles[currentProfileIndex];
    const newMessage = {
        id: Date.now(),
        author: `${profileData.dogName} (${profileData.ownerNickname})`,
        authorId: profileData.id,
        text: messageText,
        timestamp: new Date().toISOString()
    };
    if (!messagesByRoom[currentRoomId]) messagesByRoom[currentRoomId] = [];
    messagesByRoom[currentRoomId].push(newMessage);
    
    // 반려견 채팅방일 경우 더미 응답 추가 (AI 구현 전 임시)
    if (currentRoomId === "dogChat") {
        const dogResponse = {
            id: Date.now() + 1,
            author: profileData.dogName,
            authorId: "dog",
            text: "멍멍! 나 지금 꼬리 흔들고 있어!",
            timestamp: new Date().toISOString()
        };
        messagesByRoom[currentRoomId].push(dogResponse);
    }
    
    // 마지막 메시지, 시간, 미확인 갱신
    if (currentRoomId !== "dogChat") {
        const room = chatRooms.find(r => r.id === currentRoomId);
        if (room) {
            room.lastMsg = messageText;
            room.lastTime = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
            room.unread = 0;
        }
        localStorage.setItem("chatRooms", JSON.stringify(chatRooms));
    }
    localStorage.setItem("messagesByRoom", JSON.stringify(messagesByRoom));
    renderMessages();
    messageInput.value = "";
    setTimeout(() => {
        document.getElementById("chatList").scrollTop = document.getElementById("chatList").scrollHeight;
    }, 10);
}