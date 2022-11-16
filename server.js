const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

//process object will emit a unhandled rejection
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection. Terminating...');
  console.log(err);
  process.exit(1);
});

//process object will emit a uncaughtException
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception. Terminating...');
  console.log(err);
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log('DB Connection Successful');
});

const port = process.env.PORT || 6000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
