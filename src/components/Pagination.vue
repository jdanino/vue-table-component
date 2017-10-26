<template>
    <div class="pagination-container">
    
        <nav v-if="shouldShowPagination && type == 'next-prev'">
            <ul class="pagination next-prev">
                <li>
                    <a v-if="pagination.currentPage > 1" @click="pageClicked(pagination.currentPage -1)">
                        <span>&laquo;</span>
                    </a>
                    <a v-else class="disabled">
                        <span>&laquo;</span>
                    </a>
                </li>
                <li>
                    <a v-if="pagination.currentPage < pagination.totalPages" @click="pageClicked(pagination.currentPage + 1)">
                        <span>&raquo;</span>
                    </a>
                    <a v-else class="disabled">
                        <span>&raquo;</span>
                    </a>

                </li>
            </ul>
        </nav>

        <nav v-if="shouldShowPagination && type == 'items'">
            <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ active: isActive(page) }" v-for="page in pages">
                    <a class="page-link" @click="pageClicked(page)">{{ page }}</a>
                </li>
            </ul>
        </nav>

    </div>
</template>

<script>
    import range from 'lodash/range';

    export default {
        props: {
            pagination: {
                type: Object,
                default: () => ({}),
            },
            type:{
                default: 'items',
            },
        },

        computed: {
            pages() {
                return this.pagination.totalPages === undefined
                    ? []
                    : range(1, this.pagination.totalPages + 1);
            },

            shouldShowPagination() {
                if (this.pagination.totalPages === undefined) {
                    return false;
                }

                if (this.pagination.count === 0) {
                    return false;
                }

                return this.pagination.totalPages > 1;
            },
        },

        methods: {
            isActive(page) {
                const currentPage = this.pagination.currentPage || 1;

                return currentPage === page;
            },

            pageClicked(page) {
                if (this.pagination.currentPage === page) {
                    return;
                }

                this.$emit('pageChange', page);
            },
        },
    };
</script>
