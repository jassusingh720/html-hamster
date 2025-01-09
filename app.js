// Fetch videos from the server and display them
function loadVideos() {
    fetch('/api/videos')
      .then(response => response.json())
      .then(videos => {
        const videoList = document.getElementById('video-list');
        videoList.innerHTML = '';  // Clear current list
        videos.forEach(video => {
          const videoElement = document.createElement('div');
          videoElement.innerHTML = `
            <h3>${video.title}</h3>
            <video controls>
              <source src="${video.videoUrl}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          `;
          videoList.appendChild(videoElement);
        });
      });
  }
  
  // Handle video upload form submission
  document.getElementById('upload-video-form').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('title', document.getElementById('video-title').value);
    formData.append('description', document.getElementById('video-description').value);
    formData.append('video', document.getElementById('video-file').files[0]);
  
    fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      loadVideos();  // Reload videos after upload
    })
    .catch(error => console.error('Error:', error));
  });
  
  // Load videos when page loads
  window.onload = loadVideos;
  