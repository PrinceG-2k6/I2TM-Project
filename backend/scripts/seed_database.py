import os
import sys
from datetime import datetime, timezone
from pymongo import MongoClient

# Add the root backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings

INDIAN_CITIES = [
    {
        "id": "delhi", "name": "New Delhi", "state": "Delhi NCR",
        "center": {"lat": 28.5672, "lng": 77.2100},
        "junctions": ["J-04 Ring Road South (AIIMS)", "J-01 Connaught Inner", "J-02 Aurobindo Marg Node"]
    },
    {
        "id": "mumbai", "name": "Mumbai", "state": "Maharashtra",
        "center": {"lat": 19.0657, "lng": 72.8686},
        "junctions": ["M-01 BKC Central Junction", "M-02 Dadar TT Circle", "M-03 Marine Drive Flyover"]
    },
    {
        "id": "bengaluru", "name": "Bengaluru", "state": "Karnataka",
        "center": {"lat": 12.9172, "lng": 77.6228},
        "junctions": ["B-01 Silk Board Node", "B-02 HSR Outer Ring Road", "B-03 Electronic City Toll"]
    },
    {
        "id": "hyderabad", "name": "Hyderabad", "state": "Telangana",
        "center": {"lat": 17.4435, "lng": 78.3772},
        "junctions": ["H-01 Hitec City Cyber Towers", "H-02 Gachibowli Junction", "H-03 Punjagutta Flyover"]
    },
    {
        "id": "chennai", "name": "Chennai", "state": "Tamil Nadu",
        "center": {"lat": 13.0067, "lng": 80.2022},
        "junctions": ["C-01 Kathipara Cloverleaf Node", "C-02 Anna Salai Arterial", "C-03 T Nagar Bus Terminus"]
    },
    {
        "id": "nagpur", "name": "Nagpur", "state": "Maharashtra",
        "center": {"lat": 21.1458, "lng": 79.0882},
        "junctions": ["N-01 RBI Square", "N-02 Law College Square", "N-03 Variety Square"]
    }
]

CAMERA_APPROACH_CONFIG = [
  { "dir": 'N', "latOff":  0.0012, "lngOff":  0.0002, "label": 'North CCTV' },
  { "dir": 'E', "latOff": -0.0002, "lngOff":  0.0018, "label": 'East CCTV'  },
  { "dir": 'W', "latOff":  0.0001, "lngOff": -0.0018, "label": 'West CCTV'  },
  { "dir": 'S', "latOff": -0.0014, "lngOff": -0.0002, "label": 'South CCTV' }
]

SIGNAL_APPROACH_CONFIG = [
  { "dir": 'N', "appKey": 'North Approach', "latOff":  0.0008, "lngOff":  0.0001 },
  { "dir": 'E', "appKey": 'East Approach',  "latOff": -0.0001, "lngOff":  0.0014 },
  { "dir": 'W', "appKey": 'West Approach',  "latOff":  0.0000, "lngOff": -0.0014 },
  { "dir": 'S', "appKey": 'South Approach', "latOff": -0.0011, "lngOff": -0.0001 }
]

def seed_database():
    print(f"Connecting to MongoDB at {settings.mongodb_uri}...")
    client = MongoClient(settings.mongodb_uri)
    db = client[settings.mongodb_database]
    
    # Wipe existing
    print("Wiping existing collections...")
    db.junctions.delete_many({})
    db.equipment.delete_many({})
    
    now = datetime.now(timezone.utc)
    
    junctions_to_insert = []
    equipment_to_insert = []
    
    for city in INDIAN_CITIES:
        for idx, junc_name in enumerate(city["junctions"]):
            # Small random-ish offset for each junction from city center
            j_lat = city["center"]["lat"] + (idx * 0.005)
            j_lng = city["center"]["lng"] + (idx * 0.005)
            
            junc_doc = {
                "name": junc_name,
                "latitude": j_lat,
                "longitude": j_lng,
                "roads": ["Main Road", "Cross Road"],
                "lanes": 4,
                "status": "ACTIVE",
                "created_at": now,
                "updated_at": now
            }
            # Insert immediately so we get the ID
            res = db.junctions.insert_one(junc_doc)
            junction_id = str(res.inserted_id)
            print(f"Inserted Junction: {junc_name} ({junction_id})")
            
            # Generate Cameras
            for cam in CAMERA_APPROACH_CONFIG:
                equipment_to_insert.append({
                    "device_id": f'{city["id"].upper()}-JUNC-{idx+1}-CAM-{cam["dir"]}',
                    "device_type": "CAMERA",
                    "name": f'{junc_name} {cam["label"]}',
                    "city_name": city["name"],
                    "junction_id": junction_id,
                    "junction_name": junc_name,
                    "approach": cam["label"].replace(" CCTV", " Approach"),
                    "latitude": j_lat + cam["latOff"],
                    "longitude": j_lng + cam["lngOff"],
                    "status": "ONLINE",
                    "created_at": now,
                    "updated_at": now
                })
                
            # Generate Signals
            for sig in SIGNAL_APPROACH_CONFIG:
                equipment_to_insert.append({
                    "device_id": f'{city["id"].upper()}-JUNC-{idx+1}-SIG-{sig["dir"]}',
                    "device_type": "SIGNAL",
                    "name": f'{junc_name} {sig["appKey"]} Light',
                    "city_name": city["name"],
                    "junction_id": junction_id,
                    "junction_name": junc_name,
                    "approach": sig["appKey"],
                    "latitude": j_lat + sig["latOff"],
                    "longitude": j_lng + sig["lngOff"],
                    "status": "ONLINE",
                    "created_at": now,
                    "updated_at": now
                })
                
    if equipment_to_insert:
        db.equipment.insert_many(equipment_to_insert)
        print(f"Inserted {len(equipment_to_insert)} equipment devices (Cameras & Signals).")
        
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
