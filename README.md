📅 Smart Day Planner

A full-stack mobile application that helps users organize their daily tasks, optimize schedules, and visualize routes on a map.

🚀 Features
* 🔐 User Authentication
  -Register, login, and secure JWT-based authentication
* ✅ Task Management
  -Create, update, delete tasks
  -Add location, priority, and time windows
  -Mark tasks as completed
* 🧠 Smart Scheduling
  -Automatically generates optimized schedules
  -Considers:
      Task priority
      Time constraints
      Travel distance
* 🗺️ Map Integration
  -Displays tasks and routes on a map
  -Shows optimized path from home → tasks
  -Google Maps navigation support
* 📊 Progress Tracking
  -Completion tracking for daily tasks
  -Visual feedback on productivity

===================================================================================================================

🏗️ Tech Stack
Backend
  -FastAPI
  -SQLAlchemy
  -PostgreSQL
  -JWT Authentication
  -Pydantic
Frontend (Mobile)
  -React Native (Expo)
  -TypeScript
  -React Navigation
  -AsyncStorage
APIs & Services
  -Mapbox / OSRM (routing)
  -Nominatim (geocoding)

====================================================================================================================

smart-day-planner/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   └── main.py
│   └── requirements.txt
│
├── mobile/
│   ├── app/
│   ├── components/
│   ├── services/
│   └── assets/
│
└── README.md


======================================================================================================================
⚙️ Setup Instructions

1. Clone the Repository
    git clone <your-repo-url>
    cd smart-day-planner

2. Backend Setup
    cd backend

    # create virtual environment
    python -m venv venv
    source venv/bin/activate   # Linux/macOS
    venv\Scripts\activate      # Windows
    
    # install dependencies
    pip install -r requirements.txt
    
    # run server
    python -m uvicorn app.main:app --reload
    Backend runs on: http://127.0.0.1:8000

3. Frontend Setup (Mobile)
   cd mobile

  # install dependencies
  npm install
  
  # start expo
  npx expo start

 - Press a to run Android emulator
 = Or scan QR with Expo Go

===================================================================================================================
🔑 Environment Variables

DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
MAPBOX_ACCESS_TOKEN=your_mapbox_token

==================================================================================================================
🛠️ Future Improvements
🔔 Notifications & reminders
📅 Calendar integration
🤖 AI-based smarter planning
📍 Real-time traffic updates
👥 Shared/group scheduling

===================================================================================================================
👨‍💻 Authors: Cheng Yue, Shoaib Siddiqui, Shahriar Ferdous
