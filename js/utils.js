// Utility Functions

/**
 * Convert file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Base64 string
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Validate if file is an image
 * @param {File} file - File to validate
 * @returns {boolean} True if valid image
 */
function isValidImage(file) {
    return file && file.type.startsWith('image/');
}

/**
 * Format file size to human readable
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Show/hide loading state
 * @param {boolean} show - Whether to show loading
 */
function toggleLoading(show) {
    const loading = document.getElementById('loading');
    loading.style.display = show ? 'block' : 'none';
}

/**
 * Show/hide result section
 * @param {boolean} show - Whether to show result
 */
function toggleResult(show) {
    const result = document.getElementById('result');
    result.style.display = show ? 'block' : 'none';
}

/**
 * Show/hide preview section
 * @param {boolean} show - Whether to show preview
 */
function togglePreview(show) {
    const preview = document.getElementById('preview');
    preview.style.display = show ? 'block' : 'none';
}

/**
 * Download image from canvas or img element
 * @param {string} dataUrl - Image data URL
 * @param {string} filename - Download filename
 */
function downloadImage(dataUrl, filename = 'enhanced_hd.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Show error message to user
 * @param {string} message - Error message
 */
function showError(message) {
    alert('Error: ' + message);
    console.error(message);
}

/**
 * Show warning message to user
 * @param {string} message - Warning message
 */
function showWarning(message) {
    alert('Warning: ' + message);
    console.warn(message);
}
