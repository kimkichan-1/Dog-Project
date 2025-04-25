// assets/js/home.js
let profiles = [];
let currentProfileIndex = 0;
let records = [];
let walkCount = 0;
let missions = {
    mission1: { title: "새로운 냄새를 맡아보게 해주세요!", description: "산책 중 새로운 장소를 탐험해보세요.", completed: null },
    mission2: { title: "친구와 놀게 해주세요!", description: "다른 강아지와 함께 놀 수 있는 시간을 가져보세요.", completed: null }
};

window.onload = function() {
    const savedProfiles = localStorage.getItem("profiles");
    if (savedProfiles && JSON.parse(savedProfiles).length > 0) { // 프로필이 존재하는 경우
        profiles = JSON.parse(savedProfiles);
        currentProfileIndex = 0;
        document.getElementById("noProfileSection").style.display = "none";
        document.getElementById("homeSection").style.display = "flex";
        updateDailyHeader();
        startBannerSlide();
        loadRecords();
    } else { // 프로필이 없는 경우
        document.getElementById("noProfileSection").style.display = "flex";
        document.getElementById("homeSection").style.display = "none";
    }
};

function updateDailyHeader() {
    if (profiles.length === 0) return;
    const profileData = profiles[currentProfileIndex];
    document.getElementById("dogDailyTitle").textContent = `${profileData.dogName}의 하루`;
}

// 이벤트 배너 슬라이드
let currentSlide = 0;
const slides = document.querySelectorAll(".banner-slide");
const indicators = document.querySelectorAll(".indicator");

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    indicators.forEach(indicator => indicator.classList.remove("active"));
    slides[index].classList.add("active");
    indicators[index].classList.add("active");
    currentSlide = index;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

function startBannerSlide() {
    setInterval(nextSlide, 5000);
}

document.querySelector(".banner-next").addEventListener("click", nextSlide);
document.querySelector(".banner-prev").addEventListener("click", prevSlide);
indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => showSlide(index));
});

// 기록하기 팝업 열기
function openRecordPopup(index = null) {
    const popup = document.getElementById("recordPopup");
    const recordIndexInput = document.getElementById("recordIndex");
    const activityTypeSelect = document.getElementById("activityType");
    const activityTimeInput = document.getElementById("activityTime");

    if (index !== null) {
        const record = records[index];
        activityTypeSelect.value = record.type;
        activityTimeInput.value = record.time;
        recordIndexInput.value = index;
    } else {
        activityTypeSelect.value = "";
        activityTimeInput.value = "";
        recordIndexInput.value = "";
    }

    popup.style.display = "flex";
}

// 기록하기 팝업 닫기
function closeRecordPopup() {
    const popup = document.getElementById("recordPopup");
    popup.style.display = "none";
    document.getElementById("activityType").value = "";
    document.getElementById("activityTime").value = "";
    document.getElementById("recordIndex").value = "";
}

// 기록 저장
function saveRecord(event) {
    event.preventDefault();

    const activityType = document.getElementById("activityType").value;
    const activityTime = document.getElementById("activityTime").value;
    const recordIndex = document.getElementById("recordIndex").value;

    const activityMap = {
        morningMeal: { name: "아침식사", icon: "🍽️", color: "#ffeb3b" },
        morningWalk: { name: "아침산책", icon: "🌞", color: "#4caf50" },
        lunchMeal: { name: "점심식사", icon: "🍽️", color: "#ffeb3b" },
        lunchWalk: { name: "점심산책", icon: "🌞", color: "#4caf50" },
        dinnerMeal: { name: "저녁식사", icon: "🍽️", color: "#ffeb3b" },
        dinnerWalk: { name: "저녁산책", icon: "🌙", color: "#4caf50" },
        water: { name: "물 마시기", icon: "💧", color: "#2196f3" },
        snack: { name: "간식 타임", icon: "🍖", color: "#ff6f61" },
        sleep: { name: "취침 시간", icon: "🌙", color: "#9c27b0" }
    };

    const record = {
        type: activityType,
        name: activityMap[activityType].name,
        icon: activityMap[activityType].icon,
        color: activityMap[activityType].color,
        time: activityTime
    };

    if (recordIndex !== "") {
        const isWalk = records[recordIndex].type.includes("Walk");
        records[recordIndex] = record;
        if (isWalk && !activityType.includes("Walk")) {
            walkCount--;
        } else if (!isWalk && activityType.includes("Walk")) {
            walkCount++;
        }
    } else {
        records.push(record);
        if (activityType.includes("Walk")) {
            walkCount++;
        }
    }

    records.sort((a, b) => a.time.localeCompare(b.time));
    localStorage.setItem("records", JSON.stringify(records));
    updateTimeline();
    updateWalkCount();
    closeRecordPopup();
}

// 기록 삭제
function deleteRecord(index) {
    const record = records[index];
    if (record.type.includes("Walk")) {
        walkCount--;
    }
    records.splice(index, 1);
    localStorage.setItem("records", JSON.stringify(records));
    updateTimeline();
    updateWalkCount();
}

// 기록 로드
function loadRecords() {
    const savedRecords = localStorage.getItem("records");
    if (savedRecords) {
        records = JSON.parse(savedRecords);
        walkCount = records.filter(record => record.type.includes("Walk")).length;
        updateTimeline();
        updateWalkCount();
    }
}

// 타임라인 업데이트
function updateTimeline() {
    const timeline = document.getElementById("timeline");
    timeline.innerHTML = "";
    records.forEach((record, index) => {
        const item = document.createElement("div");
        item.classList.add("timeline-item");
        item.innerHTML = `
            <span class="timeline-icon" style="color: ${record.color}">${record.icon}</span>
            <div class="timeline-info">
                <span>${record.name}</span>
            </div>
            <span class="timeline-time">${record.time}</span>
            <div class="timeline-actions">
                <button class="edit" onclick="openRecordPopup(${index})">수정</button>
                <button class="delete" onclick="deleteRecord(${index})">삭제</button>
            </div>
        `;
        timeline.appendChild(item);
    });
}

// 산책 횟수 업데이트
function updateWalkCount() {
    document.getElementById("walkCount").textContent = `${walkCount}회`;
}

// 탭 전환
function showDailyTab(tabName) {
    const tabs = document.querySelectorAll(".daily-tabs button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => tab.classList.remove("active"));
    tabContents.forEach(content => content.style.display = "none");

    document.querySelector(`.daily-tabs button[onclick="showDailyTab('${tabName}')"]`).classList.add("active");
    document.getElementById(`${tabName}Tab`).style.display = "block";
}

// 미션 팝업 열기
function openMissionPopup(missionId) {
    const popup = document.getElementById("missionPopup");
    const title = document.getElementById("missionTitle");
    const description = document.getElementById("missionDescription");

    title.textContent = missions[missionId].title;
    description.textContent = missions[missionId].description;
    popup.style.display = "flex";
}

// 미션 팝업 닫기
function closeMissionPopup() {
    const popup = document.getElementById("missionPopup");
    popup.style.display = "none";
}

// 미션 완료 처리
function completeMission(success) {
    const missionId = document.getElementById("missionTitle").textContent === missions.mission1.title ? "mission1" : "mission2";
    missions[missionId].completed = success;
    localStorage.setItem("missions", JSON.stringify(missions));
    closeMissionPopup();
}