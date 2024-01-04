//
//
// ***************************************************
// Definitions
// ***************************************************
//
//

const { ipcRenderer }   = require('electron');
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


let crea = 0

//
//
// ***************************************************
// Main Elements
// ***************************************************
//
//

// btnExtras
btnPin              .addEventListener   ('click', () => {
                                            document.querySelector('body').classList.toggle("bodyOnTop");
                                            btnPin.classList.toggle("bar-extra-pin-active");
                                            ipc.send('pinApp');
                                        })

// btnWindow
btnMin              .addEventListener   ('click', () => { ipc.send('miniApp')           })
btnClose            .addEventListener   ('click', () => { ipc.send('closeApp')          })

// btnAside
openEnvAPK          .addEventListener   ('click', () => { ipc.send('openEnvAPK')        })
btnPano             .addEventListener   ('click', () => { ipc.send('panoWin')           })

// BuildButtons
buildInstallEnv     .addEventListener   ('click', () => { ipc.send('buildInstallEnv')   })
openBuildFolder     .addEventListener   ('click', () => { ipc.send('openBuildFolder')   })

deleteFilesBuild    .addEventListener   ('click', () => { ipc.send('deleteFilesBuild')  })


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
ipc.on("build.buildInstallEnv", async (e, buildPath, filesPath) => {
    const fFormat           = ['.jpg', '.jpeg', '.png', '.bmp']
    const fK                = '.ktx'

    if ((await fs.promises.readdir(path.join(filesPath, 'tmp'))).length != 0) {
        const fFiles        = ['_WORLD_MODEL.gltf.ovrscene', 'scene.zip', '_BACKGROUND_LOOP.ogg']
        fFiles.forEach(f => {
            if (fs.existsSync(path.join(filesPath, 'tmp', f))) fs.unlinkSync(path.join(filesPath, 'tmp',f))
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
                        term.writeln(`Compress Texture File: ${fPath}`);

                        const fName         = path.basename(fPath, fExt);
                        const command       = `${path.join(filesPath,"img2ktx.exe")} -o "${path.join(buildPath, fName)}.ktx" -m -f ASTC8x8 "${fPath}"`;

                        execSync(command);
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
            term.writeln(`\n::: ERROR :::\nAn error occurred: ${err}`)
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
})


//
//
// ***************************************************
// Functions
// ***************************************************
//
//

