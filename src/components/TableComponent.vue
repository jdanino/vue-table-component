<template>
    <div class="table-component">
        
        <div class="metadata-and-filters">

            <div v-cloak v-if="pagination" class="metadata">
                <p>
                    Page {{ pagination.currentPage }} from {{ pagination.totalPages }} ({{ metadata.totalRecords }} records)
                </p>
            </div>

            <div v-if="filters.length" class="clear-filters">
                <a href @click.prevent="clearFilters" class="btn btn-default">
                    <slot name="clear-filter-link">Clear filter{{ this.filters.length == 1 ? '' : 's' }} ({{ this.filters.length }})</slot>
                </a>
            </div>
        </div>

        <div v-if="showFilter && filterableColumnExists" class="table-component__filter">
            <input
                    :class="fullFilterInputClass"
                    type="text"
                    v-model="filter"
                    :placeholder="filterPlaceholder"
            >
            <a
                    v-if="filter"
                    @click="filter = ''"
                    class="table-component__filter__clear"
            >×</a>
        </div>

        <div class="table-component__table-wrapper">
            <table :class="fullTableClass">
                <caption v-if="showCaption" class="table-component__table__caption" role="alert" aria-live="polite">
                    {{ ariaCaption }}
                </caption>
                <thead :class="fullTableHeadClass">
                <tr>
                    <table-column-header
                            @click="changeSorting"
                            v-for="column in columns"
                            :key="column.show"
                            :sort="sort"
                            :column="column"
                    ></table-column-header>
                </tr>
                </thead>
                
                <!-- <table-filters></table-filters> -->
                <thead>
                    <tr>
                        <slot name="filters"></slot>
                    </tr>
                </thead>

                <tbody :class="fullTableBodyClass">
                <table-row
                        v-for="row in displayedRows"
                        :key="row.vueTableComponentInternalRowId"
                        :row="row"
                        :columns="columns"
                ></table-row>
                </tbody>
            </table>
        </div>

        <div v-if="displayedRows.length === 0" class="table-component__message">
            {{ filterNoResults }}
        </div>


        <div style="display:none;">
            <slot></slot>
        </div>

        <pagination v-if="pagination" :pagination="pagination" @pageChange="pageChange"></pagination>
    </div>
</template>

