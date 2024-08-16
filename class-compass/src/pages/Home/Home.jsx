import { Flex, Heading, Box, TextField, Table, Text, Popover, Button, Grid } from "@radix-ui/themes"
import Navbar from "../../components/Navbar/Navbar"
import { useEffect, useState } from "react"

function Home(props) {

  // Data from rds2
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dayCombinations, setDayCombinations] = useState({})
  const [course, setCourse] = useState()
  const [keyPressed, setKeyPressed] = useState()

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

  useEffect(() => {
    if (keyPressed === "Enter") {
      console.log(course)
    }
  }, [keyPressed])


  const courseInput = (event) => {
    setCourse(event.target.value)
  }

  // Extract data from rds2
  const extractTableData = (htmlString) => {
    // Create a temporary DOM element to parse the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const dayCombinations = {};

    const rows = doc.querySelectorAll('#offeredCourseTbl tbody tr');
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      const course = cells[1].textContent.trim();
      const section = cells[2].textContent.trim();
      const faculty = cells[3].textContent.trim();
      const timeCell = cells[4].textContent.trim();
      const availableSeats = cells[6].textContent.trim();

      // Split time into days and actual time
      const [days, time] = timeCell.split(' ');

      const sectionData = {
        section: section,
        availableSeats: availableSeats,
        faculty: faculty,
      };

      const courseData = {
        course: course,
        time: time,
        sections: [sectionData],
      };

      if (!dayCombinations[days]) {
        dayCombinations[days] = [];
      }

      const existingCourse = dayCombinations[days].find(
        (item) => item.course === course && item.time === time
      );

      if (existingCourse) {
        existingCourse.sections.push(sectionData);
      } else {
        dayCombinations[days].push(courseData);
      }
    });

    setDayCombinations(dayCombinations);
    console.log(dayCombinations)
  };

  return (
    <>
      <Navbar theme={props.theme} setTheme={props.setTheme} page="home" />


      <Flex justify="center" align="center" gap="3" direction="column" p="5">
        <img height="50px" src="logo.png" alt="logo" />
        <Heading color="iris" size={{ initial: "8", md: "9" }}>Class <span className="gradient-animation">Compass</span></Heading>
        <Heading color="gray" size="4">A more organized way for NSUers to look up courses and more...</Heading>

        <Box maxWidth="300px" mt="5">
          <TextField.Root onChange={courseInput} variant="surface" size="3" placeholder="Search course..." />
        </Box>

        <Grid columns={{ initial: "1", md: "1", lg: "2" }} gap="5" width="auto">
          {/* Table */}
          <Flex gap="3" direction="column" justify="top" align="center">
            <Flex mt="5" gap="4" align="center">
              <Text>ST (Sunday - Tuesday)</Text>
            </Flex>
            <Table.Root variant="surface" style={{ boxShadow: "var(--shadow-5" }}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Course</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Sections</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {!loading ? (
                  dayCombinations.ST.map((course, index) => {
                    return (
                      <Table.Row key={index}>
                        <Table.Cell>{course.course}</Table.Cell>
                        <Table.Cell>{course.time}</Table.Cell>
                        <Table.Cell>
                          <Grid columns={{ initial: "2", md: "3", lg: "3" }} gap="1" width="auto">
                            {course.sections.map((section, index) => {
                              return (
                                <Popover.Root key={index}>
                                  <Popover.Trigger>
                                    <Button variant="soft">{section.section}</Button>
                                  </Popover.Trigger>
                                  <Popover.Content size="1" maxWidth="300px">
                                    <Text as="p" trim="both" size="1">
                                      Available Seats: {section.availableSeats}, Faculty: {section.faculty}
                                    </Text>
                                  </Popover.Content>
                                </Popover.Root>
                              )
                            })}
                          </Grid>
                        </Table.Cell>
                      </Table.Row>
                    )
                  })

                ) : true}

                <Table.Row>
                  <Table.RowHeaderCell>CSE115</Table.RowHeaderCell>
                  <Table.Cell>8:00 am - 9:15 am</Table.Cell>
                  <Table.Cell>
                    <Grid columns={{ initial: "2", md: "3", lg: "3" }} gap="1" width="auto">
                      <Popover.Root>
                        <Popover.Trigger>
                          <Button variant="soft">1</Button>
                        </Popover.Trigger>
                        <Popover.Content size="1" maxWidth="300px">
                          <Text as="p" trim="both" size="1">
                            Available Seats: 20, Faculty: TBA
                          </Text>
                        </Popover.Content>
                      </Popover.Root>

                      <Popover.Root>
                        <Popover.Trigger>
                          <Button variant="soft">3</Button>
                        </Popover.Trigger>
                        <Popover.Content size="1" maxWidth="300px">
                          <Text as="p" trim="both" size="1">
                            Available Seats: 20, Faculty: TBA
                          </Text>
                        </Popover.Content>
                      </Popover.Root>

                      <Popover.Root>
                        <Popover.Trigger>
                          <Button variant="soft">4</Button>
                        </Popover.Trigger>
                        <Popover.Content size="1" maxWidth="300px">
                          <Text as="p" trim="both" size="1">
                            Available Seats: 20, Faculty: TBA
                          </Text>
                        </Popover.Content>
                      </Popover.Root>

                      <Popover.Root>
                        <Popover.Trigger>
                          <Button variant="soft">10</Button>
                        </Popover.Trigger>
                        <Popover.Content size="1" maxWidth="300px">
                          <Text as="p" trim="both" size="1">
                            Available Seats: 20, Faculty: TBA
                          </Text>
                        </Popover.Content>
                      </Popover.Root>
                    </Grid>
                  </Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.RowHeaderCell>Zahra Ambessa</Table.RowHeaderCell>
                  <Table.Cell>zahra@example.com</Table.Cell>
                  <Table.Cell>Admin</Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.RowHeaderCell>Jasper Eriksson</Table.RowHeaderCell>
                  <Table.Cell>jasper@example.com</Table.Cell>
                  <Table.Cell>Developer</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Root>
          </Flex>

          {/* Table */}
          <Flex gap="3" direction="column" justify="top" align="center">
            <Flex mt="5" gap="4" align="center">
              <Text>MW (Sunday - Tuesday)</Text>
            </Flex>
            <Table.Root variant="surface" style={{ boxShadow: "var(--shadow-5" }}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Course</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Sections</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                <Table.Row>
                  <Table.RowHeaderCell>CSE115</Table.RowHeaderCell>
                  <Table.Cell>8:00 am - 9:15 am</Table.Cell>
                  <Table.Cell>1, 4, 6, 7</Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.RowHeaderCell>Zahra Ambessa</Table.RowHeaderCell>
                  <Table.Cell>zahra@example.com</Table.Cell>
                  <Table.Cell>Admin</Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.RowHeaderCell>Jasper Eriksson</Table.RowHeaderCell>
                  <Table.Cell>jasper@example.com</Table.Cell>
                  <Table.Cell>Developer</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Root>
          </Flex>

          {/* Table */}
          <Flex gap="3" direction="column" justify="top" align="center">
            <Flex mt="5" gap="4" align="center">
              <Text>RA (Sunday - Tuesday)</Text>
            </Flex>
            <Table.Root variant="surface" style={{ boxShadow: "var(--shadow-5" }}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Course</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Sections</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                <Table.Row>
                  <Table.RowHeaderCell>CSE115</Table.RowHeaderCell>
                  <Table.Cell>8:00 am - 9:15 am</Table.Cell>
                  <Table.Cell>1, 4, 6, 7</Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.RowHeaderCell>Zahra Ambessa</Table.RowHeaderCell>
                  <Table.Cell>zahra@example.com</Table.Cell>
                  <Table.Cell>Admin</Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.RowHeaderCell>Jasper Eriksson</Table.RowHeaderCell>
                  <Table.Cell>jasper@example.com</Table.Cell>
                  <Table.Cell>Developer</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Root>
          </Flex>

          {/* Table */}
          <Flex gap="3" direction="column" justify="top" align="center">
            <Flex mt="5" gap="4" align="center">
              <Text>F (Friday)</Text>
            </Flex>
            <Table.Root variant="surface" style={{ boxShadow: "var(--shadow-5" }}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Course</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Sections</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                <Table.Row>
                  <Table.RowHeaderCell>CSE115</Table.RowHeaderCell>
                  <Table.Cell>8:00 am - 9:15 am</Table.Cell>
                  <Table.Cell>1, 4, 6, 7</Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.RowHeaderCell>Zahra Ambessa</Table.RowHeaderCell>
                  <Table.Cell>zahra@example.com</Table.Cell>
                  <Table.Cell>Admin</Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.RowHeaderCell>Jasper Eriksson</Table.RowHeaderCell>
                  <Table.Cell>jasper@example.com</Table.Cell>
                  <Table.Cell>Developer</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Root>
          </Flex>
        </Grid>
      </Flex>
    </>
  )
}

export default Home