//
//
// ***************************************************
// Definitions
// ***************************************************
//
//

const {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    shell,
} = require("electron");

const path      = require("path");
const fs        = require('fs');

require("electron-reloader")(module);

const buildPath = path.join(__dirname, "Build");
const filesPath = path.join(__dirname, "files");
const termLine  = "==========================================\n";
const ipc       = ipcMain;

let mainWindow;
let panoWindow;

let sendMainWindow;


//
//
// ***************************************************
// Main Window
// ***************************************************
//
//

const createMainWindow = function() {
    mainWindow = new BrowserWindow({
        alwaysOnTop:            false,
        resizable:              false,
        width:                  1060,
        height:                 730,
        maximizable:            false,
        titleBarStyle:          "hidden",
        icon:                   path.join(__dirname, "app/src/img/HomesIcon.ico"),
        webPreferences: {
            // devTools:           false,
            sandbox:            false,
            nodeIntegration:    true,
            contextIsolation:   false,
            preload:            path.join(__dirname, "preload.js"),
        }
    });

    // mainWindow.webContents.openDevTools()

    mainWindow.loadFile("app/index.html");
    sendMainWindow = mainWindow.webContents

    // extra_functions
    ipc.handle('dialog.showDialog', (e, t, m) => {
        dialog.showMessageBox(mainWindow, {
            title: t,
            message: m,
        })
    })

    // btnExtras
    ipc.on('pinApp',            ()  => {
                                            const onTop = mainWindow.isAlwaysOnTop();
                                            mainWindow.setAlwaysOnTop(!onTop);
                                        })
    ipc.on('mountUSB',          () => {     sendMainWindow.send("quest.MountUSB", filesPath.toString()) })

    // btnWindow
    ipc.on('miniApp',           ()  => {    mainWindow.minimize();  })
    ipc.on('closeApp',          ()  => {    mainWindow.close();     })

    // btnAside
    ipc.on('fileDropped',       (e, f, p, t) => {
                                            if (checkFileWin(t)) {
                                                sendMainWindow              .send("term.inData", 
                                                    `File Dropped: \n name: ${f.toString()} \n type: ${t.toString()} \n path: ${p.toString()}\n`)
                                            } else {
                                                dialog.showErrorBox("", `Unsupported file format:\n\t${t}`);
                                                sendMainWindow              .send("term.inData", `Unsupported file format: ${t}\n`)
                                            }
                                        })
    ipc.on('openEnvAPK',        ()  => {
                                            console.log(dialog.showOpenDialog(mainWindow, {
                                                title: "Open APK Environment file",
                                                properties: ["openFile"],
                                                filters: [
                                                    {name: 'APK file', extensions: ["apk"]}
                                                ]
                                            }))
                                        })
    ipc.on('panoWin',           ()  => {
                                            sendMainWindow              .send("modal.toggle", true);
                                            createPanoWindow();
                                        })

    // BuildButtons
    ipc.on('buildInstallEnv',   ()  => {
                                            fs.readdir(buildPath, (err, files) => {
                                                const fFormat       = ['.apk', '.zip', '.rar', '.mp3', '.ogg', '.wav', '.wma', '.fla', '.pcm', '.ovrscene']
                                                try {
                                                    if (err) throw err;
                                                    if (!files.length || !Array.isArray(files)) {
                                                        shell               .beep           ()
                                                        dialog              .showErrorBox   ("Empty Folder", "Put your .gLTF model-files in dir .\\Build");
                                                        sendMainWindow      .send           ("term.inData", `Build Fail!\n>>> Empty build folder.\n`)
                                                        throw false;
                                                    }
                                                    if (files.filter((x) => x.match(new RegExp(`.*\..glb$`))).length > 0) {
                                                        shell               .beep           ()
                                                        dialog              .showErrorBox   (`.glb file found!`, `.glb file found in .\\Build, Error!\nChoose glTF separate in Blender`);
                                                        sendMainWindow      .send           ("term.inData", `Build Fail!\n>>> .glb file found in build folder.\n`)
                                                        throw false;
                                                    }
                                                    if (files.filter((x) => x.match(new RegExp(`.*\..gltf$`))).length > 1) {
                                                        shell               .beep           ()
                                                        dialog              .showErrorBox   (`Multiples .glTF file found!`, `More than one .glTF file found in .\\Build, Error!`);
                                                        sendMainWindow      .send           ("term.inData", `Build Fail!\n>>> Multiples .glTF files found in vuild folder.\n`)
                                                        throw false;
                                                    }
                                                    fFormat.map((f) => {
                                                        if (files.filter((x) => x.match(new RegExp(`.*\.${f}$`))).length > 0) {
                                                            shell           .beep           ()
                                                            dialog          .showErrorBox   (`${f} file found!`, `${f} file found in .\\Build, Error!`);
                                                            sendMainWindow  .send           ("term.inData", `Build Fail!\n>>> ${f} file found in build folder.\n`)
                                                            throw false;
                                                        }
                                                    })
                                                } catch(e) {
                                                    return e;
                                                }
                                                sendMainWindow              .send           ("term.inData", `${termLine}>>> Start Building... <<<\n`)
                                                sendMainWindow              .send           ("build.buildInstallEnv", buildPath.toString(), filesPath.toString())
                                            })
                                        })

    ipc.on('openBuildFolder',   ()  => {    shell.openPath(buildPath)  })

    ipc.on('deleteFilesBuild',  ()  => {
                                            fs.readdir(buildPath, (err, files) => {
                                                if (err) return err;
                                                if (!files.length || !Array.isArray(files)) {
                                                    shell.beep()
                                                    dialog                  .showErrorBox   ("Empty Folder", "Folder is already empty");
                                                } else {
                                                    sendMainWindow          .send           ("term.inData", ">>> Deleting Build folder files... <<<");
                                                    for (let i = 0; i < files.length; i++) {
                                                        fs.unlink(__dirname + '\\Build\\' + files[i], (er) => {
                                                            if (er) return er;
                                                            sendMainWindow  .send           ("term.inData", `Removed file: ${files[i]}`)
                                                        })
                                                    }
                                                }
                                                sendMainWindow              .send           ("term.inData", `\n`);
                                            })
                                        })

    // Terminal
};


