
// Main Application Logic

// Global variables
window.currentFile = null;

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewImg = document.getElementById('previewImg');

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Initialize the application
 */
function initializeApp() {
    setupEventListeners();
    console.log('HD Image Upscaler initialized');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Prevent default drag behaviors on document
    document.addEventListener('dragover', preventDefault);
    document.addEventListener('drop', preventDefault);
}

/**
 * Handle drag over event
 * @param {DragEvent} e - Drag event
 */
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.style.borderColor = '#4285f4';
    uploadArea.style.background = '#f8f9ff';
}

/**
 * Handle drag leave event
 */
function handleDragLeave() {
    uploadArea.style.borderColor = '#ddd';
    uploadArea.style.background = '';
}

/**
 * Handle file drop event
 * @param {DragEvent} e - Drop event
 */
function handleDrop(e) {
    e.preventDefault();
    uploadArea.style.borderColor = '#ddd';
    uploadArea.style.background = '';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

/**
 * Handle file selection from input
 * @param {Event} e - Change event
 */
function handleFileSelect(e) {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
}

/**
 * Process selected/dropped file
 * @param {File} file - Selected file
 */
function handleFile(file) {
    // Validate file
    if (!isValidImage(file)) {
        showError('Please select a valid image file');
        return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('File size too large. Please select an image under 10MB');
        return;
    }
    
    // Store current file
    window.currentFile = file;
    
    // Create file reader
    const reader = new FileReader();
    
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        togglePreview(true);
        toggleResult(false);
        
        // Log file info
        console.log('File loaded:', {
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type
        });
    };
    
    reader.onerror = () => {
        showError('Failed to read file');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Prevent default behavior
 * @param {Event} e - Event to prevent
 */
function preventDefault(e) {
    e.preventDefault();
}

/**
 * Reset application state
 */
function resetApp() {
    window.currentFile = null;
    fileInput.value = '';
    togglePreview(false);
    toggleResult(false);
    toggleLoading(false);
}

// Expose functions globally for HTML onclick handlers
window.enhanceImage = enhanceImage;
window.downloadResult = downloadResult;
window.resetApp = resetApp;
