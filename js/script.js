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
const textColorPicker = document.getElementById("textColor");
// const fontSizeInput = document.getElementById('fontSize');

// State Variables
let currentScriptId = null;
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
let isPreviewActive = false;
let isScrolling = false;

// Load saved text color
textColorPicker.value = localStorage.getItem("scriptColor") || "#ffffff";
letterSpacingInput.value = localStorage.getItem("letterSpacing") || "0";

// Text Color Functions
function updateScriptColor(color) {
  overlayScript.style.color = color;
  localStorage.setItem("scriptColor", color);
}

// Add letter spacing update function
function updateLetterSpacing(spacing) {
  overlayScript.style.letterSpacing = `${spacing}px`;
  localStorage.setItem("letterSpacing", spacing);
}

// Add event listener for letter spacing
letterSpacingInput.addEventListener("input", (e) => {
  updateLetterSpacing(e.target.value);
});

// Script Management Functions
addScriptBtn.addEventListener("click", () => {
  scriptFormContainer.classList.remove("hidden");
  scriptTitleInput.value = "";
  scriptContentInput.value = "";
  currentScriptId = null; // Reset for new script
});

updateScriptBtn.addEventListener("click", () => {
  if (!currentScriptId) {
    Swal.fire("Warning!", "Please select a script to edit!", "warning");
    return;
  }
  scriptFormContainer.classList.remove("hidden");
});

deleteScriptBtn.addEventListener("click", async () => {
  if (!currentScriptId) {
    Swal.fire("Warning!", "Please select a script to delete!", "warning");
    return;
  }

  const result = await Swal.fire({
    title: "Delete Script?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(
        `https://teleprompter-backend-1-6wcb.onrender.com/api/script/${currentScriptId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete script");

      Swal.fire("Deleted!", "Script has been deleted.", "success");
      scriptText.textContent = "Select a script to begin";
      currentScriptId = null;
      populateScriptDropdown();
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    }
  }
});

submitScriptBtn.addEventListener("click", async () => {
  const title = scriptTitleInput.value.trim();
  const content = scriptContentInput.value.trim();

  if (!title || !content) {
    Swal.fire("Warning!", "Please fill in both title and content!", "warning");
    return;
  }

  try {
    const url = currentScriptId
      ? `https://teleprompter-backend-1-6wcb.onrender.com/api/script/${currentScriptId}`
      : "https://teleprompter-backend-1-6wcb.onrender.com/api/script";

    const method = currentScriptId ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok)
      throw new Error(
        `Failed to ${currentScriptId ? "update" : "save"} script`
      );

    const result = await response.json();
    Swal.fire(
      "Success!",
      `Script ${currentScriptId ? "updated" : "saved"} successfully!`,
      "success"
    );

    scriptFormContainer.classList.add("hidden");
    populateScriptDropdown();

    // If new script, select it automatically
    if (!currentScriptId) {
      const newScriptOption = [...scriptDropdown.options].find(
        (opt) => opt.value === result.script._id
      );
      if (newScriptOption) {
        scriptDropdown.value = result.script._id;
        scriptDropdown.dispatchEvent(new Event("change"));
      }
    }
  } catch (error) {
    Swal.fire("Error!", error.message, "error");
  }
});

cancelScriptBtn.addEventListener("click", () => {
  scriptFormContainer.classList.add("hidden");
  scriptTitleInput.value = "";
  scriptContentInput.value = "";
  currentScriptId = null;
});

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

// Color picker event listener
textColorPicker.addEventListener("input", (e) => {
  updateScriptColor(e.target.value);
});

// Preview Mode Functions
showPreviewBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: true,
    });

    videoInterface.classList.remove("hidden");
    videoPreview.srcObject = stream;

    // Enter fullscreen
    const videoContainer = document.querySelector(".video-container");
    if (videoContainer.requestFullscreen) {
      await videoContainer.requestFullscreen();
    }

    // Update UI elements
    isPreviewActive = true;
    settingsPanel.style.display = "block";
    startScrollingBtn.classList.remove("hidden");
    startRecordingBtn.classList.remove("hidden"); // Show recording button
    closePreviewBtn.classList.remove("hidden");
    showPreviewBtn.classList.add("hidden");

    // Hide main screen settings
    document.querySelector(".settings-panel").style.display = "block";
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
    mimeType: "video/webm",
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
    const scriptHeight = overlayScript.scrollHeight;
    const containerHeight = videoOverlay.clientHeight;
    const scrollDistance = scriptHeight - containerHeight;
    
    // Reset position
    overlayScript.style.transform = `translate(-50%, 0)`;
    void overlayScript.offsetHeight; // Trigger reflow
    
    // Apply scrolling animation
    overlayScript.style.transform = `translate(-50%, -${scrollDistance}px)`;
    overlayScript.style.transition = `transform ${(11 - scrollSpeedInput.value) * 2000}ms linear`;
}

// Settings Controls
applySettingsBtn.addEventListener("click", () => {
    overlayScript.style.fontSize = `${fontSizeInput.value}px`;
    overlayScript.style.letterSpacing = `${letterSpacingInput.value}px`;
    scriptText.style.fontSize = `${fontSizeInput.value}px`;
    settingsPanel.style.display = "none";
  });

scrollSpeedInput.addEventListener("input", () => {
  if (isScrolling) {
    const currentY = Math.abs(
      parseInt(overlayScript.style.transform.split("(")[1])
    );
    const remaining = overlayScript.scrollHeight - currentY;
    const newDuration =
      (remaining / overlayScript.scrollHeight) *
      (11 - scrollSpeedInput.value) *
      1000;

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
    videoPreview.srcObject.getTracks().forEach((track) => track.stop());
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
    // Show both control buttons
    startScrollingBtn.classList.remove("hidden");
    startRecordingBtn.classList.remove("hidden");
  } else {
    videoContainer.classList.remove("fullscreen");
    exitPreviewMode();
  }
});

// Initialize
populateScriptDropdown();
showPreviewBtn.disabled = true;
updateScriptColor(textColorPicker.value);
