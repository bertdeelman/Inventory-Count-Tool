// Define a default API configuration
window.API_CONFIG = {
    BASE_URL: "http://localhost",
    PATHS: {
        STATUS: "/api",
        IMPORT: "/api/inventorycounts/import"
    },
    USERNAME: "api_username",
    PASSWORD: "api_password",
    TIMEOUT: 10000,
    OPTIONS: {}
};

// Load the API config if available
document.addEventListener('DOMContentLoaded', function() {
    // Try to load custom config
    const configScript = document.createElement('script');
    configScript.src = 'config.js';
    configScript.type = 'text/javascript';
    
    // Once the script is loaded or if it fails, check API status
    configScript.onload = function() {
        console.log("Config loaded successfully");
        setTimeout(checkApiStatus, 500);
    };
    
    configScript.onerror = function() {
        console.warn("Could not load config.js, using default configuration");
        setTimeout(checkApiStatus, 500);
    };
    
    document.head.appendChild(configScript);
});

// Global function for checking API status
function checkApiStatus() {
    const apiStatusDot = document.getElementById('apiStatusDot');
    const apiStatusText = document.getElementById('apiStatusText');
    
    // Set status to checking
    setApiStatus('checking');
    
    try {
        console.log("Checking API at:", window.API_CONFIG.BASE_URL + window.API_CONFIG.PATHS.STATUS);
        
        // Basic Auth credentials
        const credentials = btoa(`${window.API_CONFIG.USERNAME}:${window.API_CONFIG.PASSWORD}`);
        
        // Check timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), window.API_CONFIG.TIMEOUT);
        
        // Prepare headers with proper handling for CORS
        const headers = {
            'Authorization': `Basic ${credentials}`
        };
        
        // Add any custom headers from config
        if (window.API_CONFIG.OPTIONS && typeof window.API_CONFIG.OPTIONS === 'object') {
            Object.keys(window.API_CONFIG.OPTIONS).forEach(key => {
                headers[key] = window.API_CONFIG.OPTIONS[key];
            });
        }
        
        // Send GET request to API status endpoint
        fetch(`${window.API_CONFIG.BASE_URL}${window.API_CONFIG.PATHS.STATUS}`, {
            method: 'GET',
            headers: headers,
            mode: 'cors', // Try with CORS mode
            credentials: 'include', // Include credentials for CORS requests
            signal: controller.signal
        })
        .then(response => {
            clearTimeout(timeoutId);
            
            console.log("API status response:", response.status);
            
            // Check if response is OK (202 or 200)
            if (response.status === 202 || response.status === 200) {
                setApiStatus('online');
            } else {
                setApiStatus('error', `Status: ${response.status}`);
            }
            
            // Update the send button status
            updateSendApiButton();
        })
        .catch(error => {
            clearTimeout(timeoutId);
            
            console.error('Error checking API status:', error);
            
            let errorMessage = error.message;
            if (error.name === 'AbortError') {
                errorMessage = 'Timeout';
            }
            
            // Try again with no-cors mode as fallback
            if (errorMessage.includes('Failed to fetch')) {
                console.log("Retrying with no-cors mode...");
                tryNoCorsCheck();
            } else {
                setApiStatus('offline', errorMessage);
                updateSendApiButton();
            }
        });
    } catch (error) {
        console.error('Error in API status check function:', error);
        setApiStatus('offline', error.message);
        updateSendApiButton();
    }
}

// Fallback check with no-cors mode
function tryNoCorsCheck() {
    try {
        // Basic Auth credentials
        const credentials = btoa(`${window.API_CONFIG.USERNAME}:${window.API_CONFIG.PASSWORD}`);
        
        // Send a ping request with no-cors mode
        fetch(`${window.API_CONFIG.BASE_URL}${window.API_CONFIG.PATHS.STATUS}`, {
            method: 'GET',
            mode: 'no-cors', // This allows the request but limits response access
            credentials: 'include'
        })
        .then(() => {
            // If we get here, the server is reachable, but we can't access the response
            // This is better than showing "offline" 
            console.log("Server reachable with no-cors mode");
            setApiStatus('limited', "CORS policy restriction");
            updateSendApiButton();
        })
        .catch(error => {
            console.error('Error in no-cors check:', error);
            setApiStatus('offline', "Server unreachable");
            updateSendApiButton();
        });
    } catch (error) {
        console.error('Error in no-cors attempt:', error);
        setApiStatus('offline', error.message);
        updateSendApiButton();
    }
}

