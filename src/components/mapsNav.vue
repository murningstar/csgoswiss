<template>
    <nav>
    	<li class="listOfMapLinks">
            <ul 
                v-for="map in maps" 
                :class="{ activeMap: currentMap == map }"
                @click="$emit('emit-startLoading')"
            >
                <router-link :to="`/${map}`"> 
                    {{ map }} 
                </router-link>
            </ul>
    	</li>
    </nav>
</template>

<script>
    export default {
        name:'mapsNav',
        data: ()=>{
            return {
                maps:[ 'mirage', 'dust2', 'inferno', 'overpass', 'train', 'vertigo', 'ancient',],
                currentMap:''
            }
        },
        watch:{
            $route(to,from){
                this.currentMap=to.name.slice(1)
            },
            currentMap(nextmap,oldmap){
                console.log(nextmap);
            }
        }
    }
</script>

<style lang="scss">
    nav{
        box-sizing: content-box;
        background-color: rgb(75, 87, 67);
        justify-self: center;
        // width: fit-content;
        max-width: 100%;
        border: 8px solid var(--bg_light);
        min-width: 0;
        height: 35px;
        // border-color: rgb(74, 89, 66);
        .listOfMapLinks{
            max-width: fit-content;
            min-width: 0;
            // border: 3px solid cyan;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            border-bottom: 	1px solid rgb(135, 147, 127);
            ul{
                padding-left: 8px;
                padding-right: 25px;
                flex-shrink: 1; 
                // flex-basis: 1;
                flex-grow: 0;
                min-width: 0;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: flex-start;

                background-color: rgb(75, 87, 67);
                border-top:     1px solid rgb(135, 147, 127);
    	        border-left:    1px solid rgb(135, 147, 127);
		        border-right:   1px solid rgb(35, 41, 27);
		        // border-bottom:  1px solid rgb(35, 41, 27);
                margin-right: 1px;

                &.activeMap{
                    border-top:     1px solid rgb(135, 147, 127);
                    border-left:    1px solid rgb(135, 147, 127);
                    border-right:   1px solid rgb(35, 41, 27);
                    border-bottom: none;
                    transform: scaleY(1.06);
                    a{
                        transform: scaleY(0.95) translateY(-2px);
                    }
                }

                a{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    position: relative;
                    font-size: min(2vw, 16px);
                    text-decoration: none;
                    display: block;
                    // border: 2px solid rgba(128, 0, 128, 1);
                    // text-align: center;
                    color: rgb(220, 220, 220);
                    &::first-letter{
                        text-transform: capitalize;
                    }
                    &.mapLink-active{
                        color: rgb(255, 255, 255);
                    }
                }
                
            }
        }
    }
</style>