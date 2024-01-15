//
//
// ***************************************************
// Definitions
// ***************************************************
//
//

const {
    ipcRenderer,
    shell
} = require('electron');

const   { Terminal }    = require('xterm');
const   { FitAddon }    = require('xterm-addon-fit');
const   { execSync }    = require('child_process');
const   audioPlayer     = require('node-wav-player');
const   path            = require('path');
const   ini             = require('ini')
const   fs              = require('fs');

const   ipc             = ipcRenderer
const   fitAddon        = new FitAddon()
const   term            = new Terminal({
                                    theme: { foreground: '#00FF00' },
                                    cursorBlink:    false,
                                    convertEol:     true,
                                    scrollback:     70 - 1,
                                    rows:           1
                                });

// App Dir
const   appRoot         = __dirname.slice(0, -4)
const   buildPath       = path.join(appRoot, "Build")
const   filesPath       = path.join(appRoot, "files")
const   fPathTMP        = path.join(filesPath, "tmp")

// Element variables
const   modalHelp       = document.querySelector("#modal-help")
let     crea            = null
let     apkPath         = null
let     audPath         = null
let     jsPath          = null
let     javaPath        = null
let     idr             = null
let     idr2            = null
let     fin2            = null

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
btnOpenEnvAPK       .addEventListener   ('click',   () => { openEnvAPK()                                            })
btnConvInstallEnv   .addEventListener   ('click',   () => { convInstallEnv()                                        })
btnInsllAfConver    .addEventListener   ('click',   () => { toggleCheck(btnInsllAfConver, chckInsllAfBuild);        })
btnPano             .addEventListener   ('click',   () => { ipc.send('panoWin')                                     })

// Quest btns Area  
btnDrive            .addEventListener   ('click',   () => { questMountUSB()                                         })
btnWifi             .addEventListener   ('click',   () => { document.querySelector('#modal-wifi').showModal()       })

btnSet720           .addEventListener   ('click',   () => { questSet720()                                           })
btnSaveLastVideo    .addEventListener   ('click',   () => { saveLastVideo()                                         })
btnOnlyInstallAPK   .addEventListener   ('click',   () => { onlyInstallAPK()                                        })
btnUninstallAPK     .addEventListener   ('click',   () => { uninstallAPK()                                          })

// Package txt Area
txtPackage          .addEventListener   ('keydown', (e) => { packageTXTLimitDown(e)                                 })
txtPackage          .addEventListener   ('keyup',   (e) => { packageTXTLimitUp(e)                                   })

// Build btns Area
btnBuildInstallEnv  .addEventListener   ('click',   () => { ipc.send('buildInstallEnv')                             })
chckInsllAfBuild    .addEventListener   ('click',   () => { toggleCheck(chckInsllAfBuild, btnInsllAfConver);        })
btnUnpackAPK        .addEventListener   ('click',   () => { unpackAPK(false)                                        })

btnOpenBuildFolder  .addEventListener   ('click',   () => { ipc.send('openBuildFolder')                             })
btnKTXtoPNG         .addEventListener   ('click',   () => { convKTXToPNG()                                          })

btnRelAudioNoAudio  .addEventListener   ('click',   () => { relAudioNoAudioEnv()                                    })
btnDeleteFilesBuild .addEventListener   ('click',   () => { ipc.send('deleteFilesBuild')                            })


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


//
//
// ***************************************************
// Functions
// ***************************************************
//
//

// Aside functions
// async function Picture1_OLEDragDrop(Data, Effect, Button, Shift, x, y) {
//     // TODO: Fix and complete this function
//     try {
//       let intFile;
//       let i;
//       let fields = [];
//       let k;
//       let pat;
//       let tme;
//       let ff;
//       let tw;
//       let idr4;
//       let pak_label;
  
