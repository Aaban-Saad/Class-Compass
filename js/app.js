// Section 1 globals
let addedCourses = [];

// Section 2 globals
let am_from = "AM";
let am_to = "AM";
let day = "All days";
let addedGaps = [];

// Section 3 globals
let st = true;
let mw = true;
let ra = true;
let f = true;

let preferredClassDays = 4;
let maxClasses = 7;
let maxBackToBackClasses = 7;
let maxFinal = 5;

let avoidLongGaps = false;
let keepLongGaps = false;
let avoidPrayerTimes = true;


// Section 1 functions

// Collapse sections
function collapseSections(event) {
    let id = event.target.id;
    let container = document.getElementById(id + "-container");

    if (container.getAttribute("style") === "display: none") {
        container.setAttribute("style", "display: flex");
    } else {
        container.setAttribute("style", "display: none");
    }
}

//  Add courses
const courseAddBtn = document.getElementById("course-add-btn");
courseAddBtn.addEventListener('click', () => {
    let course = document.getElementById("course-input-box").value.toUpperCase();

    if (course.length === 0) return;
    if (addedCourses.includes(course)) return;

    document.getElementById("course-input-box").value = "";

    addedCourses.push(course);

    let courseContainer = document.getElementById("added-courses-container")
    courseContainer.innerHTML = courseContainer.innerHTML + `
    <div id="${course}" class="course">
    <span>
        ${course}
    </span>
    <button id="${course}-delete" class="custom-btn btn-5" onclick=removeCourse(event)>
        X
    </button>
    </div>`
});

// Remove course
function removeCourse(event) {
    let id = event.target.id;
    let courseId = (id.split('-'))[0];
    let course = document.getElementById(courseId);
    addedCourses.splice(addedCourses.indexOf(courseId.toUpperCase()), 1);
    course.outerHTML = "";
}

// Section 2 functions

// For changing the am/pm tags in section 2
function amFrom() {
    if (am_from === "AM") {
        am_from = "PM";
        document.getElementById("am-from").setAttribute("style", "display: none;");
        document.getElementById("pm-from").setAttribute("style", "display: flex;");
    } else {
        am_from = "AM";
        document.getElementById("am-from").setAttribute("style", "display: flex;");
        document.getElementById("pm-from").setAttribute("style", "display: none;");
    }
}
function amTo() {
    if (am_to === "AM") {
        am_to = "PM";
        document.getElementById("am-to").setAttribute("style", "display: none;");
        document.getElementById("pm-to").setAttribute("style", "display: flex;");
    } else {
        am_to = "AM";
        document.getElementById("am-to").setAttribute("style", "display: flex;");
        document.getElementById("pm-to").setAttribute("style", "display: none;");
    }
}


// Select gap day
function openDropDown() {
    currentStyle = document.getElementById("dropdown-content").getAttribute("style");
    if (currentStyle === "display: none;") {
        document.getElementById("dropdown-content").setAttribute("style", "display: block;");
    } else {
        document.getElementById("dropdown-content").setAttribute("style", "display: none;");
    }
}

function selectDay(event) {
    day = event.target.innerHTML;
    document.getElementById("dropbtn").innerHTML = day + " >";
    document.getElementById("dropdown-content").setAttribute("style", "display: none;");
}

function addGap() {
    let fromTime = document.getElementById("gap-input-box-from").value;
    let toTime = document.getElementById("gap-input-box-to").value;

    if (fromTime.length < 3 || toTime.length < 3) return;
    if (!fromTime.includes(":") || !toTime.includes(":")) return;

    // checking for chars
    charFound = false;
    let timeNumbers = []
    timeNumbers.push((fromTime.split(":"))[0]);
    timeNumbers.push((fromTime.split(":"))[1]);
    timeNumbers.push((toTime.split(":"))[0]);
    timeNumbers.push((toTime.split(":"))[1]);
    timeNumbers.forEach(timeNumber => {
        if (Number(timeNumber) !== 0 && !Number(timeNumber)) {
            charFound = true;
        }
    });
    if(charFound) return;


    // Convert to 24 hr format
    let fromTime24 = twelveTo24(fromTime, am_from);
    let toTime24 = twelveTo24(toTime, am_to);
    let time24 = fromTime24 + "-" + toTime24 + "-" + day;

    if (addedGaps.includes(time24)) return;

    document.getElementById("gap-input-box-from").value = "";
    document.getElementById("gap-input-box-to").value = "";

    addedGaps.push(time24);

    let time = fromTime + " " + am_from + " - " + toTime + " " + am_to + "<br> (" + day + ")";

    container = document.getElementById("added-gaps-container");
    container.innerHTML = container.innerHTML + `
    <div id = "${time24}" class="gap">
        <span>${time}</span>
        <button id = "${time24}_delete" class="custom-btn btn-5" onclick=deleteGap(event)>
            X
        </button>
    </div>
    `
}

