from fastapi import FastAPI, Query
from fastapi.responses import FileResponse
from main import Game

game = Game()
app = FastAPI()


@app.post("/start")
async def start(rings: int = Query(..., description="Number of rings")):
    # now `rings` is an int, so game.start won't blow up
    game.start(rings)
    # return the new board so the UI can render immediately
    return {"board": game.board}


@app.get("/state")
async def get_state():
    # the UI calls /state to repaint
    return {"board": game.board}


@app.get("/")
async def get_ui():
    return FileResponse("index.html")


@app.get("/styles.css")
async def get_styles():
    return FileResponse("styles.css")


@app.get("/script.js")
async def get_script():
    return FileResponse("script.js")


@app.post("/move")
async def move(src: int = Query(..., description="Source peg index"),
               dst: int = Query(..., description="Destination peg index")):
    success, msg = game.move(src, dst)
    return [success, msg]


@app.post("/solve")
async def solve():
    # 1) snapshot the starting board
    initial = [peg.copy() for peg in game.board]
    steps = [ [peg.copy() for peg in initial] ]  # include start state

    # 2) work on a local board
    local = [peg.copy() for peg in initial]
    total = sum(len(peg) for peg in initial)  # number of rings

    def solve_rec(n, src, dst, aux):
        if n == 1:
            disk = local[src].pop()
            local[dst].append(disk)
            steps.append([peg.copy() for peg in local])
        else:
            solve_rec(n-1, src, aux, dst)
            disk = local[src].pop()
            local[dst].append(disk)
            steps.append([peg.copy() for peg in local])
            solve_rec(n-1, aux, dst, src)

    solve_rec(total, 0, 2, 1)
    return {"steps": steps}


@app.post("/undo")
async def undo():
    return game.undo()
