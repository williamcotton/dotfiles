const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const { argv } = require('node:process');
const os = require('node:os');

const createWindow = () => {
   // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "elec_src/preload.js"),
    },
  });

  // Load the module HTML file.
  const module = argv[2];
  const filename = `../elec/${module}.html`;
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
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// Listen for the stdout event from the renderer process.
ipcMain.on('stdout', (event, data) => {
  console.log(data)
})

// Listen for the exit event from the renderer process.
ipcMain.on('exit', (event, arg) => {
  app.quit()
});

// Listen for the stdin-request event from the renderer process.
ipcMain.on('stdin-request', (event) => {
  let data = [];
  process.stdin.on('data', (chunk) => {
    data.push(chunk);
  });
  process.stdin.on('end', () => {
    event.reply('stdin-response', Buffer.concat(data));
  });
});