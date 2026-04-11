import httpx

async def geocode_location(location: str):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": location,
        "format": "json",
        "limit": 1
    }

    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=params)
        data = res.json()

        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])

    return None, None