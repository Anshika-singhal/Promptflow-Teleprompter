// Get Elements
const scriptText = document.getElementById("scriptText");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const speedControl = document.getElementById("speedControl");
const fetchScriptBtn = document.getElementById("fetchScriptBtn");

// New Elements for Dialog Box
const scriptsDialog = document.getElementById("scriptsDialog"); // A dialog box element to show the scripts
const scriptsList = document.getElementById("scriptsList"); // A container to display the list of scripts

// New Elements
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

let scrollSpeed = 3;
let animationFrame;
let isScrolling = false;
let currentScriptId = null; // Stores the latest script ID for updating or deleting
let mediaRecorder;
let recordedChunks = [];

// ▶ Fetch the latest script from API
async function fetchScript() {
    try {
        const response = await fetch("http://localhost:5000/api/script");
        const scripts = await response.json();

        if (scripts.length === 0) {
            scriptText.innerText = "No script found!";
            return;
        }

        // Use the latest script
        const latestScript = scripts[scripts.length - 1];
        scriptText.innerText = latestScript.content;
        scriptText.style.top = "100%"; // Reset position
        currentScriptId = latestScript._id; // Store latest script ID

    } catch (error) {
        console.error("Error fetching script:", error);
        scriptText.innerText = "Error loading script!";
    }
}

// ▶ Show Add/Update Script Form
addScriptBtn.addEventListener("click", () => {
    scriptFormContainer.classList.remove("hidden");
    submitScriptBtn.innerText = "Add Script";
    currentScriptId = null; // Reset to indicate new script
    scriptTitleInput.value = "";
    scriptContentInput.value = "";
});

// ▶ Hide Script Form
cancelScriptBtn.addEventListener("click", () => {
    scriptFormContainer.classList.add("hidden");
});

// ▶ Submit New or Updated Script
submitScriptBtn.addEventListener("click", async () => {
    const title = scriptTitleInput.value.trim();
    const content = scriptContentInput.value.trim();

    if (!title || !content) {
        alert("Please enter both title and content!");
        return;
    }

    try {
        let url = "http://localhost:5000/api/script";
        let method = "POST";
        let bodyData = { title, content };

        if (currentScriptId) {
            // Update existing script
            url = `http://localhost:5000/api/script/${currentScriptId}`;
            method = "PUT";
        }

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData),
        });

        if (response.ok) {
            alert(currentScriptId ? "✅ Script updated successfully!" : "✅ Script added successfully!");
            scriptFormContainer.classList.add("hidden");
            fetchScript();
        } else {
            alert("❌ Failed to save script!");
        }
    } catch (error) {
        console.error("Error saving script:", error);
    }
});

// ▶ Populate Form for Editing
updateScriptBtn.addEventListener("click", async () => {
    if (!currentScriptId) {
        alert("No script available to update.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/script/${currentScriptId}`);
        const script = await response.json();

        scriptTitleInput.value = script.title;
        scriptContentInput.value = script.content;
        submitScriptBtn.innerText = "Update Script";
        scriptFormContainer.classList.remove("hidden");
    } catch (error) {
        console.error("Error fetching script for update:", error);
    }
});

// ▶ Delete the latest script
deleteScriptBtn.addEventListener("click", async () => {
    if (!currentScriptId) {
        alert("No script available to delete.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/script/${currentScriptId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("✅ Script deleted successfully!");
            scriptText.innerText = "No script found!";
            currentScriptId = null;
        } else {
            alert("❌ Failed to delete script!");
        }
    } catch (error) {
        console.error("Error deleting script:", error);
    }
});

// ▶ Start Scrolling
function startScrolling() {
    if (isScrolling) return;
    isScrolling = true;

    function scrollText() {
        let top = parseInt(window.getComputedStyle(scriptText).top);
        scriptText.style.top = (top - scrollSpeed) + "px";

        if (top < -scriptText.scrollHeight) {
            scriptText.style.top = "100%";
        }

        animationFrame = requestAnimationFrame(scrollText);
    }

    scrollText();
}

// ⏸ Pause Scrolling
pauseBtn.addEventListener("click", () => {
    cancelAnimationFrame(animationFrame);
    isScrolling = false;
});

// 🔄 Reset Scrolling
resetBtn.addEventListener("click", () => {
    cancelAnimationFrame(animationFrame);
    scriptText.style.top = "100%";
    isScrolling = false;
});

// 🎚️ Adjust Speed
speedControl.addEventListener("input", function () {
    scrollSpeed = parseInt(this.value);
});

// 🎛️ Event Listeners
startBtn.addEventListener("click", startScrolling);
fetchScriptBtn.addEventListener("click", fetchScript);

// 🎥 Start Video Recording
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        videoPreview.srcObject = stream;
        mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.classList.remove("hidden");
        };

        mediaRecorder.start();
        recordBtn.innerText = "⏹ Stop Recording";
        recordBtn.onclick = stopRecording;
    } catch (error) {
        console.error("Error starting video:", error);
    }
}

// ⏹ Stop Video Recording
function stopRecording() {
    mediaRecorder.stop();
    videoPreview.srcObject.getTracks().forEach(track => track.stop());
    recordBtn.innerText = "🔴 Start Recording";
    recordBtn.onclick = startRecording;
}

// 📹 Add Event Listener for Recording
recordBtn.addEventListener("click", startRecording);

// ▶ Fetch All Scripts
async function fetchAllScripts() {
    try {
        const response = await fetch("http://localhost:5000/api/script");
        const scripts = await response.json();

        if (scripts.length === 0) {
            alert("No scripts found!");
            return;
        }

        // Clear existing list
        scriptsList.innerHTML = '';

        // Display scripts in the dialog
        scripts.forEach(script => {
            const listItem = document.createElement("li");
            listItem.textContent = script.title; // Display script title
            listItem.onclick = () => {
                handleScriptSelection(script._id, script.title, script.content);
                scriptsDialog.classList.add("hidden"); // Hide dialog after selection
            };
            scriptsList.appendChild(listItem);
        });

        // Show dialog with scripts list
        scriptsDialog.classList.remove("hidden");

    } catch (error) {
        console.error("Error fetching scripts:", error);
    }
}

// ▶ Handle Script Selection for Start, Update, or Delete
function handleScriptSelection(scriptId, title, content) {
    currentScriptId = scriptId;
    scriptTitleInput.value = title;
    scriptContentInput.value = content;

    if (currentScriptId) {
        submitScriptBtn.innerText = "Update Script"; // Set to update if script exists
        scriptFormContainer.classList.remove("hidden"); // Show the form
    }
}

// ▶ Show Scripts for Start
startBtn.addEventListener("click", () => {
    fetchAllScripts(); // Fetch and show scripts for selection
});

// ▶ Show Scripts for Update
updateScriptBtn.addEventListener("click", () => {
    fetchAllScripts(); // Fetch and show scripts for selection
});

// ▶ Show Scripts for Delete
deleteScriptBtn.addEventListener("click", () => {
    fetchAllScripts(); // Fetch and show scripts for selection
});

// ▶ Close Dialog Box (if needed)
const closeDialogBtn = document.getElementById("closeDialogBtn");
closeDialogBtn.addEventListener("click", () => {
    scriptsDialog.classList.add("hidden"); // Close the dialog
});