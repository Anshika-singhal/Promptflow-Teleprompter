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
const videoPreview = document.getElementById("videoPreview");
const downloadLink = document.getElementById("downloadLink");
const settingsToggle = document.getElementById("settingsToggle");
const settingsContent = document.querySelector(".settings-content");
const scrollSpeedInput = document.getElementById("scrollSpeed");
const fontSizeInput = document.getElementById("fontSize");
const videoOverlay = document.getElementById("videoOverlay");
const overlayScript = document.getElementById("overlayScript");

// State Variables
let currentScriptId = null;
let mediaRecorder;
let recordedChunks = [];
let scrollInterval;
let isRecording = false;
let scrollPosition = 0;

// API Functions
async function populateScriptDropdown() {
  try {
    const response = await fetch("http://localhost:5000/api/script");
    const scripts = await response.json();
    
    scriptDropdown.innerHTML = '<option value="" disabled selected>Select a script</option>';
    scripts.forEach(script => {
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
    const response = await fetch(`http://localhost:5000/api/script/${selectedScriptId}`);
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
      ? `http://localhost:5000/api/script/${currentScriptId}`
      : "http://localhost:5000/api/script";

    const method = currentScriptId ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content })
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
    showCancelButton: true
  });

  if (result.isConfirmed) {
    try {
      await fetch(`http://localhost:5000/api/script/${currentScriptId}`, { 
        method: "DELETE" 
      });
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
      // Start Recording
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoPreview.srcObject = stream;
      mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

      mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.classList.remove("hidden");
      };

      mediaRecorder.start();
      recordBtn.textContent = "⏹ Stop Recording";
      isRecording = true;

      // Show Video Overlay
      videoOverlay.classList.remove("hidden");
      startScrolling();

      // Mobile Recording Mode
      if (window.innerWidth <= 768) {
        document.body.classList.add("recording-mode");
      }
    } else {
      // Stop Recording
      mediaRecorder.stop();
      videoPreview.srcObject.getTracks().forEach(track => track.stop());
      recordBtn.textContent = "🔴 Start Recording";
      isRecording = false;

      // Hide Video Overlay
      videoOverlay.classList.add("hidden");
      stopScrolling();

      // Exit Mobile Recording Mode
      if (window.innerWidth <= 768) {
        document.body.classList.remove("recording-mode");
      }
    }
  } catch (error) {
    Swal.fire("Error!", "Camera access required.", "error");
  }
});

// Scroll Feature
function startScrolling() {
  const speed = parseInt(scrollSpeedInput.value);
  scrollInterval = setInterval(() => {
    scrollPosition += speed;
    overlayScript.scrollTo(0, scrollPosition);
  }, 100);
}

function stopScrolling() {
  clearInterval(scrollInterval);
}

// Settings Toggle
settingsToggle.addEventListener("click", () => {
  settingsContent.classList.toggle("hidden");
});

// Scroll Speed Control
scrollSpeedInput.addEventListener("input", () => {
  if (isRecording) {
    stopScrolling();
    startScrolling();
  }
});

// Font Size Control
fontSizeInput.addEventListener("input", () => {
  overlayScript.style.fontSize = `${fontSizeInput.value}px`;
});

// Initialize
populateScriptDropdown();