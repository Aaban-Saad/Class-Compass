import { Heading, Card, Flex, TextField, Button, Badge, Grid, Select, Checkbox, CheckboxCards, IconButton } from '@radix-ui/themes'
import Navbar from '../../components/Navbar/Navbar'
import { useEffect, useState } from 'react'

function Planner(props) {
  const [keyPressed, setKeyPressed] = useState(null)
  const [course, setCourse] = useState("")
  const [courses, setCourses] = useState([])
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
  const [preferredClassDays, setPreferredDays] = useState(4)
  const [maxClassesPerDay, setMaxClassesPerDay] = useState(4)
  const [maxBtoBClasses, setMaxBtoBClasses] = useState(4)
  const [avoidLongGaps, setAvoidLongGaps] = useState(false)
  const [keepLongGaps, setKeepLongGaps] = useState(false)
  const [avoidPrayerTimes, setAvoidPrayerTimes] = useState(true)

  const [coursesInADay, setCoursesInADay] = useState({ 's': 0, 't': 0, 'm': 0, 'w': 0, 'r': 0, 'a': 0, 'f': 0, })
  const [totalDaysTaken, setTotalDaysTaken] = useState(0)

  const timeSlots = [480, 565, 650, 735, 820, 905, 990, 1075, 1160, 1245, 1330] // In minutes

  useEffect(() => {
    const handleKeyDown = (e) => setKeyPressed(e.key);

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  useEffect(() => {
    if (keyPressed === "Enter") {
      addCourse(course)
    }
  }, [keyPressed])


  const addCourse = (course) => {
    if (course !== "" && !courses.includes(course)) {
      setCourses((prev) => [...prev, course])
    }
  }

  const removeCourse = (indexToRemove) => {
    setCourses((prev) =>
      prev.filter((item, index) => index !== indexToRemove)
    );
  };

  function validTime(str) {
    return /^[0-9:]+$/.test(str)
  }

  const addGap = () => {
    if ((gapFrom.length != 5) || (gapTo.length != 5)) return
    if ((gapFrom.charAt(2) !== ':') || (gapTo.charAt(2) !== ':')) return
    if (!validTime(gapFrom) || !validTime(gapTo)) return

    const gapTime = (gapDay + " " + gapFrom + " " + gapFromAm + " - " + gapTo + " " + gapToAm).toUpperCase()
    let timeInMinutes = timeToMinutes(gapTime)
    if(timeInMinutes.startTime >= timeInMinutes.endTime) return

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




  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar theme={props.theme} setTheme={props.setTheme} page="planner" />
      <Flex align="center" justify="center" direction="column" gap="3" p="2">
        <Heading size="7" color='indigo' ml="3" mr="3">
          Automatic Advising Planner
        </Heading>
        <Card>
          <Flex direction={{ initial: "column", md: "row" }} gap="5">
            <Card style={{ boxShadow: "var(--shadow-3", width: "100%" }}>
              <Flex align="center" direction="column" justify="center" gap="3">

                <Heading size="5">
                  Add Courses
                </Heading>
                <Flex gap="2" justify="center" align="center">
                  <TextField.Root size="2" onChange={(event) => setCourse(event.target.value)} placeholder="Course Name" />
                  <Button color="green" onClick={() => addCourse(course)}>
                    Add
                  </Button>
                </Flex>

                <Card mt="2">
                  <Grid columns={{ initial: "2", md: "3" }} gap="3" width="100%">
                    {courses.map((item, index) => {
                      return (
                        <Badge key={index} variant='surface' size="3" color="iris">
                          <span style={{ maxWidth: "70px", overflow: 'hidden' }}>
                            {item}
                          </span>
                          <Button onClick={() => removeCourse(index)} color='red' size="1" variant='surface'>
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
                      Preferred class days:
                    </Flex>

                    <Flex justify="center" align="center" gap="2">
                      <Button size="1" variant='soft' onClick={() => {
                        setPreferredDays((prev) => prev - 1)
                        if(preferredClassDays <= 1) setPreferredDays(() => 1)
                      }}>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.25 7.5C2.25 7.22386 2.47386 7 2.75 7H12.25C12.5261 7 12.75 7.22386 12.75 7.5C12.75 7.77614 12.5261 8 12.25 8H2.75C2.47386 8 2.25 7.77614 2.25 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                      </Button>
                      <span>{preferredClassDays}</span>
                      <Button size="1" variant='soft' onClick={() => {
                        setPreferredDays((prev) => prev + 1)
                        if(preferredClassDays >= 7) setPreferredDays(() => 7)
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
                      Maximum number of classes per day
                    </Flex>

                    <Flex justify="center" align="center" gap="2">
                      <Button size="1" variant='soft' onClick={() => {
                        setMaxClassesPerDay((prev) => prev - 1)
                        if(maxClassesPerDay <= 1) setMaxClassesPerDay(() => 1)
                      }}>
                        <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.25 7.5C2.25 7.22386 2.47386 7 2.75 7H12.25C12.5261 7 12.75 7.22386 12.75 7.5C12.75 7.77614 12.5261 8 12.25 8H2.75C2.47386 8 2.25 7.77614 2.25 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                      </Button>
                      <span>{maxClassesPerDay}</span>
                      <Button size="1" variant='soft' onClick={() => {
                        setMaxClassesPerDay((prev) => prev + 1)
                        if(maxClassesPerDay >= 24) setMaxClassesPerDay(() => 24)
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
                        if(maxBtoBClasses <= 1) setMaxBtoBClasses(() => 1)
                      }}>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.25 7.5C2.25 7.22386 2.47386 7 2.75 7H12.25C12.5261 7 12.75 7.22386 12.75 7.5C12.75 7.77614 12.5261 8 12.25 8H2.75C2.47386 8 2.25 7.77614 2.25 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                      </Button>
                      <span>{maxBtoBClasses}</span>
                      <Button size="1" variant='soft' onClick={() => {
                        setMaxBtoBClasses((prev) => prev + 1)
                        if(maxBtoBClasses >= 24) setMaxBtoBClasses(() => 24)
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

                    <Checkbox onClick={() => setAvoidLongGaps(!avoidLongGaps)}/>
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

                    <Checkbox onClick={() => setKeepLongGaps(!avoidLongGaps)}/>
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

                    <Checkbox defaultChecked onClick={() => setAvoidPrayerTimes(!avoidPrayerTimes)}/>
                  </Flex>
                </Card>

              </Flex>
            </Card>
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