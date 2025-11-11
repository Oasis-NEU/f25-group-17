import TimeHHMM from "./timeHHMM.js";
import { assert } from "console";

class TimeBoundaries {
    constructor() {
        this.boundaries = [new TimeHHMM(0, 0), new TimeHHMM(23, 59)];
    }

    push(timeBoundary) {
        for(let i = 0; i < this.boundaries.length; i++) {
            if(this.boundaries[i].compare(timeBoundary) == 0) {
                console.log("Warning: Attempted to add duplicate TimeHHMM");
                return;
            } else if(this.boundaries[i].compare(timeBoundary) > 0) {
                this.boundaries.splice(i, 0, timeBoundary);
                return;
            }
        }
        assert(false, "TimeBoundaries.push did not insert TimeHHMM");
    }

    checkFree(timeHHMM) {
        // Pairs of boundaries define range [l,r) {left inclusive, right exclusive}
        if(!(timeHHMM instanceof TimeHHMM)) {
            throw new Error("Can only check if a TimeHHMM is free in TimeBoundaries");
        }
        if(this.boundaries.length % 2 != 0) {
            throw new Error("TimeBoundaries boundaries length is not even");
        }
        for(let i = 0; i < this.boundaries.length - 1; i += 2) {
            const beforeLeft = this.boundaries[i].compare(timeHHMM) > 0;
            const beforeRight = this.boundaries[i + 1].compare(timeHHMM) > 0;
            if(!beforeLeft && beforeRight) {
                return true;
            }
            if(!beforeLeft && !beforeRight) {
                return false;
            }
        }
        assert(false, "TimeBoundaries.checkFree should not reach here");
    }
}

export default TimeBoundaries;