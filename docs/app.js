import Vue from 'vue';
import { TableColumn, TableComponent, TableColumnFilter, activeToggle } from '../src';
import axios from 'axios';

new Vue({
    el: '#app',

    components: {
        TableColumn,
        TableComponent,
        TableColumnFilter,
        activeToggle,
    },

    methods: {
        async fetchData({ page, filter, filters, sort }) {
            const data = {
                orderBy   : sort.fieldName,
                sortOrder : sort.order,
                filter    : filter,
                filters    : filters,
                page      : page,
                // globalFilters: [{ column: 'user_id|is', value: '5' }],
            };

            const response = await axios.get('http://datatable-api-endpoint.dev/', { params: data });

            return {
                data       : response.data.data,
                pagination : {
                    currentPage : response.data.current_page,
                    totalPages  : response.data.last_page,
                },
                metadata: {
                    to: response.data.to,
                    from: response.data.from,
                    totalRecords: response.data.total,
                    recordsPerPage: response.data.per_page,
                    
                },
            };
        },

        deleteItem(id) {
            this.$refs.table.removeRow(id);
        },

    },
});