// Логика только для работы с окном загрузки Loading_goldsource.js
// Этот файл по сути миксин
import { ref } from "vue";
export function useLoadingGoldsourceLogic() {
    const isLoading = ref(false);
    const nSegmentsVisible = ref(0);
    function startLoading() {
        isLoading.value = true;
        nSegmentsVisible.value = 0;
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                // console.log(`progressbar element № ${i}`);
                nSegmentsVisible.value += 1;
            }, i * 10);
        }
    }
    /* endLoading используется только на эмитах из Maps.vue
    endLoading срабатывает когда изображение карты уже загружено. В этот момент progressbar
    должен находиться в состоянии загрузки 15/21(аутентичность goldsource UI). */
    async function endLoading() {
        /* Декоративный таймаут (для аутентичности загрузки goldsource)
        Также для ситуации, когда эмит из Maps может произойти мгновенно.
        То есть, чтобы отрисовка последних палок прокнула во время отрисовки 15 первых. */
        await new Promise((res) => setTimeout(res, 100));
        /* Здесь цикл спавнит таймауты со временем i*10 (10, 20, 30... мс),
        для дорисовки оставшихся палок в progressbar */
        await new Promise((res) => {
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    nSegmentsVisible.value += 1;
                    if (i >= 5) {
                        res("");
                    }
                }, i * 10);
            }
        });
        /* Выключение окна загрузки.
        Обёрнуто в таймаут тоже с декоративной целью */
        setTimeout(() => {
            isLoading.value = false;
            nSegmentsVisible.value = 0;
        }, 40);
    }
    /* --=<{ Комедия }>=--
    С точки зрения визуала
    И с точки зрения кода */
    async function onImageLoadError(){
        await new Promise((res) => setTimeout(()=>{nSegmentsVisible.value-=1;res('')}, 250))
        await new Promise((res) => setTimeout(()=>{nSegmentsVisible.value-=1;res('')}, 500))
        await new Promise((res) => setTimeout(()=>{nSegmentsVisible.value-=1;res('')}, 250))
        await new Promise((res) => setTimeout(()=>{nSegmentsVisible.value-=1;res('')}, 200))
        await new Promise((res) => setTimeout(()=>{nSegmentsVisible.value-=1;res('')}, 150))
        await new Promise((res) => setTimeout(()=>{nSegmentsVisible.value-=1;res('')}, 100))
        await new Promise((res) => setTimeout(()=>{nSegmentsVisible.value-=1;res('')}, 75))
        await new Promise((res) => setTimeout(()=>{nSegmentsVisible.value-=1;res('')}, 55))
        await new Promise((res) => setTimeout(()=>{nSegmentsVisible.value-=1;res('')}, 45))
        await new Promise((res) => setTimeout(()=>{nSegmentsVisible.value-=1;res('')}, 35))
        await new Promise((res) => setTimeout(()=>{nSegmentsVisible.value-=1;res('')}, 25))
        await new Promise((res) => setTimeout(()=>{nSegmentsVisible.value-=1;res('')}, 15))
        await new Promise((res) => setTimeout(()=>{nSegmentsVisible.value-=1;res('')}, 10))
        await new Promise((res) => setTimeout(()=>{nSegmentsVisible.value-=1;res('')}, 10))        
    }
    return { isLoading, nSegmentsVisible, startLoading, endLoading, onImageLoadError };
}