//       if (sr === "") {
//         for (intFile = 0; intFile < Data.Files.length; intFile++) {
//           pat = Data.Files[intFile];
//         }
//       } else {
//         pat = sr;
//         sr = "";
//       }
//       pat = pat.replace(/"/g, "");
//       tw = false;
//       u = ExtractFile(pat);
//       k = u.slice(-3).toLowerCase();
//       if (k === "apk") {
//         lvButtons_H6.enabled = true;
//         lvButtons_H5.enabled = true;
//         lvButtons_H4.enabled = true;
//         lvButtons_H10.enabled = true;
//         J = '"';
//         tme = txtOutputs.value;
//         objDOS.CommandLine = (J + apppath + "\\files\\aapt.exe" + J + " d badging " + J + pat + J);
//         ff = await objDOS.ExecuteCommand();
//         txtOutputs.value = tme + "Added APK: " + pat + "\n\n";
//         txtOutputs.selectionStart = txtOutputs.value.length;
//         fields = ff.split("'");
//         for (i = 0; i < fields.length; i++) {
//           if (fields[i].trim().includes("package")) {
//             pack = fields[i + 1].trim();
//           }
//           if (fields[i].trim().includes("application-label")) {
//             pak_label = fields[i + 1].trim();
//           }
//         }
//         Label8.caption = u;
//         Text1.value = pack.substring(pack.lastIndexOf(".") + 1).trim();
//         Text2.value = pak_label.trim();
//         Command1.enabled = true;
//         patapk = pat;
//       } else {
//         if (k === "mp3" || k === "aif" || k === "iff") {
//           tw = true;
//         }
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   }


async function openEnvAPK() {
    // TODO: Picture_OLE DragDrop function
    try {
        const dirAPK    = await ipc.invoke('openEnvAPK')

        if (dirAPK === undefined || dirAPK === "") return;

        // TODO: Call Picture_OLE DragDrop function from here...
    } catch (err) {
        term.writeln(`\n::: ERROR :::\n ${err}`)
        return;
    }
}

async function convInstallEnv() {
    // TODO: Make env.ConvInstallEnv function
    shell               .beep()
    const rep           = await ipc.invoke("env.ConvInstall", document.querySelector("#txtPackage").value, document.querySelector("#txtAppName").value)

    if (rep === undefined || rep === "") return;

    txtPackage.value    = rep[0]
    txtAppName.value    = rep[1]

    showMsgStatus       ("Converting")
    await unpackAPK     (true)
    ipc.send            ('buildInstallEnv')
}


// Quest functions
function questMountUSB() {
    try {
        showMsgStatus       ("Connecting")
        const command       = `"${path.join(filesPath, "adb.exe")}" shell svc usb setFunctions mtp true`;

        execSync            (command)

        shell               .beep                                   ()
        addClassConnection  ('#btnDrive')
        term                .write                                  ('>>> Quest mounted as drive <<<\n\n')
        showMsgStatus       ("Done")
    } catch(err) {
        showMsgStatus       ("Error")
        removeClassConnection('#btnDrive')
        term.writeln        (`\n::: ERROR :::\n ${err}\n------\n`)
        return;
    }
}

function questSet720() {
    try {
        showMsgStatus       ("Working")
        const commandW      = `"${path.join(filesPath, "adb.exe")}" shell setprop debug.oculus.capture.width 1280`
        const commandH      = `"${path.join(filesPath, "adb.exe")}" shell setprop debug.oculus.capture.height 720`

        execSync            (commandW)
        execSync            (commandH)

        showMsgStatus       ("Done")
        shell               .beep                                   ()
        term                .write                                  ('>>> Recording video size set to 720p (1280x720) <<<\n')
    } catch(err) {
        showMsgStatus       ("Error")
        term.writeln        (`\n::: ERROR :::\n ${err}`)
        return;
    }
}

