const dropbox = document.getElementById("dropbox")

function setup_drag_listeners() {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropbox.addEventListener(eventName, preventDefaults, false)
    });

    // Highlight drop zone when file is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
    dropbox.addEventListener(eventName, highlight, false)
    });

    ['dragleave', 'drop'].forEach(eventName => {
    dropbox.addEventListener(eventName, unhighlight, false)
    });

    // Handle dropped files
    dropbox.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight(e) {
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        dropbox.classList.add('dragover');
        }
}

function unhighlight(e) {
  dropbox.classList.remove('dragover');
}

function handleDrop(e) {
  console.log('Hey u dropped this')
  const files = e.dataTransfer.files;
  console.log(files[0].name)
  // Do something with the dropped files

  let formData = new FormData()
  formData.append('tmp', files[0])

  fetch('/api/drop', {
    method: 'POST',
    body: formData
  })

  location.href = "/upload_page"
}

setup_drag_listeners()