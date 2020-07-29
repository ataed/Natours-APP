const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 🤯 Shutting down....');
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const uri = process.env.ATLAS_URI.replace(
  '<password>',
  process.env.DB_PASSWORD
);
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log('Successfully connected to the database!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}....`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHADLED REJECTION! 🤯 Shutting down....');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

//event listener to SIGTERM signal
//SIGTERM signal : sended from heroku every 24h to shutdown the app
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED . Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated! ⚡');
  });
});
