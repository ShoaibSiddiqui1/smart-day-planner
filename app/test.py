import asyncio
from datetime import datetime, timedelta
from app.algorithms import optimize_schedule_smart  # Ensure this points to your new function

# 1. Update Task class to match your Model [cite: 2026-02-23]
class Task:
    def __init__(self, title, lat, lon, priority, duration, start, end):
        self.title = title
        self.latitude = lat
        self.longitude = lon
        self.priority = priority
        self.duration_minutes = duration
        self.start_window = start
        self.end_window = end

async def run_test():
    # 2. Setup Test Data [cite: 2026-02-23]
    now = datetime.now()
    tasks = [
        # Far away but High Priority
        Task("Grocery Store", 40.8075, -73.9626, 5, 30, now, now + timedelta(hours=5)),
        # Nearby but Low Priority
        Task("Coffee with Friend", 40.7614, -73.9776, 1, 45, now, now + timedelta(hours=2)),
        # Specific Time Window (Urgent)
        Task("Doctor Appointment", 40.7484, -73.9857, 4, 60, now + timedelta(hours=1), now + timedelta(hours=3)),
    ]

    # 3. Define User's Current State (Times Square) [cite: 2026-02-23]
    user_loc = (40.7580, -73.9855) # (lat, lon)
    user_time = now

    print("--- Starting Mapbox Optimization Test ---")
    
    # 4. Run the ASYNC Optimization [cite: 2026-03-02]
    try:
        result = await optimize_schedule_smart(tasks, user_loc, user_time)

        # 5. Display Results [cite: 2026-02-23]
        if not result:
            print("No tasks could be scheduled.")
        else:
            for i, task in enumerate(result):
                # Check if 'real_travel_time' was attached by Mapbox [cite: 2026-03-02]
                travel_info = f"{task.real_travel_time:.1f} mins away" if hasattr(task, 'real_travel_time') else "Haversine fallback"
                print(f"Stop {i+1}: {task.title} (Prio: {task.priority}) - {travel_info}")
                
    except Exception as e:
        print(f"Test Failed: {e}")

# Run the async loop [cite: 2026-03-02]
if __name__ == "__main__":
    asyncio.run(run_test())