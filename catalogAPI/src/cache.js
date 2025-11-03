import * as fs from "fs";
import * as path from "path";

const cacheDirPath = "../cache";

class Cache {
    constructor(filepath) {
        this.filepath = path.join(cacheDirPath, filepath);
        this.load();
    }

    loadCacheDir() {
        const dirs = this.filepath.split("\\");
        for(let i = 1; i < dirs.length - 1; i++) {
            const dir = dirs.slice(0, i + 1).join("/");
            if(!fs.existsSync(dir)) {
                console.log(`Creating cache directory ${dir} since it does not exist`)
                fs.mkdir(dir, { recursive: true }, mkdirErr => {
                    if(mkdirErr) {
                        console.log("Error creating the directory: ", mkdirErr);
                    } else {
                        console.log(`Cache directory created at ${dir}`);
                    }
                })
            }
        }
    }

    load() {
        this.loadCacheDir();
        if(!fs.existsSync(this.filepath)) {
            console.log(`Creating cache file ${this.filepath}`)
            fs.writeFile(`${this.filepath}`, "", writeErr => {
                if(writeErr) {
                    console.log("Error creating the file: ", writeErr);
                } else {
                    console.log(`File created at ${this.filepath}`);
                }
            })
        }
    }

    isEmpty() {
        return fs.existsSync(this.filepath) || fs.readFileSync(this.filepath, "utf-8") == "";
    }

    read() {
        return fs.readFileSync(this.filepath, "utf-8") == "" ? {} : JSON.parse(fs.readFileSync(this.filepath, "utf-8"));
    }

    update(data) {
        try {
            let writeData = JSON.stringify(data, null, 4);
            JSON.parse(writeData);
            fs.writeFileSync(this.filepath, writeData, (err) => {
                if(err) {
                    console.log(`Error updating cache file ${this.filepath}`);
                }
            });
        } catch(error) {
            console.error(`Invalid JSON format while attempting to update cache ${this.filepath}!`)
        }
    }
}

export default Cache;