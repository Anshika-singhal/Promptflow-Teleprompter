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
const recordBtn = document.getElementById("recordBtn");
const stopRecordBtn = document.getElementById("stopRecordBtn");
const cancelRecordBtn = document.getElementById("cancelRecordBtn");
const videoPreview = document.getElementById("videoPreview");
const downloadLink = document.getElementById("downloadLink");
const settingsToggle = document.getElementById("settingsToggle");
const settingsContent = document.querySelector(".settings-content");
const scrollSpeedInput = document.getElementById("scrollSpeed");
const fontSizeInput = document.getElementById("fontSize");
const videoOverlay = document.getElementById("videoOverlay");
const overlayScript = document.getElementById("overlayScript");
const blackScreen = document.getElementById("blackScreen");
const settingsPanel = document.querySelector(".settings-panel");

// State Variables
let currentScriptId = null;
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
let scrollInterval;

// Hide settings panel by default
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
  } catch (error) {
    Swal.fire("Error!", "Failed to load script.", "error");
  }
});

// Add Script
addScriptBtn.addEventListener("click", () => {
  scriptFormContainer.classList.remove("hidden");
  currentScriptId = null;
  scriptTitleInput.value = "";
  scriptContentInput.value = "";
  submitScriptBtn.textContent = "Add Script";
});

// Update Script
updateScriptBtn.addEventListener("click", () => {
  if (!currentScriptId) {
    Swal.fire("Oops...", "Please select a script to update first!", "warning");
    return;
  }
  scriptFormContainer.classList.remove("hidden");
  submitScriptBtn.textContent = "Update Script";
});

// Cancel Form
cancelScriptBtn.addEventListener("click", () => {
  scriptFormContainer.classList.add("hidden");
});

// Submit Script (Add/Update)
submitScriptBtn.addEventListener("click", async () => {
  const title = scriptTitleInput.value.trim();
  const content = scriptContentInput.value.trim();

  if (!title || !content) {
    Swal.fire("Oops...", "Please fill in both fields!", "warning");
    return;
  }

  try {
    const endpoint = currentScriptId
      ? `https://teleprompter-backend-1-6wcb.onrender.com/api/script/${currentScriptId}`
      : "https://teleprompter-backend-1-6wcb.onrender.com/api/script";

    const method = currentScriptId ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) throw new Error(response.statusText);

    const action = currentScriptId ? "updated" : "added";
    Swal.fire("Success!", `Script ${action} successfully!`, "success");
    scriptFormContainer.classList.add("hidden");
    populateScriptDropdown();
  } catch (error) {
    Swal.fire("Error!", `Operation failed: ${error.message}`, "error");
  }
});

// Delete Script
deleteScriptBtn.addEventListener("click", async () => {
  if (!currentScriptId) {
    Swal.fire("Oops...", "Select a script first!", "warning");
    return;
  }

  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This cannot be undone!",
    icon: "warning",
    showCancelButton: true,
  });

  if (result.isConfirmed) {
    try {
      await fetch(
        `https://teleprompter-backend-1-6wcb.onrender.com/api/script/${currentScriptId}`,
        {
          method: "DELETE",
        }
      );
      Swal.fire("Deleted!", "Script removed.", "success");
      scriptText.textContent = "Select a script to begin";
      overlayScript.textContent = "Select a script to begin";
      currentScriptId = null;
      populateScriptDropdown();
    } catch (error) {
      Swal.fire("Error!", "Delete failed.", "error");
    }
  }
});

// Video Recording
recordBtn.addEventListener("click", async () => {
  try {
    if (recordBtn.textContent === "🔴 Start Recording") {
      // Initialize overlay
      overlayScript.textContent = scriptText.textContent;
      overlayScript.style.fontSize = `${fontSizeInput.value}px`;
      overlayScript.style.transform = "translateY(0)";
      overlayScript.style.transition = "none";
      void overlayScript.offsetHeight; // Trigger reflow

      // Show settings panel
      settingsPanel.style.display = "block";

      // Start recording logic
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });

      recordBtn.classList.add("hidden");
      stopRecordBtn.classList.remove("hidden");
      cancelRecordBtn.classList.remove("hidden");

      videoPreview.srcObject = stream;
      mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

      mediaRecorder.ondataavailable = (e) => recordedChunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.classList.remove("hidden");
      };

      mediaRecorder.start();
      document.querySelector(".video-container").requestFullscreen();
      videoOverlay.classList.remove("hidden");
      startScrolling();
    } else {
      // Stop recording logic
      mediaRecorder.stop();
      videoPreview.srcObject.getTracks().forEach((track) => track.stop());

      // Show black screen confirmation
      blackScreen.style.display = "block";
      setTimeout(() => (blackScreen.style.display = "none"), 500);

      exitRecordingMode();
    }
  } catch (error) {
    Swal.fire("Error!", "Camera access required.", "error");
    exitRecordingMode();
  }
});

