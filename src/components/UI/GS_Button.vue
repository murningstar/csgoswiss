<script setup lang="ts">

</script>


<template>
    <button class="container">
        <div class="content">
            <slot>

            </slot>
        </div>
    </button>
</template>


<style scoped lang="scss">
button.container {
    display: block;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    font-size: 1rem;
    text-align: left;
    min-width: 87px;
    /* padding: 7px 20px 7px 7px; */
    color: white;
    border-radius: 0;
    background-color: var(--bg_light);
    @include gs-bd;
}

.content {
    margin-left: 1px;
    width: 97%;
    height: 95%;
    padding: 6px 15px 7px 5px;
    white-space: nowrap;
}

button:active .content {
    transform: translate(1px, 1px);
}

button:focus {
    box-shadow: 0px 0px 0 1px black;
}

button:focus .content {
    border: 2px dotted #000;
    padding: 4px 0 5px 5px;
}

button:active {
    @include gs-bd-clicked;
}
</style>