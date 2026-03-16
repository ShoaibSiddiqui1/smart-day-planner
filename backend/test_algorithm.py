import httpx
import asyncio
import json

BASE_URL = "http://127.0.0.1:8000"

async def test_smart_scheduler():
    async with httpx.AsyncClient() as client:
        print("🧠 Testing Smart Scheduling Algorithm...")

        # 1. Login to get the token
        login_data = {"username": "jason@example.com", "password": "password123"}
        login_res = await client.post(f"{BASE_URL}/login", data=login_data)
        
        if login_res.status_code != 200:
            print("❌ Login failed. Make sure you registered the user first.")
            return

        token = login_res.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ Logged in.")

        # 2. Trigger the Schedule Generation
        print("🛰️ Calling Mapbox & Optimization Engine...")
        sched_res = await client.post(f"{BASE_URL}/schedules/generate", headers=headers)

        if sched_res.status_code == 200:
            print("✅ Schedule Generated Successfully!")
            data = sched_res.json()
            
            print("\n" + "="*50)
            print(f"📅 OPTIMIZED PLAN FOR: {data.get('schedule_date')}")
            print(f"⏱️  Total Task Duration: {data.get('total_duration_minutes')} mins")
            print("="*50)

            items = data.get("items", [])
            if not items:
                print("⚠️ No items returned. Check if tasks are 'pending' in DB.")
            else:
                for i, item in enumerate(items, 1):
                    # FIX: Reach into the nested 'task' object for the title
                    task_info = item.get("task", {})
                    title = task_info.get("title", "Unknown Task")
                    
                    # Formatting the time for better readability
                    start_str = item['scheduled_start'].split("T")[-1][:5] # HH:MM
                    end_str = item['scheduled_end'].split("T")[-1][:5]     # HH:MM
                    
                    print(f"{i}. [{start_str} - {end_str}] {title}")
            
            print("="*50)
            
        else:
            print(f"❌ Scheduling failed ({sched_res.status_code}): {sched_res.text}")

if __name__ == "__main__":
    asyncio.run(test_smart_scheduler())