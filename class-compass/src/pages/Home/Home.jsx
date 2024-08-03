import { Flex, Heading, Box, TextField, Table, Text, Popover, Button, Grid } from "@radix-ui/themes"
function Home() {
  return (
    <>
      <Flex justify="center" align="center" gap="3" direction="column" p="5">
        <img height="40px" src="./src/assets/logo.png" alt="logo" />
        <Heading color="iris" size={{ initial: "8", md: "9" }}>Class <span className="gradient-animation">Compass</span></Heading>
        <Heading color="gray" size="4">A more organized way for NSUers to look up courses and more...</Heading>

        <Box maxWidth="300px" mt="5">
          <TextField.Root variant="surface" size="3" placeholder="Search course..." />
        </Box>

        <Grid columns={{ initial: "1", md: "2", lg: "3" }} gap="5" width="auto">

          {/* Table */}
          <Flex gap="3" direction="column" justify="top" align="center">
            <Flex mt="5" gap="4" align="center">
              <Text>ST (Sunday - Tuesday)</Text>
            </Flex>
            <Table.Root variant="surface" style={{boxShadow: "var(--shadow-5"}}>
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
            <Table.Root variant="surface" style={{boxShadow: "var(--shadow-5"}}>
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
            <Table.Root variant="surface" style={{boxShadow: "var(--shadow-5"}}>
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
            <Table.Root variant="surface" style={{boxShadow: "var(--shadow-5"}}>
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