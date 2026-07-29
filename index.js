require('dotenv').config();
require('./middleware/database/connectDatabase.js');

const express = require('express');
const cors = require('cors');
const path = require('path');
const { user_auth } = require('./middleware/authorization/authorization.js');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.js');
const { Server } = require('socket.io'); // for socket - 1
const http = require('http');
global.globalSetting = {};

const { check_validation } = require('./utils/validateRequest.js');

const app = express();
const route = require('./src/routes/index.route.js');
const { db } = require('./src/model/index.js');
(async () => {
    globalSetting = await db.Setting.findOne({});
})();
require('./utils/varibles.js');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(`${process.env.API_COMMON_ROUTE}/uploads`, express.static(path.join(__dirname, 'uploads'))); // @todo from fromntend

app.use(`${process.env.API_COMMON_ROUTE}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(`${process.env.API_COMMON_ROUTE}`, user_auth, check_validation, route);

app.get('/', function (req, res) {
    console.log('........');
    res.status(200).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Health Check Route - Render keep-alive ke liye
app.get('/health', function (req, res) {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const allowedOrigins = [
    'https://admin.gulugulu.online',
    'https://backend.gulugulu.online',
    'https://agency.gulugulu.online',
    'https://backend.gulu-gulu.cloud',
    'https://admin.gulu-gulu.cloud', // Your production frontend
    'https://gulu-gulu.cloud',       // Your root domain
    'http://localhost:3000',      // For local development
    'http://localhost:5173',      // If using Vite locally
    'http://localhost:8081',
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // For development, we are allowing all origins. 
        // In production, you should revert this to the specific allowedOrigins list.
        return callback(null, true);

        /* 
        // Strict check (Uncomment this for production)
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
        */
    },
    credentials: true, // <--- CRITICAL: Allows Authorization headers / Cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

const server = http.createServer(app); // for socket - 2
global.io = new Server(server, {
    // for socket - 3
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH']
    },
    pingTimeout: 20000,
    pingInterval: 25000, //connection stable b/w 25 sec time
    maxHttpBufferSize: 1e8
});

//socket.js
require('./utils/socket.js');

const PORT = process.env.PORT || 3001;
//start the server
//start the server
server.listen(PORT, () => {
    // for socket - 4
    console.log(`Magic happens on port ${PORT}` || 3001);

    // Initialize Notification Scheduler
    const { initNotificationScheduler } = require('./src/services/notificationScheduler.js');
    initNotificationScheduler();

    // ✅ Render Free Tier Sleep Prevention
    const { startKeepAlive } = require('./utils/keepAlive.js');
    startKeepAlive();
});
