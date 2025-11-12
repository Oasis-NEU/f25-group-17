// TimeBoundaries PROOF OF CONCEPT with raw numbers

class Schedule {
    constructor() {
        this.bounds = [0, 100];
    }

    show() {
        console.log(this.bounds);
        return this;
    }

    push(l, r) {
        // assumes r > l and l, r element of (0, 100) {exclusively in original bounds}
        let lDupe = false;
        let rDupe = false;
        let lInd = -1;
        let rInd = -1;
        for(let i = 0; i < this.bounds.length; i++) {
            if(this.bounds[i] == l) {
                lDupe = true;
                lInd = i + 1; // dupes are always "placed" *after* the original
                break;
            } else if(this.bounds[i] > l) {
                lInd = i;
                break;
            }
        }
        for(let i = lInd; i < this.bounds.length; i++) {
            if(this.bounds[i] == r) {
                rDupe = true;
                rInd = i + 1; // dupes are always "placed" *after* the original
                break;
            } else if(this.bounds[i] > r) {
                rInd = i;
                break;
            }
        }

        const elementsBetween = rInd - lInd;
        const lIndInside = lInd % 2 == 0;
        /*
        // *l* **r** \notAdded
        if(!lIndInside && !lDupe) {
            // 0 *\1* 5-10 100 -> 0 *1* 5-10 100
            this.bounds.splice(lInd, 0, l);
            if(elementsBetween % 2 == 0) { // rDupe does not matter
                // rDupe f:
                // 0 *1*-**\2** 5-10 100 -> 0 *1*-**2** 5-10 100
                // 0 *1*-5-10-**\11** 100 -> 0 *1*-**11** 100
                // rDupe t:
                // 0 *1*-5-10-**\10** 100 -> 0 *1*-**10** 100
                this.bounds.splice(lInd + 1, elementsBetween, r);
            } else { // odd elements between, rDupe does not matter
                // rDupe f:
                // 0 *1*-5-**\6**-10 100 -> 0 *1*-10 100
                // rDupe t:
                // 0 *1*-5-**\5**-10 100 -> 0 *1*-10 100
                this.bounds.splice(lInd + 1, elementsBetween);
            }
        } else if(!lIndInside && lDupe) {
            // 0 1-10-*\10* 20-30 100 -> 0 1-10 20-30 100
            if(elementsBetween % 2 == 0 && !rDupe) {
                // 0 1-10-**\11** 20-30 100 -> 0 1-**11** 20-30 100
                // 0 1-10-20-30-**\31** 100 -> 0 1-**31** 100
                this.bounds.splice(lInd - 1, elementsBetween + 1, r);
            } else if(elementsBetween % 2 == 0 && rDupe) {
                // 0 1-10-20-30-**\30** 100 -> 0 1-30 100
                this.bounds.splice(lInd - 1, elementsBetween);
            } else { // odd elements between, rDupe does not matter
                // rDupe f:
                // 0 1-10-20-**\21**-30 100 -> 0 1-30 100
                // rDupe t:
                // 0 1-10-20-**\20**-30 100 -> 0 1-30 100
                this.bounds.splice(lInd - 1, elementsBetween + 1);
            }
        } else { // lIndInside t and lDupe does not matter; if lDupe, act as *\5* instead of *\6*, same location
            // 0 5-*\6*-10 20-30 100 -> 0 5-10 20-30 100
            if(elementsBetween % 2 == 0) { // rDupe does not matter
                // rDupe f:
                // 0 5-**\7**-10 20-30 100 -> 0 5-10 20-30 100
                // 0 5-10-20-**\21**-30 100 -> 0 5-30 100
                // rDupe t:
                // 0 5-10-20-**\20**-30 100 -> 0 5-30 100
                this.bounds.splice(lInd, elementsBetween);
            } else { // odd elements between, rDupe does not matter
                // rDupe f:
                // 0 5-10-**\11** 20-30 100 -> 0 5-**11** 20-30 100
                // rDupe t:
                // 0 5-10-**\10** 20-30 100 -> 0 5-**10** 20-30 100
                // 0 5-10-20-30-**\30** 100 -> 0 5-**30** 100
                this.bounds.splice(lInd, elementsBetween, r);
            }
        }
        */
        if(!lIndInside && !lDupe) {
            this.bounds.splice(lInd, 0, l);
            if(elementsBetween % 2 == 0) {
                this.bounds.splice(lInd + 1, elementsBetween, r);
            } else {
                this.bounds.splice(lInd + 1, elementsBetween);
            }
        } else if(!lIndInside && lDupe) {
            if(elementsBetween % 2 == 0 && !rDupe) {
                this.bounds.splice(lInd - 1, elementsBetween + 1, r);
            } else if(elementsBetween % 2 == 0 && rDupe) {
                this.bounds.splice(lInd - 1, elementsBetween);
            } else {
                this.bounds.splice(lInd - 1, elementsBetween + 1);
            }
        } else {
            if(elementsBetween % 2 == 0) {
                this.bounds.splice(lInd, elementsBetween);
            } else {
                this.bounds.splice(lInd, elementsBetween, r);
            }
        }
        // console.log(`${lInd} ${rInd}`);
        // this.show();
        return this;
    }
}

