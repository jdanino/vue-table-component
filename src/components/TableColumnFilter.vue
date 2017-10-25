<template>
    <td>
        <select v-if="type == 'select'"
            @change="filter"
            v-model="value"
        >
            <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>

        <input v-if="type == 'date'" 
            type="date" 
            @change="filter"
            v-model="value"
        >

        <input v-if="type == 'text'" 
            type="text" 
            @change="filter"
            v-model="value"
        >
    </td>
</template>

<script>

    export default {
        props: {
            column: {},
            type: {
                default: 'text',
            },
            options: {
                default: () => {
                    return [];
                },
            },

        },

        data() {
            return {
                value         : '',
            };
        },

        methods: {
            filter() {
                this.$parent.setFilter(this.column, this.value);
            },
        },

    };
</script>