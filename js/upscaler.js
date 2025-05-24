// Image Upscaling Logic

/**
 * Main function to enhance image
 * @param {number} scale - Upscaling factor (2 or 4)
 */
async function enhanceImage(scale) {
    if (!window.currentFile) {
        showError('No image selected');
        return;
    }
    
    // File size check (Waifu2x has limits)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (window.currentFile.size > maxSize) {
        showError('Image too large for AI upscaling. Please use an image under 5MB.');
        return;
    }
    
    toggleLoading(true);
    toggleResult(false);
    
    try {
        console.log('Trying AI upscaling with Waifu2x...');
        const success = await tryApiUpscale(scale);
        
        if (!success) {
            console.log('AI upscaling failed, using fallback method...');
            await clientUpscale(scale);
            showWarning('Using basic upscaling. For best quality, try a smaller image with AI upscaling.');
        } else {
            console.log('AI upscaling successful!');
        }
    } catch (error) {
        console.error('Enhancement failed:', error);
        showError('Failed to enhance image. Please try again or use a different image.');
    } finally {
        toggleLoading(false);
        toggleResult(true);
    }
}

/**
 * Try to upscale using Waifu2x API
 * @param {number} scale - Upscaling factor
 * @returns {Promise<boolean>} Success status
 */
async function tryApiUpscale(scale) {
    try {
        // Convert to base64 for API
        const base64 = await fileToBase64(window.currentFile);
        
        // Waifu2x API call
        const response = await fetch('https://api.waifu2x.udp.jp/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                img: base64,
                scale: scale,
                noise: 1, // noise reduction level (0-3)
                style: 'art' // 'art' or 'photo'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.img) {
                document.getElementById('resultImg').src = 'data:image/png;base64,' + data.img;
                return true;
            }
        }
        
        // Try alternative Waifu2x endpoint
        return await tryAlternativeWaifu2x(scale);
        
    } catch (error) {
        console.warn('Waifu2x API failed:', error);
        return await tryAlternativeWaifu2x(scale);
    }
}

/**
 * Try alternative Waifu2x service
 * @param {number} scale - Upscaling factor
 * @returns {Promise<boolean>} Success status
 */
async function tryAlternativeWaifu2x(scale) {
    try {
        const formData = new FormData();
        formData.append('file', window.currentFile);
        formData.append('scale', scale);
        formData.append('noise', '1');
        formData.append('style', 'art');
        
        // DeepAI Waifu2x alternative (free tier)
        const response = await fetch('https://api.deepai.org/api/waifu2x', {
            method: 'POST',
            headers: {
                'api-key': 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K' // Free tier key
            },
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.output_url) {
                document.getElementById('resultImg').src = data.output_url;
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.warn('Alternative Waifu2x failed:', error);
        return false;
    }
}

/**
 * Client-side canvas upscaling
 * @param {number} scale - Upscaling factor
 */
async function clientUpscale(scale) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve, reject) => {
        img.onload = () => {
            try {
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                // High-quality scaling settings
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Multi-pass scaling for better quality
                if (scale > 2) {
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = img.width * 2;
                    tempCanvas.height = img.height * 2;
                    
                    tempCtx.imageSmoothingEnabled = true;
                    tempCtx.imageSmoothingQuality = 'high';
                    tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
                    
                    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
                } else {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
                
                // Apply sharpening filter
                applySharpeningFilter(ctx, canvas.width, canvas.height);
                
                document.getElementById('resultImg').src = canvas.toDataURL('image/png');
                resolve();
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = document.getElementById('previewImg').src;
    });
}

/**
 * Apply basic sharpening filter to canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
function applySharpeningFilter(ctx, width, height) {
    try {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const output = new Uint8ClampedArray(data);
        
        // Simple sharpening kernel
        const kernel = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) { // RGB channels only
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                            sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                        }
                    }
                    const idx = (y * width + x) * 4 + c;
                    output[idx] = Math.max(0, Math.min(255, sum));
                }
            }
        }
        
        const outputImageData = new ImageData(output, width, height);
        ctx.putImageData(outputImageData, 0, 0);
    } catch (error) {
        console.warn('Sharpening filter failed:', error);
        // Continue without sharpening
    }
}

/**
 * Download the enhanced result
 */
function downloadResult() {
    const resultImg = document.getElementById('resultImg');
    if (resultImg && resultImg.src) {
        downloadImage(resultImg.src, 'enhanced_hd.png');
    } else {
        showError('No enhanced image to download');
    }
  }
