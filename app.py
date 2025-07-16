from fastapi import FastAPI
from fastapi.responses import FileResponse
from main import Game

game = Game()
app = FastAPI()


@app.get("/")
async def get_ui():
    return FileResponse("index.html")


@app.get("/styles.css")
async def get_styles():
    return FileResponse("styles.css")


@app.get("/script.js")
async def get_script():
    return FileResponse("script.js")


@app.post("/start")
async def start(rings):
    game.start(rings)


@app.post("/move")
async def move(src, dst):
    return game.move(src, dst)


@app.post("/solve")
async def solve():
    game.solve()


@app.post("/undo")
async def undo():
    return game.undo()