async function saveLastVideo() {
    try {
        showMsgStatus           ("Working")
        let     videoExtract    = execSync(`"${path.join(filesPath, "adb.exe")}" shell ls -lt /sdcard/Oculus/VideoShots`, {encoding: 'utf-8', stdio: 'pipe' })                              // get list of videos as one long string
        const   videosArray     = videoExtract.split('\n')                                                                                                                                  // create an array from the string

        if (videosArray[1] === "") throw videosArray[1];

        videoExtract            = videosArray[1].substring(videosArray[1].indexOf("com.oculus.shellenv"), videosArray[1].length - videosArray[1].indexOf("com.oculus.vrshell") + 1);        // get last video name from array
        const   dirSave         = await ipc.invoke("quest.saveLastVideo", videoExtract.slice(0, -5))

        if (dirSave === undefined || dirSave === "") return;

        execSync(`"${path.join(filesPath, "adb.exe")}" pull "/sdcard/Oculus/VideoShots/${videoExtract}" "${dirSave}"`)                                                                      // extract video from Oculus
        term.writeln            (`>>> Video Extraction Successfully <<<\n"${dirSave}"\n`)
        showMsgStatus           ("Done")
    } catch (err) {
        showMsgStatus           ("Error")
        term.writeln(`\n::: ERROR :::\n ${err}\n`)
        return;
    }
}

function onlyInstallAPK() {
    try {
        showMsgStatus   ('Working')

        const command   = `"${path.join(filesPath, "adb.exe")}" install -r "${apkPath}"`

        term.writeln    (`>>> Try connecting to Quest for APK-Install ...\n`)

        execSync        (command)

        showMsgStatus   ('Done')
        playAudioDone   ()
        term.writeln    ('Installation Succesful!\n')
    } catch(err) {
        shell           .beep()
        showMsgStatus   ('Error')
        term.writeln    (`\n::: ERROR :::\n ${err}\nIf Quest is connected, Please remove the USB-Cable and reconnect it again.\n`)
        return;
    }
}

function uninstallAPK() {
    // TODO: Test and complete function
    let pack2       = ""
    let fileFound   = ""
    try {
        showMsgStatus   ("Working")

        const   commandP    = `"${path.join(filesPath, "aapt.exe")}" d badging "${apkPath}"`
                fileFound   = execSync(commandP)
        const   fields      = fileFound.split("'")
        for (i = 0; i < fields.length; i++) {
            if (fields[i].trim().includes("package")) {
                pack2 = fields[i + 1].trim();
            }
        }

        term.writeln    (`>>> Try connecting to Quest for APK-uninstall...\n`)

        const   commandF    = `"${path.join(filesPath, "adb.exe")}" uninstall "${pack2}"`
                fileFound   = execSync(commandF)

        // ff = fileFound (note)

        // if (ff.includes("connect error")) ie = true;
        // if (ff.includes("cannot Connect")) ie = true;
        // if (ff.includes("Unknown package")) {
        //     messageBeep(16); // You need to implement messageBeep function
        //     message("Error: Unknown package!\nAPK already uninstalled?!"); // You need to implement message function
        //     ie = true;
        // }
        // if (ff.includes("more")) {
        //     messageBeep(16); // You need to implement messageBeep function
        //     message("Error: USB-Cable Connected!\nPlease Remove USB-Cable!"); // You need to implement message function
        //     ie = true;

        showMsgStatus   ('Done')
        playAudioDone   ()
        term.writeln    ('Uninstall Succesful!\n')
    } catch (err) {
        shell           .beep()
        showMsgStatus   ('Error')
        term.writeln    (`\n::: ERROR :::\n ${err}\nIf Quest is connected, Please remove the USB-Cable and reconnect it again.\n`)
        return;
    }
}


