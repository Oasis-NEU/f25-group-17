const cookieString = "JSESSIONID=704C3985632589BC5307C8CDDF332048; nubanner-cookie=2384404891.36895.0000;"

async function searchClasses(termCode, subjectFilter = "", offset = 1, max = 20) {
  const base = "https://nubanner.neu.edu/StudentRegistrationSsb/ssb";

  // 1) Declare term
  const termResp = await fetch(`${base}/term/search?mode=search`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Cookie': cookieString
    },
    body: `term=${termCode}&studyPath=&studyPathText=&startDatepicker=&endDatepicker=`
  });
  const termJson = await termResp.json();
  if (!termResp.ok || !termJson.fwdURL) {
    throw new Error("Failed to declare term: " + JSON.stringify(termJson));
  }

  // 2) Get subject list
  const subjUrl = new URL(`${base}/classSearch/get_subject`);
  subjUrl.searchParams.set('term', termCode);
  subjUrl.searchParams.set('offset', offset);
  subjUrl.searchParams.set('max', max);
  if (subjectFilter) subjUrl.searchParams.set('searchTerm', subjectFilter);

  const subjResp = await fetch(subjUrl.toString(), {
    method: 'GET',
    credentials: 'include'
  });
  const subjList = await subjResp.json();

  // 3) Optionally pick a subject, then search classes
  // Example: pick first subject code
  if (subjList.length === 0) {
    return { subjects: subjList, classes: [] };
  }
  const subj = subjList[0].code;

  // 4) Search results
  const searchUrl = new URL(`${base}/searchResults/searchResults`);
//   searchUrl.searchParams.set('term', termCode);
//   searchUrl.searchParams.set('subject', subj);
//   searchUrl.searchParams.set('offset', offset);
//   searchUrl.searchParams.set('max', max);
  // possibly other filters: courseNbr, scheduleType, etc.
  console.log(searchUrl.toString())

  const searchResp = await fetch(`${base}/searchResults/searchResults?txt_subject=&txt_courseNumber=&txt_term=${termCode}&startDatepicker=&endDatepicker=&pageOffset=0&pageMaxSize=2&sortColumn=&sortDirection=`, {
    method: 'GET',
    headers: {'Cookie': cookieString},
    credentials: 'include'
  });
  console.log(termResp.headers)
  console.log(searchResp.headers)
  const searchJson = await searchResp.json();

  return {
    subjects: subjList,
    classes: searchJson
  };
}

// Usage:
searchClasses("202610", "")
  .then(res => {
    // console.log("Subjects:", res.subjects);
    console.log("Classes:", res.classes.data);
  })
  .catch(err => {
    console.error("Error:", err);
  });
