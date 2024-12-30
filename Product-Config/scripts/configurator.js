async function loadCSVAndGenerateOptions() {
    try {
        const response = await fetch('./data/products.csv'); // Updated to fetch from the /data folder
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.split(','));

        if (rows.length < 2) return;

        const headers = rows[0];
        const products = rows.slice(1).map(row => {
            const product = {};
            row.forEach((cell, index) => {
                if (headers[index]) { // Ensure the header exists
                    product[headers[index].trim()] = cell?.trim() || "N/A"; // Handle missing or empty cells
                }
            });
            return product;
        });

        createFilterMenu(headers, products);
        displayProducts(products);

    } catch (error) {
        console.error('Error loading CSV:', error);
    }
}

function createFilterMenu(headers, products) {
    const filterMenuDiv = document.getElementById('filter-menu');
    if (!filterMenuDiv) {
        console.error('Error: Filter menu div not found in the DOM.');
        return;
    }

    // Limit to the first 8 parameters
    const filterableHeaders = headers.slice(0, 8);

    filterableHeaders.forEach(header => {
        const filterLabel = document.createElement('label');
        filterLabel.textContent = header;

        const filterDropdown = document.createElement('select');
        filterDropdown.innerHTML = `<option value="">All</option>`; // Default option to show all products

        // Get unique values for the current parameter
        const uniqueValues = [...new Set(products.map(product => product[header]))].filter(value => value);
        uniqueValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            filterDropdown.appendChild(option);
        });

        filterDropdown.addEventListener('change', () => {
            filterProducts(filterableHeaders, products);
        });

        filterMenuDiv.appendChild(filterLabel);
        filterMenuDiv.appendChild(filterDropdown);
    });
}

function filterProducts(filterableHeaders, products) {
    const filterMenuDiv = document.getElementById('filter-menu');
    const filters = Array.from(filterMenuDiv.getElementsByTagName('select')).map(select => select.value);

    const filteredProducts = products.filter(product => {
        return filters.every((filter, index) => {
            if (!filter) return true; // Ignore empty filters
            const header = filterableHeaders[index];
            return product[header] === filter;
        });
    });

    displayProducts(filteredProducts);
}

function displayProducts(products) {
    const configuratorDiv = document.getElementById('configurator');
    if (!configuratorDiv) {
        console.error('Error: Configurator div not found in the DOM.');
        return;
    }

    // Clear existing products
    configuratorDiv.innerHTML = '';

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');

        let isFirstDetail = true; // Track the first detail
        for (const [key, value] of Object.entries(product)) {
            if (key && value) { // Ensure valid key-value pairs
                const detail = document.createElement('p');
                if (isFirstDetail) {
                    detail.textContent = `${value}`; // Display only the value for the first detail
                    isFirstDetail = false;
                } else {
                    detail.textContent = `${key}: ${value}`;
                }
                productDiv.appendChild(detail);
            }
        }

        configuratorDiv.appendChild(productDiv);
    });
}


function createFilterMenu(headers, products) {
    const filterMenuDiv = document.getElementById('filter-menu');
    if (!filterMenuDiv) {
        console.error('Error: Filter menu div not found in the DOM.');
        return;
    }

     // Add "Clear All Filters" button
     const clearButton = document.createElement('button');
     clearButton.textContent = "Clear All Filters";
     clearButton.classList.add('filterbutton');
 
     clearButton.addEventListener('click', () => {
         Array.from(dropdowns).forEach(dropdown => dropdown.value = ""); // Reset all dropdowns
         displayProducts(products); // Reset product display
         updateFilterOptions(filterableHeaders, products);
     });
     filterMenuDiv.appendChild(clearButton);
     
    // Limit to the first 8 parameters
    const filterableHeaders = headers.slice(0, 8);

    filterableHeaders.forEach(header => {
        const filterLabel = document.createElement('label');
        filterLabel.textContent = header;

        const filterDropdown = document.createElement('select');
        filterDropdown.innerHTML = `<option value="">All</option>`; // Default option to show all products
        filterDropdown.dataset.header = header; // Store header information in dropdown

        filterMenuDiv.appendChild(filterLabel);
        filterMenuDiv.appendChild(filterDropdown);
    });

    updateFilterOptions(filterableHeaders, products);

    // Add event listeners for dynamic updates
    const dropdowns = filterMenuDiv.getElementsByTagName('select');
    Array.from(dropdowns).forEach(dropdown => {
        dropdown.addEventListener('change', () => {
            const filters = getSelectedFilters(filterableHeaders);
            const filteredProducts = applyFilters(products, filters);
            updateFilterOptions(filterableHeaders, filteredProducts, filters);
            displayProducts(filteredProducts);
        });
    });
}

function getSelectedFilters(headers) {
    const filterMenuDiv = document.getElementById('filter-menu');
    const dropdowns = filterMenuDiv.getElementsByTagName('select');
    const filters = {};
    Array.from(dropdowns).forEach(dropdown => {
        const header = dropdown.dataset.header;
        const value = dropdown.value;
        if (value) filters[header] = value;
    });
    return filters;
}

function applyFilters(products, filters) {
    return products.filter(product => {
        return Object.entries(filters).every(([header, value]) => product[header] === value);
    });
}

function updateFilterOptions(headers, products, currentFilters = {}) {
    const filterMenuDiv = document.getElementById('filter-menu');
    const dropdowns = filterMenuDiv.getElementsByTagName('select');

    Array.from(dropdowns).forEach(dropdown => {
        const header = dropdown.dataset.header;
        const selectedValue = dropdown.value;

        // Get unique values for the current header based on the filtered products
        const uniqueValues = [...new Set(products.map(product => product[header]))].filter(value => value);

        dropdown.innerHTML = `<option value="">All</option>`;
        uniqueValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            if (value === selectedValue) option.selected = true;
            dropdown.appendChild(option);
        });
    });
}


document.addEventListener('DOMContentLoaded', loadCSVAndGenerateOptions);
