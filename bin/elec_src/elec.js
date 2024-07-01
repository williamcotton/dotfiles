const { app, BrowserWindow, ipcMain, nativeImage, Tray } = require("electron");
const path = require("node:path");
const { argv } = require("node:process");
const os = require("node:os");
const minimist = require("minimist");
const { spawn } = require("child_process");
const tmp = require("tmp");
const fs = require("fs");

const currentPid = process.pid;
const parentPid = process.ppid;
let grandparentPid = null;
const pstree = spawn("pstree", ["-p", currentPid.toString()]);
pstree.stdout.on("data", (data) => {
  let prevPid = null;
  data.toString().split("\n").forEach((line) => {
    const match = line.match(/(\d+)/);
    if (match) {
      const pid = parseInt(match[1], 10);
      if (pid === parentPid) {
        grandparentPid = prevPid;
      }
      prevPid = pid;
    }
  });
});

const args = minimist(argv.slice(2));
const coords = { x: parseInt(args.x, 10), y: parseInt(args.y, 10) };

const moduleName = argv[2];

// Enable the remote module for the main process.
require('@electron/remote/main').initialize()

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 320,
    height: 240,
    x: coords.x,
    y: coords.y,
    title: moduleName,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Enable the remote module for the renderer process.
  require('@electron/remote/main').enable(mainWindow.webContents)

  // Load the module HTML file.
  const filename = `../../elec/${moduleName}.html`;
  mainWindow.loadFile(filename);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  ipcMain.on("resize-window", (event, { width, height }) => {
    mainWindow.setSize(width, height);
  });
  
  ipcMain.on("focus-window", (event) => {
    mainWindow.focus();
  });

  // When the window is closed, quit the app.
  mainWindow.on("closed", function () {
    app.quit();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  process.on("SIGINT", () => {
    app.quit();
  });
});

// Listen for the stdout event from the renderer process.
ipcMain.on("stdout", (event, data) => {
  process.stdout.write(data);
});

process.stdout.on("close", () => {
  app.quit();
});

// Listen for the exit event from the renderer process.
ipcMain.on("exit", (event, arg) => {
  app.quit();
});

// Listen for the stdin-request event from the renderer process.
ipcMain.on("stdin-request", (event) => {
  process.stdin.on("data", (chunk) => {
    event.reply("stdin-response", chunk);
  });
});

// Call the textpng command with the "pick" argument.
const textpng = spawn("textpng", [moduleName]);

// Save the output to a buffer.
let buffer = Buffer.alloc(0);
textpng.stdout.on("data", (data) => {
  buffer = Buffer.concat([buffer, data]);
});

// When the command finishes, write the buffer to a temporary file and set the app dock icon.
textpng.on("close", (code) => {
  if (code === 0) {
    // Write the buffer to a temporary file.
    const tmpobj = tmp.fileSync({ postfix: ".png" });
    fs.writeFileSync(tmpobj.name, buffer);

    // Set the app dock icon to the temporary file.
    app.dock.setIcon(tmpobj.name);
  } else {
    console.error(`textpng exited with code ${code}`);
  }
});

// const WIDTH = 100;
// const HEIGHT = 50;

// const canvas = createCanvas(WIDTH, HEIGHT);
// const ctx = canvas.getContext('2d');

// ctx.fillStyle = '#fff'; // Set the background color to white
// ctx.fillRect(0, 0, WIDTH, HEIGHT);

// ctx.fillStyle = '#000'; // Set the text color to black
// ctx.font = 'bold 24px sans-serif';
// ctx.textAlign = 'center';
// ctx.textBaseline = 'middle';
// ctx.fillText(module, WIDTH / 2, HEIGHT / 2);

// const buffer = canvas.toBuffer('image/png');

// tmp.file((err, path, fd, cleanupCallback) => {
//   if (err) throw err;

//   fs.write(fd, buffer, 0, buffer.length, 0, (err, written, buffer) => {
//     if (err) throw err;

//     // console.log(`PNG image written to ${path}`);
//     app.dock.setIcon(path);

//     cleanupCallback();
//   });
// });