function deleteGap(event) {
    let id = event.target.id;
    let gapId = (id.split('_'))[0];
    let gap = document.getElementById(gapId);
    addedGaps.splice(addedGaps.indexOf(gapId.toUpperCase()), 1);
    gap.outerHTML = "";
}

function twelveTo24(time, amString) {
    const splittedTime = time.split(":")
    let hour = (splittedTime[0].trim());
    let min = (splittedTime[1].trim());
    if (amString.toUpperCase() === "PM" && hour != "12") {
        hour = String(Number(hour) + 12);
    } else if(amString.toUpperCase() === "AM" && hour == "12") {
        hour = "00";
    }
    if (hour.length < 2) hour = "0" + hour;
    if (min.length < 2) min = "0" + min;
    return hour + min;
}

function yesNoBtn(event) {
    const id = event.target.id;
    let splitted = id.split("-");
    let key = splitted[0];
    let value = splitted[1] === "yes" ? true : false;
    value = !value;

    const antiId = key + "-" + (value ? "yes" : "no"); 

    let style = "display: flex;";
    let antiStyle = "display: none;"

    if(key === "st") {
        document.getElementById(id).setAttribute("style", antiStyle);
        document.getElementById(antiId).setAttribute("style", style);
        st = value;
    } 
    else if(key === "mw") {
        document.getElementById(id).setAttribute("style", antiStyle);
        document.getElementById(antiId).setAttribute("style", style);
        mw = value;
    } 
    else if(key === "ra") {
        document.getElementById(id).setAttribute("style", antiStyle);
        document.getElementById(antiId).setAttribute("style", style);
        mw = value;
    } 
    else if(key === "f") {
        document.getElementById(id).setAttribute("style", antiStyle);
        document.getElementById(antiId).setAttribute("style", style);
        f = value;
    }
    else if(key === "avoid_long_gaps") {
        document.getElementById(id).setAttribute("style", antiStyle);
        document.getElementById(antiId).setAttribute("style", style);
        avoidLongGaps = value;

        if(keepLongGaps && avoidLongGaps) {
            keepLongGaps = !keepLongGaps;
            document.getElementById("keep_long_gaps-yes").setAttribute("style", "display: none;");
            document.getElementById("keep_long_gaps-no").setAttribute("style", "display: flex;");
        }
    }
    else if(key === "keep_long_gaps") {
        document.getElementById(id).setAttribute("style", antiStyle);
        document.getElementById(antiId).setAttribute("style", style);
        keepLongGaps = value;

        if(keepLongGaps && avoidLongGaps) {
            avoidLongGaps = !avoidLongGaps;
            document.getElementById("avoid_long_gaps-yes").setAttribute("style", "display: none;");
            document.getElementById("avoid_long_gaps-no").setAttribute("style", "display: flex;");
        }
    }
    else if(key === "avoid_prayer_times") {
        document.getElementById(id).setAttribute("style", antiStyle);
        document.getElementById(antiId).setAttribute("style", style);
        avoidPrayerTimes = value;
    }
}

function plusBtn(event) {
    id = event.target.id;
    if(id === "preferred-class-days-plus") {
        let value = Number(document.getElementById("preferred-class-days").innerHTML);
        if(value < 99) value++;
        preferredClassDays = value;
        document.getElementById("preferred-class-days").innerHTML = value;
    } 
    else if(id === "max-back-to-back-classes-plus") {
        let value = Number(document.getElementById("max-back-to-back-classes").innerHTML);
        if(value < 99) value++;
        maxBackToBackClasses = value;
        document.getElementById("max-back-to-back-classes").innerHTML = value;
    } 
    else if(id === "max-classes-plus") {
        let value = Number(document.getElementById("max-classes").innerHTML);
        if(value < 99) value++;
        maxClasses = value;
        document.getElementById("max-classes").innerHTML = value;
    } 
    else if(id === "max-finals-plus") {
        let value = Number(document.getElementById("max-finals").innerHTML);
        if(value < 99) value++;
        maxFinal = value;
        document.getElementById("max-finals").innerHTML = value;
    }
}

function minusBtn(event) {
    id = event.target.id;
    if(id === "preferred-class-days-minus") {
        let value = Number(document.getElementById("preferred-class-days").innerHTML);
        if(value > 1) value--;
        preferredClassDays = value;
        document.getElementById("preferred-class-days").innerHTML = value;
    } else if(id === "max-back-to-back-classes-minus") {
        let value = Number(document.getElementById("max-back-to-back-classes").innerHTML);
        if(value > 1) value--;
        maxBackToBackClasses = value;
        document.getElementById("max-back-to-back-classes").innerHTML = value;
    } else if(id === "max-classes-minus") {
        let value = Number(document.getElementById("max-classes").innerHTML);
        if(value > 1) value--;
        maxClasses = value;
        document.getElementById("max-classes").innerHTML = value;
    } else if(id === "max-finals-minus") {
        let value = Number(document.getElementById("max-finals").innerHTML);
        if(value > 1) value--;
        maxFinal = value;
        document.getElementById("max-finals").innerHTML = value;
    }
}