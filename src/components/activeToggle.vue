<template>
    <div>
        <a title="(De)activeer" @click.prevent="toggleState">

            <span class="fa"
                  :class="{ 'fa-toggle-on': active, 'fa-toggle-off': !active }"
                  style="margin-right: 5px;"
            >
            </span>
            <span >{{ activeText }}</span>
            <span class="fa fa-spinner fa-spin" v-show="loading"></span>
        </a>
    </div>
</template>

<script>
module.exports = {

    props    : [
        'module',
        'id',
        'dataActive',
        'showText',
    ],

    data : function () {
        return {
            loading : false,
            active  : this.dataActive,
        };
    },
    methods : {

        toggleState : function () {
            this.loading = true;
            const url = '/api/' + this.module + '/' + this.id + '/active';

            axios.put(url, { active: !this.active }).then(data => {
                this.active = !this.active;
                this.loading = false;
            });
        },
    },

    computed : {

        activeText : function () {
            if (this.active) {
                return 'Actief';
            }
            return 'Inactief';
        },

    },

};
</script>