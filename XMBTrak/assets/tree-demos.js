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

  // FancyTree example with columns
  if (typeof $ !== 'undefined' && $.fn.fancytree) {
    $('#fancytree-demo').fancytree({
      extensions: ['table'],
      source: [
        {
          title: 'Node 1',
          data: { info: 'Info 1' },
          folder: true,
          children: [
            { title: 'Child 1', data: { info: 'Info 1.1' } },
            { title: 'Child 2', data: { info: 'Info 1.2' } }
          ]
        },
        { title: 'Node 2', data: { info: 'Info 2' } }
      ],
      table: {
        indentation: 20,
        nodeColumnIdx: 0
      },
      renderColumns: function(event, data) {
        var node = data.node;
        var $tdList = $(node.tr).find('>td');
        $tdList.eq(1).text(node.data.info);
      }
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
    app.use(PrimeVue.default);
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
      rootValue: 0,
      columns: ['name'],
      showBorders: true
    });
  }
});
