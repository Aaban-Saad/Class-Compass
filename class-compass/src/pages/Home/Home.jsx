import { Flex, Heading, Box, TextField, Table, Text, Popover, Button, Grid, Spinner } from "@radix-ui/themes"
import Navbar from "../../components/Navbar/Navbar"
import { useEffect, useState } from "react"

function Home(props) {

  // Data from rds2
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadedSearchResult, setLoadedSearchResult] = useState(false)
  const [dayCombinations, setDayCombinations] = useState({}) // day wise sorted data
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({});
  const [keyPressed, setKeyPressed] = useState(null)

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

    const handleSearch = (event) => {
      setKeyPressed((k) => event.key)
    };

    fetchData()

    document.addEventListener('keydown', handleSearch)

    return () => {
      document.removeEventListener('keydown', handleSearch);
    };
  }, [])

  // This is for search functionality
  useEffect(() => {
    setLoadedSearchResult(false)

    if (keyPressed === "Enter") {
      if (!searchQuery) {
        setSearchResults({})
        return;
      }

      const filteredResults = {}

      Object.keys(dayCombinations).forEach((days) => {
        const filteredCourses = dayCombinations[days].filter(
          (courseData) =>
            courseData.course.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filteredCourses.length > 0) {
          filteredResults[days] = filteredCourses
        }
      });

      setSearchResults(filteredResults)
      setLoadedSearchResult(true)
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
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar theme={props.theme} setTheme={props.setTheme} page="home" />


      <Flex justify="center" align="center" gap="3" direction="column" p="5" >
        <img height="50px" src="logo.png" alt="logo" />
        <Heading color="iris" size={{ initial: "8", md: "9" }}>Class <span className="gradient-animation">Compass</span></Heading>
        <Heading color="gray" size="4">A more organized way for NSUers to look up courses and plan for advising</Heading>

        {loading ?
          <>
            <Spinner size="3" />
            <Text>Fetching offered course list...</Text>
          </>
           :
          <>
            <Box maxWidth="300px" mt="5">
              <TextField.Root onChange={(event) => setSearchQuery(event.target.value)} variant="surface" size="3" placeholder="Search course..." />
            </Box>
          </>
        }

        {
          (!loading & !loadedSearchResult) ?
          <Heading>Search for a course</Heading> : true
        }

        {
          (!loading & loadedSearchResult) ?
            (
              <Grid columns={{ initial: "1", md: "1", lg: "2" }} gap="5" width="auto">
                {
                  Object.entries(searchResults).map(([days, courses]) => {
                    return (
                      <Table.Root key={days} variant="surface" style={{ boxShadow: "var(--shadow-5" }}>
                        <Table.Header>
                          <Table.Row>
                            <Table.ColumnHeaderCell >Days: {days}</Table.ColumnHeaderCell>
                          </Table.Row>
                          <Table.Row >
                            <Table.ColumnHeaderCell >Course</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell >Time</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell >Sections</Table.ColumnHeaderCell>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {courses.map((course, index) => {
                            return (
                              <Table.Row key={index}>
                                <Table.Cell maxWidth={"150px"}>{course.course}</Table.Cell>
                                <Table.Cell maxWidth={"150px"}>{course.time}</Table.Cell>
                                <Table.Cell maxWidth={"150px"}>
                                  <Grid columns={{ initial: "2", md: "3", lg: "3" }} gap="1" width="auto">
                                    {course.sections.map((section, index) => {
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
                            )
                          })}
                        </Table.Body>
                      </Table.Root>
                    )
                  })
                }
              </Grid>
            ) : true
        }
      </Flex>
    </div>
  )
}

export default Home