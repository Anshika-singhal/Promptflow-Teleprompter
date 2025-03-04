Promptflow Teleprompter
Promptflow Teleprompter is a web-based application designed to assist speakers, presenters, and content creators by providing a customizable teleprompter interface. The application allows users to create, edit, and display scripts with adjustable settings to enhance their delivery.

Features
- Script Management: Create, edit, and delete scripts with ease.
- Customizable Display: Adjust font size, text color, and scrolling speed to suit your preferences.
- Preview Mode: View scripts in a teleprompter interface with options to start and stop scrolling.
- Recording Integration: Record your presentations directly within the application.
- Bold Text Toggle: Enhance readability by toggling bold text on or off.

Technologies Used
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js with Express.js
- Database: MongoDB
  
Getting Started

Prerequisites
- Node.js installed on your machine.
- MongoDB instance running locally or remotely.
  
Installation

*Clone the repository:
bash
- git clone https://github.com/Anshika-singhal/Promptflow-Teleprompter.git
- cd Promptflow-Teleprompter
  
*Install backend dependencies:
bash
- cd backend
- npm install

*Set up environment variables:
#Create a .env file in the backend directory and add your MongoDB connection string:

- MONGODB_URI=your_mongodb_connection_string
  
*Start the backend server:
bash
- npm start
  
*Install frontend dependencies:
bash
- cd ../frontend
- npm install
  
*Start the frontend application:
bash
- npm start

#The application should now be accessible at http://localhost:5000.

Usage
1.Access the Application:
  Navigate to http://localhost:5000 in your web browser.

2.Manage Scripts:
  - Add a New Script: Click on the "Add Script" button, enter the title and content, and save.
  - Edit an Existing Script: Select a script from the dropdown menu and click "Update Script" to modify.
  - Delete a Script: Select a script and click "Delete Script" to remove it.

3.Customize Display Settings:
  - Adjust the font size and scrolling speed using the settings panel.
  - Change the text color using the color picker.
  - Toggle bold text on or off with the "Bold" button.

4.Preview and Record:
  - Click "Show Preview" to enter the teleprompter mode.
  - Use the "Start Scrolling" and "Stop Scrolling" buttons to control the script flow.
  - Click "Start Recording" to record your presentation; click "Stop Recording" to end and download the video.

*Live Backend
  The backend of this application is deployed and live at https://teleprompter-backend-1-6wcb.onrender.com. This allows the frontend application to interact with the database for script management and other functionalities.

*Contributing
  Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

*License
  This project is licensed under the MIT License. See the LICENSE file for details.