// Update API status indicator
function setApiStatus(status, message = '') {
    const apiStatusDot = document.getElementById('apiStatusDot');
    const apiStatusText = document.getElementById('apiStatusText');

    switch(status) {
        case 'checking':
            apiStatusDot.className = 'w-3 h-3 rounded-full bg-gray-400 mr-1';
            apiStatusText.textContent = 'Checking...';
            apiStatusText.className = 'text-sm text-gray-600';
            break;
            
        case 'online':
            apiStatusDot.className = 'w-3 h-3 rounded-full bg-green-500 mr-1';
            apiStatusText.textContent = 'Online';
            apiStatusText.className = 'text-sm text-green-600';
            break;
            
        case 'limited':
            apiStatusDot.className = 'w-3 h-3 rounded-full bg-blue-500 mr-1';
            apiStatusText.textContent = 'Limited access' + (message ? `: ${message}` : '');
            apiStatusText.className = 'text-sm text-blue-600';
            break;
            
        case 'offline':
            apiStatusDot.className = 'w-3 h-3 rounded-full bg-red-500 mr-1';
            apiStatusText.textContent = 'Offline' + (message ? `: ${message}` : '');
            apiStatusText.className = 'text-sm text-red-600';
            break;
            
        case 'error':
            apiStatusDot.className = 'w-3 h-3 rounded-full bg-yellow-500 mr-1';
            apiStatusText.textContent = 'Error' + (message ? `: ${message}` : '');
            apiStatusText.className = 'text-sm text-yellow-600';
            break;
    }
}

