from datetime import datetime, timedelta, timezone
from typing import List
import math
import httpx
from .config import settings

MAPBOX_TOKEN = settings.mapbox_access_token

def calculate_haversine_minutes(coord1, coord2, speed_kmh=40):
    """
    Calculates 'as the crow flies' travel time between two (lat, lon) points.
    Includes safety checks for None values to prevent TypeErrors.
    """
    if not coord1 or not coord2:
        return 0
    if any(c is None for c in coord1) or any(c is None for c in coord2):
        return 0
        
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    R = 6371.0  # Earth radius in km
    dlat, dlon = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2)**2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2)
    distance = R * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))
    
    # Returns travel time in minutes
    return (distance / speed_kmh) * 60

def calculate_priority_score(task, travel_minutes, current_time):
    """
    Calculates a score based on priority, urgency, and distance.
    Higher score = higher priority to be scheduled next.
    """
    # 1. Priority weight (e.g., Priority 1 = 10 points)
    priority_weight = task.priority * 10 

    # 2. Time window urgency
    # Standardize to timezone-naive to prevent subtraction errors
    now = current_time.replace(tzinfo=None) if current_time.tzinfo else current_time
    latest_end = task.latest_end.replace(tzinfo=None) if task.latest_end.tzinfo else task.latest_end

    time_remaining = (latest_end - now).total_seconds() / 60
    # Higher urgency if the deadline is approaching
    time_urgency = 100 / (time_remaining + 1) if time_remaining > 0 else -1000

    # 3. Distance Penalty (More travel = lower score)
    distance_penalty = travel_minutes * 2 

    return priority_weight + time_urgency - distance_penalty

async def get_mapbox_matrix(user_lon, user_lat, tasks):
    """
    Calls Mapbox to get a matrix of driving durations in one batch.
    """
    if not MAPBOX_TOKEN:
        return None
        
    coords = f"{user_lon},{user_lat}"
    for t in tasks:
        coords += f";{t.longitude},{t.latitude}"

    url = f"https://api.mapbox.com/directions-matrix/v1/mapbox/driving/{coords}"
    params = {"access_token": MAPBOX_TOKEN, "annotations": "duration"}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, timeout=5.0)
            if response.status_code == 200:
                # durations[0] is travel times from the start point to all tasks
                return response.json().get("durations", [[]])[0]
        except Exception as e:
            print(f"Mapbox API Error: {e}")
        return None

async def optimize_schedule_smart(tasks: List, start_coords: tuple, start_time: datetime):
    optimized_route = []
    
    # --- FIX 1: Ensure start_time is naive ---
    if start_time.tzinfo is not None:
        start_time = start_time.replace(tzinfo=None)
    
    current_time = start_time
    current_location = start_coords 
    unscheduled_tasks = tasks.copy()

    durations = await get_mapbox_matrix(current_location[1], current_location[0], unscheduled_tasks)

    while unscheduled_tasks:
        for i, task in enumerate(unscheduled_tasks):
            if durations and i + 1 < len(durations) and durations[i+1] is not None:
                task.real_travel_time = durations[i + 1] / 60
            else:
                task.real_travel_time = calculate_haversine_minutes(
                    current_location, (task.latitude, task.longitude)
                )

        unscheduled_tasks.sort(
            key=lambda t: calculate_priority_score(t, t.real_travel_time, current_time), 
            reverse=True
        )

        next_task = unscheduled_tasks.pop(0)
        arrival_time = current_time + timedelta(minutes=next_task.real_travel_time)
        
        # --- FIX 2: Ensure earliest_start and latest_end are naive ---
        earliest = next_task.earliest_start.replace(tzinfo=None) if next_task.earliest_start.tzinfo else next_task.earliest_start
        latest = next_task.latest_end.replace(tzinfo=None) if next_task.latest_end.tzinfo else next_task.latest_end

        # Now the comparison is safe
        actual_start = max(arrival_time, earliest)

        # --- FIX 3: Use the naive 'latest' for the check ---
        if actual_start + timedelta(minutes=next_task.duration_minutes) <= latest:
            optimized_route.append(next_task)
            current_time = actual_start + timedelta(minutes=next_task.duration_minutes)
            current_location = (next_task.latitude, next_task.longitude)
            durations = None 
        else:
            print(f"Skipping {next_task.title}: Time window exceeded.")

    return optimized_route