<script>
    import Column from '../classes/Column';
    import expiringStorage from '../expiring-storage';
    import Row from '../classes/Row';
    import TableColumnHeader from './TableColumnHeader';
    import TableRow from './TableRow';
    import settings from '../settings';
    import isArray from 'lodash/isArray';
    import pick from 'lodash/pick';
    import Pagination from './Pagination';
    import { classList } from '../helpers';

    import TableFilters from './TableFilters';
    import TableColumnFilter from './TableColumnFilter';

    export default {
        components: {
            TableColumnHeader,
            TableRow,
            Pagination,
            TableFilters,
            TableColumnFilter,
        },

        props: {
            data: { default: () => [], type: [Array, Function] },

            showFilter: { default: true },
            showCaption: { default: true },

            sortBy: { default: '', type: String },
            sortOrder: { default: '', type: String },

            cacheKey: { default: null },
            cacheLifetime: { default: 5 },

            tableClass: { default: settings.tableClass },
            theadClass: { default: settings.theadClass },
            tbodyClass: { default: settings.tbodyClass },
            filterInputClass: { default: settings.filterInputClass },
            filterPlaceholder: { default: settings.filterPlaceholder },
            filterNoResults: { default: settings.filterNoResults },
        },

        data: () => ({
            columns: [],
            rows: [],
            filter: '',
            filters: [],
            sort: {
                fieldName: '',
                order: '',
            },
            pagination: null,
            metadata: {},

            localSettings: {},
        }),

        created() {
            this.sort.fieldName = this.sortBy;
            this.sort.order = this.sortOrder;

            this.restoreState();
        },

        async mounted() {
            const columnComponents = this.$slots.default
                .filter(column => column.componentInstance)
                .map(column => column.componentInstance);

            this.columns = columnComponents.map(
                column => new Column(column)
            );

            columnComponents.forEach(columnCom => {
                Object.keys(columnCom.$options.props).forEach(
                    prop => columnCom.$watch(prop, () => {
                        this.columns = columnComponents.map(
                            column => new Column(column)
                        );
                    })
                );
            });

            await this.mapDataToRows();
        },

        watch: {

            filter() {
                if (!this.usesLocalData) {
                    this.mapDataToRows();
                }

                this.saveState();
            },

            data() {
                if (this.usesLocalData) {
                    this.mapDataToRows();
                }
            },
        },

        computed: {
            fullTableClass() {
                return classList('table-component__table', this.tableClass);
            },

            fullTableHeadClass() {
                return classList('table-component__table__head', this.theadClass);
            },

            fullTableBodyClass() {
                return classList('table-component__table__body', this.tbodyClass);
            },

            fullFilterInputClass() {
                return classList('table-component__filter__field', this.filterInputClass);
            },

            ariaCaption() {
                if (this.sort.fieldName === '') {
                    return 'Table not sorted';
                }

                return `Table sorted by ${this.sort.fieldName} ` +
                    (this.sort.order === 'asc' ? '(ascending)' : '(descending)');
            },

            usesLocalData() {
                return isArray(this.data);
            },

            displayedRows() {
                if (!this.usesLocalData) {
                    return this.sortedRows;
                }

                if (!this.showFilter) {
                    return this.sortedRows;
                }

                if (!this.columns.filter(column => column.isFilterable()).length) {
                    return this.sortedRows;
                }

                return this.sortedRows.filter(row => row.passesFilter(this.filter));
            },

            sortedRows() {
                if (!this.usesLocalData) {
                    return this.rows;
                }

                if (this.sort.fieldName === '') {
                    return this.rows;
                }

                if (this.columns.length === 0) {
                    return this.rows;
                }

                const sortColumn = this.getColumn(this.sort.fieldName);

                if (!sortColumn) {
                    return this.rows;
                }

                return this.rows.sort(sortColumn.getSortPredicate(this.sort.order, this.columns));
            },

            filterableColumnExists() {
                return this.columns.filter(c => c.isFilterable()).length > 0;
            },

            storageKey() {
                return this.cacheKey
                    ? `vue-table-component.${this.cacheKey}`
                    : `vue-table-component.${window.location.host}${window.location.pathname}${this.cacheKey}`;
            },

        },

        methods: {

            async pageChange(page) {
                this.pagination.currentPage = page;

                await this.mapDataToRows();
            },

            async mapDataToRows() {
                const data = this.usesLocalData
                    ? this.prepareLocalData()
                    : await this.fetchServerData();

                let rowId = 0;

                this.rows = data
                    .map(rowData => {
                        rowData.vueTableComponentInternalRowId = rowId++;
                        return rowData;
                    })
                    .map(rowData => new Row(rowData, this.columns));
            },

            prepareLocalData() {
                this.pagination = null;

                return this.data;
            },

            async fetchServerData() {

                const page = this.pagination && this.pagination.currentPage || 1;

                const response = await this.data({
                    filter: this.filter,
                    filters: this.filters,
                    sort: this.sort,
                    page: page,
                });

                this.pagination = response.pagination;
                this.metadata = response.metadata;

                return response.data;
            },

            async refresh() {
                await this.mapDataToRows();
            },

            changeSorting(column) {
                const currentlySortedBy = column.sortBy || column.show;

                if (this.sort.fieldName !== currentlySortedBy) {
                    this.sort.fieldName = currentlySortedBy;
                    this.sort.order = 'asc';
                } else {
                    this.sort.order = (this.sort.order === 'asc' ? 'desc' : 'asc');
                }
                
                if (!this.usesLocalData) {
                    this.mapDataToRows();
                }

                this.saveState();
            },

            getColumn(columnName) {
                return this.columns.find(column => column.show === columnName);
            },

            saveState() {
                expiringStorage.set(this.storageKey, pick(this.$data, ['filter', 'sort']), this.cacheLifetime);
            },

            restoreState() {
                const previousState = expiringStorage.get(this.storageKey);

                if (previousState === null) {
                    return;
                }

                this.sort = previousState.sort;
                this.filter = previousState.filter;

                this.saveState();
            },

            setFilter(column, value) {
                
                // this.$set(this.filters, column, value);
                // this.$set(this.filters, column, value);
                this.filters.push({ column: column, value: value });

                if (!this.usesLocalData) {
                    this.mapDataToRows();
                }

                this.saveState();
            },

            clearFilters() {

                this.$slots.filters.map(filter => {
                    if (filter.tag !== undefined) {
                        const itemToRemove = this.filters.find(item => item['column'] == filter.componentInstance.column);
                        this.filters.splice(this.filters.indexOf(itemToRemove), 1);

                        filter.componentInstance.reset();
                    }
                });

                if (!this.usesLocalData) {
                    this.mapDataToRows();
                }

                this.saveState();
            },
        },
    };
</script>
