let profiles = [];
let currentProfileIndex = 0;

window.onload = function() {
    const savedProfiles = localStorage.getItem("profiles");
    if (savedProfiles) {
        profiles = JSON.parse(savedProfiles);
        currentProfileIndex = 0;
        if (profiles.length > 0) {
            document.getElementById("signupSection").style.display = "none";
            document.getElementById("profileSection").style.display = "block";
            displayProfile();
        } else {
            document.getElementById("signupSection").style.display = "block";
            document.getElementById("profileSection").style.display = "none";
        }
    } else {
        document.getElementById("signupSection").style.display = "block";
        document.getElementById("profileSection").style.display = "none";
    }
};

function signup(event) {
    event.preventDefault();

    const dogName = document.getElementById("dog-name").value;
    const dogGender = document.getElementById("dog-gender").value;
    const dogBirthdate = document.getElementById("dog-birthdate").value;
    const dogBreed = document.getElementById("dog-breed").value;
    const dogWeight = document.getElementById("dog-weight").value || null;
    const dogSize = document.getElementById("dog-size").value || null;
    const personality = Array.from(document.querySelectorAll('input[name="personality"]:checked')).map(checkbox => checkbox.value);
    const likes = Array.from(document.querySelectorAll('input[name="likes"]:checked')).map(checkbox => checkbox.value);
    const dislikes = Array.from(document.querySelectorAll('input[name="dislikes"]:checked')).map(checkbox => checkbox.value);
    const dogProfileImage = document.getElementById("dog-profile").files[0] ? URL.createObjectURL(document.getElementById("dog-profile").files[0]) : null;
    const dogIllustration = document.getElementById("dog-illustration").value || null;
    const health = Array.from(document.querySelectorAll('input[name="health"]:checked')).map(checkbox => checkbox.value);
    const dogActivity = document.getElementById("dog-activity").value || null;
    const ownerNickname = document.getElementById("owner-nickname").value;
    const ownerRegion = document.getElementById("owner-region").value || null;
    const ownerPhone = document.getElementById("owner-phone").value || null;
    const ownerExperience = document.getElementById("owner-experience").value || null;

    const newProfile = {
        id: profiles.length > 0 ? Math.max(...profiles.map(p => p.id)) + 1 : 1,
        dogName,
        dogGender,
        dogBirthdate,
        dogBreed,
        dogWeight,
        dogSize,
        personality,
        likes,
        dislikes,
        dogProfileImage,
        dogIllustration,
        health,
        dogActivity,
        ownerNickname,
        ownerRegion,
        ownerPhone,
        ownerExperience,
        healthRecords: {
            vaccination: { hospital: null, date: null },
            heartworm: { hospital: null, date: null },
            checkup: { hospital: null, date: null }
        },
        footprints: []
    };

    profiles.push(newProfile);
    localStorage.setItem("profiles", JSON.stringify(profiles));
    currentProfileIndex = profiles.length - 1;

    document.getElementById("signupSection").style.display = "none";
    document.getElementById("profileSection").style.display = "block";
    displayProfile();

    return false;
}

// 프로필 배너 렌더링 함수
function renderProfileBanner() {
    const banner = document.getElementById("profileBanner");
    if (!banner) return;
    banner.innerHTML = "";

    profiles.forEach((profile, idx) => {
        const btn = document.createElement("button");
        btn.textContent = profile.dogName || `프로필${idx+1}`;
        btn.className = idx === currentProfileIndex ? "active" : "";
        btn.onclick = function() {
            currentProfileIndex = idx;
            displayProfile();
        };
        banner.appendChild(btn);
    });
}

function displayProfile() {
    renderProfileBanner();

    const profile = profiles[currentProfileIndex];
    if (!profile) return;

    // 견종 한국어 매핑
    const breedMap = {
        "pomeranian": "포메라니안",
        "golden-retriever": "골든 리트리버",
        "shiba-inu": "시바 이누",
        "bulldog": "불독",
        "labrador-retriever": "래브라도 리트리버",
        "poodle": "푸들",
        "dachshund": "닥스훈트",
        "beagle": "비글",
        "chihuahua": "치와와",
        "siberian-husky": "시베리안 허스키",
        "yorkshire-terrier": "요크셔 테리어",
        "maltese": "말티즈",
        "border-collie": "보더 콜리",
        "german-shepherd": "저먼 셰퍼드"
    };

    document.getElementById("profileDogName").textContent = `${profile.dogName} (${profile.ownerNickname})`;
    document.getElementById("profileDogDetails").textContent = `${breedMap[profile.dogBreed] || profile.dogBreed} | ${profile.dogGender === 'male' ? '수컷' : profile.dogGender === 'female' ? '암컷' : '중성화'}`;
    document.getElementById("profilePersonality").textContent = profile.personality.length > 0 ? profile.personality.join(", ") : "정보 없음";
    document.getElementById("basicTitle").textContent = `${profile.dogName} (${profile.ownerNickname})`;
    document.getElementById("profileDogBirthdate").textContent = profile.dogBirthdate || "정보 없음";
    document.getElementById("profileDogWeight").textContent = profile.dogWeight ? `${profile.dogWeight} kg` : "정보 없음";
    document.getElementById("profileDogLikes").textContent = profile.likes.length > 0 ? profile.likes.join(", ") : "정보 없음";
    document.getElementById("profileDogDislikes").textContent = profile.dislikes.length > 0 ? profile.dislikes.join(", ") : "정보 없음";
    document.getElementById("profileDogHealth").textContent = profile.health.length > 0 ? profile.health.join(", ") : "정보 없음";

    // 건강 기록 표시
    document.getElementById("vaccinationHospital").textContent = profile.healthRecords.vaccination.hospital || "기록 없음";
    document.getElementById("vaccinationDate").textContent = profile.healthRecords.vaccination.date || "";
    document.getElementById("heartwormHospital").textContent = profile.healthRecords.heartworm.hospital || "기록 없음";
    document.getElementById("heartwormDate").textContent = profile.healthRecords.heartworm.date || "";
    document.getElementById("checkupHospital").textContent = profile.healthRecords.checkup.hospital || "기록 없음";
    document.getElementById("checkupDate").textContent = profile.healthRecords.checkup.date || "";

    // 발도장 표시
    const footprint = profile.footprints.length > 0 ? profile.footprints[0] : null;
    document.getElementById("footprintLocation").textContent = footprint ? footprint.location : "기록 없음";
    document.getElementById("footprintDate").textContent = footprint ? footprint.date : "";
}

