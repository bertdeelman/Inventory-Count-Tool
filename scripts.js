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
    
    // Dark mode elements
    const darkModeToggle = document.getElementById('darkModeToggle');
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');
    
    // JSON data storage
    let currentJsonData = null;
    
    // Initialize dark mode
    initDarkMode();
    
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