const app = require('./app');
const port = process.env.PORT || 5000;


app.listen(port, () => {
  console.log(`MetroSheba Backend running on http://localhost:${port}`);
});