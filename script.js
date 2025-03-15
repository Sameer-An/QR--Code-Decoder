document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const qrInput = document.getElementById('qr-input');
    const decodeButton = document.getElementById('decode-button');
    const cameraButton = document.getElementById('camera-button');
    const captureButton = document.getElementById('capture-button');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const cameraCanvas = document.getElementById('camera-canvas');
    const resultDiv = document.getElementById('result');
    const loadingIndicator = document.getElementById('loading-indicator');
    const fileNameDisplay = document.getElementById('file-name');

    // Canvas context
    const ctx = canvas.getContext('2d');
    const cameraCtx = cameraCanvas.getContext('2d');
    
    // Stream reference
    let stream = null;

    // Initialize canvas with a placeholder
    initCanvas();

    // Set up event listeners
    decodeButton.addEventListener('click', handleFileUpload);
    cameraButton.addEventListener('click', toggleCamera);
    captureButton.addEventListener('click', captureQRCode);
    qrInput.addEventListener('change', handleFileChange);

    // Function to initialize canvas with placeholder
    function initCanvas() {
        canvas.width = 400;
        canvas.height = 300;
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR code preview will appear here', canvas.width / 2, canvas.height / 2);
    }

    // Function to handle file selection change
    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            previewImage(file);
        } else {
            fileNameDisplay.textContent = 'No file selected';
        }
    }

    // Function to handle file upload
    function handleFileUpload() {
        const file = qrInput.files[0];
        if (!file) {
            showResult('Please select an image file first.');
            return;
        }

        decodeQRFromFile(file);
    }

    // Function to preview the uploaded image
    function previewImage(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Resize canvas to fit image
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw image on canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Function to decode QR code from file
    function decodeQRFromFile(file) {
        showLoading(true);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Resize canvas to fit image
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw image on canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Get image data for QR code processing
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Process QR code
                processQRCode(imageData);
            };
            img.onerror = () => {
                showLoading(false);
                showResult('Error loading image. Please try another file.');
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            showLoading(false);
            showResult('Error reading file. Please try again.');
        };
        reader.readAsDataURL(file);
    }

    // Function to toggle camera
    function toggleCamera() {
        if (stream) {
            // Stop camera if already running
            stopCamera();
            cameraButton.innerHTML = '<i class="fas fa-camera"></i> Start Camera';
            captureButton.disabled = true;
        } else {
            // Start camera
            startCamera();
            cameraButton.innerHTML = '<i class="fas fa-stop"></i> Stop Camera';
        }
    }

    // Function to start camera
    function startCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            showResult('Accessing camera...');
            
            // Try to use the environment-facing camera first (for mobile devices)
            const constraints = { 
                video: { 
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            };
            
            navigator.mediaDevices.getUserMedia(constraints)
                .then((mediaStream) => {
                    stream = mediaStream;
                    video.srcObject = mediaStream;
                    video.style.display = 'block';
                    captureButton.disabled = false;
                    video.play()
                        .then(() => {
                            showResult('Camera active. Position a QR code in view and click "Capture QR Code".');
                        })
                        .catch((error) => {
                            console.error('Error playing video:', error);
                            showResult('Error starting video: ' + error.message);
                        });
                })
                .catch((error) => {
                    console.error('Error accessing camera:', error);
                    showResult('Error accessing camera: ' + error.message);
                });
        } else {
            showResult('Your browser does not support camera access.');
        }
    }

    // Function to stop camera
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            video.style.display = 'none';
            video.srcObject = null;
            showResult('Camera stopped.');
        }
    }

    // Function to capture QR code from camera
    function captureQRCode() {
        if (!stream) return;
        
        showLoading(true);
        
        try {
            // Set canvas dimensions to match video
            cameraCanvas.width = video.videoWidth;
            cameraCanvas.height = video.videoHeight;
            
            // Draw current video frame to canvas
            cameraCtx.drawImage(video, 0, 0, cameraCanvas.width, cameraCanvas.height);
            
            // Get image data for QR code processing
            const imageData = cameraCtx.getImageData(0, 0, cameraCanvas.width, cameraCanvas.height);
            
            // Copy to main canvas for display
            canvas.width = cameraCanvas.width;
            canvas.height = cameraCanvas.height;
            ctx.putImageData(imageData, 0, 0);
            
            // Process QR code
            processQRCode(imageData);
        } catch (error) {
            console.error('Error capturing from camera:', error);
            showResult('Error capturing from camera: ' + error.message);
            showLoading(false);
        }
    }

    // Function to process QR code from image data
    function processQRCode(imageData) {
        try {
            // Use jsQR library to decode QR code
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });
            
            showLoading(false);
            
            if (code) {
                // Draw boundary on canvas
                drawQRCodeBoundary(code.location);
                
                // Show result
                showResult(code.data);
            } else {
                showResult('No QR code found in the image.');
            }
        } catch (error) {
            console.error('Error processing QR code:', error);
            showResult('Error processing QR code: ' + error.message);
            showLoading(false);
        }
    }

    // Function to draw QR code boundary on canvas
    function drawQRCodeBoundary(location) {
        // Draw boundary lines
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#FF3B58';
        
        // Draw lines connecting the four points
        ctx.beginPath();
        ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
        ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y);
        ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
        ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
        ctx.lineTo(location.topLeftCorner.x, location.topLeftCorner.y);
        ctx.stroke();
        
        // Draw corner points
        drawPoint(location.topLeftCorner);
        drawPoint(location.topRightCorner);
        drawPoint(location.bottomRightCorner);
        drawPoint(location.bottomLeftCorner);
    }

    // Function to draw a point on the canvas
    function drawPoint(point) {
        ctx.fillStyle = '#FF3B58';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Function to show result
    function showResult(message) {
        // Check if the message is a URL
        if (isValidURL(message)) {
            resultDiv.innerHTML = `
                <p>Decoded URL:</p>
                <a href="${message}" target="_blank">${message}</a>
            `;
        } else {
            resultDiv.innerHTML = `
                <p>Decoded content:</p>
                <div>${message}</div>
            `;
        }
    }

    // Function to check if a string is a valid URL
    function isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // Function to show/hide loading indicator
    function showLoading(isLoading) {
        loadingIndicator.classList.toggle('hidden', !isLoading);
    }

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        if (stream) {
            stopCamera();
        }
    });
}); 