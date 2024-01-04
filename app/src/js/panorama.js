const { ipcRenderer }   = require('electron')
const ipc               = ipcRenderer

// buttons
btnCancel.addEventListener  ('click', () => { ipc.send('cancelApp') })