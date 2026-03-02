from datetime import datetime, timedelta
from algorithms import optimize_schedule

# test for the algors
class Task:
    def __init__(self, title, lat, lon, priority, duration, start, end):
        self.title = title
        self.latitude = lat
        self.longitude = lon
        self.priority = priority
        self.duration_minutes = duration
        self.start_window = start
        self.end_window = end

# 1. Setup Test Data
now = datetime.now()
tasks = [
    # Far away but High Priority
    Task("Grocery Store", 40.8075, -73.9626, 5, 30, now, now + timedelta(hours=5)),
    # Nearby but Low Priority
    Task("Coffee with Friend", 40.7614, -73.9776, 1, 45, now, now + timedelta(hours=2)),
    # Specific Time Window (Urgent)
    Task("Doctor Appointment", 40.7484, -73.9857, 4, 60, now + timedelta(hours=1), now + timedelta(hours=3)),
]

# 2. Define User's Current State (e.g., Times Square)
user_loc = (40.7580, -73.9855)
user_time = now

# 3. Run Optimization
print("--- Starting Optimization Test ---")
result = optimize_schedule(tasks, user_loc, user_time)

# 4. Display Results
for i, task in enumerate(result):
    print(f"Stop {i+1}: {task.title} (Prio: {task.priority})")