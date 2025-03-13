document.addEventListener('DOMContentLoaded', function() {
    // DOM elementen
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

    // Bestandsupload event
    fileUpload.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // Controleer of het een Excel-bestand is
            if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel' ||
                file.name.endsWith('.xlsx') ||
                file.name.endsWith('.xls')) {
                
                fileName.textContent = `Geselecteerd bestand: ${file.name}`;
                
                // Activeer de converteerknop als er ook een referentienaam is
                checkEnableButton();
            } else {
                fileName.textContent = 'Fout: Selecteer een geldig Excel-bestand (.xlsx of .xls)';
                fileUpload.value = '';
                checkEnableButton();
            }
        } else {
            fileName.textContent = '';
            checkEnableButton();
        }
    });

    // Referentienaam event
    referenceName.addEventListener('input', function() {
        checkEnableButton();
    });

    // Controleer of de converteerknop geactiveerd kan worden
    function checkEnableButton() {
        if (fileUpload.files.length > 0 && referenceName.value.trim() !== '') {
            convertBtn.disabled = false;
        } else {
            convertBtn.disabled = true;
        }
    }

    // Converteer knop event
    convertBtn.addEventListener('click', function() {
        const file = fileUpload.files[0];
        const reader = new FileReader();

        convertBtn.disabled = true;
        convertBtn.innerHTML = '<div class="spinner"></div>';

        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Haal de eerste sheet op
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Converteer naar een array van waarden (alleen kolom A)
                const locationIds = [];
                
                // Loop door alle cellen om kolom A te vinden
                const range = XLSX.utils.decode_range(worksheet['!ref']);
                for (let row = range.s.r; row <= range.e.r; row++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 }); // Kolom A
                    const cell = worksheet[cellAddress];
                    
                    if (cell && cell.v && typeof cell.v === 'string' && cell.v.trim() !== '') {
                        locationIds.push(cell.v.trim());
                    }
                }
                
                // Controleer of er geldige data is gevonden
                if (locationIds.length > 0) {
                    // Bouw de JSON-structuur
                    const inventoryLines = locationIds.map(id => ({
                        "ReferenceName": referenceName.value.trim(),
                        "ExtLocationId": id
                    }));
                    
                    const jsonData = {
                        "ImportOperation": {
                            "Lines": {
                                "InventoryLine": inventoryLines
                            }
                        }
                    };
                    
                    // Toon het resultaat
                    jsonResult.textContent = JSON.stringify(jsonData, null, 4);
                    resultContainer.classList.remove('hidden');
                    
                    // Scroll naar het resultaat
                    resultContainer.scrollIntoView({ behavior: 'smooth' });
                } else {
                    alert('Geen geldige gegevens gevonden in kolom A van het Excel-bestand.');
                }
            } catch (error) {
                console.error('Fout bij het verwerken van het Excel-bestand:', error);
                alert('Er is een fout opgetreden bij het verwerken van het Excel-bestand. Controleer of het bestand geldig is.');
            } finally {
                convertBtn.disabled = false;
                convertBtn.textContent = 'Converteer naar JSON';
            }
        };
        
        reader.onerror = function() {
            alert('Er is een fout opgetreden bij het lezen van het bestand.');
            convertBtn.disabled = false;
            convertBtn.textContent = 'Converteer naar JSON';
        };
        
        reader.readAsArrayBuffer(file);
    });

    // Kopieer knop event
    copyBtn.addEventListener('click', function() {
        // Selecteer de tekst
        const range = document.createRange();
        range.selectNode(jsonResult);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        
        // Kopieer naar klembord
        try {
            document.execCommand('copy');
            copySuccess.classList.remove('hidden');
            
            // Verberg het succes bericht na animatie
            setTimeout(() => {
                copySuccess.classList.add('hidden');
            }, 2000);
        } catch (err) {
            console.error('Kon niet kopiëren:', err);
            alert('Kopiëren niet gelukt. Probeer handmatig te kopiëren (Ctrl+C).');
        }
        
        // Deselecteer
        window.getSelection().removeAllRanges();
    });
    
    // Download JSON bestand knop event
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
});

// Drag-and-drop functionaliteit
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
        
        // Trigger het change event manueel
        const event = new Event('change', { bubbles: true });
        fileUpload.dispatchEvent(event);
    }
});