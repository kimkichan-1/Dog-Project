let profiles = [];
let currentProfileIndex = 0;
let posts = [];
let currentPost = null;
let likedPosts = {};
let currentCommentIndex = null;

window.onload = function() {
    const savedProfiles = localStorage.getItem("profiles");
    if (savedProfiles && JSON.parse(savedProfiles).length > 0) {
        profiles = JSON.parse(savedProfiles);
        currentProfileIndex = 0;
    } else {
        console.log("No profiles found, redirecting to MYP001.html");
        window.location.href = "MYP001.html";
        return;
    }

    const savedPosts = localStorage.getItem("posts");
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    } else {
        console.log("No posts found, redirecting to CMM001.html");
        window.location.href = "CMM001.html";
        return;
    }

    const savedLikes = localStorage.getItem("likedPosts");
    if (savedLikes) {
        likedPosts = JSON.parse(savedLikes);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("postId");

    if (!postId || isNaN(postId)) {
        console.log("Invalid postId, redirecting to CMM001.html");
        window.location.href = "CMM001.html";
        return;
    }

    currentPost = posts.find(post => post.id === parseInt(postId));
    if (currentPost) {
        // 조회수 증가
        currentPost.views += 1;
        localStorage.setItem("posts", JSON.stringify(posts));

        // 게시물 표시
        document.getElementById("postTitle").textContent = currentPost.title;
        document.getElementById("postTag").textContent = currentPost.tag;
        document.getElementById("postContent").textContent = currentPost.content;
        document.getElementById("postLikes").textContent = currentPost.likes;
        document.getElementById("postComments").textContent = currentPost.comments;
        document.getElementById("postViews").textContent = currentPost.views;

        // 작성자 확인 후 수정/삭제 버튼 표시
        const profileData = profiles[currentProfileIndex];
        if (currentPost.authorId === profileData.id) {
            document.getElementById("postActions").style.display = "flex";
        }

        // 좋아요 버튼 상태 업데이트
        updateLikeButton(profileData.id, currentPost.id);

        // 댓글 표시
        updateComments();
    } else {
        window.location.href = "CMM001.html";
    }
};

// XSS 방지를 위한 입력 sanitizing
function sanitizeInput(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}

// 좋아요 토글
function toggleLike() {
    const profileData = profiles[currentProfileIndex];
    const userId = profileData.id;
    const postId = currentPost.id;
    const likeBtn = document.getElementById("likeBtn");

    if (!likedPosts[userId]) {
        likedPosts[userId] = [];
    }

    if (likedPosts[userId].includes(postId)) {
        // 좋아요 취소
        currentPost.likes -= 1;
        likedPosts[userId] = likedPosts[userId].filter(id => id !== postId);
    } else {
        // 좋아요 추가
        currentPost.likes += 1;
        likedPosts[userId].push(postId);
    }

    // 애니메이션 트리거
    likeBtn.classList.add("animate");
    setTimeout(() => likeBtn.classList.remove("animate"), 300);

    // UI 및 저장소 업데이트
    document.getElementById("postLikes").textContent = currentPost.likes;
    localStorage.setItem("posts", JSON.stringify(posts));
    localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
    updateLikeButton(userId, postId);
}

// 좋아요 버튼 상태 업데이트
function updateLikeButton(userId, postId) {
    const likeBtn = document.getElementById("likeBtn");
    const isLiked = likedPosts[userId] && likedPosts[userId].includes(postId);
    likeBtn.textContent = isLiked ? "좋아요 취소 ❤️" : "좋아요 ❤️";
    likeBtn.classList.toggle("liked", isLiked);
}

