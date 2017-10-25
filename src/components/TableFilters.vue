<template>
        <thead>
            <slot>FILTERS hier</slot>
        </thead>
</template>

<script>
    
    import TableColumnFilter from './TableColumnFilter';

    export default {
        props: [],

        components: {
            TableColumnFilter,
        },

        computed: {

        },
    };
</script>
