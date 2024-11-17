const dropZone = document.getElementById('drop-zone');
const singleInput = document.getElementById('single-file-input');
const multipleInput = document.getElementById('multiple-file-input');
const downloadButton = document.getElementById('download-file');
const downloadLink = document.getElementById('download-link');

function dragOver(event) {
    event.preventDefault();
    dropZone.style = "border-color: #333; color: #333;";
}

function dragLeave(event) {
    event.preventDefault();
    dropZone.style = "border-color: #ccc; color: #aaa;";
}

function onDrop(event) {
    event.preventDefault();
    dropZone.style = "border-color: #ccc; color: #aaa;";
    const validImageTypes = ['image/png', 'image/jpg'];
    const files = event.dataTransfer.files;

    if (files.length > 5) {
        alert('Can\'t upload more than 5 files!')
        return
    }

    for (let file of files) {
        if (!validImageTypes.includes(file.type)) {
            alert('Only file .png and .jpg are allowed!');
            return;
        }
    }

    if (files.length === 1) {
        singleInput.files = files;
        singleInput.closest('form').classList.remove('hidden');
        singleInput.closest('form').classList.add('visible');
        multipleInput.closest('form').classList.remove('visible');
        multipleInput.closest('form').classList.add('hidden');
    } else if (files.length > 1) {
        multipleInput.files = files;
        multipleInput.closest('form').classList.remove('hidden');
        multipleInput.closest('form').classList.add('visible');
        singleInput.closest('form').classList.remove('visible');
        singleInput.closest('form').classList.add('hidden');
    }
}

async function uploadFile(files, url) {
    const formData = new FormData();
    const fieldName = files.length > 1 ? "multipleImage" : "singleImage";

    for (let file of files) {
        formData.append(fieldName, file);
    }
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            console.log(result)

            downloadButton.innerHTML = '';
            if (result.uploadType === 'single') {
                const link = document.createElement('a');
                link.href = `/download/${result.pdfPath.split('/').pop()}`;
                link.download = 'translated_file.pdf';
                link.textContent = 'Download Translated PDF';
                downloadButton.appendChild(link);

            } else if (result.uploadType === 'multiple') {
                const link = document.createElement('a');
                link.href = result.zipPath;
                link.download = 'translated_files.zip';
                link.textContent = 'Download Translated Files ZIP';
                downloadButton.appendChild(link);

            }

            downloadButton.classList.remove('hidden');
            downloadButton.classList.add('visible');
        }
    } catch (error) {
        console.error("upload failed: ", error)
        throw error
    }

}

async function handleUpload(event) {
    event.preventDefault();
    const form = event.target;
    const url = form.id === 'single-upload-from' ? '/uploadfile' : '/uploadmultiple';
    const files = form.querySelector('input[type="file"]').files;
    if (files.length > 0) {
        await uploadFile(files, url);
    }
}
