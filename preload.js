const { ipcRenderer }   = require('electron')
const ipc               = ipcRenderer

window.addEventListener('DOMContentLoaded', () => {
    const dropZone  = document.querySelector("#drop");
    const cmb       = document.querySelector("#DVComboBox");
    const inputs    = document.querySelectorAll("input");

    // Prevent Spellcheck
    inputs.forEach(e => {
        e.setAttribute('spellcheck', false)
    })

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((e) => {
        dropZone.addEventListener(e, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover']   .forEach((e) => { dropZone.addEventListener(e, highlight, false); });
    ['dragleave', 'drop']       .forEach((e) => { dropZone.addEventListener(e, unhighlight, false); });

    function highlight(e)   { dropZone.classList.add('highlight') }
    function unhighlight(e) { dropZone.classList.remove('highlight') }

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false)

    function handleDrop(e) {
        const f = e.dataTransfer.files[0];
        ipc.send('fileDropped', f.name, f.path, f.type);
    }

    // comboBox decrase volumen
    for (let i=1; i <= 32; i++) {
        let opt = document.createElement("option")
        opt.value = i.toString()
        opt.text = i.toString()
        cmb.appendChild(opt)
    }

    cmb.selectedIndex = 18


    // Default behavior
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
})