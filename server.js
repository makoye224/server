  const express = require("express");
  const app = express();
  const colors = require("colors")
  const dotenv = require("dotenv").config();
  const {errorHandler} = require("./middleware/errorMiddleware")
  const connectDB = require("./config/db")
  const port = process.env.PORT || 5100;
  const path = require("path")
  const nodemailer = require('nodemailer');
  const http = require("http");
  const cors = require("cors");
  const { Server } = require("socket.io");

  
  connectDB();
  app.use(cors());
  const server = http.Server(app);
  const io = new Server(server, {
    cors: {
      origin: "https://sokoni-market-makoye224-gmailcom.vercel.app",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (data) => {
      socket.join(data);
      console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    socket.on("send_message", (data) => {
      socket.to(data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
  });


  app.use(express.json()) 
  app.use(express.urlencoded({extended: false}))
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

  app.set("view engine", "ejs")
  app.use(express.urlencoded({extended: false}))

  app.use("/api/products", require("./routes/productRoutes"))
  app.use("/api/users", require("./routes/userRoutes"))


  // Serve frontend
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));

    app.get('*', (req, res) =>
      res.sendFile(
        path.resolve(__dirname, '../', 'frontend', 'build', 'index.html')
      )
    );
  } else {
    app.get('/', (req, res) => res.send('Please set to production'));
  }

  app.post('/api/send-email', async (req, res) => {
    const { recipient, subject, message } = req.body;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: recipient,
      subject: subject,
      text: message,
    };
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  });
  
  app.use(errorHandler)

  server.listen(port, ()=> console.log(`server started on port ${port}`));
