// Element References
const scriptText = document.getElementById("scriptText");
const scriptDropdown = document.getElementById("scriptDropdown");
const addScriptBtn = document.getElementById("addScriptBtn");
const updateScriptBtn = document.getElementById("updateScriptBtn");
const deleteScriptBtn = document.getElementById("deleteScriptBtn");
const scriptFormContainer = document.getElementById("scriptFormContainer");
const scriptTitleInput = document.getElementById("scriptTitle");
const scriptContentInput = document.getElementById("scriptInput");
const submitScriptBtn = document.getElementById("submitScriptBtn");
const cancelScriptBtn = document.getElementById("cancelScriptBtn");
const showPreviewBtn = document.getElementById("showPreviewBtn");
const startRecordingBtn = document.getElementById("startRecordingBtn");
const startScrollingBtn = document.getElementById("startScrollingBtn");
const stopRecordBtn = document.getElementById("stopRecordBtn");
const closePreviewBtn = document.getElementById("closePreviewBtn");
const downloadLink = document.getElementById("downloadLink");
const videoPreview = document.getElementById("videoPreview");
const videoOverlay = document.getElementById("videoOverlay");
const overlayScript = document.getElementById("overlayScript");
const blackScreen = document.getElementById("blackScreen");
const settingsPanel = document.querySelector(".settings-panel");
const scrollSpeedInput = document.getElementById("scrollSpeed");
const fontSizeInput = document.getElementById("fontSize");
const applySettingsBtn = document.getElementById("applySettingsBtn");
const videoInterface = document.querySelector(".video-interface");

// State Variables
let currentScriptId = null;
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
let isPreviewActive = false;
let isScrolling = false;

// Initialize Settings Panel
settingsPanel.style.display = "none";

// API Functions
async function populateScriptDropdown() {
  try {
    const response = await fetch(
      "https://teleprompter-backend-1-6wcb.onrender.com/api/script"
    );
    const scripts = await response.json();

    scriptDropdown.innerHTML =
      '<option value="" disabled selected>Select a script</option>';
    scripts.forEach((script) => {
      const option = document.createElement("option");
      option.value = script._id;
      option.textContent = script.title;
      scriptDropdown.appendChild(option);
    });
  } catch (error) {
    Swal.fire("Error!", "Failed to load scripts.", "error");
  }
}

// Event Handlers
scriptDropdown.addEventListener("change", async (event) => {
  const selectedScriptId = event.target.value;
  if (!selectedScriptId) return;

  try {
    const response = await fetch(
      `https://teleprompter-backend-1-6wcb.onrender.com/api/script/${selectedScriptId}`
    );
    const script = await response.json();

    scriptText.textContent = script.content;
    overlayScript.textContent = script.content;
    currentScriptId = selectedScriptId;
    scriptTitleInput.value = script.title;
    scriptContentInput.value = script.content;
    
    // Enable preview button when script is selected
    showPreviewBtn.disabled = false;
  } catch (error) {
    Swal.fire("Error!", "Failed to load script.", "error");
  }
});

// Script Management Functions (Keep existing functionality)
// Add/Update/Delete scripts functions remain the same

// Preview Mode Functions
showPreviewBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: true
    });

    videoInterface.classList.remove("hidden");
    videoPreview.srcObject = stream;
    isPreviewActive = true;
    settingsPanel.style.display = "block";
    startScrollingBtn.classList.remove("hidden");
    closePreviewBtn.classList.remove("hidden");
    showPreviewBtn.classList.add("hidden");
  } catch (error) {
    Swal.fire("Error!", "Camera access required.", "error");
  }
});

// Recording Controls
startRecordingBtn.addEventListener("click", () => {
  if (!currentScriptId) {
    Swal.fire("Warning!", "Please select a script first!", "warning");
    return;
  }

  mediaRecorder = new MediaRecorder(videoPreview.srcObject, { 
    mimeType: "video/webm" 
  });

  mediaRecorder.ondataavailable = (e) => recordedChunks.push(e.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.classList.remove("hidden");
  };

  mediaRecorder.start();
  isRecording = true;
  settingsPanel.style.display = "none";
  startRecordingBtn.classList.add("hidden");
  stopRecordBtn.classList.remove("hidden");
});

stopRecordBtn.addEventListener("click", () => {
  mediaRecorder.stop();
  exitRecordingMode();
});

// Scrolling Controls
startScrollingBtn.addEventListener("click", () => {
  startScrolling();
  settingsPanel.style.display = "none";
});

function startScrolling() {
  const overlayHeight = overlayScript.scrollHeight;
  const duration = (11 - scrollSpeedInput.value) * 1000;

  overlayScript.style.transition = `transform ${duration}ms linear`;
  overlayScript.style.transform = `translateY(-${overlayHeight}px)`;
  isScrolling = true;

  // Update progress bar
  const progressBar = document.querySelector(".progress-bar");
  progressBar.style.width = "0%";
  progressBar.style.transition = `width ${duration}ms linear`;
  setTimeout(() => (progressBar.style.width = "100%"), 50);
}

// Settings Controls
applySettingsBtn.addEventListener("click", () => {
  overlayScript.style.fontSize = `${fontSizeInput.value}px`;
  scriptText.style.fontSize = `${fontSizeInput.value}px`;
  settingsPanel.style.display = "none";
});

scrollSpeedInput.addEventListener("input", () => {
  if (isScrolling) {
    const currentY = Math.abs(
      parseInt(overlayScript.style.transform.split("(")[1])
    );
    const remaining = overlayScript.scrollHeight - currentY;
    const newDuration = (remaining / overlayScript.scrollHeight) * 
      (11 - scrollSpeedInput.value) * 1000;

    overlayScript.style.transition = `transform ${newDuration}ms linear`;
    overlayScript.style.transform = `translateY(-${overlayScript.scrollHeight}px)`;
  }
});

// Close Preview
closePreviewBtn.addEventListener("click", () => {
  exitPreviewMode();
});

function exitPreviewMode() {
  if (videoPreview.srcObject) {
    videoPreview.srcObject.getTracks().forEach(track => track.stop());
  }
  videoInterface.classList.add("hidden");
  isPreviewActive = false;
  isScrolling = false;
  showPreviewBtn.classList.remove("hidden");
  startScrollingBtn.classList.add("hidden");
  closePreviewBtn.classList.add("hidden");
  settingsPanel.style.display = "none";
  overlayScript.style.transform = "translateY(0)";
}

function exitRecordingMode() {
  mediaRecorder = null;
  recordedChunks = [];
  isRecording = false;
  stopRecordBtn.classList.add("hidden");
  startRecordingBtn.classList.remove("hidden");
  downloadLink.classList.remove("hidden");
}

// Fullscreen Handling
document.addEventListener("fullscreenchange", () => {
  const videoContainer = document.querySelector(".video-container");
  if (document.fullscreenElement) {
    videoContainer.classList.add("fullscreen");
    videoOverlay.classList.remove("hidden");
  } else {
    videoContainer.classList.remove("fullscreen");
    exitPreviewMode();
  }
});

// Initialize
populateScriptDropdown();
showPreviewBtn.disabled = true;