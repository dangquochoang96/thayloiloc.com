const fetch = require('node-fetch'); // wait native fetch is available in node 18+
fetch('https://api.chothuetatca.com/api/rent-tasks')
  .then(res => res.json())
  .then(body => {
    console.log("Length:", body.data.length);
    console.log("Sample 0:", JSON.stringify(body.data[0], null, 2));
  })
  .catch(console.error);
