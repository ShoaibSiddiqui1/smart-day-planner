from datetime import datetime, timedelta
from typing import List
import math
import os
import httpx

MAPBOX_TOKEN = os.getenv("MAPBOX_ACCESS_TOKEN")

def calculate_priority_score(task, current_location, current_time):
    # 1. Priority weight (Rank 1-5)
    # If priority is 5, this is 50 points.
    priority_weight = task.priority * 10 

    # 2. Time window urgency
    time_remaining = (task.end_window - current_time).total_seconds() / 60
    time_urgency = 100 / (time_remaining + 1) if time_remaining > 0 else -1000

    # 3. REAL Distance Penalty
    task_coords = (task.latitude, task.longitude)
    travel_minutes = calculate_haversine_minutes(current_location, task_coords)
    
    # CHANGE THIS: Increase the penalty multiplier if you want it to care MORE about distance.
    # A multiplier of 2 means every 10 minutes of driving costs 20 points.
    distance_penalty = travel_minutes * 2 

    return priority_weight + time_urgency - distance_penalty

def calculate_haversine_minutes(coord1, coord2, speed_kmh=40):
    """
    Fallback: Calculates 'as the crow flies' travel time [cite: 2026-02-23].
    """
    if not coord1 or not coord2:
        return 0
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    R = 6371.0 # Earth radius
    dlat, dlon = math.radians(lat2-lat1), math.radians(lon2-lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    distance = R * (2 * math.atan2(math.sqrt(a), math.sqrt(1-a)))
    return (distance / speed_kmh) * 60

async def get_mapbox_matrix(user_lon, user_lat, tasks):
    """
    Calls Mapbox to get a matrix of driving durations [cite: 2026-03-02].
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
                # durations[0] contains travel times from the start point to all others
                return response.json().get("durations", [[]])[0]
        except Exception as e:
            print(f"Mapbox API Error: {e}")
        return None

async def optimize_schedule_smart(tasks: List, start_coords: tuple, start_time: datetime):
    """
    The main engine: Uses Mapbox + Custom Scoring to build the route [cite: 2026-02-23, 2026-03-02].
    """
    optimized_route = []
    current_time = start_time
    current_location = start_coords # (lat, lon)
    unscheduled_tasks = tasks.copy()

    # 1. PRE-FETCH: Get all travel times from start to tasks in ONE call [cite: 2026-03-02]
    # start_coords is (lat, lon), but Mapbox needs (lon, lat)
    durations = await get_mapbox_matrix(start_coords[1], start_coords[0], unscheduled_tasks)

    while unscheduled_tasks:
        # 2. ATTACH TRAVEL TIMES: Use Mapbox if available, else Haversine [cite: 2026-02-23]
        for i, task in enumerate(unscheduled_tasks):
            if durations and i+1 < len(durations):
                task.real_travel_time = durations[i+1] / 60
            else:
                task.real_travel_time = calculate_haversine_minutes(current_location, (task.latitude, task.longitude))

        # 3. SCORE & SORT: Find the best task to do NEXT [cite: 2026-02-23]
        unscheduled_tasks.sort(
            key=lambda t: calculate_priority_score(t, current_location, current_time), 
            reverse=True
        )

        next_task = unscheduled_tasks.pop(0)
        arrival_time = current_time + timedelta(minutes=next_task.real_travel_time)
        actual_start = max(arrival_time, next_task.start_window)

        # 4. VALIDATE: Does it fit before the window closes? [cite: 2026-02-23]
        if actual_start + timedelta(minutes=next_task.duration_minutes) <= next_task.end_window:
            optimized_route.append(next_task)
            current_time = actual_start + timedelta(minutes=next_task.duration_minutes)
            current_location = (next_task.latitude, next_task.longitude)
            
            # RE-CALCULATE MATRIX: Since we moved, travel times from the NEW location change
            # (In a basic version, we can reuse Haversine here to save API credits)
            durations = None 
        else:
            print(f"Skipping {next_task.title}: Time window exceeded [cite: 2026-02-23].")

    return optimized_route