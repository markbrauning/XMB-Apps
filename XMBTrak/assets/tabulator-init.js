// Tabulator table initialization
window.onload = function() {
  if (window.Tabulator) {
    var tableData = [
      {id:1, name:"John", age:29, gender:"Male"},
      {id:2, name:"Jane", age:32, gender:"Female"},
      {id:3, name:"Steve", age:41, gender:"Male"},
      {id:4, name:"Mary", age:25, gender:"Female"},
      {id:5, name:"Alice", age:22, gender:"Female"},
      {id:6, name:"Bob", age:35, gender:"Male"},
      {id:7, name:"Carol", age:28, gender:"Female"},
      {id:8, name:"David", age:44, gender:"Male"},
      {id:9, name:"Eve", age:31, gender:"Female"},
      {id:10, name:"Frank", age:38, gender:"Male"},
      {id:11, name:"Grace", age:27, gender:"Female"},
      {id:12, name:"Henry", age:33, gender:"Male"},
      {id:13, name:"Ivy", age:24, gender:"Female"},
      {id:14, name:"Jack", age:40, gender:"Male"},
      {id:15, name:"Kathy", age:26, gender:"Female"},
      {id:16, name:"Leo", age:36, gender:"Male"},
      {id:17, name:"Mona", age:30, gender:"Female"},
      {id:18, name:"Nate", age:42, gender:"Male"},
      {id:19, name:"Olivia", age:23, gender:"Female"},
      {id:20, name:"Paul", age:39, gender:"Male"},
      {id:21, name:"Quinn", age:34, gender:"Female"},
      {id:22, name:"Rick", age:37, gender:"Male"},
      {id:23, name:"Sara", age:28, gender:"Female"},
      {id:24, name:"Tom", age:45, gender:"Male"},
      {id:25, name:"Uma", age:29, gender:"Female"},
      {id:26, name:"Vince", age:32, gender:"Male"},
      {id:27, name:"Wendy", age:27, gender:"Female"},
      {id:28, name:"Xander", age:41, gender:"Male"},
      {id:29, name:"Yara", age:25, gender:"Female"},
      {id:30, name:"Zack", age:35, gender:"Male"}
    ];
    var table = new Tabulator("#tabulator-table", {
      data: tableData,
      layout: "fitColumns",
      movableColumns: true,
      pagination: true,
      paginationSize: 10,
      columns: [
        {title: "ID", field: "id", width: 50, editor: "input", headerFilter: "input"},
        {title: "Name", field: "name", editor: "input", headerFilter: "input"},
        {title: "Age", field: "age", editor: "input", headerFilter: "input"},
        {title: "Gender", field: "gender", editor: "input", headerFilter: "input"}
      ]
    });

    // Hierarchy (tree) table example
    var hierarchyData = [
      {id:1, name:"Parent 1", type:"Folder", children:[
        {id:2, name:"Child 1.1", type:"File"},
        {id:3, name:"Child 1.2", type:"File"},
        {id:4, name:"Child 1.3", type:"Folder", children:[
          {id:5, name:"Child 1.3.1", type:"File"}
        ]}
      ]},
      {id:6, name:"Parent 2", type:"Folder", children:[
        {id:7, name:"Child 2.1", type:"File"}
      ]},
      {id:8, name:"Parent 3", type:"File"}
    ];

    var hierarchyTable = new Tabulator("#hierarchy-table", {
      data: hierarchyData,
      layout: "fitColumns",
      movableColumns: true,
      dataTree: true,
      dataTreeStartExpanded: false,
      columns: [
  {formatter: "rowTree", width: 40, headerSort: false, resizable: false},
        {title: "ID", field: "id", width: 60},
        {title: "Name", field: "name", width: 200},
        {title: "Type", field: "type", width: 100}
      ]
    });
    console.log("Tabulator initialized", table);
  } else {
    document.getElementById("tabulator-table").innerHTML = '<div class="notification is-danger">Tabulator library still not loaded. Check CDN and script order.</div>';
  }
}
