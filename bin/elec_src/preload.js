const { contextBridge, ipcRenderer } = require("electron");
const { parse: csvParse } = require("csv-parse");
const { argv } = require("node:process");

const remote = require('@electron/remote');

contextBridge.exposeInMainWorld("ipcRenderer", ipcRenderer);

contextBridge.exposeInMainWorld(
  "csvParse",
  (data, options, callback) => csvParse
);

contextBridge.exposeInMainWorld("resizeWindow", (width, height) => {
  ipcRenderer.send("resize-window", { width, height });
});

contextBridge.exposeInMainWorld("focusWindow", () => {
  ipcRenderer.send("focus-window");
});

// SYSTEM CALLS

contextBridge.exposeInMainWorld("ARGV", remote.process.argv);

contextBridge.exposeInMainWorld("STDIN", (callback) => {
  ipcRenderer.on("stdin-response", (_, data) => {
    const decoder = new TextDecoder("utf-8");
    callback(decoder.decode(data));
  });
  ipcRenderer.send("stdin-request");
});

contextBridge.exposeInMainWorld("STDOUT", (log) => {
  ipcRenderer.send("stdout", log);
});

contextBridge.exposeInMainWorld("EXIT", () => {
  ipcRenderer.send("exit");
});

contextBridge.exposeInMainWorld("STDOUT_AND_EXIT", (log) => {
  ipcRenderer.send("stdout", log);
  ipcRenderer.send("exit");
});
