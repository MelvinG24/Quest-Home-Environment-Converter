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
        // TODO: Add erro handle
        // TODO: Check why term clean after execution
        // const fFiles        = [...fFormat, '.gltf']
        try {
            await fs.promises.readdir(buildPath)
            .then(files => {
                files.forEach(f => {
                    let fpath = path.join(buildPath, f);
                    let fileExtension = path.extname(fpath).toLowerCase();
                    if (fFormat.includes(fileExtension)) {
                        term.writeln(`Compress Texture File: ${fpath}`);
                        let baseName = path.basename(fpath, fileExtension);
        
                        let command = `${filePath}/img2ktx.exe -o "${buildPath}/${baseName}.ktx" -m -f ASTC8x8 "${filePath}"`;
                        // let command = `${path.join(filesPath, "img2ktx.exe")} -o "${path.join(buildPath, path.basename(x))}" -m -f ASTC8x8 "${path.join(buildPath, x)}"`;
        
                        execSync(command);
                        fs.unlinkSync(fpath);
                    }
                    if (fileExtension === ".gltf") {
                        let fileContent = fs.readFileSync(fpath, 'utf8');
                        fileContent = fileContent.replace(/\.jpg/g, ".ktx");
                        fileContent = fileContent.replace(/\/jpg/g, ".ktx");
                        fileContent = fileContent.replace(/\.jpeg/g, ".ktx");
                        fileContent = fileContent.replace(/\/jpg/g, ".ktx");
                        fileContent = fileContent.replace(/\.png/g, ".ktx");
                        fileContent = fileContent.replace(/\/png/g, ".ktx");
                        fileContent = fileContent.replace(/\/bmp/g, ".ktx");
                        fs.writeFileSync(fpath, fileContent);
                    }
                })
            })

        } catch(err) {
            term.writeln(`An error occurred: ${err}`)
        }
        // const ret           = await fs.promises.readdir(buildPath)
        // .then(files => {
        //     fFiles.forEach(f => {
        //         files.filter(x => {
        //             if (x.endsWith(`${f}`) != '.gltf') {
        //                 term.writeln(`Compress Texture File: ${buildPath}\\${x}\n`)

        //                 let command = `${path.join(filesPath, "img2ktx.exe")} -o "${path.join(buildPath, path.basename(x))}" -m -f ASTC8x8 "${path.join(buildPath, x)}"`;

        //                 execSync(command)
        //                 fs.unlinkSync(path.join(buildPath, x))
        //             }
        //             if (x.endsWith(`${f}`) == '.gltf') {
        //                 let tkt     =   fs.readFileSync(path.join(buildPath, x), "binary");

        //                 tkt         =   tkt.replace(/\.jpg/g,  ".ktx");
        //                 tkt         =   tkt.replace(/\/jpg/g,  ".ktx");
        //                 tkt         =   tkt.replace(/\.jpeg/g, ".ktx");
        //                 tkt         =   tkt.replace(/\/jpeg/g, ".ktx");
        //                 tkt         =   tkt.replace(/\.png/g,  ".ktx");
        //                 tkt         =   tkt.replace(/\/png/g,  ".ktx");
        //                 tkt         =   tkt.replace(/\/bmp/g,  ".ktx");

        //                                 fs.writeFileSync(path.join(buildPath, x), tkt);
        //             }
        //         })
        //     })
        // })
    }

    const checkBuildPath    = await fs.promises.readdir(buildPath).then(files => {
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


