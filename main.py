class Game:
    def __init__(self):
        self.rings = 0
        self.board = []
        self.history = []

    def start(self, rings):
        self.rings = rings
        self.board = [[rings - i for i in range(rings)]]  # Initial state: all rings on the first peg
        self.board.append([])  # Second peg is empty
        self.board.append([])  # Third peg is empty
        self.history = []  # Clear history for a new game
        self.history.append([list(peg) for peg in self.board])  # Store initial state

    def move(self, src, dst):
        if not (0 <= src < 3 and 0 <= dst < 3):
            return False, "Invalid source or destination peg."

        if src == dst:
            return False, "Source and destination cannot be the same."

        if not self.board[src]:
            return False, "Source peg is empty."

        ring_to_move = self.board[src][-1]

        if self.board[dst] and ring_to_move > self.board[dst][-1]:
            return False, "Cannot place a larger ring on a smaller ring."

        # Store current state before making the move for undo functionality
        self.history.append([list(peg) for peg in self.board])

        self.board[dst].append(self.board[src].pop())
        return True, "Move successful!"

    def solve(self):
        self.start(self.rings)  # Reset the game to its initial state
        print("Solving Tower of Hanoi...")
        self.print_board() # <--- Add this line to show the initial board
        self._solve_recursive(self.rings, 0, 2, 1) # Start solving from peg 0 to 2, using 1 as auxiliary

    def _solve_recursive(self, n, src, dst, aux):
        if n == 1:
            print(f"Move ring 1 from peg {src} to peg {dst}")
            # Simulate the move for visualization
            ring = self.board[src].pop()
            self.board[dst].append(ring)
            self.print_board()
            self.history.append([list(peg) for peg in self.board])
            return

        self._solve_recursive(n - 1, src, aux, dst)
        print(f"Move ring {n} from peg {src} to peg {dst}")
        # Simulate the move for visualization
        ring = self.board[src].pop()
        self.board[dst].append(ring)
        self.print_board()
        self.history.append([list(peg) for peg in self.board])
        self._solve_recursive(n - 1, aux, dst, src)

    def undo(self):
        if len(self.history) > 1:  # Cannot undo the initial state
            self.history.pop()  # Remove the current state
            self.board = [list(peg) for peg in self.history[-1]]  # Revert to the previous state
            return True, "Undo successful!"
        return False, "Cannot undo further."

    def print_board(self):
        print("\n--- Current Board ---")
        for i, peg in enumerate(self.board):
            print(f"Peg {i}: {peg}")
        print("---------------------\n")


def main():
    print("Welcome to the Tower of Hanoi Solver!")
    game = Game()

    while True:
        print("\n--- Main Menu ---")
        print("1. Start a new game")
        print("2. Quit")
        choice = input("Enter your choice: ")

        if choice == '1':
            while True:
                try:
                    rings = int(input("Enter the number of rings: "))
                    game.start(rings)
                    game.print_board()
                    break
                except ValueError:
                    print("Invalid input. Please enter a number.")

            while True:
                print("\n--- Game Menu ---")
                print("1. Move a ring")
                print("2. Let the computer solve the puzzle")
                print("3. Undo a move")
                print("4. Restart the game")
                print("5. Start a new game (different number of rings)")
                print("6. Quit program")
                game_choice = input("Enter your choice: ")

                if game_choice == '1':
                    try:
                        src = int(input("Enter source peg (0, 1, or 2): "))
                        dst = int(input("Enter destination peg (0, 1, or 2): "))
                        success, message = game.move(src, dst)
                        print(message)
                        if success:
                            game.print_board()

                        # Check for win condition
                        if len(game.board[2]) == game.rings and all(
                                game.board[2][i] == game.rings - i for i in range(game.rings)):
                            print(f"Congratulations! You solved the Tower of Hanoi with {game.rings} rings!")
                            break  # Go back to main menu
                    except ValueError:
                        print("Invalid input. Please enter numbers for pegs.")

                elif game_choice == '2':
                    game.solve()
                    print(f"The computer has solved the {game.rings}-ring Tower of Hanoi!")
                    break  # Go back to main menu after solving

                elif game_choice == '3':
                    success, message = game.undo()
                    print(message)
                    if success:
                        game.print_board()

                elif game_choice == '4':
                    game.start(game.rings)  # Restart with the same number of rings
                    print("Game restarted!")
                    game.print_board()

                elif game_choice == '5':
                    break  # Break from game menu to go back to main menu for a new game

                elif game_choice == '6':
                    print("Goodbye!")
                    return  # Exit the program

                else:
                    print("Invalid choice. Please try again.")

        elif choice == '2':
            print("Goodbye!")
            break  # Exit the program

        else:
            print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()
