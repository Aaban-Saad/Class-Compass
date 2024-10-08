import { Slider, Popover, Heading, Table, Text, Card, Flex, TextField, Button, Badge, Grid, Select, Checkbox, CheckboxCards, IconButton } from '@radix-ui/themes'
import Navbar from '../../components/Navbar/Navbar'
import { useEffect, useState, useRef } from 'react'
import domtoimage from 'dom-to-image'

function Planner(props) {
  const [data, setData] = useState(null)
  const [dayCombinations, setDayCombinations] = useState({}) // day wise sorted data
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const [keyPressed, setKeyPressed] = useState(null)
  const [course, setCourse] = useState("")
  const [courses, setCourses] = useState({})
  const [gaps, setGaps] = useState([])
  const [gapFrom, setGapFrom] = useState("")
  const [gapTo, setGapTo] = useState("")
  const [gapFromAm, setGapFromAm] = useState("am")
  const [gapToAm, setGapToAm] = useState("am")
  const [gapDay, setGapDay] = useState("All-Days")

  const [stPossible, setStPossible] = useState(true)
  const [mwPossible, setMwPossible] = useState(true)
  const [raPossible, setRaPossible] = useState(true)
  const [fPossible, setFPossible] = useState(true)
  const [maxClassesPerDay, setMaxClassesPerDay] = useState(4)
  const [maxBtoBClasses, setMaxBtoBClasses] = useState(4)
  const [avoidLongGaps, setAvoidLongGaps] = useState(false)
  const [keepLongGaps, setKeepLongGaps] = useState(false)
  const [avoidPrayerTimes, setAvoidPrayerTimes] = useState(true)

  const [finishedPlanning, setFinishedPlanning] = useState(false)

  let classesInADay = { 'S': 0, 'T': 0, 'M': 0, 'W': 0, 'R': 0, 'A': 0, 'F': 0, }
  let btoBClassesInADay = { 'S': 0, 'T': 0, 'M': 0, 'W': 0, 'R': 0, 'A': 0, 'F': 0, }
  const days = ['S', 'T', 'M', 'W', 'R', 'A', 'F']
  const timeSlots = [480, 565, 650, 735, 820, 905, 990, 1075, 1160, 1245, 1330] // In minutes

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/fetch-html')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.text();
        setData(result)
        extractTableData(result)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    };

    const handleKeyDown = (e) => setKeyPressed(e.key)

    fetchData()

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])


  useEffect(() => {
    setFinishedPlanning(() => false)
    if (keyPressed === "Enter") {
      addCourse(course)
    }
  }, [keyPressed])

  // Extract data from rds2
  const extractTableData = (htmlString) => {
    // Create a temporary DOM element to parse the HTML string
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')

    const dayCombinations = {}

    const rows = doc.querySelectorAll('#offeredCourseTbl tbody tr')
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td')
      const course = cells[1].textContent.trim()
      const section = cells[2].textContent.trim()
      const faculty = cells[3].textContent.trim()
      const timeCell = cells[4].textContent.trim()
      const availableSeats = cells[6].textContent.trim()

      // Split time into days and actual time
      const [days] = timeCell.split(' ')

      const sectionData = {
        section: section,
        availableSeats: availableSeats,
        faculty: faculty,
      };

      const courseData = {
        days: days,
        course: course,
        time: timeCell,
        sections: [sectionData],
      };

      if (!dayCombinations[days]) {
        dayCombinations[days] = []
      }


      const existingCourse = dayCombinations[days].find(
        (item) => item.course === course && item.time === timeCell
      )

      if (existingCourse) {
        existingCourse.sections.push(sectionData)
      } else {
        dayCombinations[days].push(courseData)
      }
    });
    setDayCombinations(dayCombinations)

    const sections = findSections(dayCombinations, "CSE225", "480", "S");
  };

  const captureRef = useRef(null);

  const handleCapture = () => {
    const element = captureRef.current;
    domtoimage.toPng(element)
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'advising-pan.png';
        link.click();
      })
      .catch((error) => {
        console.error('Error capturing the image:', error);
      });
  };

  const findSections = (schedule, course, begTime, days) => {
    for (const day in schedule) {
      const dayCourses = schedule[day]
      for (const courseObj of dayCourses) {
        let courseTimeInMin = timeToMinutes(courseObj.time)
        if (courseObj.course === course && begTime == courseTimeInMin.startTime && (courseTimeInMin.days).includes(days)) {
          return courseObj
        }
      }
    }

    return {}
  }

  function findCourseBySubstring(searchString) {
    if (searchString.length < 2) return

    searchString = searchString.toLowerCase();

    for (const day in dayCombinations) {
      const courses = dayCombinations[day];
      for (const courseObj of courses) {
        if (courseObj.course.toLowerCase().includes(searchString)) {
          return courseObj.course; // Return the course name if a match is found
        }
      }
    }
    return ""; // Return null if no match is found
  }


  const addCourse = (course) => {
    if (course.length < 2) return

    let c = findCourseBySubstring(course)
    if (c !== "" && !courses.hasOwnProperty(c)) {
      setCourses((prev) => ({ ...prev, [c.toUpperCase()]: { taken: false, time: "none", sections: [] } }))
      setCourse(() => "")
      document.getElementById("planner-course-input").value = ""
    }

    setFinishedPlanning(() => false)

  }


  const removeCourse = (courseToRemove) => {
    setCourses((prev) => {
      const newCourses = { ...prev }
      delete newCourses[courseToRemove]
      return newCourses
    })

    setFinishedPlanning(() => false)
  }


  function validTime(str) {
    return /^[0-9:]+$/.test(str)
  }

  const addGap = () => {
    if ((gapFrom.length != 5) || (gapTo.length != 5)) return
    if ((gapFrom.charAt(2) !== ':') || (gapTo.charAt(2) !== ':')) return
    if (!validTime(gapFrom) || !validTime(gapTo)) return

    const gapTime = (gapDay + " " + gapFrom + " " + gapFromAm + " - " + gapTo + " " + gapToAm).toUpperCase()
    let timeInMinutes = timeToMinutes(gapTime)
    if ('error' in timeInMinutes) return
    if (timeInMinutes.startTime >= timeInMinutes.endTime) return

    if (gapTime !== "" && !gaps.includes(gapTime)) {
      setGaps((prev) => [...prev, gapTime])
    }
  }

  const removeGap = (indexToRemove) => {
    setGaps((prev) =>
      prev.filter((item, index) => index !== indexToRemove)
    );
  };

  const timeToMinutes = (timeStr) => {
    try {
      // Split the input string by the dash to separate start and end times
      const [daysAndStartTime, endTimePart] = timeStr.split(' - ')

      if (!daysAndStartTime || !endTimePart) {
        throw new Error('Invalid format: Missing start or end time.')
      }

      // Split the start time part to extract days, start time, and start period (AM/PM)
      const [days, startTime, startPeriod] = daysAndStartTime.split(' ')

      // Split the end time part to extract end time and end period (AM/PM)
      const [endTime, endPeriod] = endTimePart.split(' ')

      if (!days || !startTime || !startPeriod || !endTime || !endPeriod) {
        throw new Error('Invalid format: Missing time components.')
      }

      // Helper function to validate time and convert to minutes
      const convertToMinutes = (time, period) => {
        let [hour, minute] = time.split(':').map(Number);

        // Validate hour and minute
        if (hour < 1 || hour > 12 || minute < 0 || minute >= 60) {
          throw new Error(`Invalid time: ${time} ${period}`)
        }

        // Convert hour to 24-hour format
        if (period === 'PM' && hour !== 12) {
          hour += 12
        } else if (period === 'AM' && hour === 12) {
          hour = 0;
        }

        return hour * 60 + minute
      };

      // Calculate starting and ending minutes
      const startMinutes = convertToMinutes(startTime, startPeriod);
      const endMinutes = convertToMinutes(endTime, endPeriod)

      return {
        days: days,
        startTime: startMinutes,
        endTime: endMinutes,
      };
    } catch (error) {
      return { error: error.message }
    }
  }

  function getSectionWithHighestSeats(sections) {
    if (!Array.isArray(sections) || sections.length === 0) {
      return {} // Return empty obj
    }

    // Use reduce to find the section with the highest available seats
    return sections.reduce((maxSection, currentSection) => {
      return currentSection.availableSeats > maxSection.availableSeats ? currentSection : maxSection
    })
  }

  function getCourseTiming(courseName, sectionName) {
    for (const day in dayCombinations) {
      const courses = dayCombinations[day]
      for (const courseObj of courses) {
        if (courseObj.course === courseName) {
          for (const sectionObj of courseObj.sections) {
            if (sectionObj.section === sectionName) {
              return courseObj.time; // Return the time if course and section match
            }
          }
        }
      }
    }
    return ""
  }

  function isTimeTaken(day, time) {
    day = day.toUpperCase()
    for (let c in courses) {
      let timeInMin = timeToMinutes(courses[c].time)
      try {
        if (((timeInMin.days).includes(day) ||
          day.includes(timeInMin.days)) &&
          timeInMin.startTime <= time &&
          timeInMin.endTime >= time) {
          return true
        }
      } catch (error) {
        // Do nothing
        true
      }
    }
    return false;
  }

  function isTimeGap(day, time) {
    for (let gap of gaps) {
      let timeInMin = timeToMinutes(gap);
      try {
        if (
          (timeInMin.days === "ALL-DAYS" ||
            timeInMin.days.includes(day) ||
            day.includes(timeInMin.days)) &&
          timeInMin.startTime <= time &&
          timeInMin.endTime >= time
        ) {
          return true;
        }
      } catch (error) {
        // Do nothing
        true
      }
    }
    return false; // Return false if no gap matches
  }

  function getBtoBClasses(day, time) {
    let n = 0
    let i = timeSlots.indexOf(time) - 1

    for (i; i >= 0; i--) {
      if (isTimeTaken(day, timeSlots[i])) n++
      else break
    }

    i = timeSlots.indexOf(time) + 1
    for (i; i < timeSlots.length; i++) {
      if (isTimeTaken(day, timeSlots[i])) n++
      else break
    }
    return n
  }

  const updateCourse = (c, taken, timeString, sections) => {
    // Create a new copy of the courses state
    const updatedCourses = { ...courses };

    // Update the specific course
    updatedCourses[c] = {
      ...updatedCourses[c], // Preserve other properties if any
      taken: taken,
      time: timeString,
      sections: sections,
    };

    // Set the new state
    setCourses(updatedCourses);
  };

  const planAdvising = (seed) => {
    if (Object.keys(courses).length === 0) return

    setFinishedPlanning(() => false)

    // Resetting previous advising
    for (let c in courses) {
      courses[c].taken = false
      courses[c].time = "Couldn't manage time"
      courses[c].sections = []
      updateCourse(c, false, "Couldn't manage time", [])
    }
    for (let c in classesInADay) {
      classesInADay[c] = 0
    }

    for (let c in courses) { // >>> For each course... <<<
      if (courses[c].taken) continue

      for (let i = 0; i < days.length; i++) { // >>> For each day... <<<
        if (courses[c].taken) break

        let offsetDayIndex = (Math.floor(6 * seed / 100) + i) % 7 // 0 to 6 = 7 days in a week
        let day = days[offsetDayIndex].toUpperCase()

        if (classesInADay[day.toUpperCase()] >= maxClassesPerDay) {
          continue
        }

        // Filtering possible class days
        if ((day.toUpperCase() === 'S' ||
          day.toUpperCase() === 'T') &&
          !stPossible) {
          continue
        }
        else if ((day.toUpperCase() === 'M' ||
          day.toUpperCase() === 'W') &&
          !mwPossible) {
          continue
        }
        else if ((day.toUpperCase() === 'R' ||
          day.toUpperCase() === 'A') &&
          !raPossible) {
          continue
        }
        else if (day.toUpperCase() === 'F' &&
          !fPossible) {
          continue
        }

        let keptLongGap = false
        for (let j = 0; j < timeSlots.length; j++) { // >>> For each time slot... Advise <<<

          // If max classes reached then break
          if (classesInADay[day.toUpperCase()] >= maxClassesPerDay) {
            break
          }

          let offsetTimeIndex = (Math.floor((timeSlots.length - 1) * (seed % 33) / 33) + j) % timeSlots.length
          let timeSlot = timeSlots[offsetTimeIndex]

          // Keeping long gap: if half or, more classes are taken already then skip a few slots
          if (!keptLongGap && keepLongGaps && classesInADay[day] === Math.floor(maxClassesPerDay / 2)) {
            j += 2
            keptLongGap = true
            continue
          } else if (!keptLongGap && keepLongGaps && classesInADay[day] === Math.floor(Object.keys(courses).length / 2)) {
            j += 2
            keptLongGap = true
            continue
          }

          // Avoid prayer time: 12:15 - 1:30 and after 4:20
          if (avoidPrayerTimes && timeSlot === 735 || timeSlot >= 990) {
            continue
          }

          if (!isTimeTaken(day, timeSlot) && !isTimeGap(day, timeSlot)) {
            let courseObj = findSections(dayCombinations, c, timeSlot, day)
            if (!('course' in courseObj)) {
              continue
            }
            else if ('course' in courseObj) {
              let timeInMin = timeToMinutes(courseObj.time)
              day = timeInMin.days // Updating day with the found day(s)
              let endTime = timeInMin.endTime
              if (isTimeTaken(day, timeSlot) || isTimeGap(day, timeSlot)) {
                // Second check with the updated day(s)
                continue
              }
              else if (isTimeTaken(day, endTime) || isTimeGap(day, endTime)) {
                // Second check if the end time is available
                continue
              }
              else {
                // Checking max back to back classes
                let lol = getBtoBClasses(day, timeSlot)
                if (getBtoBClasses(day, timeSlot) >= maxBtoBClasses) {
                  continue
                }

                // Check for ECE people (Same section lab)
                if ((c.includes("CSE") || c.includes("EEE") || c.includes("ETE") || c.includes("ECE")) && c.charAt(c.length - 1) !== "L") {
                  let labCourseName = ""
                  let differentNames = c.split("/")
                  differentNames.forEach(course => {
                    labCourseName += course + "L" + "/"
                  });
                  labCourseName = labCourseName.substring(0, labCourseName.length - 1)// avoid the last "/"
                  if (labCourseName in courses) {
                    let preferredSection = getSectionWithHighestSeats(courseObj.sections)
                    let labTimingString = getCourseTiming(labCourseName, preferredSection.section)
                    let labTiming = timeToMinutes(labTimingString)

                    // If taken before, drop it first
                    updateCourse(labCourseName, false, "Time clashes", [])
                    courses[labCourseName].taken = false
                    courses[labCourseName].time = "Time clashes"
                    courses[labCourseName].sections = []

                    // Avoid prayer time: 12:15 - 1:30 and after 4:20
                    if (avoidPrayerTimes && labTiming.startTime === 735 || labTiming.startTime >= 990) {
                      continue
                    }

                    if (!(isTimeTaken(labTiming.days, labTiming.startTime) ||
                      isTimeGap(labTiming.days, labTiming.startTime) ||
                      isTimeTaken(labTiming.days, labTiming.endTime) ||
                      isTimeGap(labTiming.days, labTiming.endTime))) {

                      // Paired section with lab
                      updateCourse(c, true, courseObj.time, [preferredSection])
                      courses[c].taken = true
                      courses[c].time = courseObj.time
                      courses[c].sections = [preferredSection]

                      updateCourse(labCourseName, true, labTimingString, [preferredSection])
                      courses[labCourseName].taken = true
                      courses[labCourseName].time = labTimingString
                      courses[labCourseName].sections = [preferredSection]

                      // Keeping track of the number of classes per day
                      classesInADay[day.charAt(0)]++
                      classesInADay[labTiming.days.charAt(0)]++
                      // BtoBClassesInADay[day.charAt(0)] = getBtoBClasses(day.charAt(0), timeToMinutes(courseObj.time).startTime)
                      if (day.length > 1) {
                        classesInADay[day.charAt(1)]++
                        classesInADay[labTiming.days.charAt(1)]++
                        // BtoBClassesInADay[day.charAt(1)] = getBtoBClasses(day.charAt(1), timeToMinutes(courseObj.time).startTime)
                      }

                      break
                    }
                    continue
                  }
                }

                updateCourse(c, true, courseObj.time, courseObj.sections)
                courses[c].taken = true
                courses[c].time = courseObj.time
                courses[c].sections = courseObj.sections

                // Increase back to back classes

                // Keeping track of the number of classes per day
                classesInADay[day.charAt(0)]++
                // BtoBClassesInADay[day.charAt(0)] = getBtoBClasses(day.charAt(0), timeToMinutes(courseObj.time).startTime)
                if (day.length > 1) {
                  classesInADay[day.charAt(1)]++
                  // BtoBClassesInADay[day.charAt(1)] = getBtoBClasses(day.charAt(1), timeToMinutes(courseObj.time).startTime)
                }

                // Checking max back to back classes
                // if (getBtoBClasses(day, timeSlot) >= maxBtoBClasses) {
                //   continue
                // }

                break
              }
            }
          }
        }
      }
    }
    setFinishedPlanning(() => true)
  }


  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar theme={props.theme} setTheme={props.setTheme} page="planner" />
      <Flex align="center" justify="center" direction="column" gap="3" p="2">
        <Heading size="7" color='indigo' ml="3" mr="3">
          Automatic Advising Planner
        </Heading>
        <Card>
          <Flex direction="column" justify="center" align="center" gap="5">

            <Flex direction={{ initial: "column", md: "row" }} gap="5">
              <Card style={{ boxShadow: "var(--shadow-3", width: "100%" }}>
                <Flex align="center" direction="column" justify="center" gap="3">

                  <Heading size="5">
                    Add Courses
                  </Heading>
                  <Flex gap="2" justify="center" align="center">
                    <TextField.Root id='planner-course-input' size="2" onChange={(event) => setCourse(event.target.value)} placeholder="Course Name" />
                    <Button color="green" onClick={() => addCourse(course)}>
                      Add
                    </Button>
                  </Flex>

                  <Card mt="2">
                    <Grid columns={{ initial: "2", md: "3" }} gap="3" width="100%">

                      {Object.keys(courses).map((courseKey) => {
                        return (
                          <Card key={courseKey} variant='classic' style={{ backgroundColor: "var(--indigo-2)", border: "2px solid var(--indigo-7)" }}>
                            <Flex justify="center" align="center" gap="3" color="red" >
                              <Text size="2" color='indigo' style={{ maxWidth: "70px" }}>
                                {courseKey}
                              </Text>

                              <Button onClick={() => removeCourse(courseKey)} color='red' size="1" variant='surface'>
                                <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                              </Button>
                            </Flex>
                          </Card>
                        );
                      })}
                    </Grid>
                  </Card>
                </Flex>
              </Card>

              <Card style={{ boxShadow: "var(--shadow-3", width: "100%" }}>
                <Flex align="center" justify="center" direction="column" gap="3">
                  <Heading size="5">
                    Add Gaps
                  </Heading>
                  <Flex justify="center" align="center" gap="1">
                    <span>From: </span>
                    <TextField.Root onChange={(e) => setGapFrom(e.target.value)} style={{ width: "70px" }} size="2" placeholder="hh:mm" />
                    <Button onClick={() => { setGapFromAm(gapFromAm === "am" ? "pm" : "am") }} variant='surface' color='green' size="1">{gapFromAm}</Button>
                    <span>To: </span>
                    <TextField.Root onChange={(e) => setGapTo(e.target.value)} style={{ width: "70px" }} size="2" placeholder="hh:mm" />
                    <Button onClick={() => { setGapToAm(gapToAm === "am" ? "pm" : "am") }} variant='surface' color='green' size="1">{gapToAm}</Button>
                  </Flex>

                  <Flex align="center" justify="center" gap="2">
                    <Select.Root onValueChange={(value) => setGapDay(value)} defaultValue="All-Days">
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Group>
                          <Select.Label>Days</Select.Label>
                          <Select.Item value="All-Days">All Days</Select.Item>
                          <Select.Item value="ST">ST</Select.Item>
                          <Select.Item value="MW">MW</Select.Item>
                          <Select.Item value="RA">RA</Select.Item>
                          <Select.Item value="F">F</Select.Item>
                        </Select.Group>
                      </Select.Content>
                    </Select.Root>
                    <Button onClick={() => addGap()} color='green'>Add Gap</Button>
                  </Flex>
                  <Card mt="2">
                    <Grid columns="1" gap="3" width="auto">
                      {gaps.map((item, index) => {
                        return (
                          <Badge key={index} variant='surface' size="3" color="iris">
                            <span style={{ maxWidth: "200px", overflow: 'hidden' }}>
                              {item}
                            </span>
                            <Button onClick={() => removeGap(index)} color='red' size="1" variant='surface'>
                              <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            </Button>
                          </Badge>
                        )
                      })}
                    </Grid>
                  </Card>
                </Flex>
              </Card>

              <Card style={{ boxShadow: "var(--shadow-3", width: "100%" }}>
                <Flex align="center" justify="center" direction="column" gap="3">
                  <Heading size="5">
                    Advanced Settings
                  </Heading>

                  <Flex direction="column">
                    <Flex justify="center" align="center" gap="1" mb="2">
                      <IconButton variant='soft'>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                      </IconButton>
                      Possible Class Days:
                    </Flex>
                    <CheckboxCards.Root size="1" defaultValue={['1', '2', '3', '4']} columns="4">
                      <CheckboxCards.Item value="1" onClick={() => setStPossible(!stPossible)}>
                        ST
                      </CheckboxCards.Item>
                      <CheckboxCards.Item value="2" onClick={() => setMwPossible(!mwPossible)}>
                        MW
                      </CheckboxCards.Item>
                      <CheckboxCards.Item value="3" onClick={() => setRaPossible(!raPossible)}>
                        RA
                      </CheckboxCards.Item>
                      <CheckboxCards.Item value="4" onClick={() => setFPossible(!fPossible)}>
                        F
                      </CheckboxCards.Item>

                    </CheckboxCards.Root>
                  </Flex>

                  <Card style={{ width: "100%" }}>
                    <Flex justify="between" align="center" gap="2">
                      <Flex justify="center" align="center" gap="1" style={{ textAlign: "left" }}>
                        <IconButton variant='soft'>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </IconButton>
                        Maximum number of classes per day
                      </Flex>

                      <Flex justify="center" align="center" gap="2">
                        <Button size="1" variant='soft' onClick={() => {
                          setMaxClassesPerDay((prev) => prev - 1)
                          if (maxClassesPerDay <= 1) setMaxClassesPerDay(() => 1)
                        }}>
                          <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.25 7.5C2.25 7.22386 2.47386 7 2.75 7H12.25C12.5261 7 12.75 7.22386 12.75 7.5C12.75 7.77614 12.5261 8 12.25 8H2.75C2.47386 8 2.25 7.77614 2.25 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </Button>
                        <span>{maxClassesPerDay}</span>
                        <Button size="1" variant='soft' onClick={() => {
                          setMaxClassesPerDay((prev) => prev + 1)
                          if (maxClassesPerDay >= 24) setMaxClassesPerDay(() => 24)
                        }}>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>

                  <Card style={{ width: "100%" }}>
                    <Flex justify="between" align="center" gap="2">
                      <Flex justify="center" align="center" gap="1" style={{ textAlign: "left" }}>
                        <IconButton variant='soft'>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </IconButton>
                        Maximum number of back to back classes:
                      </Flex>

                      <Flex justify="center" align="center" gap="2">
                        <Button size="1" variant='soft' onClick={() => {
                          setMaxBtoBClasses((prev) => prev - 1)
                          if (maxBtoBClasses <= 1) setMaxBtoBClasses(() => 1)
                        }}>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.25 7.5C2.25 7.22386 2.47386 7 2.75 7H12.25C12.5261 7 12.75 7.22386 12.75 7.5C12.75 7.77614 12.5261 8 12.25 8H2.75C2.47386 8 2.25 7.77614 2.25 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </Button>
                        <span>{maxBtoBClasses}</span>
                        <Button size="1" variant='soft' onClick={() => {
                          setMaxBtoBClasses((prev) => prev + 1)
                          if (maxBtoBClasses >= 24) setMaxBtoBClasses(() => 24)
                        }}>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>

                  <Card style={{ width: "100%" }}>
                    <Flex justify="between" align="center" gap="2">
                      <Flex justify="center" align="center" gap="1" style={{ textAlign: "left" }}>
                        <IconButton variant='soft'>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </IconButton>
                        Try to avoid long gaps:
                      </Flex>

                      <Checkbox id="avoid-long-gap" onClick={() => setAvoidLongGaps((prev) => {
                        const current = !prev
                        if (keepLongGaps) {
                          document.getElementById('keep-long-gap').click()
                        }
                        return current
                      })} />
                    </Flex>
                  </Card>

                  <Card style={{ width: "100%" }}>
                    <Flex justify="between" align="center" gap="2">
                      <Flex justify="center" align="center" gap="1" style={{ textAlign: "left" }}>
                        <IconButton variant='soft'>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </IconButton>
                        Try to keep long gaps:
                      </Flex>

                      <Checkbox id="keep-long-gap" onClick={() => setKeepLongGaps((prev) => {
                        const current = !prev
                        if (avoidLongGaps) {
                          document.getElementById('avoid-long-gap').click()
                        }
                        return current
                      })}
                      />
                    </Flex>
                  </Card>

                  <Card style={{ width: "100%" }}>
                    <Flex justify="between" align="center" gap="2">
                      <Flex justify="center" align="center" gap="1" style={{ textAlign: "left" }}>
                        <IconButton variant='soft'>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </IconButton>
                        Avoid prayer times:
                      </Flex>

                      <Checkbox defaultChecked onClick={() => setAvoidPrayerTimes(!avoidPrayerTimes)} />
                    </Flex>
                  </Card>

                </Flex>
              </Card>
            </Flex>
            <Button onClick={() => planAdvising(0)} color='green'>Plan Advising</Button>
          </Flex>
        </Card>

        <Card>
          <Flex>
            {
              finishedPlanning ?
                (
                  <Flex direction="column" gap="3">
                    <Heading size="5">Advising Plan</Heading>
                    <Flex justify="center" align="center" gap="3">
                      <IconButton variant='soft'>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                      </IconButton>
                      <Text>Seed:</Text>
                      <Slider onValueChange={(value) => planAdvising(value[0])} variant="soft" defaultValue={[0]} />
                    </Flex>
                    <Button color='blue' onClick={handleCapture}>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 2C7.77614 2 8 2.22386 8 2.5L8 11.2929L11.1464 8.14645C11.3417 7.95118 11.6583 7.95118 11.8536 8.14645C12.0488 8.34171 12.0488 8.65829 11.8536 8.85355L7.85355 12.8536C7.75979 12.9473 7.63261 13 7.5 13C7.36739 13 7.24021 12.9473 7.14645 12.8536L3.14645 8.85355C2.95118 8.65829 2.95118 8.34171 3.14645 8.14645C3.34171 7.95118 3.65829 7.95118 3.85355 8.14645L7 11.2929L7 2.5C7 2.22386 7.22386 2 7.5 2Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                      Save as Image
                    </Button>
                    <Flex ref={captureRef} style={{ backgroundColor: "var(--indigo-3)" }} direction="column" justify="center" align="center" gap="2">
                      <Table.Root style={{ backgroundColor: "var(--indigo-2)" }} variant="surface">
                        <Table.Header>
                          <Table.Row>
                            <Table.ColumnHeaderCell>Course</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Sections</Table.ColumnHeaderCell>
                          </Table.Row>
                        </Table.Header>

                        <Table.Body>
                          {
                            Object.keys(courses).map((courseKey) => (
                              <Table.Row key={courseKey}>
                                <Table.Cell>{courseKey}</Table.Cell>
                                <Table.Cell>{courses[courseKey].time}</Table.Cell>
                                <Table.Cell>
                                  <Grid columns={{ initial: "2", md: "3", lg: "3" }} gap="1" width="auto">
                                    {courses[courseKey].sections.map((section, index) => {
                                      return (
                                        <Popover.Root key={index}>
                                          <Popover.Trigger>
                                            <Button variant="soft">{section.section}</Button>
                                          </Popover.Trigger>
                                          <Popover.Content size="1" maxWidth="300px">
                                            <Text as="p" trim="both" size="1">
                                              Section: {section.section} | Available Seats: {section.availableSeats} | Faculty: {section.faculty}
                                            </Text>
                                          </Popover.Content>
                                        </Popover.Root>
                                      )
                                    })}
                                  </Grid>
                                </Table.Cell>
                              </Table.Row>
                            ))
                          }

                        </Table.Body>
                      </Table.Root>
                    </Flex>
                  </Flex>

                ) : true
            }
          </Flex>
        </Card>
      </Flex>
    </div>
  )
}

export default Planner