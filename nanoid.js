const nano = import("nanoid").then((nanoid) => {
    // const startTime = Date.now();
    // let init = nanoid.nanoid(5);
    // let counter = 0;
    // while (nanoid.nanoid(5) != init) {
    //     counter++;
    // }
    // console.log((Date.now() - startTime) / 1000 + " seconds");
    // console.log(counter + " iterations");

    if (process.argv[2]) {
        // Аргумент скрипта - int
        console.log("");
        let amount = Number(process.argv[2]);
        if (amount !== NaN) {
            for (let i = 1; i < amount + 1; i++) {
                console.log(i + " - " + nanoid.nanoid(13));
            }
        }
    } else {
        console.log(nanoid.nanoid(13));
    }
});
