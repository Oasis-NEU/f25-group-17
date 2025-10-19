import { bannerURL } from "./constants.js"
import Cache from "./cache.js"

const currentTermsCacheFilepath = "currentTerms.json"

class TermParser {
    constructor() {
        this.cache = new Cache(currentTermsCacheFilepath)
    }

    async getTerms() {
        const max = 500
        const searchTermURL = new URL(`${bannerURL}/classSearch/getTerms`);
        searchTermURL.searchParams.append("offset", 1);
        searchTermURL.searchParams.append("max", max);

        const response = await fetch(searchTermURL);
        const terms = await response.json();

        if(!response.ok) {
            throw new Error(`Error getting terms from Banner: Status Code ${response.status} - ${response.statusText}`);
        }
        return terms;
    }

    async getCurrentTerms() {
        const terms = await this.getTerms();
        const currentTerms = terms.filter(term => !term.description.includes("(View Only)"));
        return currentTerms;
    }

    async updateCache() {
        console.log("Updating current terms cache...")
        this.cache.update(await this.getCurrentTerms());
    }
}

const instance = new TermParser();

export default instance;