function showTab(tabName) {
    const tabs = document.querySelectorAll(".profile-tabs button");
    const tabContents = document.querySelectorAll(".profile-details .tab-content");
    const ownerTabContents = document.querySelectorAll(".owner-info .tab-content");

    tabs.forEach(tab => tab.classList.remove("active"));
    tabContents.forEach(content => content.style.display = "none");
    ownerTabContents.forEach(content => content.style.display = "none");

    document.querySelector(`.profile-tabs button[onclick="showTab('${tabName}')"]`).classList.add("active");
    document.getElementById(`${tabName}Tab`).style.display = "block";
    document.getElementById(`${tabName}OwnerTab`).style.display = "block";
}

function editProfile() {
    document.getElementById("signupSection").style.display = "block";
    document.getElementById("profileSection").style.display = "none";
    const profile = profiles[currentProfileIndex];

    document.getElementById("dog-name").value = profile.dogName;
    document.getElementById("dog-gender").value = profile.dogGender;
    document.getElementById("dog-birthdate").value = profile.dogBirthdate;
    document.getElementById("dog-breed").value = profile.dogBreed;
    document.getElementById("dog-weight").value = profile.dogWeight || "";
    document.getElementById("dog-size").value = profile.dogSize || "";

    document.querySelectorAll('input[name="personality"]').forEach(checkbox => {
        checkbox.checked = profile.personality.includes(checkbox.value);
    });
    document.querySelectorAll('input[name="likes"]').forEach(checkbox => {
        checkbox.checked = profile.likes.includes(checkbox.value);
    });
    document.querySelectorAll('input[name="dislikes"]').forEach(checkbox => {
        checkbox.checked = profile.dislikes.includes(checkbox.value);
    });

    document.getElementById("dog-illustration").value = profile.dogIllustration || "";

    document.querySelectorAll('input[name="health"]').forEach(checkbox => {
        checkbox.checked = profile.health.includes(checkbox.value);
    });

    document.getElementById("dog-activity").value = profile.dogActivity || "";
    document.getElementById("owner-nickname").value = profile.ownerNickname;
    document.getElementById("owner-region").value = profile.ownerRegion || "";
    document.getElementById("owner-phone").value = profile.ownerPhone || "";
    document.getElementById("owner-experience").value = profile.ownerExperience || "";

    profiles.splice(currentProfileIndex, 1);
    localStorage.setItem("profiles", JSON.stringify(profiles));
}

function addNewProfile() {
    document.getElementById("signupSection").style.display = "block";
    document.getElementById("profileSection").style.display = "none";
    document.querySelector("form").reset();
}

function openDeletePopup() {
    document.getElementById("deletePopup").style.display = "flex";
}

function closeDeletePopup() {
    document.getElementById("deletePopup").style.display = "none";
}

function confirmDelete() {
    profiles.splice(currentProfileIndex, 1);
    localStorage.setItem("profiles", JSON.stringify(profiles));
    if (profiles.length === 0) {
        document.getElementById("signupSection").style.display = "block";
        document.getElementById("profileSection").style.display = "none";
    } else {
        currentProfileIndex = Math.max(0, currentProfileIndex - 1);
        displayProfile();
    }
    closeDeletePopup();
}

function openHealthPopup(type) {
    document.getElementById("healthPopup").style.display = "flex";
    document.getElementById("recordType").value = type;
    document.getElementById("popupTitle").textContent = type === "vaccination" ? "종합 예방접종 기록" : type === "heartworm" ? "심장사상충 예방 기록" : "건강검진 기록";
}

function closeHealthPopup() {
    document.getElementById("healthPopup").style.display = "none";
}

function saveHealthRecord(event) {
    event.preventDefault();
    const type = document.getElementById("recordType").value;
    const hospital = document.getElementById("hospitalName").value;
    const date = document.getElementById("recordDate").value;
    profiles[currentProfileIndex].healthRecords[type] = { hospital, date };
    localStorage.setItem("profiles", JSON.stringify(profiles));
    displayProfile();
    closeHealthPopup();
}

function openFootprintPopup() {
    document.getElementById("footprintPopup").style.display = "flex";
}

function closeFootprintPopup() {
    document.getElementById("footprintPopup").style.display = "none";
}

function saveFootprint(event) {
    event.preventDefault();
    const location = document.getElementById("footprintLocationInput").value;
    const date = document.getElementById("footprintDateInput").value;
    profiles[currentProfileIndex].footprints.push({ location, date });
    localStorage.setItem("profiles", JSON.stringify(profiles));
    displayProfile();
    closeFootprintPopup();
}