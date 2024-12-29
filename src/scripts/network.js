document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("network-container");
    async function loadCSV() {
        try {
            const response = await fetch('./data/products.csv'); // Updated to fetch from the /data folder
            const csvText = await response.text();
            const rows = csvText.split("\n").filter(row => row.trim() !== ""); // Remove empty rows
            const edges = [];
            const nodeIds = new Set();
            rows.slice(1).forEach(row => { // Skip header row
                const [from, to] = row.split(",").map(value => value.trim());
                edges.push({ from: parseInt(from, 10), to: parseInt(to, 10) });
                nodeIds.add(parseInt(from, 10));
                nodeIds.add(parseInt(to, 10));
            });
    
            return { edges, nodeIds };

        } catch (error) {
            console.error('Error loading CSV:', error);
        }
    }

    // Load data from CSV
    const { edges, nodeIds } = await loadCSV("data/nodedata.csv");

    // Generate nodes
    const nodes = Array.from(nodeIds).map(id => ({ id, label: `Node ${id}` }));

    // Initialize the network
    const data = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };

    const options = {
        nodes: {
            shape: "text",
            size: 50,
            font: { color: "#000", size: 10 }
        },
        edges: {
            color: "#888",
            width: 4
        },
        physics: {
            enabled: false
        }
    };

    new vis.Network(container, data, options);

});