import httpx
import asyncio
from datetime import datetime, timedelta, timezone

BASE_URL = "http://127.0.0.1:8000"

async def seed_and_test():
    async with httpx.AsyncClient() as client:
        print("🚀 Starting Final Seed & Test...")

        # 1. Registration
        user_data = {
            "username": "jason_test",
            "email": "jason@example.com",
            "password": "password123",
            "home_address": "Empire State Building, NY"
        }
        # Path is "/" because of your main.py setup
        reg_res = await client.post(f"{BASE_URL}/", json=user_data)
        if reg_res.status_code == 201:
            print("✅ User created.")
        else:
            print(f"ℹ️ Registration check: {reg_res.status_code}")

        # 2. Login
        login_data = {
            "username": "jason@example.com", 
            "password": "password123"
        }
        print("🔑 Attempting login...")
        response = await client.post(f"{BASE_URL}/login", data=login_data)
        
        if response.status_code == 200:
            token = response.json().get("access_token")
            headers = {"Authorization": f"Bearer {token}"}
            print("✅ Login successful!")

            # 3. Task Creation
            now = datetime.now(timezone.utc)
            task_data = {
                "title": "Final Test Task",
                "description": "It works!",
                "location": "New York, NY",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "priority": 3,
                "duration_minutes": 45,
                # USE .isoformat() to provide the full timestamp the database wants
                "earliest_start": now.isoformat(),
                "latest_end": (now + timedelta(hours=4)).isoformat()
            }
            print("📝 Creating task...")
            task_res = await client.post(f"{BASE_URL}/tasks/", json=task_data, headers=headers)
            
            if task_res.status_code == 201:
                print("✅ Task created successfully!")
                print("\n🔥 BACKEND VERIFIED.")
            else:
                print(f"❌ Task failed ({task_res.status_code}): {task_res.text}")
        else:
            print(f"❌ Login failed: {response.text}")

if __name__ == "__main__":
    asyncio.run(seed_and_test())