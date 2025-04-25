let profiles = [];
let currentProfileIndex = 0;
let posts = [];
let editMode = false;
let editPostId = null;

window.onload = function() {
    const savedProfiles = localStorage.getItem("profiles");
    if (savedProfiles && JSON.parse(savedProfiles).length > 0) {
        profiles = JSON.parse(savedProfiles);
        currentProfileIndex = 0;
    } else {
        window.location.href = "MYP001.html";
        return;
    }

    const savedPosts = localStorage.getItem("posts");
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    }

    // URL 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    editMode = urlParams.get("editMode") === "true";
    editPostId = parseInt(urlParams.get("postId"));

    if (editMode && editPostId) {
        // 수정 모드일 경우 제목 변경 및 폼 데이터 채우기
        document.getElementById("pageTitle").textContent = "게시물 수정";
        const post = posts.find(p => p.id === editPostId);
        if (post) {
            document.getElementById("postTitle").value = post.title;
            document.getElementById("postTag").value = post.tag.split(" • ")[1] || "";
            document.getElementById("postTopic").value = post.topic;
            document.getElementById("postContent").value = post.content;
        } else {
            window.location.href = "CMM001.html"; // 게시물 없으면 리다이렉트
        }
    }
};

function savePost(event) {
    event.preventDefault();

    const title = document.getElementById("postTitle").value;
    const tag = document.getElementById("postTag").value;
    const topic = document.getElementById("postTopic").value;
    const content = document.getElementById("postContent").value;

    const profileData = profiles[currentProfileIndex];

    if (editMode && editPostId) {
        // 수정 모드: 기존 게시물 업데이트
        const postIndex = posts.findIndex(p => p.id === editPostId);
        if (postIndex !== -1) {
            posts[postIndex].title = title;
            posts[postIndex].tag = `${profileData.dogName} (${profileData.ownerNickname}) • ${tag}`;
            posts[postIndex].content = content;
            posts[postIndex].topic = topic;
            localStorage.setItem("posts", JSON.stringify(posts));
        }
        window.location.href = `CMM003.html?postId=${editPostId}`; // 수정 후 원래 게시물 페이지로 이동
    } else {
        // 새 게시물 작성
        const newPost = {
            id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
            title: title,
            tag: `${profileData.dogName} (${profileData.ownerNickname}) • ${tag}`,
            content: content,
            topic: topic,
            breed: profileData.dogBreed,
            author: profileData.dogName,
            authorId: profileData.id,
            likes: 0,
            comments: 0,
            views: 0,
            commentList: []
        };
        posts.push(newPost);
        localStorage.setItem("posts", JSON.stringify(posts));
        window.location.href = "CMM001.html";
    }
}