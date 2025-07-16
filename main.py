class Game:
    def __init__(self):
        self.rings = 0
        self.board = []
        self.history = []

    def start(self, rings):
        self.rings = rings
        self.board = [[rings - i for i in range(rings)]]
        self.board.append([])
        self.board.append([])
        self.history = []

    def move(self, src, dst):
        if 0 <= src < 3 and 0 <= dst < 3:
            if len(self.board[dst]) == 0 or (len(self.board[src]) > 0
                                             and self.board[src][-1] == self.board[dst][-1] + 1):
                self.board[dst].pop(self.board[src])
                return True
            return False
        return False

    def solve(self):
        self.start(self.rings)

    def undo(self):
        self.board = [[self.history[i][j] for j in range(len(self.history[i]))] for i in range(len(self.history))]


def main():
    print("Welcome to the Tower of Hanoi Solver!")


if __name__ == "__main__":
    main()
