import { bannerURL } from "./constants.js";
import Cache from "./cache.js";

const currentTermsCacheFilepath = "currentTerms.json";

class TermParser {
    constructor() {
        this.cache = new Cache(currentTermsCacheFilepath);
    }

    async fetchTerms() {
        const max = 500;
        const searchTermURL = new URL(`${bannerURL}/classSearch/getTerms`);
        searchTermURL.searchParams.append("offset", 1);
        searchTermURL.searchParams.append("max", max);

        console.log("Fetching terms from Banner API...")
        const response = await fetch(searchTermURL);
        const terms = await response.json();

        if(!response.ok) {
            throw new Error(`Error getting terms from Banner: Status Code ${response.status} - ${response.statusText}`);
        }
        return terms;
    }

    async fetchCurrentTerms() {
        const terms = await this.fetchTerms();
        const currentTerms = terms.filter(term => !term.description.includes("(View Only)"));
        return currentTerms;
    }

    async getCurrentTerms() {
        // May cause future errors since not sure if cache loads properly (sync/async wise)
        if(this.cache.isEmpty()) {
            return await this.fetchCurrentTerms();
        } else {
            return this.cache.read();
        }
    }

    async updateCache() {
        console.log("Updating current terms cache...")
        this.cache.update(await this.fetchCurrentTerms());
    }
}

const instance = new TermParser();

export default instance;