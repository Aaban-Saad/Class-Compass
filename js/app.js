// Collapse sections
function collapseSections(event) {
    let id = event.target.id;
    let container = document.getElementById(id + "-container");

    console.log(container.getAttribute("style"));
    if (container.getAttribute("style") === "display: none") {
        container.setAttribute("style", "display: flex");
    } else {
        container.setAttribute("style", "display: none");
    }
}

//  Add courses
const courseAddBtn = document.getElementById("course-add-btn");
courseAddBtn.addEventListener('click', () => {
    let course = document.getElementById("course-input-box").value;
    if(course.length === 0) return;
    document.getElementById("course-input-box").value = "";

    let courseContainer = document.getElementById("added-courses-container")
    courseContainer.innerHTML = courseContainer.innerHTML + `
    <div id="${course}" class="course">
    ${course.toUpperCase()}
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
    course.outerHTML = "";
}

