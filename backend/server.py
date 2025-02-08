from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request
import httpx

app = FastAPI()

# Set up the static file path (for JS, CSS, etc.)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Set up template directory
templates = Jinja2Templates(directory="templates")

# External API URL to fetch quiz data
api_url = "https://api.jsonserve.com/Uw5CrX"

@app.get("/", response_class=HTMLResponse)
async def get_home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/quiz")
async def get_quiz_data():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(api_url)
            if response.status_code == 200:
                return response.json()
            else:
                return {"message": "Error fetching quiz data"}
    except Exception as e:
        return {"message": str(e)}
# uvicorn backend.server:app --reload