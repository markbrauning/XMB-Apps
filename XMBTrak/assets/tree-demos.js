// Initialize various tree demos
window.addEventListener('load', function(){
  // jsTree example
  if (typeof $ !== 'undefined' && $.fn.jstree) {
    $('#jstree-demo').jstree({
      'core' : {
        'data' : [
          { 'text' : 'Root node', 'children' : [
            { 'text' : 'Child node 1' },
            { 'text' : 'Child node 2' }
          ]}
        ]
      },
      'plugins' : ['checkbox']
    });
  }

  // FancyTree example
  if (typeof $ !== 'undefined' && $.fn.fancytree) {
    $('#fancytree-demo').fancytree({
      source: [
        {title: 'Node 1', folder: true, children:[
          {title: 'Child 1'},
          {title: 'Child 2'}
        ]},
        {title: 'Node 2', children:[{title: 'Child 3'}]}
      ]
    });
  }

  // ag-Grid tree data example
  if (typeof agGrid !== 'undefined') {
    const gridOptions = {
      columnDefs: [
        { field: 'orgHierarchy', headerName: 'Hierarchy', cellRenderer: 'agGroupCellRenderer' }
      ],
      rowData: [
        { orgHierarchy: ['A', 'A1'] },
        { orgHierarchy: ['A', 'A2'] },
        { orgHierarchy: ['B'] },
        { orgHierarchy: ['B', 'B1'] }
      ],
      treeData: true,
      animateRows: true,
      groupDefaultExpanded: -1,
      getDataPath: function(data){ return data.orgHierarchy; }
    };
    new agGrid.Grid(document.querySelector('#aggrid-demo'), gridOptions);
  }

  // Handsontable nested rows example
  if (typeof Handsontable !== 'undefined') {
    const hotData = [
      {id:1, name:'Parent 1', __children:[
        {id:2, name:'Child 1.1'},
        {id:3, name:'Child 1.2'}
      ]},
      {id:4, name:'Parent 2'}
    ];
    new Handsontable(document.getElementById('handsontable-demo'), {
      data: hotData,
      colHeaders: ['ID', 'Name'],
      columns: [{data:'id'}, {data:'name'}],
      nestedRows: true,
      rowHeaders: true,
      licenseKey: 'non-commercial-and-evaluation'
    });
  }

  // PrimeVue TreeTable example
  if (typeof Vue !== 'undefined' && typeof PrimeVue !== 'undefined') {
    const { createApp } = Vue;
    const app = createApp({
      data(){
        return {
          nodes: [
            { key:'0', label:'Documents', children:[
              { key:'0-0', label:'Work', children:[
                { key:'0-0-0', label:'Expenses.doc' },
                { key:'0-0-1', label:'Resume.doc' }
              ]},
              { key:'0-1', label:'Home', children:[
                { key:'0-1-0', label:'Invoices.txt' }
              ]}
            ]}
          ]
        };
      },
      template:`<TreeTable :value="nodes">
                  <Column field="label" header="Name" />
                </TreeTable>`
    });
    app.use(PrimeVue);
    app.component('TreeTable', PrimeVue.TreeTable);
    app.component('Column', PrimeVue.Column);
    app.mount('#primevue-tree');
  }

  // DevExtreme DataGrid tree data example
  if (typeof $ !== 'undefined' && typeof $.fn.dxDataGrid !== 'undefined') {
    $('#dxgrid-demo').dxDataGrid({
      dataSource: [
        { id:1, parentId:0, name:'Parent 1' },
        { id:2, parentId:1, name:'Child 1.1' },
        { id:3, parentId:1, name:'Child 1.2' },
        { id:4, parentId:0, name:'Parent 2' }
      ],
      keyExpr: 'id',
      parentIdExpr: 'parentId',
      dataStructure: 'tree',
      columns: ['name'],
      showBorders: true
    });
  }
});