// Cancel Recording
cancelRecordBtn.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    recordedChunks = [];
  }
  exitRecordingMode();
});

// Handle fullscreen change
document.addEventListener("fullscreenchange", () => {
  const videoContainer = document.querySelector(".video-container");
  if (document.fullscreenElement) {
    videoContainer.classList.add("fullscreen");
    videoOverlay.classList.remove("hidden");
    startScrolling();
  } else {
    videoContainer.classList.remove("fullscreen");
    exitRecordingMode();
  }
});

// New function to handle exiting recording mode
function exitRecordingMode() {
  const videoContainer = document.querySelector(".video-container");
  videoContainer.classList.remove("fullscreen");
  videoOverlay.classList.add("hidden");
  stopScrolling();

  // Show/hide appropriate buttons
  recordBtn.classList.remove("hidden");
  stopRecordBtn.classList.add("hidden");
  cancelRecordBtn.classList.add("hidden");

  // Hide settings panel
  settingsPanel.style.display = "none";

  // Exit fullscreen if still active
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
}

let isScrolling = false;
let scrollPosition = 0;
let animationFrameId;

function startScrolling() {
  const overlayHeight = overlayScript.scrollHeight;
  const duration = (11 - scrollSpeedInput.value) * 1000;

  overlayScript.style.transition = `transform ${duration}ms linear`;
  overlayScript.style.transform = `translateY(-${overlayHeight}px)`;

  // Update progress bar
  const progressBar = document.querySelector(".progress-bar");
  progressBar.style.width = "0%";
  progressBar.style.transition = `width ${duration}ms linear`;
  setTimeout(() => (progressBar.style.width = "100%"), 50);
}

function stopScrolling() {
  if (!isScrolling) return;
  isScrolling = false;
  overlayScript.style.transition = "none";
  const currentY = parseInt(
    overlayScript.style.transform.split("(")[1].split("px")[0]
  );
  overlayScript.style.transform = `translateY(${currentY}px)`;
}

function toggleScrolling() {
  if (isScrolling) {
    stopScrolling();
  } else {
    startScrolling();
  }
}

// Update scroll speed control
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

// Add font size control
fontSizeInput.addEventListener("input", () => {
  overlayScript.style.fontSize = `${fontSizeInput.value}px`;
  scriptText.style.fontSize = `${fontSizeInput.value}px`;
});

// Update your recordBtn event handler
recordBtn.addEventListener("click", async () => {
  try {
    if (recordBtn.textContent === "🔴 Start Recording") {
      // Initialize overlay
      overlayScript.textContent = scriptText.textContent;
      overlayScript.style.fontSize = `${fontSizeInput.value}px`;
      overlayScript.style.transform = "translateY(0)";
      overlayScript.style.transition = "none";
      void overlayScript.offsetHeight; // Trigger reflow

      // Show settings panel
      settingsPanel.style.display = "block";

      // Start recording logic
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });

      // Set video and overlay elements
      videoPreview.srcObject = stream;
      videoPreview.play().then(() => {
        videoOverlay.classList.remove("hidden");
        videoPreview.classList.add("active");
      });

      // Setup media recorder
      mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorder.ondataavailable = (e) => recordedChunks.push(e.data);

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.classList.remove("hidden");
      };

      // Start recording and enter fullscreen
      mediaRecorder.start();
      document.querySelector(".video-container").requestFullscreen();
      startScrolling();

      // Update UI
      recordBtn.classList.add("hidden");
      stopRecordBtn.classList.remove("hidden");
      cancelRecordBtn.classList.remove("hidden");
    } else {
      // Stop recording logic
      mediaRecorder.stop();
      videoPreview.srcObject.getTracks().forEach((track) => track.stop());
      exitRecordingMode();
    }
  } catch (error) {
    Swal.fire("Error!", `Recording failed: ${error.message}`, "error");
    exitRecordingMode();
  }
});

// Add these new functions
function resetScrollPosition() {
  overlayScript.style.transition = "none";
  overlayScript.style.transform = "translateY(0)";
  void overlayScript.offsetHeight; // Trigger reflow
}

// Add keyboard controls
document.addEventListener("keydown", (e) => {
  if (!isRecording) return;

  switch (e.key.toLowerCase()) {
    case " ":
      toggleScrolling();
      break;
    case "arrowup":
      scrollSpeedInput.value = Math.min(
        10,
        parseInt(scrollSpeedInput.value) + 1
      );
      scrollSpeedInput.dispatchEvent(new Event("input"));
      break;
    case "arrowdown":
      scrollSpeedInput.value = Math.max(
        1,
        parseInt(scrollSpeedInput.value) - 1
      );
      scrollSpeedInput.dispatchEvent(new Event("input"));
      break;
  }
});

populateScriptDropdown();