//
//
// ***************************************************
// Child Window
// ***************************************************
//
//

const createPanoWindow = () => {
    panoWindow = new BrowserWindow({
        parent:                 mainWindow,
        modal:                  true,
        resizable:              false,
        width:                  935,
        height:                 578,
        titleBarStyle:          "hidden",
        webPreferences: {
            // devTools:           false,
            nodeIntegration:    true,
            contextIsolation:   false,
            preload:            path.join(__dirname, "preload.js"),
        }
    });

    panoWindow.loadFile("app/panorama.html");

    panoWindow.center();

    ipc.on('cancelApp',         ()  => {
                                            sendMainWindow.send("modal.toggle", false);
                                            panoWindow.close();
                                        })

    // ipc.handle('showDialog',    (e, m) => {
    //     dialog.showErrorBox("" ,m.toString())
    // })
}


//
//
// ***************************************************
// Window Ready
// ***************************************************
//
//

app.whenReady().then(function() {
    createMainWindow()

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0 ) createMainWindow()
    })
});

app.on("window-all-closed", function() {
    if (process.platform != 'darwin') app.quit();
});


//
//
// ***************************************************
// Functions
// ***************************************************
//
//

let checkFileWin = (t) => {
    let winCheck  = () => {
            if (panoWindow == undefined || panoWindow.isDestroyed()) return true;
            return false;
        }
    const fFormat   = [
        "audio/mpeg",
        "audio/ogg",
        "audio/wav",
        "audio/x-ms-wma"
    ]
    try {
        fFormat.map(f => { if (t == f) throw true; })
        if (winCheck()) {
            throw t == "application/vnd.android.package-archive" ? true : false;
        } else {
            throw t == "image/jpeg" ? true : t == "image/png" ? true : false;
        }
    } catch(e) {
        return e;
    }
}