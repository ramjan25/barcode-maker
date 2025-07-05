document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');

    generateBtn.addEventListener('click', () => {
        const activeTab = document.querySelector('.tab-button.active').getAttribute('onclick').includes('manual') ? 'manual' : 'sequence';
        const barcodeType = document.getElementById('barcode-type').value;
        
        let codes = [];
        if (activeTab === 'manual') {
            const textInput = document.getElementById('text-input').value.trim();
            codes = textInput.split('\n').filter(line => line.trim() !== '');
        } else {
            const prefix = document.getElementById('prefix').value;
            const suffix = document.getElementById('suffix').value;
            const start = parseInt(document.getElementById('start').value);
            const end = parseInt(document.getElementById('end').value);
            const increment = parseInt(document.getElementById('increment').value);

            if (isNaN(start) || isNaN(end) || isNaN(increment)) {
                alert('Start Value, End Value, and Increment must be valid numbers.');
                return;
            }
            if (start > end) {
                alert('Start Value cannot be greater than End Value.');
                return;
            }
            if (increment <= 0) {
                alert('Increment must be a positive number.');
                return;
            }

            const padding = String(end).length;
            for (let i = start; i <= end; i += increment) {
                const numericPart = String(i).padStart(padding, '0');
                codes.push(`${prefix}${numericPart}${suffix}`);
            }
        }

        if (codes.length === 0) {
            alert('No valid codes to generate. Please check your input.');
            return;
        }

        const zip = new JSZip();
        const barcodeFolder = zip.folder("ramjan khan");
        let successCount = 0;
        let errors = [];

        codes.forEach(code => {
            const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

            try {
                console.log(`Attempting to generate barcode for: ${code} with type: ${barcodeType}`);
                JsBarcode(svgNode, code, {
                    format: barcodeType,
                    displayValue: true
                });

                const svgString = svgNode.outerHTML; // Get the SVG string directly
                
                const safeFilename = code.replace(/[^a-z0-9_.-]/gi, '_') + '.svg';

                barcodeFolder.file(safeFilename, svgString);
                successCount++;

            } catch (e) {
                console.error(`Error for code "${code}":`, e);
                errors.push(`'${code}': ${e.message}`);
            }
        });

        if (successCount > 0) {
            zip.generateAsync({type:"blob"}).then(function(content) {
                saveAs(content, "ramjan khan.zip");
            });

            let alertMessage = `Successfully generated ${successCount} out of ${codes.length} barcodes.`;
            if (errors.length > 0) {
                alertMessage += `\n\n${errors.length} codes failed:\n- ${errors.join('\n- ')}`;
            }
            alert(alertMessage);

        } else {
            let errorMessage = "Could not generate any valid barcodes.";
            if (errors.length > 0) {
                 errorMessage += `\n\nPlease check the following ${errors.length} errors:\n- ${errors.join('\n- ')}`;
            }
            errorMessage += "\n\nThis often happens if the input data is not valid for the selected barcode type."
            alert(errorMessage);
        }
    });
});

function openTab(event, tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.style.display = 'none');

    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));

    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.classList.add('active');
}