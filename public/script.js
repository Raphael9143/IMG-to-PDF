//drag and drop: https://stackoverflow.com/questions/8006715/drag-drop-files-into-standard-html-file-input
//file upload express js: https://viblo.asia/p/file-upload-voi-multer-nodejs-va-express-E375z4VdZGW
//multer: https://www.npmjs.com/package/multer

const dropZone = document.getElementById('drop-zone')
const singleInput = document.getElementById('single-file-input')
const uploadButton = document.getElementById('upload-button')
const downloadButton = document.getElementById('download-file')
const downloadLink = document.getElementById('download-link')


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
        singleInput.closest('form').classList.remove('hidden');
        singleInput.closest('form').classList.add('visible');
    }
}

async function uploadFile(files, url) {
    const formData = new FormData();
    const fieldName = "singleImage"

    for (let file of files) {
        formData.append(fieldName, file);
    }

    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        const result = await response.json();

        downloadButton.innerHTML = '';

        if (result.uploadType === 'single' && result.pdfPath) {
            const link = document.createElement('a');
            link.href = `/download/${result.pdfPath.split('/').pop()}`;
            link.download = `translated_file.pdf`;
            link.textContent = 'Download Translated PDF';
            downloadButton.appendChild(link);
            downloadButton.classList.remove('hidden');
            downloadButton.classList.add('visible');
        }

        console.log("Upload successful:", result);
    } else {
        console.error('Upload failed.');
    }
}


async function handleUpload(event) {
    event.preventDefault()
    const form = event.target
    const url = '/uploadfile'
    const files = form.querySelector('input[type="file"]').files
    if (files.length > 0) {
        await uploadFile(files, url)
    }
}