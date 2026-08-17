from datetime import datetime, timezone
from typing import Any

from app.services import congestion_service, density_service, traffic_service
from app.simulation.traffic_simulator import TrafficScenario, generate_traffic_observation


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_simulated_traffic(junction_id: str, scenario: str | None = None) -> dict[str, Any]:
    normalized_scenario = scenario.upper() if scenario else "NORMAL"
    try:
        scenario_value = TrafficScenario(normalized_scenario)
    except ValueError as error:
        raise ValueError("Invalid traffic scenario") from error

    observation = generate_traffic_observation(junction_id, scenario_value)
    payload = {
        "junction_id": observation["junction_id"],
        "direction": observation.get("direction", "UNKNOWN"),
        "vehicle_count": observation["vehicle_count"],
        "cars": observation["cars"],
        "motorcycles": observation["motorcycles"],
        "buses": observation["buses"],
        "trucks": observation["trucks"],
        "average_speed": observation["average_speed"],
        "queue_length": observation["queue_length"],
    }
    return traffic_service.create_traffic_observation(
        traffic_service.TrafficObservationCreate(
            junction_id=payload["junction_id"],
            direction=payload["direction"],
            vehicle_count=payload["vehicle_count"],
            cars=payload["cars"],
            motorcycles=payload["motorcycles"],
            buses=payload["buses"],
            trucks=payload["trucks"],
            average_speed=payload["average_speed"],
            queue_length=payload["queue_length"],
        )
    )


