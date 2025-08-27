// Minimal starter behavior
// Demo data for Tabulator
const demoData = [
  { id: 1, item: "Sensor A", qty: 5, price: 12.5, inStock: true, category: "IO" },
  { id: 2, item: "PLC Module", qty: 2, price: 299.99, inStock: true, category: "PLC" },
  { id: 3, item: "Actuator X", qty: 10, price: 45.0, inStock: false, category: "Motion" },
];

// Initialize Tabulator if the div exists
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("example-table");
  if (!el || typeof Tabulator === "undefined") return;

  const table = new Tabulator(el, {
    data: demoData,
    reactiveData: true,
    height: 320,
    layout: "fitColumns",
    movableColumns: true,
    pagination: "local",
    paginationSize: 5,
    columns: [
      { title: "ID", field: "id", width: 60, sorter: "number" },
      { title: "Item", field: "item", editor: "input" },
      { title: "Qty", field: "qty", editor: "number", hozAlign: "right" },
      { title: "Price", field: "price", editor: "number", hozAlign: "right", formatter: "money", formatterParams: { symbol: "$" } },
      { title: "In Stock", field: "inStock", editor: true, formatter: "tickCross", hozAlign: "center" },
      { title: "Category", field: "category", editor: "list", editorParams: { values: ["PLC", "IO", "Motion", "Network"] } },
    ],
  });

  // Buttons
  document.getElementById("download-csv")?.addEventListener("click", () => table.download("csv", "table.csv"));
  document.getElementById("add-row")?.addEventListener("click", () => {
    table.addRow({ id: Date.now(), item: "New Item", qty: 1, price: 0, inStock: false, category: "IO" }, true);
  });
  document.getElementById("clear")?.addEventListener("click", () => table.clearData());
});