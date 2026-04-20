from datetime import datetime, timedelta
from typing import List
import math


def calculate_haversine_minutes(coord1, coord2, speed_kmh=40):
    if not coord1 or not coord2:
        return 9999
    if any(c is None for c in coord1) or any(c is None for c in coord2):
        return 9999

    lat1, lon1 = coord1
    lat2, lon2 = coord2

    R = 6371.0

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )

    distance = R * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))
    return (distance / speed_kmh) * 60


def calculate_priority_score(task, travel_minutes, current_time):
    priority_weight = (task.priority or 2) * 20
    now = current_time.replace(tzinfo=None) if current_time.tzinfo else current_time

    if task.latest_end is None:
        time_urgency = 0
    else:
        latest_end = (
            task.latest_end.replace(tzinfo=None)
            if task.latest_end.tzinfo
            else task.latest_end
        )
        time_remaining = (latest_end - now).total_seconds() / 60
        time_urgency = 100 / (time_remaining + 1) if time_remaining > 0 else -1000

    distance_penalty = (travel_minutes or 0) * 2
    return priority_weight + time_urgency - distance_penalty


async def optimize_schedule_smart(tasks: List, start_coords: tuple, start_time: datetime):
    if start_time.tzinfo:
        start_time = start_time.replace(tzinfo=None)

    current_time = start_time
    current_location = start_coords
    unscheduled_tasks = tasks.copy()
    optimized_route = []

    print("=== OPTIMIZER START ===")
    print("Start coords:", start_coords)
    print("Start time:", start_time)

    while unscheduled_tasks:
        print("\n--- New loop ---")
        print("Current time:", current_time)
        print("Current location:", current_location)

        for task in unscheduled_tasks:
            task.real_travel_time = calculate_haversine_minutes(
                current_location,
                (task.latitude, task.longitude),
            )

            print(
                f"Task: {task.title} | "
                f"location={task.location} | "
                f"lat={task.latitude} lon={task.longitude} | "
                f"travel={task.real_travel_time:.2f} min | "
                f"earliest={task.earliest_start} | "
                f"latest={task.latest_end}"
            )

        unscheduled_tasks.sort(
            key=lambda t: calculate_priority_score(
                t, t.real_travel_time, current_time
            ),
            reverse=True,
        )

        next_task = unscheduled_tasks.pop(0)

        travel_time = next_task.real_travel_time or 0
        duration = next_task.duration_minutes or 30
        arrival_time = current_time + timedelta(minutes=travel_time)

        earliest = (
            next_task.earliest_start.replace(tzinfo=None)
            if next_task.earliest_start and next_task.earliest_start.tzinfo
            else next_task.earliest_start
        )

        latest = (
            next_task.latest_end.replace(tzinfo=None)
            if next_task.latest_end and next_task.latest_end.tzinfo
            else next_task.latest_end
        )

        if earliest is None:
            earliest = current_time

        if latest is None:
            latest = current_time + timedelta(hours=12)

        actual_start = max(arrival_time, earliest)
        actual_end = actual_start + timedelta(minutes=duration)

        print(
            f"Chosen task: {next_task.title} | "
            f"arrival={arrival_time} | "
            f"actual_start={actual_start} | "
            f"actual_end={actual_end} | "
            f"latest={latest}"
        )

        if actual_end <= latest:
            print(f"Scheduled: {next_task.title}")
            optimized_route.append(next_task)
            current_time = actual_end
            current_location = (next_task.latitude, next_task.longitude)
        else:
            print(f"Skipping {next_task.title}: time window exceeded")

    print("=== OPTIMIZER END ===")
    print("Scheduled tasks:", [task.title for task in optimized_route])

    return optimized_route