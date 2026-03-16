import httpx
import asyncio
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"

async def refresh_data():
    async with httpx.AsyncClient() as client:
        print("🧹 Cleaning up old tasks and refreshing for today...")

        # 1. Login to get token
        login_res = await client.post(
            f"{BASE_URL}/login", 
            data={"username": "jason@example.com", "password": "password123"}
        )
        token = login_res.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Define fresh tasks for TODAY (March 16, 2026)
        # We'll spread them across Manhattan to test Mapbox/Haversine
        now = datetime.now()
        
        new_tasks = [
            {
                "title": "Morning Coffee in Chelsea",
                "priority": 1,
                "duration_minutes": 30,
                "earliest_start": (now + timedelta(hours=1)).isoformat(),
                "latest_end": (now + timedelta(hours=4)).isoformat(),
                "latitude": 40.7465,
                "longitude": -74.0014,
                "status": "pending"
            },
            {
                "title": "Visit Central Park",
                "priority": 2,
                "duration_minutes": 90,
                "earliest_start": (now + timedelta(hours=2)).isoformat(),
                "latest_end": (now + timedelta(hours=8)).isoformat(),
                "latitude": 40.7850,
                "longitude": -73.9682,
                "status": "pending"
            },
            {
                "title": "Project Meeting at NYU",
                "priority": 1,
                "duration_minutes": 60,
                "earliest_start": (now + timedelta(hours=1)).isoformat(),
                "latest_end": (now + timedelta(hours=12)).isoformat(),
                "latitude": 40.7295,
                "longitude": -73.9965,
                "status": "pending"
            }
        ]

       # Inside refresh_tasks.py, change the loop to this:
        for task in new_tasks:
            # Changed "/tasks/" to "/tasks"
            res = await client.post(f"{BASE_URL}/tasks/", json=task, headers=headers)
            if res.status_code == 201:
                print(f"✅ Created: {task['title']}")
            else:
                print(f"❌ Failed: {task['title']} - {res.status_code} {res.text}")
if __name__ == "__main__":
    asyncio.run(refresh_data())