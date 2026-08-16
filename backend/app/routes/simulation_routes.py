from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status

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
