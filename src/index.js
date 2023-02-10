const sourceMap = require("source-map");
const path = require("path");
const fs = require("fs");

const ROOT_PATH = "/Users/zhanghao/Workspace/cocos-project/learning-project/build/web-mobile";
const OUTPUT_PATH = path.resolve(__dirname, "../output");

function walk(paramPath, storeArray = []) {
    const dirs = fs.readdirSync(paramPath, { withFileTypes: true });
    dirs.forEach((dir) => {
        const absDir = path.resolve(paramPath, dir.name);
        if (dir.isFile()) {
            storeArray.push(absDir);
        } else if (dir.isDirectory()) {
            walk(absDir, storeArray);
        }
    });
    return storeArray;
}

const mapDirs = walk(ROOT_PATH)
    .map((dir) => {
        if (path.extname(dir) === ".map") {
            return dir;
        }
    })
    .filter((v) => v);

if (fs.existsSync(OUTPUT_PATH)) {
    fs.rmdirSync(OUTPUT_PATH, { recursive: true });
}
fs.mkdirSync(OUTPUT_PATH);

mapDirs.forEach(async (dir) => {
    const contentStr = fs.readFileSync(dir, "utf-8");
    const data = JSON.parse(contentStr);
    const consumer = await new sourceMap.SourceMapConsumer(data);
    consumer.sources.forEach((sourceDir, idx) => {
        const lastPrevDirStr = sourceDir.lastIndexOf("../") > 0 ? sourceDir.lastIndexOf("../") + 3 : 0;
        const lastProtocolDirStr = sourceDir.lastIndexOf(":/") > 0 ? sourceDir.lastIndexOf(":/") + 2 : 0;
        const removeToDirIndex = Math.max(lastPrevDirStr, lastProtocolDirStr);
        const writeToDir = path.resolve(OUTPUT_PATH, sourceDir.substring(removeToDirIndex));

        fs.mkdirSync(path.dirname(writeToDir), { recursive: true });

        fs.writeFileSync(writeToDir, consumer.sourcesContent[idx], "utf-8");
    });
});