// Build functions
ipc.on("build.buildInstallEnv", async () => {
    const fFormat           =   ['.jpg', '.jpeg', '.png', '.bmp']
    const fK                =   '.ktx'

    showMsgStatus           ("Building")
    if ((await fs.promises.readdir(fPathTMP)).length != 0) {
        const fFiles        =   ['_WORLD_MODEL.gltf.ovrscene', 'scene.zip', '_BACKGROUND_LOOP.ogg']
        fFiles.forEach(f =>     {
                                    if (fs.existsSync(path.join(fPathTMP, f))) fs.unlinkSync(path.join(fPathTMP, f))
                                })
    }

    if (chckKTXcompress.checked) {
        try {
            await fs.promises.readdir(buildPath)
            .then(files => {
                files.forEach(f => {
                    const fPath             = path.join(buildPath, f);
                    const fExt              = path.extname(fPath).toLowerCase();

                    if (fFormat.includes(fExt)) {
                        term                .writeln(`Compress Texture File: ${fPath}`);

                        const fName         = path.basename(fPath, fExt);
                        const command       = `"${path.join(filesPath,"img2ktx.exe")}" -o "${path.join(buildPath, fName)}.ktx" -m -f ASTC8x8 "${fPath}"`;

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
            showMsgStatus("Error")
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
        showMsgStatus           ("Error")
        ipc.invoke              ("dialog.showDialog", "Error", ".JPG/.PNG and .KTX present in same videosLister!");
        term.writeln            (".JPG/.PNG and .KTX present in same videosLister!\n")
        return;
    }

    weit3();
})


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
                                                                                const command = (check1.checked) ?  `"${path.join(filesPath,"sox.exe")}" -S "${aud}" -C 3 "${path.join(fPathTMP, "_BACKGROUND_LOOP.ogg")}" vol -${lvButtons_H.options[lvButtons_H.selectedIndex].value} dB` :
                                                                                                                    `"${path.join(filesPath,"sox.exe")}" -S "${aud}" -C 3 "${path.join(fPathTMP, "_BACKGROUND_LOOP.ogg")}"`;
                                                                                execSync        (command);

                                                                                killer          ();
                                                                            }
    } catch (err) {
        showMsgStatus("Error")
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
    // TODO: Define jsPath variable
    try {
        const commandA      = `"${path.join(filesPath, "7za.exe")}" a "${path.join(fPathTMP, "_WORLD_MODEL.gltf.ovrscene.zip")}" "buildPath" "\*"`
        const commandB      = `"${path.join(filesPath, "7za.exe")}" a "${path.join(fPathTMP, "scene.zip")}" "${path.join(fPathTMP, "_WORLD_MODEL.glft.ovrscene")}" "${path.join(fPathTMP, "_BACKGROUND_LOOP.ogg")}"`

        execSync            (commandA)

        fs.renameSync       (`"${path.join(fPathTMP, "_WORLD_MODEL.gltf.ovrscene.zip")}", "${path.join(fPathTMP, "_WORLD_MODEL.glft.ovrscene")}"`)

        if (!fs.existsSync  (`"${path.join(fPathTMP, "_BACKGROUND_LOOP.ogg")}"`))
            fs.copyFileSync (`"${path.join(filesPath, "silent.ogg")}", "${path.join(fPathTMP, "_BACKGROUND_LOOP.ogg")}"`)

        execSync            (commandB)

        if (fs.existsSync   (`"${path.join(fPathTMP, "_BACKGROUND_LOOP.ogg")}"`))
            fs.unlinkSync   (`"${path.join(fPathTMP, "_BACKGROUND_LOOP.ogg")}"`)

        fs.unlinkSync       (`"${path.join(fPathTMP, "_WORLD_MODEL.gltf.ovrscene")}"`)

        fs.readdirSync      (buildPath).forEach(f => {
                                                    if (path.extname(f) === '.gltf')
                                                        idr = f.slice(0, -5)
                                                })

        txtPackage.value    = txtPackage.value.substr(0, 16).concat((txtPackage.value.substr(16)    === "" ?    ClearString(idr, true)  :   ClearString(txtPackage.value.slice(16), true)))
        txtAppName.value    = txtAppName.value                                                      === "" ?    ClearString(idr, false) :   ClearString(txtAppName.value, false)

        const anman         = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="${txtPackage.value.toLowerCase()}">
    <application android:allowBackup="false" android:label="${txtAppName.value}">
        <meta-data android:name="com.oculus.environmentVersion" android:value="1"/>
    </application>
</manifest>`;

        fs.writeFileSync    (`"${path.join(filesPath, "Environment", "AndroidManifest.xml")}"`, anman);

// --------------------------------------------------------------------------------
        let idr4            = "", idr5 = "", itsApp = "", an ="Environment"

        fs.copyFileSync     (`"${path.join(fPathTMP, "scene.zip")}"`, `"${path.join(filesPath, "Environment", "assets", "scene.zip")}"`)
        if (jsPath !== "")  fs.copyFileSync(`"${jsPath}"`, `"${path.join(filesPath, "Environment", "assets", "markup.json")}"`)

        const commandC      = `"${javaPath}" -Xmx1024m -jar "${path.join(filesPath, "apktool_2.3.4.jar")}" b -f -o "${path.join(fPathTMP, "tmpz.apk")}" "${path.join(filesPath, "Environment")}"`
        const commandD      = `"${javaPath}" -Xmx1024m -jar "${path.join(filesPath, "ApkSigner.jar")}" sign --key "${path.join(filesPath, "apkeasytool.pk8")}" --cert "${path.join(filesPath, "apkeasytool.pem")}" --out "${path.join(fPathTMP, "tmpz.apk")}" "${path.join(fPathTMP, "tmpz.apk")}"`

        execSync            (commandC)
        term.writeln        ("Sign APK-file\n")
        execSync            (commandD)

        if (crea > 0) {
            idr2            = idr2.replace("_environment",  "")
            idr2            = idr2.replace(".environment",  "")
            idr2            = idr2.replace("environment",   "")

            if (crea === 2) an += "_Silent"

            const   aa      = `${idr2}_${an}.apk`
            fin2            = `"${path.join(appRoot, aa)}"`
            fs.copyFileSync (`"${path.join(fPathTMP, "tmpz.apk")}", "${fin2}"`)
        } else {
            const   aa      = `${idr2}_${an}.apk`
            if (txtAPK.value == "") {
                itsApp      = `"${path.join(appRoot, aa)}"`
                fs.copyFileSync (`"${path.join(fPathTMP, "tmpz.apk")}", "${itsApp}}"`)
            } else {
                idr4        = txtAPK.value
                idr4        = idr4.replace("winterlodge", "")
                idr4        = idr4.replace("winter.lodge", "")
                idr4        = idr4.replace("winter lodge", "")
                idr4        = idr4.replace("winter_lodge", "")
                idr4        = idr4.replace("spacestation", "")
                idr4        = idr4.replace("space station", "")
                idr4        = idr4.replace("space.station", "")
                idr4        = idr4.replace("space_station", "")
                idr4        = idr4.replace("classichome", "")
                idr4        = idr4.replace("classic home", "")
                idr4        = idr4.replace("classic_home", "")
                idr4        = idr4.replace("classic.home", "")
                idr4        = idr4.replace("cybercity", "")
                idr4        = idr4.replace("cyber city", "")
                idr4        = idr4.replace("cyber_city", "")
                idr4        = idr4.replace("cyber.city", "")
                idr4        = idr4.replace("_environment", "")
                idr4        = idr4.replace(".environment", "")
                idr4        = idr4.replace("environment", "")
                idr4        = idr4.replace("..apk", ".apk")
                idr4        = idr4.replace("_.apk", ".apk")
                idr4        = idr4.replace("_Environment.apk", ".apk")
                idr4        = idr4.replace("_environment.apk", ".apk")

                idr5        = `"${path.join(appRoot, idr4.replace('.apk', '_Environment.apk'))}"`

                fs.copyFileSync (`"${path.join(fPathTMP, "tmpz.apk")}"`, idr5)

                itsApp      = idr5

                if (chckInsllAfBuild.checked || crea > 0) {
                    nex()
                } else {
                    const commandE  = `"${path.join(filesPath, "adb.exe")}" install -r "${itsApp}"`

                    term.writeln    ("Try connecting to Quest for APK-install\n")

                    execSync        (commandE)
                }
            }
        }
    } catch (err) {
        showMsgStatus("Error")
        term.writeln(`\n::: ERROR :::\nAn error occurred:\n ${err}`)
        return;
    }
}

function nex() {
    try {
        crea    = 0
        const config    = ini.parse(fs.readFileSync(`"${path.join(filesPath, 'config.ini')}"`, 'utf-8'))
        const fTMP      = [
                            '_WORLD_MODEL.gltf.ovrscene',
                            'scene.zip',
                            '_BACKGROUND_LOOP.ogg',
                            'tmpz.apk',
                            'tmp.apk',
                            'temp_ec.wav'
                        ]
        const fFiles    = [
                            'scene.zip',
                            'tmpz.apk',
                            'tmp.apk',
                            'tmp.zip',
                        ]

        fTMP.forEach(f =>   {
                                if (fs.existsSync(`"${path.join(fPathTMP, f)}"`))
                                    fs.unlinkSync(`"${path.join(fPathTMP, f)}"`)
                            })
        fFiles.forEach(f => {
                                if (fs.existsSync(`"${path.join(fPathTMP, f)}"`))
                                    fs.unlinkSync(`"${path.join(fPathTMP, f)}"`)
                            })

        if (fs.existsSync(`"${path.join(filesPath, 'Environment', 'assets', 'markup.json')}"`))
            fs.unlinkSync(`"${path.join(filesPath, 'Environment', 'assets', 'markup.json')}"`)

        if (fs.existsSync(`"${path.join(filesPath, 'Environment', 'AndroidManifest.xml')}"`))
            fs.unlinkSync(`"${path.join(filesPath, 'Environment', 'AndroidManifest.xml')}"`)

        fs.readdirSync(`"${path.join(filesPath, 'Environment', 'build', 'apk')}"`)
            .forEach(f => {
                fs.unlinkSync(`"${path.join(filesPath, 'Environment', 'build', 'apk', f)}"`)
            })

        fs.rmSync(`"${path.join(filesPath, 'Environment', 'build', 'apk')}"`,   { recursive: true, force: true })
        fs.rmSync(`"${path.join(filesPath, 'Environment', 'build')}"`,          { recursive: true, force: true })

        if (config.Save.AutoClear === '1') {
            fs.readdirSync(`"${path.join(buildPath)}"`).forEach(f => {
                fs.unlinkSync(`"${path.join(buildPath, f)}"`)
            })
        }

        showMsgStatus   ('Done')
        playAudioDone   ()
        term.writeln    (`\nBuild APK finished! ${new Date().toLocaleTimeString()}\n`)
    } catch(err) {
        shell           .beep()
        showMsgStatus   ('Error')
        term.writeln    (`\n::: ERROR :::\n ${err}\nIf Quest is connected, Please remove the USB-Cable and reconnect it again.\n`)
        return;
    }
}


async function unpackAPK(e) {
    // TODO: Drag function
    try {
        if (buildPath.length != 0) {
            if (window.confirm("This will delete all the files on your Build folder\nDo you want to continue?") === false) {
                return;
            } else {
                ipc.send('deleteFilesBuild')
            }
        }
        term.writeln    (">>> Extracting glTF-Files to ..\\Build")

        execSync        (`"${path.join(filesPath, "7za.exe")}" e "${apkPath}" -o "${buildPath}" scene.zip -r -aoa > nul`)
        execSync        (`"${path.join(filesPath, "7za.exe")}" e "${buildPath}" "\\scene.zip" -o "${buildPath}" _WORLD_MODEL.gltf.ovrscene -r -aoa > nul`)
        execSync        (`"${path.join(filesPath, "7za.exe")}" e "${buildPath}" "\\scene.zip" -o "${buildPath}" _BACKGROUND_LOOP.ogg -r -aoa > nul`)
        execSync        (`"${path.join(filesPath, "7za.exe")}" e "${buildPath}" "\\_WORLD_MODEL.gltf.ovrscene" -o "${buildPath}" -aoa`)

        fs.unlinkSync   (`"${path.join(buildPath, "scene.zip")}"`)
        fs.unlinkSync   (`"${path.join(buildPath, "_WORLD_MODEL.gltf.ovrscene")}"`)

        // drag(appPath, "_BACKGROUND_LOOP.ogg")
        if (e === false) {
            showMsgStatus("Done")
            playAudioDone()
        }
    } catch (err) {
        showMsgStatus("Error")
        term.writeln(`\n::: ERROR :::\nAn error occurred:\n ${err}`)
        return;
    }
}


//
//
// ***************************************************
// Miscellaneous
// ***************************************************
//
//

function addClassConnection(d) {
    document            .querySelector('#status_id')            .classList.add('questConnected_id')
    document            .querySelector('#status')               .classList.add('questConnected_txt')
    document            .querySelector(d)                       .classList.add('questConnected_txt')
    document            .querySelector('#status')               .textContent = "Connected"
}

function removeClassConnection(d) {
    document            .querySelector('#status_id')            .classList.remove('questConnected_id')
    document            .querySelector('#status')               .classList.remove('questConnected_txt')
    document            .querySelector(d)                       .classList.remove('questConnected_txt')
    document            .querySelector('#status')               .textContent = "Disconnected"
}

function showMsgStatus(status) {
    const e = document.querySelector("#processStatustxt")

    e.className = '';
    switch(status) {
        case "Done":
        case "Error":
            e.classList.add     (`psTXT-${status.toLowerCase()}`)
            e.textContent       = `${status}!`
            setInterval         (async () => {
                                    e.className         = ''
                                    e.classList.add     ('psTXT-inactive')
                                    e.textContent       = 'text'
                                }, 10000)
            break;
        default:
            e.classList.add     ('psTXT-working')
            e.textContent       = `...${status}`
            break;
    }
}

function packageTXTLimitDown(e) {
    const key   = e.keyCode || e.which

    if (txtPackage.selectionStart   <= 16   &&
        txtPackage.selectionEnd     == 16   &&
        key === 8 ) {
        e.preventDefault()
        txtPackage.selectionStart = 16
    }
    if (txtPackage.value.length <= 16 || txtPackage.selectionStart < 16) {
        txtPackage.selectionStart = 16
        if (key === 8   ||
            key === 37  ||
            key === 46  ||
            key === 88  &&
            e.ctrlKey) {
                e.preventDefault()
        }
    }
}

function packageTXTLimitUp(e) {
    txtPackage.value = txtPackage.value.replace(/ /g, '_')

    if (txtPackage.selectionStart   < 16)
        txtPackage.selectionStart   = 16

    if (txtPackage.selectionStart <= 16) txtPackage.setSelectionRange(16, txtPackage.selectionEnd)
}

ipc.on ("modal.toggle", (e, b) =>       { document.querySelector('#modalBlock').classList.toggle('toggleDisplay', b)   })

function toggleCheck(e, d)              { d.checked = e.checked }

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

ipc.on('app.loaded', (e, pjson) => {
    term.writeln(`Quest Home Environment Converter\nv${pjson.version}\n`)
})

function playAudioDone() {
    audioPlayer.play({ path: path.join(filesPath, "gong.wav").toString() })
}

function ClearString(str, bool) {
    if (bool) {
        str =   str.replace(/ /g, '_');
        return  str.replace(/[^a-z0-9_]/gi, '');
    } else {
        return  str.replace(/[^a-z0-9/()!.,\-_+*#:;?^$%=`' ]/gi, '');
    }
}