def _to_serializable_value(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    if hasattr(value, "value"):
        return value.value
    if isinstance(value, dict):
        return {key: _to_serializable_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_to_serializable_value(item) for item in value]
    return value


def get_simulation_dashboard(junction_id: str) -> dict[str, Any]:
    density_snapshot = density_service.get_latest_density_by_direction(junction_id)
    alert_history = congestion_service.get_congestion_alert_history(junction_id)

    status_level_map = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
    current_status = "NORMAL"
    for density in density_snapshot.get("densities", []):
        level = density["density_level"].value if hasattr(density["density_level"], "value") else str(density["density_level"])
        if status_level_map.get(level, 0) > status_level_map.get(current_status, 0):
            current_status = level

    if alert_history:
        highest_alert = max(
            alert_history,
            key=lambda item: status_level_map.get(item["congestion_level"].value if hasattr(item["congestion_level"], "value") else str(item["congestion_level"]), 0),
        )
        current_status = highest_alert["congestion_level"]

    payload = {
        "junction_id": junction_id,
        "density": density_snapshot,
        "congestion_alerts": alert_history[-5:],
        "status": current_status,
        "generated_at": utc_now(),
    }
    return _to_serializable_value(payload)


import asyncio
import httpx
from app.ws.hub import manager
from app.models.risk_pattern_model import build_risk_pattern_document
from app.database.connection import get_risk_pattern_collection, get_equipment_collection
from app.ml.pipeline import TrafficMLPipeline

async def simulate_video_processing(junction_id: str, device_id: str, video_path: str):
    """Run real YOLO ML pipeline on video and update stats"""
    import asyncio
    import logging
    from app.ws.hub import manager
    from app.ml.pipeline import TrafficMLPipeline
    import traceback
    
    logger = logging.getLogger(__name__)
    
    # Send initial status
    await manager.broadcast({
        "type": "ML_UPDATE", 
        "device_id": device_id, 
        "status": "PROCESSING",
        "message": f"Starting YOLOv8 pipeline on {device_id}..."
    })
    
    # Give event loop a moment to flush the status message to the websocket
    await asyncio.sleep(0.5)
    
    try:
        # Initialize pipeline in a background thread to prevent blocking event loop
        # while downloading YOLO weights
        def init_pipeline():
            # Use user's trained model
            p = TrafficMLPipeline(model_path="app/models/best_final.pt")
            p.setup()
            return p
            
        pipeline = await asyncio.to_thread(init_pipeline)
        logger.info(f"TrafficMLPipeline initialized for {device_id}")
        
        frame_counter = 0
        
        logger.info(f"Running run_on_video for {video_path}...")
        
        # This will block a worker thread, but free the main event loop
        # To stream real-time, we'd normally use an async queue between threads, 
        # but for max_frames=50 it's fast enough to gather or yield periodically.
        # Let's chunk the execution so we can stream it real-time!
        
        import threading
        import queue
        
        q = queue.Queue()
        
        def run_pipeline():
            try:
                for res in pipeline.run_on_video(video_path, junction_id=junction_id, max_frames=None):
                    q.put(("data", res))
                q.put(("done", None))
            except Exception as e:
                q.put(("error", (e, traceback.format_exc())))
                
        thread = threading.Thread(target=run_pipeline)
        thread.start()
        
        while True:
            try:
                # Non-blocking check
                msg_type, payload = q.get_nowait()
                
                if msg_type == "data":
                    await manager.broadcast({
                        "type": "ML_DETECTION",
                        "device_id": device_id,
                        "junction_id": junction_id,
                        "frame": frame_counter,
                        "data": payload.model_dump(mode="json")
                    })
                    frame_counter += 1
                elif msg_type == "done":
                    break
                elif msg_type == "error":
                    raise payload[0]  # Reraise to outer try-catch
                    
            except queue.Empty:
                # Yield to asyncio loop
                await asyncio.sleep(0.1)
                
        await manager.broadcast({
            "type": "ML_UPDATE",
            "device_id": device_id,
            "status": "COMPLETED",
            "message": f"Processed {frame_counter} frames successfully."
        })
        logger.info(f"Video processing complete for {device_id}")
    except Exception as e:
        err_trace = traceback.format_exc()
        logger.error(f"Error in simulate_video_processing: {e}\n{err_trace}")
        await manager.broadcast({
            "type": "ML_ERROR",
            "device_id": device_id,
            "error": str(e),
            "traceback": err_trace
        })


async def simulate_ambulance_drive(origin: dict, destination: dict, ambulance_id: str):
    """Calculate OSRM route and simulate driving along it"""
    try:
        url = f"https://router.project-osrm.org/route/v1/driving/{origin['lng']},{origin['lat']};{destination['lng']},{destination['lat']}?overview=full&geometries=geojson"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url)
            data = resp.json()
            
        if not data.get("routes"):
            return
            
        coords = data["routes"][0]["geometry"]["coordinates"]
        
        await manager.broadcast({
            "type": "AMBULANCE_DISPATCH",
            "ambulance_id": ambulance_id,
            "route": coords,
            "status": "DISPATCHED"
        })
        
        # Simulate moving along the path
        for i in range(len(coords)):
            lng, lat = coords[i]
            await manager.broadcast({
                "type": "AMBULANCE_MOVE",
                "ambulance_id": ambulance_id,
                "position": {"lat": lat, "lng": lng},
                "progressPct": int((i / len(coords)) * 100)
            })
            await asyncio.sleep(0.5) # Simulate speed
            
        await manager.broadcast({
            "type": "AMBULANCE_ARRIVED",
            "ambulance_id": ambulance_id
        })
    except Exception as e:
        print(f"Ambulance simulation error: {e}")


async def inject_anomaly(junction_id: str, device_id: str, anomaly_type: str):
    """Instantly inject an anomaly into the DB and broadcast it"""
    doc = build_risk_pattern_document({
        "junction_id": junction_id,
        "device_id": device_id,
        "pattern_type": anomaly_type,
        "severity": "CRITICAL",
        "description": f"Simulated anomaly ({anomaly_type}) detected from uploaded video",
        "action_taken": "Alerted Traffic Marshal"
    })
    get_risk_pattern_collection().insert_one(doc)
    
    # Fetch equipment to get city name or location
    eq = get_equipment_collection().find_one({"device_id": device_id})
    location = eq.get("name", "Unknown Location") if eq else "Unknown Location"
    
    # Broadcast to Live Feed
    await manager.broadcast({
        "type": "NEW_ALERT",
        "alert": {
            "id": str(doc["_id"]),
            "time": doc["timestamp"].strftime("%H:%M:%S"),
            "title": f"Anomaly Detected: {anomaly_type}",
            "description": doc["description"],
            "severity": doc["severity"],
            "type": "RISKY_MOVEMENT",
            "feature": location
        }
    })
