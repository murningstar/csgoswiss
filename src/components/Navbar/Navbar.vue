<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { maplist } from "@/data/maplist"
import { useSomestore } from "@/stores/somestore";
const router = useRouter()
const route = useRoute();
const store = useSomestore()
const currentMap = computed(() => route.path.slice(1));
function purgeActiveNades(mapName:string) {
	if (currentMap.value!==mapName){
		store.activeGrenadeItems.clear()
		router.push('/'+mapName)
	}
}
</script>

<template>
	<nav>
		<li class="listOfMapLinks">
			<ul v-for="map in maplist"
				:class="{ activeMap: currentMap == map }"
				@click="purgeActiveNades(map)">
				<!-- <router-link :to="`/${map}`">
					{{ map }}
				</router-link> -->
				<a>
					{{ map }}
				</a>
			</ul>
		</li>
	</nav>
</template>

<style lang="scss">
/*
  nav > 
  li|.listOfMapLinks > 
  ul|.activeMap > 
  a|.mapLink-active|::first-letter
*/
nav {
	transform: translateY(1px);
	// width: fit-content;
	// border-color: rgb(74, 89, 66);
	box-sizing: content-box;
	background-color: rgb(75, 87, 67);
	justify-self: center;
	max-width: 100%;
	max-width: fit-content;
	margin: 8px;
	margin-bottom: 0;
	min-width: 0;
	height: 35px;

	.listOfMapLinks {
		// border: 3px solid cyan;
		max-width: fit-content;
		min-width: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		border-bottom: 1px solid rgb(135, 147, 127);

		/*
  nav > 
  li|.listOfMapLinks > 
  ul|.activeMap > 
  a|.mapLink-active|::first-letter
*/
		ul {
			// flex-basis: 1;
			// border-bottom:  1px solid rgb(35, 41, 27);
			// padding-left: 8px;
			// padding-right: 25px;
			flex-shrink: 1;
			flex-grow: 0;
			min-width: 0;
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: flex-start;

			background-color: rgb(75, 87, 67);
			border-top: 1px solid rgb(135, 147, 127);
			border-left: 1px solid rgb(135, 147, 127);
			border-right: 1px solid rgb(35, 41, 27);
			margin-right: 1px;
			cursor: pointer;

			// border: 1px cyan solid;
			/* 
        dynamic class for link text highlighing
        applied on <ul>
      */
			&.activeMap {
				border-top: 1px solid rgb(135, 147, 127);
				border-left: 1px solid rgb(135, 147, 127);
				border-right: 1px solid rgb(35, 41, 27);
				border-bottom: none;
				transform: scaleY(1.1);

				a {
					transform: scaleY(0.9) translateY(-2px);
					color: $text_active;
				}
			}

			a {
				padding-left: 8px;
				padding-right: 25px;
				font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
				position: relative;
				font-size: min(2vw, 16px);
				text-decoration: none;
				display: block;
				// border: 2px solid rgba(128, 0, 128, 1);
				// text-align: center;
				color: rgb(255, 255, 255);

				&::first-letter {
					text-transform: capitalize;
				}

				// &.mapLink-active {}
			}
		}
	}
}

/*
  nav > 
  li|.listOfMapLinks > 
  ul|.activeMap > 
  a|.mapLink-active|::first-letter
*/
</style>
