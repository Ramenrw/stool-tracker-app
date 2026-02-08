# Stool Tracker
Used to track the user's bowel movements with AI camera recognition to determine the rating based on the Bristol Stool Chart.
Then returns feedback to the user with a tailored course-of-action to improve their stool quality.

# Description 
Stool Tracker is a dedicated health companion that simplifies the process of monitoring bowel movements. By focusing on a clean, non-intimidating user interface, the app encourages consistent logging to help users identify patterns in their digestive health.

Core Components:
Intelligent Dashboard: Displays a personalized greeting and a "Weekly Summary" card that calculates your total bowel movements for the week.

Visual History (Dot Logic): A functional calendar system that uses color-coded dots to visualize frequency without overwhelming the user:

1 Dot: Once a day.

2 Dots: Twice a day.

3 Dots: Three or more times.

Action-Oriented Navigation: Features a "popped-out" center camera button for quick entry, ensuring that logging a new event is always one tap away.

Actionable Insights: A dedicated tips section provides distinguishable health advice to help users naturally improve their gut health.

# Getting Started
### Dependencies
* [Node](https://nodejs.org) (v14+) 
* [Python](https://www.python.org) (3.11+) (Note: 3.13 is currently incompatible with certain ML dependencies)

### Installation
Step-by-step instructions on how to install and set up the app.

1.  Clone the repository:
   ```bash
    git clone https://github.com/Ramenrw/stool-tracker-app.git
   ```

2.  Navigate to the project directory:
    ```bash
    cd stool-tracker-app
    ```
    
3. Install NPM packages:
    ```bash
    npm install
    ```
4. Install project-specific libraries:
   ```bash
   npx expo install react-native-calendars lucide-react-native
   ```

### Executing Program
To run the application, you need to start both the Python backend and the Expo frontend.

**1. Start the Backend**
```bash
cd backend
# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate   # On Windows Command Prompt
.\venv\Scripts\Activate.ps1 # On Windows PowerShell

# Run the server
python main.py
```

**2. Start the Frontend**
In a new terminal window, from the root directory:
```bash
npx expo start
```

**3. Launch the app**
For Android or iOS, simply download Expo Go on your mobile device and scan the QR code shown in the frontend terminal window!
For web testing, press `w` in the frontend terminal window.

**4. Set up your configuration**
Ensure that the `API_URL` with aligns with the output of
```bash
ipconfig getifaddr en0
```

# 🛠️ Tech Stack
Frontend: React Native with Expo (TypeScript)

Backend: FastAPI (Python)

Database: SQLite

Machine Learning: TensorFlow Lite. Uses a quantized 793 KB model trained on a custom dataset of 150+ stool images for high-precision, on-device classification.

UI/Icons: Lucide-React-Native & FontAwesome5

Navigation: React Navigation (Stack & Tab)