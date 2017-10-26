import Vue from 'vue';
import { TableColumn, TableComponent, TableFilters, TableColumnFilter } from '../src';
import axios from 'axios';

import VuePaginate from 'vue-paginate';
Vue.use(VuePaginate);

new Vue({
    el: '#app',

    components: {
        TableColumn,
        TableComponent,
        TableFilters,
        TableColumnFilter,
    },

    methods: {
        async fetchData({ page, filter, filters, sort }) {
            console.log(JSON.stringify(filters));
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

    },
});