// Fetch item descriptions from Google Apps Script
function fetchItemDescriptions() {
    fetch('https://script.google.com/macros/s/AKfycbw2DfYi93h-cj34iKrbr3AYbRZfQ_y9QjOiJaO_MJyAdw51yvAyxGdH24boRSMYPqjn/exec?action=getItems')
        .then(response => response.json())
        .then(items => {
            window.itemList = items; // Store items globally
        })
        .catch(error => {
            console.error('Error fetching item descriptions:', error);
        });
}

// Call fetchItemDescriptions when the page loads
window.onload = fetchItemDescriptions;

// Handle search-as-you-type
document.getElementById('itemDescription').addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const dropdown = document.getElementById('dropdown');
    dropdown.innerHTML = '';

    if (searchTerm) {
        const filteredItems = window.itemList.filter(item => item.toLowerCase().includes(searchTerm));
        if (filteredItems.length > 0) {
            filteredItems.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.className = 'dropdown-item';
                itemElement.textContent = item;
                itemElement.onclick = function () {
                    document.getElementById('itemDescription').value = item;
                    dropdown.classList.add('hidden');
                };
                dropdown.appendChild(itemElement);
            });
            dropdown.classList.remove('hidden');
        } else {
            dropdown.classList.add('hidden');
        }
    } else {
        dropdown.classList.add('hidden');
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('dropdown');
    if (!event.target.matches('#itemDescription')) {
        dropdown.classList.add('hidden');
    }
});

// Keyboard navigation for dropdown
document.getElementById('itemDescription').addEventListener('keydown', function (event) {
    const dropdown = document.getElementById('dropdown');
    const items = dropdown.getElementsByClassName('dropdown-item');
    let selectedIndex = -1;

    // Find the currently selected item
    for (let i = 0; i < items.length; i++) {
        if (items[i].classList.contains('selected')) {
            selectedIndex = i;
            break;
        }
    }

    // Handle arrow keys
    if (event.key === 'ArrowDown') {
        event.preventDefault(); // Prevent cursor movement in the input field
        if (selectedIndex < items.length - 1) {
            if (selectedIndex !== -1) {
                items[selectedIndex].classList.remove('selected');
            }
            selectedIndex++;
            items[selectedIndex].classList.add('selected');
            items[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    } else if (event.key === 'ArrowUp') {
        event.preventDefault(); // Prevent cursor movement in the input field
        if (selectedIndex > 0) {
            if (selectedIndex !== -1) {
                items[selectedIndex].classList.remove('selected');
            }
            selectedIndex--;
            items[selectedIndex].classList.add('selected');
            items[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    } else if (event.key === 'Enter' && selectedIndex !== -1) {
        event.preventDefault(); // Prevent form submission
        document.getElementById('itemDescription').value = items[selectedIndex].textContent;
        dropdown.classList.add('hidden');
    }
});

// Update fields based on transaction type
function updateFields() {
    const transactionType = document.getElementById('transactionType').value;
    document.getElementById('receivingFields').classList.toggle('hidden', transactionType !== 'RECEIVING');
    document.getElementById('issuanceFields').classList.toggle('hidden', transactionType !== 'ISSUANCE');
}

// Submit form data
function submitForm() {
    // Get the current date and time
    const now = new Date();
    const timestamp = now.toLocaleString(); // Format: "MM/DD/YYYY, HH:MM:SS AM/PM"

    // Format the Date field as "Month Day, Year" (e.g., February 25, 2025)
    const date = new Date(document.getElementById('date').value);
    const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Format the Production Date field as "DD-MMM-YYYY" (e.g., 25-Feb-2025)
    const productionDate = new Date(document.getElementById('productionDate').value);
    const formattedProductionDate = productionDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

    // Add the formatted dates and timestamp to the form data
    const formData = {
        date: formattedDate,
        itemDescription: document.getElementById('itemDescription').value,
        containerNo: document.getElementById('containerNo').value,
        qtyCs: document.getElementById('qtyCs').value,
        qtyKg: document.getElementById('qtyKg').value,
        transactionType: document.getElementById('transactionType').value,
        wrrNo: document.getElementById('wrrNo').value,
        rirNo: document.getElementById('rirNo').value,
        docsRefNoReceiving: document.getElementById('docsRefNoReceiving').value,
        wwrNo: document.getElementById('wwrNo').value,
        iirNo: document.getElementById('iirNo').value,
        docsRefNoIssuance: document.getElementById('docsRefNoIssuance').value,
        productionDate: formattedProductionDate,
        timestamp: timestamp // Add the timestamp to the form data
    };

    // Send the form data to Google Apps Script
    fetch('https://script.google.com/macros/s/AKfycbw2DfYi93h-cj34iKrbr3AYbRZfQ_y9QjOiJaO_MJyAdw51yvAyxGdH24boRSMYPqjn/exec', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors'
    })
        .then(() => {
            alert('Data saved successfully!');
            document.getElementById('inventoryForm').reset();
            updateFields(); // Hide conditional fields after reset
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to save data.');
        });
}
