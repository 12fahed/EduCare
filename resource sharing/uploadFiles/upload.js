const form = document.querySelector("form"),
  fileInput = document.querySelector(".file-input"),
  progressArea = document.querySelector(".progress-area"),
  uploadedArea = document.querySelector(".uploaded-area");

// Load previously uploaded files from localStorage on page load
window.addEventListener("load", () => {
  const uploadedFiles = JSON.parse(localStorage.getItem("uploadedFiles")) || [];
  uploadedArea.innerHTML = uploadedFiles.join("");
  updateFileCounter();
});

// form click event
form.addEventListener("click", () => {
  fileInput.click();
});

fileInput.onchange = ({ target }) => {
  let file = target.files[0];
  if (file) {
    let fileName = file.name;
    if (fileName.length >= 12) {
      let splitName = fileName.split('.');
      fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
    }
    uploadFile(fileName);
  }
};

// file upload function
function uploadFile(name) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "php/upload.php");
  xhr.upload.addEventListener("progress", ({ loaded, total }) => {
    let fileLoaded = Math.floor((loaded / total) * 100);
    let fileTotal = Math.floor(total / 1000);
    let fileSize;
    (fileTotal < 1024) ? fileSize = fileTotal + " KB" : fileSize = (loaded / (1024 * 1024)).toFixed(2) + " MB";
    let progressHTML = `<li class="row">
                          <i class="fas fa-file-alt"></i>
                          <div class="content">
                            <div class="details">
                              <span class="name">${name} • Uploading</span>
                              <span class="percent">${fileLoaded}%</span>
                            </div>
                            <div class="progress-bar">
                              <div class="progress" style="width: ${fileLoaded}%"></div>
                            </div>
                          </div>
                        </li>`;
    uploadedArea.classList.add("onprogress");
    progressArea.innerHTML = progressHTML;

    if (loaded == total) {
      progressArea.innerHTML = "";
      let uploadedHTML = `<li class="row">
                      <div class="content upload">
                        <i class="fas fa-file-alt"></i>
                        <div class="details">
                          <span class="name">${name} • Uploaded</span>
                          <span class="size">${fileSize}</span>
                        </div>
                      </div>
                      <i class="fas fa-check"></i>
                      <button class="delete-btn" onclick="deleteFile(this)">
                      <i class="fa-solid fa-trash fa-2xs" style="color: red;"></i>
                      </button>
                    </li>`;


      uploadedArea.classList.remove("onprogress");
      uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML);

      // Save the uploaded file information to localStorage
      const uploadedFiles = JSON.parse(localStorage.getItem("uploadedFiles")) || [];
      uploadedFiles.unshift(uploadedHTML);
      localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles));

      updateFileCounter();
    }
  });
  let data = new FormData(form);
  xhr.send(data);
}

function updateFileCounter() {
  const fileCounter = document.getElementById("fileCounter");
  const uploadedFiles = JSON.parse(localStorage.getItem("uploadedFiles")) || [];
  const currentCount = uploadedFiles.length;
  fileCounter.innerText = currentCount;
}

function deleteFile(btn) {
  const row = btn.parentNode;
  const name = row.querySelector('.name').innerText.split(' • ')[0];
  
  // Remove the deleted file entry from the uploaded area
  row.parentNode.removeChild(row);

  // Remove the deleted file information from localStorage
  const uploadedFiles = JSON.parse(localStorage.getItem("uploadedFiles")) || [];
  const updatedFiles = uploadedFiles.filter(file => !file.includes(name));
  localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles));

  updateFileCounter();
}

uploadedArea.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains('row') || target.closest('.row')) {
    const row = target.closest('.row');
    const name = row.querySelector('.name').innerText.split(' • ')[0];

    // Fetch file content and open the modal
    fetchFileContent(name)
      .then(content => openModal(name, content));
  }
});

function openModal(name, content) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal()">&times;</span>
      <p>${content}</p>
      <a class="download-btn" href="#" onclick="downloadFile('${name}', '${content}')">Download</a>
    </div>
  `;

  document.body.appendChild(modal);
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.querySelector('.modal');
  modal.style.display = 'none';
  document.body.removeChild(modal);
}

function downloadFile(name, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = name;
  link.click();
}

function fetchFileContent(name) {
  return new Promise((resolve) => {
    // Simulate fetching file content (replace this with actual logic)
    setTimeout(() => {
      const content = `Content of ${name} goes here.`;
      resolve(content);
    }, 500);
  });
}

function deleteFile(btn) {
  const row = btn.parentNode;
  const name = row.querySelector('.name').innerText.split(' • ')[0];
  
  // Remove the deleted file entry from the uploaded area
  row.parentNode.removeChild(row);

  // Remove the deleted file information from localStorage
  const uploadedFiles = JSON.parse(localStorage.getItem("uploadedFiles")) || [];
  const updatedFiles = uploadedFiles.filter(file => !file.includes(name));
  localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles));

  updateFileCounter();

  // Stop the propagation of the click event to prevent opening the modal
  event.stopPropagation();
}