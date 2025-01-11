from pynput import mouse
import sys
import json

def on_click(x, y, button, pressed):
    if button == mouse.Button.right:
        print(json.dumps({"event": "right_click", "x": x, "y": y, "pressed": pressed}))
        sys.stdout.flush()

def on_move(x, y):
    print(json.dumps({"event": "move", "x": x, "y": y}))
    sys.stdout.flush()

with mouse.Listener(on_click=on_click, on_move=on_move) as listener:
    listener.join()