// Update the Send to API button status
function updateSendApiButton() {
    const apiStatusDot = document.getElementById('apiStatusDot');
    const sendApiBtn = document.getElementById('sendApiBtn');

    if (sendApiBtn && (apiStatusDot.classList.contains('bg-green-500') || apiStatusDot.classList.contains('bg-blue-500'))) {
        sendApiBtn.disabled = false;
    } else if (sendApiBtn) {
        sendApiBtn.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const fileUpload = document.getElementById('fileUpload');
    const fileName = document.getElementById('fileName');
    const referenceName = document.getElementById('referenceName');
    const convertBtn = document.getElementById('convertBtn');
    const resultContainer = document.getElementById('resultContainer');
    const jsonResult = document.getElementById('jsonResult');
    const copyBtn = document.getElementById('copyBtn');
    const copySuccess = document.getElementById('copySuccess');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadSuccess = document.getElementById('downloadSuccess');
    const sendApiBtn = document.getElementById('sendApiBtn');
    const apiSuccess = document.getElementById('apiSuccess');
    const apiError = document.getElementById('apiError');
    
    // API status elements
    const checkApiBtn = document.getElementById('checkApiBtn');
    
    // Dark mode elements
    const darkModeToggle = document.getElementById('darkModeToggle');
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');
    
    // JSON data storage
    let currentJsonData = null;
    
    // Initialize dark mode
    initDarkMode();
    
    // Check API status button event
    checkApiBtn.addEventListener('click', checkApiStatus);
    
    // Dark mode toggle event
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // File upload event
    fileUpload.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // Check if it's an Excel file
            if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel' ||
                file.name.endsWith('.xlsx') ||
                file.name.endsWith('.xls')) {
                
                fileName.textContent = `Selected file: ${file.name}`;
                
                // Auto fill the reference name with the filename (without extension)
                const baseFileName = file.name.replace(/\.(xlsx|xls)$/i, '');
                referenceName.value = baseFileName;
                
                // Enable the convert button
                checkEnableButton();
            } else {
                fileName.textContent = 'Error: Select a valid Excel file (.xlsx or .xls)';
                fileUpload.value = '';
                checkEnableButton();
            }
        } else {
            fileName.textContent = '';
            checkEnableButton();
        }
    });

    // Reference name event
    referenceName.addEventListener('input', function() {
        checkEnableButton();
    });

    // Check if the convert button should be enabled
    function checkEnableButton() {
        if (fileUpload.files.length > 0 && referenceName.value.trim() !== '') {
            convertBtn.disabled = false;
        } else {
            convertBtn.disabled = true;
        }
    }

    // Convert button event
    convertBtn.addEventListener('click', function() {
        const file = fileUpload.files[0];
        const reader = new FileReader();

        convertBtn.disabled = true;
        convertBtn.innerHTML = '<div class="spinner"></div>';

        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Get the first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to an array of values (column A only)
                const locationIds = [];
                
                // Loop through all cells to find column A
                const range = XLSX.utils.decode_range(worksheet['!ref']);
                for (let row = range.s.r; row <= range.e.r; row++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 }); // Column A
                    const cell = worksheet[cellAddress];
                    
                    if (cell && cell.v && typeof cell.v === 'string' && cell.v.trim() !== '') {
                        locationIds.push(cell.v.trim());
                    }
                }
                
                // Check if valid data was found
                if (locationIds.length > 0) {
                    // Get selected ID type
                    const selectedIdType = document.querySelector('input[name="idType"]:checked').value;
                    
                    // Build the JSON structure
                    const inventoryLines = locationIds.map(id => {
                        // Use the selected ID type (ExtLocationId or ExtProductId)
                        const lineItem = {
                            "ReferenceName": referenceName.value.trim()
                        };
                        
                        // Add the correct ID type
                        lineItem[selectedIdType] = id;
                        
                        return lineItem;
                    });
                    
                    currentJsonData = {
                        "ImportOperation": {
                            "Lines": {
                                "InventoryLine": inventoryLines
                            }
                        }
                    };
                    
                    // Show the result
                    jsonResult.textContent = JSON.stringify(currentJsonData, null, 4);
                    resultContainer.classList.remove('hidden');
                    
                    // Update API button status based on API status
                    updateSendApiButton();
                    
                    // Scroll to the result
                    resultContainer.scrollIntoView({ behavior: 'smooth' });
                } else {
                    alert('No valid data found in column A of the Excel file.');
                }
            } catch (error) {
                console.error('Error processing Excel file:', error);
                alert('An error occurred while processing the Excel file. Check if the file is valid.');
            } finally {
                convertBtn.disabled = false;
                convertBtn.textContent = 'Convert to JSON';
            }
        };
        
        reader.onerror = function() {
            alert('An error occurred while reading the file.');
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert to JSON';
        };
        
        reader.readAsArrayBuffer(file);
    });

    // Copy button event
    copyBtn.addEventListener('click', function() {
        // Select the text
        const range = document.createRange();
        range.selectNode(jsonResult);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        
        // Copy to clipboard
        try {
            document.execCommand('copy');
            copySuccess.classList.remove('hidden');
            
            // Hide the success message after animation
            setTimeout(() => {
                copySuccess.classList.add('hidden');
            }, 2000);
        } catch (err) {
            console.error('Could not copy:', err);
            alert('Copy failed. Try to copy manually (Ctrl+C).');
        }
        
        // Deselect
        window.getSelection().removeAllRanges();
    });
    
    // Download JSON file button event
    downloadBtn.addEventListener('click', function() {
        // Get the JSON content
        const jsonContent = jsonResult.textContent;
        const referenceNameValue = referenceName.value.trim();
        
        // Create a sanitized filename (replace invalid characters)
        let fileName = referenceNameValue.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        // Add timestamp to ensure uniqueness
        const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
        fileName = `${fileName}_${dateStr}.json`;
        
        // Create a Blob with the JSON content
        const blob = new Blob([jsonContent], { type: 'application/json' });
        
        // Create a download link
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName;
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Clean up
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        
        // Show success message
        downloadSuccess.classList.remove('hidden');
        
        // Hide the success message after animation
        setTimeout(() => {
            downloadSuccess.classList.add('hidden');
        }, 2000);
    });
    
    // Send to API button event
    sendApiBtn.addEventListener('click', function() {
        if (!currentJsonData) {
            alert('No JSON data available to send.');
            return;
        }
        
        // Hide any old messages
        apiSuccess.classList.add('hidden');
        apiError.classList.add('hidden');
        
        // Show spinner on the button
        const originalBtnText = sendApiBtn.textContent;
        sendApiBtn.innerHTML = '<div class="spinner spinner-white"></div>';
        sendApiBtn.disabled = true;
        
        // Basic Auth credentials
        const credentials = btoa(`${window.API_CONFIG.USERNAME}:${window.API_CONFIG.PASSWORD}`);
        
        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`
        };
        
        // Add any custom headers from config
        if (window.API_CONFIG.OPTIONS && typeof window.API_CONFIG.OPTIONS === 'object') {
            Object.keys(window.API_CONFIG.OPTIONS).forEach(key => {
                headers[key] = window.API_CONFIG.OPTIONS[key];
            });
        }
        
        // Send the request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), window.API_CONFIG.TIMEOUT);
        
        fetch(`${window.API_CONFIG.BASE_URL}${window.API_CONFIG.PATHS.IMPORT}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(currentJsonData),
            credentials: 'include',
            signal: controller.signal
        })
        .then(response => {
            clearTimeout(timeoutId);
            
            // Check the response status
            if (response.ok) {
                // Show success message
                apiSuccess.classList.remove('hidden');
                setTimeout(() => {
                    apiSuccess.classList.add('hidden');
                }, 2000);
            } else {
                // Show error message
                apiError.classList.remove('hidden');
                setTimeout(() => {
                    apiError.classList.add('hidden');
                }, 2000);
                
                console.error('API error:', response.status, response.statusText);
                alert(`API error: ${response.status} ${response.statusText}`);
            }
        })
        .catch(error => {
            clearTimeout(timeoutId);
            
            console.error('Error with API request:', error);
            
            // Show error message
            apiError.classList.remove('hidden');
            setTimeout(() => {
                apiError.classList.add('hidden');
            }, 2000);
            
            let errorMessage = error.message;
            if (error.name === 'AbortError') {
                errorMessage = 'Timeout: The API did not respond within the expected time.';
            }
            
            alert(`An error occurred while sending to the API: ${errorMessage}`);
        })
        .finally(() => {
            // Restore the button
            sendApiBtn.innerHTML = originalBtnText;
            sendApiBtn.disabled = false;
        });
    });
    
    // Initialize dark mode
    function initDarkMode() {
        // Check for stored preference
        const prefersDarkMode = localStorage.getItem('darkMode') === 'true';
        
        // Check for system preference if there's no stored preference
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Apply dark mode if needed
        if (prefersDarkMode || (systemPrefersDark && localStorage.getItem('darkMode') === null)) {
            document.body.classList.add('dark-mode');
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
            
            // Update localStorage
            localStorage.setItem('darkMode', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
            
            // Update localStorage (only if there was a preference)
            if (localStorage.getItem('darkMode') !== null) {
                localStorage.setItem('darkMode', 'false');
            }
        }
    }
    
    // Toggle dark mode
    function toggleDarkMode() {
        // Toggle class on body
        document.body.classList.toggle('dark-mode');
        
        // Update icons
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        if (isDarkMode) {
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        } else {
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
        }
        
        // Save to localStorage
        localStorage.setItem('darkMode', isDarkMode);
    }
});

// Drag-and-drop functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.querySelector('label[for="fileUpload"]');
    const fileUpload = document.getElementById('fileUpload');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('bg-indigo-50');
        dropZone.classList.add('border-indigo-300');
    }

    function unhighlight() {
        dropZone.classList.remove('bg-indigo-50');
        dropZone.classList.remove('border-indigo-300');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        fileUpload.files = files;
        
        // Trigger the change event manually
        const event = new Event('change', { bubbles: true });
        fileUpload.dispatchEvent(event);
    }
});

// Add basic spinner styles
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .spinner {
            border: 3px solid rgba(0, 0, 0, 0.1);
            border-top: 3px solid #6366F1;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        
        .spinner-white {
            border-top-color: white;
            border-color: rgba(255, 255, 255, 0.3);
            border-top-color: white;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});