const app = require('./app');

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`ING Payments API listening on port ${PORT}`);
});
