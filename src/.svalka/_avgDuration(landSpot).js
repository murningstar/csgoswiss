// const methods_toSpot = {
//     activeOnClick(toSpot: ViewThrowSpot) {
//         activeToSpotsCounter.value++;
        
//         {
//             // Логика для вычисления средней длительности(анимации)
//             const toSpots: Spot[] = [];
//             const durations: number[] = [];
//             toSpot.lineupIds.forEach((lineupId) => {
//                 try {
//                     const lineup =
//                         viewItemsFactory.value.lineups.get(lineupId)!;
//                     toSpots.push(spots.value.get(lineup.fromId)!);
//                 } catch (error) {
//                     console.log(
//                         "Probably problem is Bad/Damaged Lineup Data. Most probably Map key Id is not the same as Item's Id",
//                     );
//                     console.log("Error: ");
//                     console.error(error);
//                 }
//             });
//             toSpots.forEach((fromSpot) => {
//                 const length = Math.sqrt(
//                     (fromSpot.coords.x - toSpot.toSpot.coords.x) ** 2 +
//                         (fromSpot.coords.y - toSpot.toSpot.coords.y) ** 2,
//                 );
//                 const duration = 2.2 + length * 0.01;
//                 durations.push(duration);
//             });
//             const avgDuration = (
//                 durations.reduce((acc, next) => acc + next, 0) /
//                 durations.length
//             ).toFixed(2);
//             // присваивание результата
//             toSpot.avgDuration = avgDuration;
//         }

//         methods_toSpot.toActiveDeps(toSpot);
//         toSpot.hslColor =
//             activeToSpotsCounter.value > 1
//                 ? (Math.random() * 359).toFixed(0)
//                 : "52";
//         toSpot.isActive = true;
//     },
// };