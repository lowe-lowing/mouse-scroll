import * as vscode from "vscode";
import { spawn } from "child_process";
import * as readline from "readline";
import path from "path";

export function activate(context: vscode.ExtensionContext) {
  const mouseListener = spawn("python", [path.join(__dirname, "mouse_listener.py")]);
  const scrollHandler = spawn("python", [path.join(__dirname, "scroll_handler.py")]);

  let lastMousePosition: { x: number; y: number } | null = null;
  let rightClickPressed = false;

  const rl = readline.createInterface({
    input: mouseListener.stdout,
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", (line) => {
    try {
      const event = JSON.parse(line);
      if (event.event === "right_click") {
        rightClickPressed = event.pressed;
      } else if (event.event === "move" && rightClickPressed) {
        const currentMousePosition = { x: event.x, y: event.y };

        if (lastMousePosition) {
          const deltaX = currentMousePosition.x - lastMousePosition.x;

          // Send deltaX to the scroll handler
          scrollHandler.stdin.write(JSON.stringify({ event: "move", delta_x: deltaX }) + "\n");
        }

        lastMousePosition = currentMousePosition;
      }
    } catch (error) {
      console.log(line);
      console.error("Error parsing mouse event:", error);
    }
  });

  mouseListener.stderr.on("data", (data) => {
    console.error(`Mouse listener error: ${data.toString()}`);
  });

  scrollHandler.stderr.on("data", (data) => {
    console.error(`Scroll handler error: ${data.toString()}`);
  });

  context.subscriptions.push({
    dispose: () => {
      mouseListener.kill();
      scrollHandler.kill();
    },
  });

  vscode.window.showInformationMessage("Mouse scroll feature activated!");
}

export function deactivate() {}

// function scrollEditor(deltaX: number, deltaY: number) {
//   const editor = vscode.window.activeTextEditor;
//   if (!editor) return;

//   const document = editor.document;
//   const visibleRange = editor.visibleRanges[0];
//   vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
//     if (event.textEditor === editor) {
//       // Detect scrolling indirectly by inspecting the visible range
//       console.log("Visible range:", event.visibleRanges);
//     }
//   });

//   //   initialize variables
//   //   5 is the prefix for vertical scroll
//   const scrollDeltaY = 5 + deltaY;
//   const scrollDeltaX = 5;

//   let newStartLine = visibleRange.start.line + scrollDeltaY;
//   let newStartCharacter = visibleRange.start.character;
//   let newEndLine = visibleRange.end.line + scrollDeltaY;
//   let newEndCharacter = visibleRange.end.character;

//   console.log(newStartCharacter, newEndCharacter);

//   // Create new range
//   const newStart = new vscode.Position(100, 50);
//   const newEnd = new vscode.Position(150, 150);
//   const newRange = new vscode.Range(newStart, newEnd);

//   // Reveal the new range in the editor
//   editor.revealRange(newRange, vscode.TextEditorRevealType.InCenter);
// }
