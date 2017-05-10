import * as utils from "wasm-utils";
import * as fs from "fs";

if (process.argv.length <= 2) {
    console.log("usage test <file>");
    process.exit();
}

async function test() {
    try {
        let stats: fs.Stats = await utils.statAsync(process.argv[2]);
        console.log(`stats=${JSON.stringify(stats)}`);
    } catch (e) {
        console.log(`${e}`);
    }
    console.log("done");
}
test();
