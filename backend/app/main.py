from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import junction_routes, traffic_routes


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(f"{settings.api_v1_prefix}/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(junction_routes.router, prefix=settings.api_v1_prefix)
app.include_router(traffic_routes.router, prefix=settings.api_v1_prefix)
