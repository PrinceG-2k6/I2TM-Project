from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, BackgroundTasks

from app.controllers import simulation_controller
from app.schemas.simulation_schema import SimulationTrafficInput


router = APIRouter(prefix="/simulation", tags=["Simulation"])


@router.post(
    "/traffic",
    status_code=status.HTTP_201_CREATED,
)
def create_simulated_traffic(payload: SimulationTrafficInput) -> dict:
    return simulation_controller.create_simulated_traffic(
        payload.junction_id,
        payload.scenario.value,
    )


@router.get("/dashboard/{junction_id}")
def get_simulation_dashboard(junction_id: str) -> dict:
    return simulation_controller.get_dashboard_state(junction_id)


@router.websocket("/live/{junction_id}")
async def live_simulation_dashboard(websocket: WebSocket, junction_id: str) -> None:
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_text()
            if message.strip().lower() in {"snapshot", "refresh", "ping"}:
                try:
                    from fastapi import HTTPException
                    dashboard_state = simulation_controller.get_dashboard_state(junction_id)
                    await websocket.send_json(dashboard_state)
                except HTTPException as e:
                    await websocket.send_json({"error": e.detail, "status": e.status_code})
                except Exception as e:
                    await websocket.send_json({"error": str(e), "status": 500})
            elif message.strip().lower() == "close":
                await websocket.close()
                break
    except WebSocketDisconnect:
        return


from fastapi import File, Form, UploadFile
import tempfile
import shutil
import os

@router.post("/process-video", status_code=status.HTTP_200_OK)
def process_video_simulation(
    background_tasks: BackgroundTasks,
    junction_id: str = Form(...),
    device_id: str = Form(...),
    video: UploadFile = File(...),
) -> dict:
    from app.services.simulation_service import simulate_video_processing
    # Save to temp file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    shutil.copyfileobj(video.file, temp_file)
    temp_file.close()
    
    background_tasks.add_task(simulate_video_processing, junction_id, device_id, temp_file.name)
    return {"message": "Video processing simulation started", "junction_id": junction_id, "device_id": device_id, "video_path": temp_file.name}


@router.post("/dispatch-ambulance", status_code=status.HTTP_202_ACCEPTED)
def dispatch_ambulance_simulation(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    ambulance_id: str,
    background_tasks: BackgroundTasks,
) -> dict:
    from app.services.simulation_service import simulate_ambulance_drive
    background_tasks.add_task(simulate_ambulance_drive, {"lat": origin_lat, "lng": origin_lng}, {"lat": dest_lat, "lng": dest_lng}, ambulance_id)
    return {"message": "Ambulance simulation started", "ambulance_id": ambulance_id}


@router.post("/trigger-anomaly", status_code=status.HTTP_201_CREATED)
async def trigger_anomaly_simulation(
    junction_id: str,
    device_id: str,
    anomaly_type: str = "WRONG_WAY",
) -> dict:
    from app.services.simulation_service import inject_anomaly
    await inject_anomaly(junction_id, device_id, anomaly_type)
    return {"message": f"Anomaly {anomaly_type} injected", "junction_id": junction_id}

