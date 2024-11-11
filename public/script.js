//drag and drop: https://stackoverflow.com/questions/8006715/drag-drop-files-into-standard-html-file-input
//file upload express js: https://viblo.asia/p/file-upload-voi-multer-nodejs-va-express-E375z4VdZGW
//multer: https://www.npmjs.com/package/multer

const dropZone = document.getElementById('drop-zone')
const singleInput = document.getElementById('single-file-input')
const multipleInput = document.getElementById('multiple-file-input')
const downloadButton = document.getElementById('download-file')

function dragOver(event) {
    event.preventDefault()
    dropZone.style = "border-color: #333; color: #333;"
}

function dragLeave(event) {
    event.preventDefault()
    dropZone.style = "border-color: #ccc; color: #aaa;"
}

function onDrop(event) {
    event.preventDefault()
    dropZone.style = "border-color: #ccc; color: #aaa;"
    const validImageTypes = ['image/png', 'image/jpg']

    const files = event.dataTransfer.files

    for (let file of files) {
        if (!validImageTypes.includes(file.type)) {
            alert('Only file .png and .jpg are allowed!')
            return
        }
    }

    if (files.length == 1) {
        singleInput.files = files
        inputOnChange(singleInput)
        singleInput.closest('form').classList.remove('hidden');
        singleInput.closest('form').classList.add('visible');
        multipleInput.closest('form').classList.remove('visible');
        multipleInput.closest('form').classList.add('hidden');
    } else if (files.length > 1) {
        multipleInput.files = files
        inputOnChange(multipleInput)
        multipleInput.closest('form').classList.remove('hidden');
        multipleInput.closest('form').classList.add('visible');
        singleInput.closest('form').classList.remove('visible');
        singleInput.closest('form').classList.add('hidden');
    }
}

function inputOnChange(inputElement) {
    const files = inputElement.files

    if (files.length > 0) {
        uploadFile(files, files.length == 1 ? '/uploadfile' : '/uploadmultiple')
    }
}

async function uploadFile(files, url) {
    const formData = new FormData()
    let fieldName = url === '/uploadfile' ? 'singleImage' : 'multipleImage'

    for (let file of files) {
        formData.append(fieldName, file);
    }

    const response = await fetch(url, {
        method: 'POST',
        body: formData
    }) 
    
    if (response.ok) {
        const result = await response.json()
        console.log("Upload successful: ", result)
    } else {
        console.error('Upload failed.')
    }
}
