<template>
    <aside class="loadingWindow">
        <p class="loadingTitle" >Loading...</p>
        <p class="loadingInfo">Downloading map image...</p>
        <div class="progressBar">
            <div class="progressSegment" v-for="segment in 21" >
                <div class="progressSegmentCrutch" :style="{visibility: segment<=nSegmentsVisible?'visible':'hidden'}">

                </div> 
            </div>
        </div>
    </aside>
</template>

<script>
    export default {
        name:'loadingWindow',
        props:{
            nSegmentsVisible:Number
        },
    }
</script>

<style lang="scss" scoped>
    .loadingWindow{
        z-index: 10;
        position: absolute;
        width: 550px;
        height: fit-content;
        background-color: purple;
        inset: 0;
        margin: auto;
        display: flex;
        flex-direction: column;
        background-color: var(--bg_light);
        padding-left: 28px;
        padding-top: 12px;
        padding-bottom: 28px;
        border-top: 1px solid var(--border_light);
        border-left: 1px solid var(--border_light);
        border-bottom: 1px solid var(--border_dark);
        border-right: 1px solid var(--border_dark);

        p{
            font-size: 21px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-weight: 400;
            letter-spacing: -0.8px;
            &.loadingTitle{
                color: white;
                padding-left: 10px;
                margin-bottom: 12px;
            }
            &.loadingInfo{
                color: rgb(142, 154, 141);
                margin-bottom: 8px;
            }
        }
        
        .progressBar{
            display: flex;
            background-color: rgb(62, 70, 55);
            padding: 4px;
            width: fit-content;
            border: 2px solid blue;
            .progressSegment{
                border: 2px solid cyan;
                
                .progressSegmentCrutch{
                    border: 2px solid green;
                    height: 24px;
                    width: 12px;
                    margin: 0 3px;
                    background-color: rgb(221, 191, 60);
                }
            }
        }
    }
</style>