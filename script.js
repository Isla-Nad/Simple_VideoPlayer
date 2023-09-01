const player = document.querySelector("video");
const add = document.querySelector("input[type='file']");
const list = document.querySelector("#al-list");
const PlayerList = document.querySelector("#play-list");
const listOpenBtn = document.querySelector(".fa-list");
const listClosenBtn = document.querySelector(".fa-circle-xmark");
const playBtn = document.querySelector("#play-pause");
const muteBtn = document.querySelector("#mute");
const fullScreenBtn = document.querySelector("#full-screen");
const seekBar = document.querySelector("#seek-bar");
const volumeBar = document.querySelector("#volume-bar");
const folder = document.querySelector(".folder");
const changeFolder = document.querySelector(".fa-folder-plus");
// ===================================================================================
// playlist
let playList = JSON.parse(localStorage.getItem("PLAYLIST")) || [];
let folderPath = JSON.parse(localStorage.getItem("FOLDER"));
let currentVideo = JSON.parse(localStorage.getItem("SRC"));
let currentTimeStamp = JSON.parse(localStorage.getItem("TIME"));
player.currentTime = Number(currentTimeStamp);
player.setAttribute("src", currentVideo);
document.querySelector("title").textContent = currentVideo.replace(/.*\//, "");

if (folderPath) {
  folder.setAttribute("data-visible", "true");
}
renderPlayList();

folder.addEventListener("submit", function (e) {
  e.preventDefault();
  folderPath = folder.querySelector("input").value.trim();
  localStorage.setItem("FOLDER", JSON.stringify(folderPath));
  folder.setAttribute("data-visible", "true");
});
changeFolder.addEventListener("click", () => {
  if (folder.getAttribute("data-visible") == "true") {
    folder.setAttribute("data-visible", "false");
  } else {
    folder.setAttribute("data-visible", "true");
  }
});

add.addEventListener("change", (e) => {
  if (add.files.length > 0) {
    for (let i = 0; i < add.files.length; i++) {
      playList.push({ name: add.files[i].name, url: folderPath + "/" + add.files[i].name });
      console.log(playList);
    }
    renderPlayList();
  }
});

function renderPlayList() {
  PlayerList.innerHTML = "";
  for (let i = 0; i < playList.length; i++) {
    PlayerList.innerHTML += `<div class="list"><li href="${playList[i].url}">${playList[i].name}</li><i class="fa-solid fa-delete-left"></i></div>`;
  }
  localStorage.setItem("PLAYLIST", JSON.stringify(playList));
}

PlayerList.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    player.setAttribute("src", e.target.getAttribute("href"));
    localStorage.setItem("SRC", JSON.stringify(player.src));
    document.querySelector("title").textContent = player.src.replace(/.*\//, "");
    handelePlayPause();
  }
  if (e.target.tagName === "I") {
    e.target.parentElement.remove();
    playList = playList.filter((item) => item.url !== e.target.previousElementSibling.getAttribute("href"));
    localStorage.setItem("PLAYLIST", JSON.stringify(playList));
  }
});

