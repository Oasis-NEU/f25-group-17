import * as fs from "fs"
import * as path from "path"

const cacheDirPath = "../cache"

class Cache {
    constructor(filepath) {
        this.filepath = path.join(cacheDirPath, filepath);
        this.loadCacheDir();
    }

    async loadCacheDir() {
        if(!fs.existsSync(cacheDirPath)) {
            console.log(`Creating cache directory ${cacheDirPath} since it does not exist`)
            fs.mkdir(cacheDirPath, { recursive: true }, mkdirErr => {
                if(mkdirErr) {
                    console.log("Error creating the directory: ", mkdirErr);
                } else {
                    console.log(`Cache directory created at ${cacheDirPath}`);
                }
            })
        }
    }

    async loadFile() {
        await this.loadCacheDir();
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
        return fs.readFileSync(this.filepath, "utf-8") == ""
    }

    async readCache() {

    }

    async writeCache() {
        
    }
}

let cache = new Cache("currentTerms.json")

export default Cache;