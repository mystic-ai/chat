import logging

from fastapi import FastAPI, Request
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse

logger = logging.getLogger("uvicorn")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Mystic Chat",
        redoc_url="/api-reference/",
    )

    setup_oapi(app)
    setup_middlewares(app)

    return app


def setup_middlewares(app: FastAPI) -> None:
    @app.middleware("http")
    async def _(request: Request, call_next):
        try:
            response = await call_next(request)
        except Exception as e:
            logger.exception(e)
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Internal Server Error",
                },
            )
        return response


def setup_oapi(app: FastAPI) -> None:
    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema
        openapi_schema = get_openapi(
            title="Mystic Chat API",
            version="0.1.0",
            description="Mystic Chat API reference.",
            routes=app.routes,
            # servers=[{"url": ""}],
        )
        app.openapi_schema = openapi_schema

    app.openapi = custom_openapi