listOpenBtn.addEventListener("click", (e) => {
  list.setAttribute("data-visible", "true");
});
listClosenBtn.addEventListener("click", (e) => {
  list.setAttribute("data-visible", "false");
});
// ===================================================================================
// Autoplay
player.addEventListener("ended", () => {
  const currentIndex = playList.findIndex((item) => item.url === player.getAttribute("src").replace("file://", "").replaceAll("%20", " "));
  if (currentIndex !== -1 && currentIndex < playList.length - 1) {
    const nextURL = playList[currentIndex + 1].url;
    player.setAttribute("src", nextURL);
    player.play();
    localStorage.setItem("SRC", JSON.stringify(player.src));
    document.querySelector("title").textContent = player.src.replace(/.*\//, "");
  }
});
// ===================================================================================
// play/pause button
playBtn.addEventListener("click", handelePlayPause);
player.addEventListener("click", handelePlayPause);
function handelePlayPause() {
  if (player.paused && player.src) {
    player.play();
    if (playBtn.querySelector(".fa-play")) {
      playBtn.querySelector(".fa-play").classList.replace("fa-play", "fa-pause");
    }
  } else {
    player.pause();
    if (playBtn.querySelector(".fa-pause")) {
      playBtn.querySelector(".fa-pause").classList.replace("fa-pause", "fa-play");
    }
  }
}
// ===================================================================================
// mute button
let currentVolume = volumeBar.value;
muteBtn.addEventListener("click", function () {
  if (!player.muted) {
    player.muted = true;
    volumeBar.value = 0;
    muteBtn.querySelector(".fa-volume-high").classList.replace("fa-volume-high", "fa-volume-xmark");
  } else {
    player.muted = false;
    volumeBar.value = currentVolume;
    muteBtn.querySelector(".fa-volume-xmark").classList.replace("fa-volume-xmark", "fa-volume-high");
  }
});
// volume bar
volumeBar.addEventListener("change", function () {
  player.volume = volumeBar.value;
  currentVolume = volumeBar.value;
  updateMuteIcon();
});
function updateMuteIcon() {
  if (player.volume === 0) {
    if (muteBtn.querySelector(".fa-volume-high")) {
      muteBtn.querySelector(".fa-volume-high").classList.replace("fa-volume-high", "fa-volume-xmark");
    }
  } else {
    if (muteBtn.querySelector(".fa-volume-xmark")) {
      muteBtn.querySelector(".fa-volume-xmark").classList.replace("fa-volume-xmark", "fa-volume-high");
    }
  }
}
// ===================================================================================
// full-screen button
fullScreenBtn.addEventListener("click", function () {
  if (player.requestFullscreen) {
    player.requestFullscreen();
  }
});
// ===================================================================================
// seek bar

let isSeeking = false;

seekBar.addEventListener("mousedown", function () {
  isSeeking = true;
  player.pause();
  if (playBtn.querySelector(".fa-pause")) {
    playBtn.querySelector(".fa-pause").classList.replace("fa-pause", "fa-play");
  }
});

seekBar.addEventListener("input", function () {
  if (isSeeking) {
    player.currentTime = player.duration * (seekBar.value / 100);
    const currentTime = formatTime(player.currentTime);
    const duration = formatTime(player.duration);
    document.querySelector(".seek-bar").innerHTML = `${currentTime} <hr/> ${duration}`;
  }
});

seekBar.addEventListener("mouseup", function () {
  isSeeking = false;
  player.play();
  if (playBtn.querySelector(".fa-play")) {
    playBtn.querySelector(".fa-play").classList.replace("fa-play", "fa-pause");
  }
});
player.addEventListener("timeupdate", function () {
  if (!isNaN(player.duration)) {
    seekBar.value = (100 / player.duration) * player.currentTime;
    const currentTime = formatTime(player.currentTime);
    const duration = formatTime(player.duration);
    document.querySelector(".seek-bar").innerHTML = `${currentTime} <hr/> ${duration}`;
    localStorage.setItem("TIME", JSON.stringify(player.currentTime));
  }
});

function formatTime(timeInSeconds) {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
const skipTime = 5;
const skipVolume = 0.2;
document.addEventListener("keydown", (e) => {
  console.log(e.key);
  switch (e.key) {
    case "ArrowLeft":
      player.currentTime -= skipTime;
      break;
    case "ArrowRight":
      player.currentTime += skipTime;
      break;
    case "ArrowUp":
      player.volume = volumeBar.value = Math.min(1, player.volume + skipVolume);
      updateMuteIcon();
      break;
    case "ArrowDown":
      player.volume = volumeBar.value = Math.max(0, player.volume - skipVolume);
      updateMuteIcon();
      break;
    case " ":
      handelePlayPause();
      break;
    default:
      break;
  }
});
player.addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }
});
// ===================================================================================
// video controls
let controlsTimeout;
player.addEventListener("play", () => {
  clearTimeout(controlsTimeout);
  controlsTimeout = setTimeout(() => {
    document.querySelector("#video-controls").setAttribute("data-visible", "true");
  }, 5000);
});
player.addEventListener("pause", () => {
  clearTimeout(controlsTimeout);
});
player.addEventListener("ended", () => {
  clearTimeout(controlsTimeout);
});
player.addEventListener("mousemove", () => {
  document.querySelector("#video-controls").setAttribute("data-visible", "false");
  clearTimeout(controlsTimeout);
  controlsTimeout = setTimeout(() => {
    document.querySelector("#video-controls").setAttribute("data-visible", "true");
  }, 5000);
});
// ===================================================================================
