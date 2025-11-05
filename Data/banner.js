console.log("Begin test program.")
// const MAX = 500; // If there are more than 500 THIS WILL BREAK. Would make it smarter but not worth it rn.
// const URL = "https://nubanner.neu.edu/StudentRegistrationSsb/ssb/courseSearch/get_subject";
// const subjectUrl = `${URL}?searchTerm=&term=${termId}&offset=1&max=${MAX}`;
// const response = await fetch(subjectUrl);
// const data = await response.json();
// console.log(data)


const termId = "202615";
const bannerURL = "https://nubanner.neu.edu/StudentRegistrationSsb/ssb/";
const subject = "CS";

const postData = {
    term: termId
}

const clickContinueURL = `${bannerURL}/term/search?mode=search`
// const postRequest = await fetch(clickContinueURL, {method: "POST", body: JSON.stringify(postData)})
const postRequest = await fetch(clickContinueURL, {
    method: "POST",
    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UT'},
    body: `term=${termId}&studyPath=&studyPathText=&startDatepicker=&endDatepicker=`
})
// console.log(postRequest.headers.get("Set-Cookie"))
const cookieResponse = postRequest.headers.get("Set-Cookie");
const sessionIdMatch = cookieResponse.match(/JSESSIONID=[^;]+/)[0];
const bannerCookieMatch = cookieResponse.match(/nubanner-cookie=[^;]+/)[0];
const cookies = sessionIdMatch + '; ' + bannerCookieMatch;
console.log(cookies)

const postRequest2 = await fetch(clickContinueURL, {
    method: "POST",
    headers: {
        "Content-Type": 'application/x-www-form-urlencoded; charset=UTF',
        "Cookie": cookieResponse,
        credentials: 'include'
    },
    body: `term=${termId}&studyPath=&studyPathText=&startDatepicker=&endDatepicker=`
})

console.log(await postRequest.text())

// const cookieResponse2 = await postRequest2.headers.get("set-cookie");
// const sessionIdMatch2 = cookieResponse2.match(/JSESSIONID=[^;]+/)[0];
// const bannerCookieMatch2 = cookieResponse2.match(/nubanner-cookie=[^;]+/)[0];
// const cookies2 = sessionIdMatch2 + '; ' + bannerCookieMatch2;
// console.log(cookies2)
// console.log(await postRequest2.text())

const searchCoursesURL = `${bannerURL}
    /searchResults/searchResults?
    txt_subject=${subject}&txt_courseNumber=&txt_term=${termId}
    &startDatepicker=&endDatepicker=
    &pageOffset=0&pageMaxSize=10&sortColumn=subjectDescription&sortDirection=asc`
const courseRequest = await fetch(searchCoursesURL, {headers: {Cookie: cookieResponse},
        credentials: 'include'})

// console.log(await courseRequest.text())

// const decoder = new TextDecoder();
// let done = false
// let result = ''
// const reader = courseRequest.body.getReader();
// while(!done) {
//     const { value, done: doneReading } = await reader.read();
//     result += decoder.decode(value, { stream: true });
//     done = doneReading;
// }
// console.log(result)