import Vue from 'vue';
import { TableColumn, TableComponent, TableColumnFilter } from '../src';
import axios from 'axios';



new Vue({
    el: '#app',

    components: {
        TableColumn,
        TableComponent,
        TableColumnFilter,
    },

    methods: {
        async fetchData({ page, filter, filters, sort }) {
            const data = {
                orderBy   : sort.fieldName,
                sortOrder : sort.order,
                filter    : filter,
                filters    : filters,
                page      : page,
            };

            const response = await axios.get('http://admin.rondreis.dev/api/blogs', { params: data });

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
            console.log(this.$refs);
            this.$refs.table.removeRow(id);
        },

    },
});