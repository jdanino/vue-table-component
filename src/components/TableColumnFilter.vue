<template>
    <td :style="{ minWidth: minWidth ? minWidth + 'px' : '', maxWidth: maxWidth ? maxWidth + 'px' : '' }">
        <select v-if="type == 'select'"
            @change="filter"
            v-model="value"
            class="form-control"
            :placeholder="placeholder || ''"
        >
            <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>

        <input v-if="type == 'date'" 
            type="date" 
            @change="filter"
            v-model="value"
            class="form-control"
            :placeholder="placeholder || ''"
        >

        <input v-if="type == 'text'" 
            type="text" 
            @change="filter"
            v-model="value"
            class="form-control"
            :placeholder="placeholder || ''"
        >
    </td>
</template>

<script>

    export default {
        props: {
            dataInitValue: '',
            column: {},
            minWidth: {},
            maxWidth: {},
            placeholder: {},
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
            
            reset() {
                this.value = '';
            },

            filter() {
                this.$parent.setFilter(this.column, this.value);
            },
        },

    };
</script>