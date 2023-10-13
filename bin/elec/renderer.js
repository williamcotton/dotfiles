const form = document.getElementById("my-form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  ipcRenderer.send("log", Object.fromEntries(formData).name);
  ipcRenderer.send("exit");
});

stdin((data) => {
  console.log(new TextDecoder('utf-8').decode(data))
});