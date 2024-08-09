// api/fetch-html.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET'); // Allow only GET requests

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // const response = await fetch('https://rds2.northsouth.edu/index.php/common/showofferedcourses'); // Replace with the desired URL
    const response = await fetch('http://0.0.0.0:8000/'); // for testing
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

