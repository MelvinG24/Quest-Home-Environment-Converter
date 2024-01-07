//
//
// ***************************************************
// Definitions
// ***************************************************
//
//

const { ipcRenderer, shell }   = require('electron');
const { Terminal }      = require('xterm');
const { FitAddon }      = require('xterm-addon-fit');
const { execSync }      = require('child_process');
const fs                = require('fs');
const path              = require('path');

const ipc               = ipcRenderer
const fitAddon          = new FitAddon()
const term              = new Terminal({
                                    theme: { foreground: '#00FF00' },
                                    cursorBlink:    false,
                                    convertEol:     true,
                                    scrollback:     70 - 1,
                                    rows:           1
                                });

// App Dir
const appRoot           = __dirname.slice(0, -4)
const buildPath         = path.join(appRoot, "Build")
const filesPath         = path.join(appRoot, "files")
const fPathTMP          = path.join(filesPath, "tmp")

// Element variables
const modalHelp         = document.querySelector("#modal-help")

let crea = null


//
//
// ***************************************************
// Main Elements
// ***************************************************
//
//

// Extras btns Area
btnPin              .addEventListener   ('click',   () => {
                                            document.querySelector('body').classList.toggle("bodyOnTop");
                                            btnPin.classList.toggle("bar-extra-pin-active");
                                            ipc.send('pinApp');
                                        })
btnHelp             .addEventListener   ('click',   () => { modalHelp.showModal()                                   })
btnMenu             .addEventListener   ('click',   () => { document.querySelector("#modal-menu").showModal();      })

// Window btns Area     
btnMin              .addEventListener   ('click',   () => { ipc.send('miniApp')                                     })
btnClose            .addEventListener   ('click',   () => { ipc.send('closeApp')                                    })

// Aside btns Area      
openEnvAPK          .addEventListener   ('click',   () => { ipc.send('openEnvAPK')                                  })
insllAfConver       .addEventListener   ('click',   () => { toggleCheck(insllAfConver, insllAfBuild);               })
btnPano             .addEventListener   ('click',   () => { ipc.send('panoWin')                                     })

// Quest btns Area  
btnDrive            .addEventListener   ('click',   () => { ipc.send('mountUSB')                                    })

// Package txt Area
txtPackage          .addEventListener   ('keydown', (e) => { packageTXTLimit(e)                                     })

// Build btns Area
buildInstallEnv     .addEventListener   ('click',   () => { ipc.send('buildInstallEnv')                             })
insllAfBuild        .addEventListener   ('click',   () => { toggleCheck(insllAfBuild, insllAfConver);               })
openBuildFolder     .addEventListener   ('click',   () => { ipc.send('openBuildFolder')                             })
deleteFilesBuild    .addEventListener   ('click',   () => { ipc.send('deleteFilesBuild')                            })


// Terminal
term.loadAddon(fitAddon)
term.open(document.querySelector('#terminal'))

fitAddon.fit()

ipc.on("term.inData", (e, d) => {
    term.writeln(d)
})

// term.onData((e) => {
//     ipc.send("term.outData", e)
// })

// Build
ipc.on("build.buildInstallEnv", async () => {
    const fFormat           =   ['.jpg', '.jpeg', '.png', '.bmp']
    const fK                =   '.ktx'

    if ((await fs.promises.readdir(fPathTMP)).length != 0) {
        const fFiles        =   ['_WORLD_MODEL.gltf.ovrscene', 'scene.zip', '_BACKGROUND_LOOP.ogg']
        fFiles.forEach(f =>     {
                                    if (fs.existsSync(path.join(fPathTMP, f))) fs.unlinkSync(path.join(fPathTMP, f))
                                })
    }

    if (KTXcompress.checked) {
        try {
            await fs.promises.readdir(buildPath)
            .then(files => {
                files.forEach(f => {
                    const fPath             = path.join(buildPath, f);
                    const fExt              = path.extname(fPath).toLowerCase();

                    if (fFormat.includes(fExt)) {
                        term                .writeln(`Compress Texture File: ${fPath}`);

                        const fName         = path.basename(fPath, fExt);
                        const command       = `${path.join(filesPath,"img2ktx.exe")} -o "${path.join(buildPath, fName)}.ktx" -m -f ASTC8x8 "${fPath}"`;

                        execSync            (command);
                        fs                  .unlinkSync(fPath);
                    }
                    if (fExt === ".gltf") {
                        let tkt             = fs.readFileSync(fPath, "binary");
                        if (tkt == null || !Array.isArray(tkt)) throw `File "${f}" is Invalid or Corrupt`

                        tkt                 = tkt.replace(/\.jpg/g,     ".ktx");
                        tkt                 = tkt.replace(/\/jpg/g,     ".ktx");
                        tkt                 = tkt.replace(/\.jpeg/g,    ".ktx");
                        tkt                 = tkt.replace(/\/jpeg/g,    ".ktx");
                        tkt                 = tkt.replace(/\.png/g,     ".ktx");
                        tkt                 = tkt.replace(/\/png/g,     ".ktx");
                        tkt                 = tkt.replace(/\/bmp/g,     ".ktx");

                        fs                  .writeFileSync(fPath, tkt, "binary");
                    }
                })
            })
        } catch(err) {
            term.writeln(`\n::: ERROR :::\nAn error occurred:\n ${err}`)
            return;
        }
    }

    const checkBuildPath    = await fs.promises.readdir(buildPath)
                                .then(files => {
                                    let j = false,      k = false
                                    fFormat.map(f => {  if (files.filter(x => x.endsWith(`${f}`)).length > 0) j = true })
                                                        if (files.filter(x => x.endsWith(`${fK}`)).length > 0) k = true
                                    return              (j === true && k === true) ? true : false;
                                })

    if (checkBuildPath) {
        ipc.invoke              ("dialog.showDialog", "Error", ".JPG/.PNG and .KTX present in same folder!");
        term.writeln            (".JPG/.PNG and .KTX present in same folder!\n")
        return;
    }

    weit3();
})


