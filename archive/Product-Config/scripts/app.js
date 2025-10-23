function productConfig() {
    return {
        table: null,
        headers: [],
        filters: {},
        filterOptions: {},
        init() {
            fetch('./data/products.csv')
                .then(res => res.text())
                .then(text => {
                    const rows = text.trim().split('\n').map(r => r.split(','));
                    if (rows.length < 2) return;
                    this.headers = rows[0].map(h => h.trim());
                    const data = rows.slice(1).map(row => {
                        const obj = {};
                        this.headers.forEach((h, i) => {
                            obj[h] = row[i] ? row[i].trim() : '';
                        });
                        return obj;
                    });
                    this.setupFilters(data);
                    this.table = new Tabulator('#product-table', {
                        data,
                        layout: 'fitDataStretch',
                        columns: this.headers.map(h => ({ title: h, field: h }))
                    });
                });
        },
        setupFilters(data) {
            this.filterOptions = {};
            this.headers.slice(0, 8).forEach(h => {
                const values = [...new Set(data.map(d => d[h]).filter(Boolean))].sort();
                this.filterOptions[h] = values;
                this.filters[h] = '';
            });
        },
        applyFilters() {
            if (!this.table) return;
            this.table.clearFilter();
            Object.entries(this.filters).forEach(([field, value]) => {
                if (value) {
                    this.table.addFilter(field, '=', value);
                }
            });
        },
        clearFilters() {
            Object.keys(this.filters).forEach(k => this.filters[k] = '');
            this.applyFilters();
        }
    };
}
