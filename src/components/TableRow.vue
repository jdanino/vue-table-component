<template>
    <tr>
        <table-cell
            v-for="(column, index) in visibleColumns"
            :key="row.vueTableComponentInternalRowId + '-' + column.index"
            :row="row"
            :column="column"
        ></table-cell>
    </tr>
</template>

<script>
    import TableCell from './TableCell';

    export default {
        props: ['columns', 'row'],

        components: {
            TableCell,
        },

        computed: {
            visibleColumns() {
                return this.columns.filter(column => ! column.hidden);
            },
        },

        mounted() {
            console.log('row ' + this.rowKey + 'mounted');
        },
    };
</script>
