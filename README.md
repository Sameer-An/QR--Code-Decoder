# QR Code Decoder

A web-based QR code decoder that allows users to upload images containing QR codes or use their device's camera to scan QR codes in real-time.

## Features

- Upload QR code images from your device
- Use your device's camera to scan QR codes in real-time
- Preview of the uploaded or captured image
- Automatic detection and decoding of QR codes
- Visual highlighting of detected QR code boundaries
- Special handling for URL content (clickable links)
- Responsive design that works on desktop and mobile devices

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- [jsQR](https://github.com/cozmo/jsQR) - A pure JavaScript QR code reading library

## How to Use

1. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
2. Choose one of the following methods to decode a QR code:
   - **Upload an image**: Click "Choose File" to select an image from your device, then click "Decode QR Code"
   - **Use camera**: Click "Start Camera" to activate your device's camera, then click "Capture QR Code" when the QR code is visible in the preview

3. The decoded content will appear in the "Result" section
   - If the content is a URL, it will be displayed as a clickable link

## Browser Compatibility

This application works best in modern browsers that support the following features:
- ES6+ JavaScript
- Canvas API
- MediaDevices API (for camera access)

## Privacy

This application processes all QR codes locally in your browser. No data is sent to any server.

## License

This project is open source and available under the MIT License.

## Acknowledgements

- [jsQR](https://github.com/cozmo/jsQR) for the QR code decoding library 