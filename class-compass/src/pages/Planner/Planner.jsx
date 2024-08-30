import { Heading, Text, Card, Flex, TextField, Button, Badge, Grid, Select, Checkbox, CheckboxCards, IconButton } from '@radix-ui/themes'
import Navbar from '../../components/Navbar/Navbar'
import { useEffect, useState } from 'react'
import { paddingPropDefs } from '@radix-ui/themes/dist/cjs/props/padding.props'

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

  const [totalDaysTaken, setTotalDaysTaken] = useState(0)

  let bToBClasses = 0
  let classesInADay = { 'S': 0, 'T': 0, 'M': 0, 'W': 0, 'R': 0, 'A': 0, 'F': 0, }
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
    console.log(dayCombinations)

    const sections = findSections(dayCombinations, "CSE225", "480", "S");
    console.log(sections);
  };

  const findSections = (schedule, course, begTime, days) => {
    for (const day in schedule) {
      const dayCourses = schedule[day]
      // console.log(dayCourses)
      for (const courseObj of dayCourses) {
        let courseTimeInMin = timeToMinutes(courseObj.time)
        // console.log(courseObj.course, begTime, courseTimeInMin.startTime, courseTimeInMin.days, days)
        if (courseObj.course === course && begTime == courseTimeInMin.startTime && (courseTimeInMin.days).includes(days)) {
          return courseObj
        }
      }
    }

    return {}
  }

  function findCourseBySubstring(searchString) {
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
    let c = findCourseBySubstring(course)
    if (c !== "" && !courses.hasOwnProperty(c)) {
      setCourses((prev) => ({ ...prev, [c.toUpperCase()]: { taken: false, time: "none", sections: [] } }))
      setCourse(() => "")
      document.getElementById("planner-course-input").value = ""
    }
  }


  const removeCourse = (courseToRemove) => {
    setCourses((prev) => {
      const newCourses = { ...prev }
      delete newCourses[courseToRemove]
      return newCourses
    })
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


  const planAdvising = () => {
    // Resetting previous advising
    for (let c in courses) {
      courses[c].taken = false
      courses[c].time = "none"
    }
    for (let c in classesInADay) {
      classesInADay[c] = 0
    }
    bToBClasses = 0

    for (let c in courses) { // >>> For each course... <<<

      for (let i = 0; i < days.length; i++) { // >>> For each day... <<<
        if (courses[c].taken) break

        bToBClasses = 0

        if (classesInADay[days[i].toUpperCase()] >= maxClassesPerDay) {
          continue
        }

        // Filtering possible class days
        if ((days[i].toUpperCase() === 'S' ||
          days[i].toUpperCase() === 'T') &&
          !stPossible) {
          continue
        }
        else if ((days[i].toUpperCase() === 'M' ||
          days[i].toUpperCase() === 'W') &&
          !mwPossible) {
          continue
        }
        else if ((days[i].toUpperCase() === 'R' ||
          days[i].toUpperCase() === 'A') &&
          !raPossible) {
          continue
        }
        else if (days[i].toUpperCase() === 'F' &&
          !fPossible) {
          continue
        }

        let day = days[i].toUpperCase()

        let keptLongGap = false
        for (let j = 0; j < timeSlots.length; j++) { // >>> For each time slot... Advise <<<
          // If max classes reached then break
          console.log(classesInADay[days[i].toUpperCase()], maxClassesPerDay)
          if (classesInADay[days[i].toUpperCase()] >= maxClassesPerDay) {
            break
          }

          // If maxed back to back classes then move to next slot
          if (bToBClasses >= maxBtoBClasses) {
            bToBClasses = 0 // Reset and move to next slot
            continue
          }

          // Keeping long gap: if half or, more classes are taken already then skip a few slots
          console.log(keepLongGaps, avoidLongGaps, classesInADay[day], maxClassesPerDay)
          if (!keptLongGap && keepLongGaps && classesInADay[day] === Math.floor(maxClassesPerDay / 2)) {
            j += 2
            console.log("1____________", classesInADay[day], Math.floor(Object.keys(courses).length / 2))
            keptLongGap = true
            continue
          } else if (!keptLongGap && keepLongGaps && classesInADay[day] === Math.floor(Object.keys(courses).length / 2)) {
            j += 2
            console.log("2____________", classesInADay[day], Math.floor(Object.keys(courses).length / 2))
            keptLongGap = true
            continue
          }

          // Avoid prayer time: 12:15 - 1:30 and after 4:20
          if (timeSlots[j] === 735 || timeSlots[j] >= 990) {
            continue
          }

          if (!isTimeTaken(day, timeSlots[j]) && !isTimeGap(day, timeSlots[j])) {
            let courseObj = findSections(dayCombinations, c, timeSlots[j], day)
            if (!('course' in courseObj)) {
              bToBClasses = 0 // Reset back to back classes
              continue
            }
            else if ('course' in courseObj) {
              console.log("updated ", courseObj)
              let timeInMin = timeToMinutes(courseObj.time)
              day = timeInMin.days // Updating day with the found day(s)
              let endTime = timeInMin.endTime
              if (isTimeTaken(day, timeSlots[j]) || isTimeGap(day, timeSlots[j])) {
                // Second check with the updated day(s)
                bToBClasses = 0 // Reset back to back classes
                continue
              }
              else if(isTimeTaken(day, endTime) || isTimeGap(day, endTime)) {
                // Second check if the end time is available
                bToBClasses = 0 // Reset back to back classes
                continue
              }
              else {

                // setCourses((prev) => ({ ...prev, [c.toUpperCase()]: { taken: true, time: courseObj.time, sections: courseObj.sections } }))
                courses[c].taken = true
                courses[c].time = courseObj.time
                courses[c].sections = courseObj.sections

                // Increase back to back classes
                bToBClasses++
                // Keeping track of the number of classes per day
                classesInADay[day.charAt(0)]++
                if (day.length > 1) classesInADay[day.charAt(1)]++
                console.log(classesInADay)

                break
              }
            }
          }
        }
      }
    }
    console.log(courses)
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
                          <Card key={courseKey} variant='classic' style={{backgroundColor:"var(--indigo-2)", border:"2px solid var(--indigo-7)"}}>
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
                    <Flex justify="center" align="center" gap="1">
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
            <Button onClick={() => planAdvising()} color='green'>Proceed</Button>
          </Flex>
        </Card>

        <Card>
          <Flex>

          </Flex>
        </Card>
      </Flex>
    </div>
  )
}

export default Planner