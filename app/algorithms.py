from datetime import datetime, timedelta
from typing import List
import math

def calculate_priority_score(task, current_location, current_time):
    # 1. Priority weight (Rank 1-5)
    # If priority is 5, this is 50 points.
    priority_weight = task.priority * 10 

    # 2. Time window urgency
    time_remaining = (task.end_window - current_time).total_seconds() / 60
    time_urgency = 100 / (time_remaining + 1) if time_remaining > 0 else -1000

    # 3. REAL Distance Penalty
    task_coords = (task.latitude, task.longitude)
    travel_minutes = calculate_travel_time(current_location, task_coords)
    
    # CHANGE THIS: Increase the penalty multiplier if you want it to care MORE about distance.
    # A multiplier of 2 means every 10 minutes of driving costs 20 points.
    distance_penalty = travel_minutes * 2 

    return priority_weight + time_urgency - distance_penalty


def calculate_travel_time(coord1, coord2, speed_kmh=40):
    """
    Calculates travel time between two (lat, lon) tuples.
    Assumes an average city speed of 40 km/h.
    """
    if not coord1 or not coord2:
        return 0
        
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    # Radius of the Earth in km
    R = 6371.0 
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    # Time = Distance / Speed (converted to minutes)
    return (distance / speed_kmh) * 60

def optimize_schedule(tasks: List, start_coords: tuple, start_time: datetime):
    optimized_route = []
    current_time = start_time
    current_location = start_coords # (lat, lon)
    unscheduled_tasks = tasks.copy()

    while unscheduled_tasks:
        # Sort using the score (which should now include a real distance penalty)
        unscheduled_tasks.sort(
            key=lambda t: calculate_priority_score(t, current_location, current_time), 
            reverse=True
        )

        next_task = unscheduled_tasks.pop(0)
        next_location = (next_task.latitude, next_task.longitude)

        # Calculate travel time from where we are to the next task
        travel_time = calculate_travel_time(current_location, next_location)
        
        # New Start Time = Current Time + Travel Time
        arrival_time = current_time + timedelta(minutes=travel_time)
        actual_start = max(arrival_time, next_task.start_window)

        # Verify if task fits within its end_window
        if actual_start + timedelta(minutes=next_task.duration_minutes) <= next_task.end_window:
            optimized_route.append(next_task)
            # Update time: Start + Duration
            current_time = actual_start + timedelta(minutes=next_task.duration_minutes)
            current_location = next_location
        else:
            print(f"Task {next_task.title} skipped: Travel/Duration exceeds window.")

    return optimized_route