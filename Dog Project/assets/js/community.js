let profiles = [];
let currentProfileIndex = 0;
let posts = [];
let selectedBreed = null;
let selectedTopic = null;

window.onload = function() {
    const savedProfiles = localStorage.getItem("profiles");
    if (savedProfiles && JSON.parse(savedProfiles).length > 0) {
        profiles = JSON.parse(savedProfiles);
        currentProfileIndex = 0;
        document.getElementById("noProfileSection").style.display = "none";
        document.getElementById("communitySection").style.display = "flex";
        loadPosts();
    } else {
        document.getElementById("noProfileSection").style.display = "flex";
        document.getElementById("communitySection").style.display = "none";
    }
};

// 게시물 로드
function loadPosts() {
    const savedPosts = localStorage.getItem("posts");
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    } else {
        posts = [];
        localStorage.setItem("posts", JSON.stringify(posts));
    }
    updatePosts();
}

// 게시물 업데이트
function updatePosts() {
    const profileData = profiles[currentProfileIndex];
    const dogBreed = profileData.dogBreed;

    // 전체 탭
    const allPosts = document.getElementById("allPosts");
    allPosts.innerHTML = "";
    document.getElementById("allCount").textContent = `${posts.length}개의 글`;
    if (posts.length === 0) {
        allPosts.innerHTML = "<p>게시물이 없습니다.</p>";
    } else {
        posts.forEach(post => {
            const item = document.createElement("div");
            item.classList.add("post-item");
            item.innerHTML = `
                <a href="CMM003.html?postId=${post.id}">
                    <div class="post-title">${post.title}</div>
                    <div class="post-tag">${post.tag}</div>
                    <div class="post-content">${post.content}</div>
                    <div class="post-stats">
                        <span>❤️ ${post.likes}</span>
                        <span>💬 ${post.comments}</span>
                        <span>👀 ${post.views}</span>
                    </div>
                </a>
            `;
            allPosts.appendChild(item);
        });
    }

    // 견종별 탭
    const breedGrid = document.getElementById("breedGrid");
    breedGrid.innerHTML = "";
    const breeds = [...new Set(posts.map(post => post.breed))];
    const breedCounts = breeds.map(breed => ({
        breed,
        count: posts.filter(post => post.breed === breed).length
    }));
    breedCounts.forEach(breed => {
        const item = document.createElement("div");
        item.textContent = `${breed.breed} (${breed.count}개의 글)`;
        item.onclick = () => {
            selectedBreed = breed.breed;
            updateBreedPosts();
        };
        breedGrid.appendChild(item);
    });

    // 주제별 탭
    const topicGrid = document.getElementById("topicGrid");
    topicGrid.innerHTML = "";
    const topics = [
        { id: "health", name: "건강/질병" },
        { id: "training", name: "훈련/행동" },
        { id: "food", name: "사료/간식" },
        { id: "walk", name: "산책/놀이" },
        { id: "free", name: "자유" }
    ];
    const topicCounts = topics.map(topic => ({
        topic: topic.id,
        name: topic.name,
        count: posts.filter(post => post.topic === topic.id).length
    }));
    topicCounts.forEach(topic => {
        const item = document.createElement("div");
        item.textContent = `${topic.name} (${topic.count}개의 글)`;
        item.onclick = () => {
            selectedTopic = topic.topic;
            updateTopicPosts();
        };
        topicGrid.appendChild(item);
    });

    // 인기글 탭
    updatePopularPosts();
}

// 견종별 게시물 업데이트
function updateBreedPosts() {
    const breedPosts = document.getElementById("breedPosts");
    breedPosts.innerHTML = "";
    if (!selectedBreed) {
        breedPosts.innerHTML = "<p>견종을 선택해주세요.</p>";
        document.getElementById("breedCount").textContent = "0개의 글";
        return;
    }
    const breedFiltered = posts.filter(post => post.breed === selectedBreed);
    document.getElementById("breedCount").textContent = `${breedFiltered.length}개의 글`;
    if (breedFiltered.length === 0) {
        breedPosts.innerHTML = "<p>해당 견종의 게시물이 없습니다.</p>";
    } else {
        breedFiltered.forEach(post => {
            const item = document.createElement("div");
            item.classList.add("post-item");
            item.innerHTML = `
                <a href="CMM003.html?postId=${post.id}">
                    <div class="post-title">${post.title}</div>
                    <div class="post-tag">${post.tag}</div>
                    <div class="post-content">${post.content}</div>
                    <div class="post-stats">
                        <span>❤️ ${post.likes}</span>
                        <span>💬 ${post.comments}</span>
                        <span>👀 ${post.views}</span>
                    </div>
                </a>
            `;
            breedPosts.appendChild(item);
        });
    }
}

// 주제별 게시물 업데이트
function updateTopicPosts() {
    const topicPosts = document.getElementById("topicPosts");
    topicPosts.innerHTML = "";
    if (!selectedTopic) {
        topicPosts.innerHTML = "<p>주제를 선택해주세요.</p>";
        document.getElementById("topicCount").textContent = "0개의 글";
        return;
    }
    const topicFiltered = posts.filter(post => post.topic === selectedTopic);
    document.getElementById("topicCount").textContent = `${topicFiltered.length}개의 글`;
    if (topicFiltered.length === 0) {
        topicPosts.innerHTML = "<p>해당 주제의 게시물이 없습니다.</p>";
    } else {
        topicFiltered.forEach(post => {
            const item = document.createElement("div");
            item.classList.add("post-item");
            item.innerHTML = `
                <a href="CMM003.html?postId=${post.id}">
                    <div class="post-title">${post.title}</div>
                    <div class="post-tag">${post.tag}</div>
                    <div class="post-content">${post.content}</div>
                    <div class="post-stats">
                        <span>❤️ ${post.likes}</span>
                        <span>💬 ${post.comments}</span>
                        <span>👀 ${post.views}</span>
                    </div>
                </a>
            `;
            topicPosts.appendChild(item);
        });
    }
}

// 인기글 탭
function updatePopularPosts() {
    const popularPosts = document.getElementById("popularPosts");
    popularPosts.innerHTML = "";
    const sortedPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 5);
    document.getElementById("popularCount").textContent = `${sortedPosts.length}개의 글`;
    if (sortedPosts.length === 0) {
        popularPosts.innerHTML = "<p>인기 게시물이 없습니다.</p>";
    } else {
        sortedPosts.forEach(post => {
            const item = document.createElement("div");
            item.classList.add("post-item");
            item.innerHTML = `
                <a href="CMM003.html?postId=${post.id}">
                    <div class="post-title">${post.title}</div>
                    <div class="post-tag">${post.tag}</div>
                    <div class="post-content">${post.content}</div>
                    <div class="post-stats">
                        <span>❤️ ${post.likes}</span>
                        <span>💬 ${post.comments}</span>
                        <span>👀 ${post.views}</span>
                    </div>
                </a>
            `;
            popularPosts.appendChild(item);
        });
    }
}

// 탭 전환
function showCommunityTab(tabName) {
    const tabs = document.querySelectorAll(".community-tabs button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => tab.classList.remove("active"));
    tabContents.forEach(content => content.style.display = "none");

    document.querySelector(`.community-tabs button[onclick="showCommunityTab('${tabName}')"]`).classList.add("active");
    document.getElementById(`${tabName}Tab`).style.display = "block";

    if (tabName === "breed" && selectedBreed) {
        updateBreedPosts();
    }
    if (tabName === "topic" && selectedTopic) {
        updateTopicPosts();
    }
    if (tabName === "popular") {
        updatePopularPosts();
    }
}