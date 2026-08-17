from app.database.connection import get_config_collection

INDIAN_CITIES = [
  {
    "id": "nagpur",
    "name": "Nagpur",
    "state": "Maharashtra",
    "center": { "lat": 21.1534, "lng": 79.0889 },
    "zoom": 14,
    "junctions": []
  }
]

EMERGENCY_PRESETS = {
  "AMBULANCE": {
    "vehicleType": "AMBULANCE",
    "vehicleLabel": "Ambulance",
    "vehicleIcon": "Siren",
    "vehicleId": "DL-01-AMB-889",
    "destination": "AIIMS Trauma Center",
    "hospital": "AIIMS Trauma Center",
    "origin": "Connaught Place Outer Circle",
    "distanceMeters": 850,
    "priorityTag": "CRITICAL (Priority 1)",
    "color": "#DC2626",
    "originOffset": { "lat": -0.0080, "lng": -0.0012 },
    "destOffset": { "lat": 0.0006, "lng": 0.0008 }
  },
  "FIRE": {
    "vehicleType": "FIRE",
    "vehicleLabel": "Fire Engine",
    "vehicleIcon": "Flame",
    "vehicleId": "DL-02-FIRE-101",
    "destination": "Connaught Commercial Hub",
    "hospital": "Connaught Commercial Hub",
    "origin": "Central Fire Station HQ",
    "distanceMeters": 1100,
    "priorityTag": "URGENT RESCUE (Priority 1)",
    "color": "#EA580C",
    "originOffset": { "lat": 0.0090, "lng": 0.0020 },
    "destOffset": { "lat": -0.0010, "lng": -0.0030 }
  }
}

DEFAULT_PATH_NODES = [
  { "name": "Outer Ring Entry",    "status": "PASSED",   "isGreen": True },
  { "name": "Commercial Arterial", "status": "ACTIVE",   "isGreen": True },
  { "name": "City Center Node",    "status": "UPCOMING", "isGreen": True },
  { "name": "Hospital Approach",   "status": "UPCOMING", "isGreen": True }
]

INITIAL_APPROACHES = {
  "North": { "name": "North Approach Corridor",  "vehicleCount": 0, "capacity": 50, "densityPct": 0.0, "status": "LOW", "currentLight": "RED",   "greenSec": 0, "avgSpeed": 0.0 },
  "South": { "name": "South Flyover Connector",  "vehicleCount": 0, "capacity": 50, "densityPct": 0.0, "status": "LOW", "currentLight": "RED",   "greenSec": 0, "avgSpeed": 0.0 },
  "East":  { "name": "East Commercial Arterial", "vehicleCount": 0, "capacity": 50, "densityPct": 0.0, "status": "LOW", "currentLight": "RED",   "greenSec": 0, "avgSpeed": 0.0 },
  "West":  { "name": "West Residential Feeder",  "vehicleCount": 0, "capacity": 50, "densityPct": 0.0, "status": "LOW", "currentLight": "RED",   "greenSec": 0, "avgSpeed": 0.0 }
}

INITIAL_CORRIDORS = []

INITIAL_ALERTS = []

CAMERA_APPROACH_CONFIG = [
  { "dir": "N", "latOff":  0.0012, "lngOff":  0.0002, "startAngle": 145, "endAngle": 215, "model": "YOLOv8 Dynamic",          "label": "North CCTV" },
  { "dir": "E", "latOff": -0.0002, "lngOff":  0.0018, "startAngle": 235, "endAngle": 305, "model": "YOLOv8 Swerve Risk",     "label": "East CCTV"  },
  { "dir": "W", "latOff":  0.0001, "lngOff": -0.0018, "startAngle":  55, "endAngle": 125, "model": "YOLOv8 Multi-Class",     "label": "West CCTV"  },
  { "dir": "S", "latOff": -0.0014, "lngOff": -0.0002, "startAngle": 325, "endAngle":  35, "model": "YOLOv8 Emergency Triage","label": "South CCTV" }
]

SIGNAL_APPROACH_CONFIG = [
  { "dir": "N", "appKey": "North", "latOff":  0.0008, "lngOff":  0.0001, "defaultLight": "RED",   "defaultGreen": 30 },
  { "dir": "E", "appKey": "East",  "latOff": -0.0001, "lngOff":  0.0014, "defaultLight": "GREEN", "defaultGreen": 45 },
  { "dir": "W", "appKey": "West",  "latOff":  0.0000, "lngOff": -0.0014, "defaultLight": "RED",   "defaultGreen": 20 },
  { "dir": "S", "appKey": "South", "latOff": -0.0011, "lngOff": -0.0001, "defaultLight": "RED",   "defaultGreen": 25 }
]

def seed_database():
    config_col = get_config_collection()
    
    # We store all these under a single config document for simplicity, 
    # or clear and replace them.
    config_col.delete_many({}) # Clear existing config
    
    config_doc = {
        "type": "dashboard_init",
        "INDIAN_CITIES": INDIAN_CITIES,
        "EMERGENCY_PRESETS": EMERGENCY_PRESETS,
        "DEFAULT_PATH_NODES": DEFAULT_PATH_NODES,
        "INITIAL_APPROACHES": INITIAL_APPROACHES,
        "INITIAL_CORRIDORS": INITIAL_CORRIDORS,
        "INITIAL_ALERTS": INITIAL_ALERTS,
        "CAMERA_APPROACH_CONFIG": CAMERA_APPROACH_CONFIG,
        "SIGNAL_APPROACH_CONFIG": SIGNAL_APPROACH_CONFIG
    }
    
    config_col.insert_one(config_doc)
    return {"message": "Database seeded successfully"}

def get_config():
    config_col = get_config_collection()
    doc = config_col.find_one({"type": "dashboard_init"}, {"_id": 0})
    if not doc:
        # If not seeded, return the defaults
        return {
            "INDIAN_CITIES": INDIAN_CITIES,
            "EMERGENCY_PRESETS": EMERGENCY_PRESETS,
            "DEFAULT_PATH_NODES": DEFAULT_PATH_NODES,
            "INITIAL_APPROACHES": INITIAL_APPROACHES,
            "INITIAL_CORRIDORS": INITIAL_CORRIDORS,
            "INITIAL_ALERTS": INITIAL_ALERTS,
            "CAMERA_APPROACH_CONFIG": CAMERA_APPROACH_CONFIG,
            "SIGNAL_APPROACH_CONFIG": SIGNAL_APPROACH_CONFIG
        }
    return doc
