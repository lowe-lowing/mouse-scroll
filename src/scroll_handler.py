from pynput.keyboard import Key, Controller
import sys
import json

# Initialize the keyboard controller
keyboard = Controller()

tick = 0
def scroll_horizontally(delta_x):
    """
    Simulates horizontal scrolling by pressing Alt + RightArrow or Alt + LeftArrow.
    """
    global tick
    if tick == 0:
        # Determine the number of key presses needed (e.g., 1 key press per 10 delta_x units)
        scroll_steps = abs(delta_x)
        direction = Key.right if delta_x < 0 else Key.left

        for _ in range(scroll_steps):
            with keyboard.pressed(Key.alt):
                keyboard.press(direction)
                keyboard.release(direction)
    tick = (tick + 1) % 8

if __name__ == "__main__":
    # Read delta_x values from stdin
    for line in sys.stdin:
        try:
            event = json.loads(line.strip())
            if event["event"] == "move":
                delta_x = event["delta_x"]
                scroll_horizontally(delta_x)
        except Exception as e:
            print(f"Error processing event: {e}", file=sys.stderr)