const s = new Schedule();
// li: outside, dupe, inside
// ri: outside, dupe, inside
// # elements strictly between: 0, 1, 2, 3, ...

// difference(1-4), lDupe, rDupe: 16 cases
// s.push([ 10,  20]); // 1, f, f      0 10-20 100
// s.push([  9,  11]); // 2, f, f      0 9-10-11-20 100 -> 0 9-20 100
// s.push([  8,  21]); // 3, f, f      0 8-9-20-21 100 -> 0 8-21 100
// s.push([  7, 101]); // 4, f, f      0 7-8-21-100-101 -> 0 
// s.push([2, 4]); // 3, f, f      0 2 2.5 3.5 5 100 -> 0 2 4 100
// s.push([1, 3]); // 2, f, f      0 1 2 3 4 100 -> 0 1 4 100

// ****REAL "tests" BELOW****

// lIndInside, lDupe, even elementsBetween, rDupe

// f, f, t, f
new Schedule().push(5, 10).push(1, 2).show();
new Schedule().push(5, 10).push(1, 11).show();
// f, f, t, t
new Schedule().push(5, 10).push(1, 10).show();
// f, f, f, f
new Schedule().push(5, 10).push(1, 6).show();
new Schedule().push(5, 10).push(15, 20).push(1, 16).show();
// f, f, f, t
new Schedule().push(5, 10).push(1, 5).show();
new Schedule().push(5, 10).push(15, 20).push(1, 20).show();

// f, t, t, f
new Schedule().push(1, 10).push(20, 30).push(10, 11).show();
new Schedule().push(1, 10).push(20, 30).push(10, 31).show();
// f, t, t, t
new Schedule().push(1, 10).push(20, 30).push(10, 30).show();
// f, t, f, f
new Schedule().push(1, 10).push(20, 30).push(10, 21).show();
// f, t, f, t
new Schedule().push(1, 10).push(20, 30).push(10, 20).show();

// t, f, t, f
new Schedule().push(5, 10).push(20, 30).push(6, 7).show();
new Schedule().push(5, 10).push(20, 30).push(6, 21).show();
// t, f, t, t
new Schedule().push(5, 10).push(20, 30).push(6, 20).show()
// t, f, f, f;
new Schedule().push(5, 10).push(20, 30).push(6, 11).show();
// t, f, f, t
new Schedule().push(5, 10).push(20, 30).push(6, 10).show();
new Schedule().push(5, 10).push(20, 30).push(6, 30).show();

// t, t, t, f
new Schedule().push(5, 10).push(20, 30).push(5, 7).show();
new Schedule().push(5, 10).push(20, 30).push(5, 21).show();
// t, t, t, t
new Schedule().push(5, 10).push(20, 30).push(5, 20).show()
// t, t, f, f;
new Schedule().push(5, 10).push(20, 30).push(5, 11).show();
// t, t, f, t
new Schedule().push(5, 10).push(20, 30).push(5, 10).show();
new Schedule().push(5, 10).push(20, 30).push(5, 30).show();

console.log();

const testAddToSample = (l, r) => {
    console.log(`${l} and ${r}`);
    new Schedule().push(3, 6).push(9, 12).show().push(l, r).show();
    console.log();
}

testAddToSample(1, 2);
testAddToSample(1, 3);
testAddToSample(1, 4);
testAddToSample(1, 6);
testAddToSample(1, 7);
testAddToSample(1, 9);
testAddToSample(1, 10);
testAddToSample(1, 12);
testAddToSample(1, 13);

testAddToSample(3, 4);
testAddToSample(3, 6);
testAddToSample(3, 7);
testAddToSample(3, 9);
testAddToSample(3, 10);
testAddToSample(3, 12);
testAddToSample(3, 13);

testAddToSample(4, 5);
testAddToSample(4, 6);
testAddToSample(4, 7);
testAddToSample(4, 9);
testAddToSample(4, 10);
testAddToSample(4, 12);
testAddToSample(4, 13);

testAddToSample(6, 7);
testAddToSample(6, 9);
testAddToSample(6, 10);
testAddToSample(6, 12);
testAddToSample(6, 13);