// 댓글 추가
function addComment(event) {
    event.preventDefault();
    const commentInput = document.getElementById("commentInput");
    const commentText = sanitizeInput(commentInput.value.trim());
    const commentForm = document.getElementById("commentForm");
    const submitBtn = document.getElementById("commentSubmitBtn");

    if (commentText) {
        const profileData = profiles[currentProfileIndex];
        const newComment = {
            author: `${profileData.dogName} (${profileData.ownerNickname})`,
            authorId: profileData.id,
            text: commentText,
            timestamp: new Date().toISOString()
        };
        if (!currentPost.commentList) {
            currentPost.commentList = [];
        }
        currentPost.commentList.push(newComment);
        currentPost.comments = currentPost.commentList.length;
        document.getElementById("postComments").textContent = currentPost.comments;
        localStorage.setItem("posts", JSON.stringify(posts));
        updateComments();
        commentInput.value = "";
        commentForm.onsubmit = addComment; // 폼 리셋
        submitBtn.textContent = "작성";
    }
}

// 댓글 수정
function editComment(index) {
    const comment = currentPost.commentList[index];
    const commentInput = document.getElementById("commentInput");
    const commentForm = document.getElementById("commentForm");
    const submitBtn = document.getElementById("commentSubmitBtn");

    commentInput.value = comment.text;
    submitBtn.textContent = "수정";
    commentForm.onsubmit = function(event) {
        event.preventDefault();
        const newText = sanitizeInput(commentInput.value.trim());
        if (newText) {
            currentPost.commentList[index].text = newText;
            currentPost.commentList[index].timestamp = new Date().toISOString();
            localStorage.setItem("posts", JSON.stringify(posts));
            updateComments();
            commentInput.value = "";
            commentForm.onsubmit = addComment;
            submitBtn.textContent = "작성";
        }
    };
}

// 댓글 삭제 모달 열기
function openDeleteCommentPopup(index) {
    currentCommentIndex = index;
    document.getElementById("deleteCommentPopup").style.display = "flex";
}

// 댓글 삭제 모달 닫기
function closeDeleteCommentPopup() {
    document.getElementById("deleteCommentPopup").style.display = "none";
    currentCommentIndex = null;
}

// 댓글 삭제 확인
function confirmDeleteComment() {
    if (currentCommentIndex !== null) {
        currentPost.commentList.splice(currentCommentIndex, 1);
        currentPost.comments = currentPost.commentList.length;
        document.getElementById("postComments").textContent = currentPost.comments;
        localStorage.setItem("posts", JSON.stringify(posts));
        updateComments();
    }
    closeDeleteCommentPopup();
}

// 댓글 업데이트
function updateComments() {
    const commentsList = document.getElementById("commentsList");
    commentsList.innerHTML = "";
    const profileData = profiles[currentProfileIndex];

    if (!currentPost.commentList || currentPost.commentList.length === 0) {
        commentsList.innerHTML = "<p>댓글이 없습니다.</p>";
    } else {
        currentPost.commentList.forEach((comment, index) => {
            const item = document.createElement("div");
            item.classList.add("comment-item");
            item.innerHTML = `
                <strong>${comment.author}</strong>: ${comment.text}
                <div style="font-size: 12px; color: #666;">${new Date(comment.timestamp).toLocaleString()}</div>
                ${comment.authorId === profileData.id ? `
                    <div class="comment-actions">
                        <button class="edit-btn" onclick="editComment(${index})">수정</button>
                        <button class="delete-btn" onclick="openDeleteCommentPopup(${index})">삭제</button>
                    </div>
                ` : ''}
            `;
            commentsList.appendChild(item);
        });
    }
}

// 게시물 수정
function editPost() {
    // CMM002.html로 이동하며 postId와 editMode 전달
    window.location.href = `CMM002.html?postId=${currentPost.id}&editMode=true`;
}

// 게시물 삭제 모달 열기
function openDeletePostPopup() {
    document.getElementById("deletePostPopup").style.display = "flex";
}

// 게시물 삭제 모달 닫기
function closeDeletePostPopup() {
    document.getElementById("deletePostPopup").style.display = "none";
}

// 게시물 삭제 확인
function confirmDeletePost() {
    const postIndex = posts.findIndex(post => post.id === currentPost.id);
    posts.splice(postIndex, 1);
    localStorage.setItem("posts", JSON.stringify(posts));
    window.location.href = "CMM001.html";
    closeDeletePostPopup();
}