//
//
// ***************************************************
// Functions
// ***************************************************
//
//

modalHelp.addEventListener('close', () => {
    // TODO: Open on Web-browser not on electron
    switch(modalHelp.returnValue) {
        case "web":
            open("https://documentcloud.adobe.com/link/track?uri=urn:aaid:scds:US:378deebf-9e73-4100-bdb1-40b816baef58");
            break;
        case "pdf":
            open(appRoot + "\\EnviromentConverterBuilder_HowTo.pdf");
            break;
        default:
            break;
    }
})


ipc.on("quest.MountUSB", () => {
    try {
        const command       = `"${path.join(filesPath, "adb.exe")}" shell svc usb setFunctions mtp true`;

        execSync            (command)

        shell               .beep                                   ()
        document            .querySelector('#status_id')            .classList.add('questConnected_id')
        document            .querySelector('#status')               .classList.add('questConnected_txt')
        document            .querySelector('#btnDrive')             .classList.add('questConnected_txt')
        document            .querySelector('#status')               .textContent = "Connected"
        term                .write                                  ('>>> Quest mounted as drive <<<\n')
    } catch(err) {
        document            .querySelector('#status_id')            .classList.remove('questConnected_id')
        document            .querySelector('#status')               .classList.remove('questConnected_txt')
        document            .querySelector('#btnDrive')             .classList.remove('questConnected_txt')
        document            .querySelector('#status')               .textContent = "Disconnected"
        term.writeln(`\n::: ERROR :::\n ${err}`)
        return;
    }
})


function packageTXTLimit(e) {
    const key   = e.keyCode

    if (txtPackage.value.length <= 16) {
        if (key === 8   ||
            key === 46  ||
            key === 88  &&
            e.ctrlKey) {
                e.preventDefault()
        }
    }
    if (txtPackage.selectionStart <= 16){
        txtPackage.setSelectionRange(16, txtPackage.selectionEnd)
    }
}


function weit3() {
    // TODO: define aud variable
    const label9        = document.querySelector("Audiotxt")
    const check1        = document.querySelector("#DecraseVolume")
    const check2        = document.querySelector("#AudioDefault")
    const check3        = document.querySelector("#AudioSilent")
    const check4        = document.querySelector("#EncodeOGG")
    const lvButtons_H   = document.querySelector("#DVComboBox")

    try {
        switch(true) {
            case crea               === 2:
            case check3             .checked:
                                                                                fs.copyFile     (path.join(filesPath, "silent.ogg"),    path.join(fPathTMP, "_BACKGROUND_LOOP.ogg"),    (err) => { if (err) throw err })
                                                                                tell            ()
                                                                                break;
            case check2             .checked:
                                                                                fs.copyFile     (path.join(filesPath, "default.ogg"),   path.join(fPathTMP, "_BACKGROUND_LOOP.ogg"),    (err) => { if (err) throw err })
                                                                                tell            ()
                                                                                break;
            case label9.value.slice(-3).toLowerCase() === "ogg"     &&
                !check4             .checked                        &&
                !check1             .checked:
                                                                                fs.copyFile     (aud,                                   path.join(fPathTMP, "_BACKGROUND_LOOP.ogg"),    (err) => { if (err) throw err })
                                                                                tell            ()
                                                                                break;
            default:                                                            break;
        }
        if (label9.value && !check3.checked && !check2.checked)             { killer            (); }
        else                                                                {
                                                                                term            .writeln(` \n\nEncode Audio File...\n`)
                                                                                const command = (check1.checked) ?  `${path.join(filesPath,"sox.exe")} -S "${aud}" -C 3 "${path.join(fPathTMP, "_BACKGROUND_LOOP.ogg")}" vol -${lvButtons_H.options[lvButtons_H.selectedIndex].value} dB` :
                                                                                                                    `${path.join(filesPath,"sox.exe")} -S "${aud}" -C 3 "${path.join(fPathTMP, "_BACKGROUND_LOOP.ogg")}"`;
                                                                                execSync        (command);

                                                                                killer          ();
                                                                            }
    } catch (err) {
        term.writeln(`\n::: ERROR :::\nAn error occurred:\n ${err}`)
        return;
    }
}


function killer(fPath = filesPath, fFiles = ['tmpz.apk', 'tmp.apk', 'tmp.zip', 'scene.zip'], i = 0) {
    fFiles.forEach(f =>             {
                                        if (fs.existsSync(path.join(fPath, f))) {
                                            fs.unlinkSync(path.join(fPath, f))
                                        }
                                    })

    if (i > 0)                      { return }
    else                            { killer(fPathTMP, [...fFiles, 'temp_ec.wav'], 1) }

    tell()
}


function tell() {
    // TODO: Complete tell function
    try {
        const command       = `${path.join(filesPath,"7za.exe")} a "${path.join(fPathTMP, "_WORLD_MODEL.gltf.ovrscene.zip")}" "${path.join(buildPath, "\*")}"`;

        executionAsyncId(command)
        // execSync            (command);
    } catch (err) {
        term.writeln(`\n::: ERROR :::\nAn error occurred:\n ${err}`)
        return;
    }
    // TODO: Tell
    return;
}


//
//
// ***************************************************
// Miscellaneous
// ***************************************************
//
//

ipc.on ("modal.toggle", (e, b) =>       { document.querySelector('#modalBlock').classList.toggle('toggleDisplay', b)   })

function toggleCheck(e, d)              { d.checked = e.checked }