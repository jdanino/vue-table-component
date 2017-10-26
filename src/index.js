import TableColumnFilter from './components/TableColumnFilter';
import TableComponent from './components/TableComponent';
import TableColumn from './components/TableColumn';
import Pagination from './components/Pagination';
import { mergeSettings } from './settings';

import activeToggle from './components/activeToggle';

export default {
    install(Vue) {
        Vue.component('table-component', TableComponent);
        Vue.component('table-column', TableColumn);
        Vue.component('pagination', Pagination);
        Vue.component('table-column-filter', TableColumnFilter);
        Vue.component('active-toggle', activeToggle);
    },

    settings(settings) {
        mergeSettings(settings);
    },
};

export { TableComponent, TableColumn, TableColumnFilter, activeToggle };
