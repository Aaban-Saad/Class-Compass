# Course Compass
A more organized way for NSUers to look up courses and plan for advising

![image](https://github.com/user-attachments/assets/1f921991-0c1c-442f-abe9-d4d7795c906c)

## Getting Started
- ```gh repo clone Aaban-Saad/Class-Compass```
- ```cd class-compass```
- ```npm install```
- ```npm run dev``` *

However, after running it like this, it cannot fetch data from rds2. Because, it uses Vercel's serverless function for that (Check the api folder). To overcome this, go to the root directory by  ```cd ..``` and run the program using Vercel: ```vercel dev```.

## Features
- ### Front End
    - React
    - Radix UI

- ### Back End
    - No back end server
    - Uses Vercel's serverless function to fetch data from rds2 (Offered Course List).
 
### Website
https://class-compass.vercel.app/
