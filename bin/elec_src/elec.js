const { app, BrowserWindow, ipcMain, nativeImage, Tray } = require("electron");
const path = require("node:path");
const { argv } = require("node:process");
const os = require("node:os");

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 320,
    height: 240,
    // frame: false,
    // transparent: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      sandbox: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the module HTML file.
  const module = argv[2];
  const filename = `../../elec/${module}.html`;
  mainWindow.loadFile(filename);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

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

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// Listen for the stdout event from the renderer process.
ipcMain.on("stdout", (event, data) => {
  console.log(data);
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

ipcMain.on("resize-window", (event, { width, height }) => {
  const window = BrowserWindow.getFocusedWindow();
  if (!window) return;

  window.setSize(width, height);
});
