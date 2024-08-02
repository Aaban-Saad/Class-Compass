// api/fetch-html.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const response = await fetch('https://rds2.northsouth.edu/index.php/common/showofferedcourses'); // Replace with the desired URL
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const html = await response.text();
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

