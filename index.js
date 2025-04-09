import express from 'express'
import db from './db.js'
import expressLayouts from 'express-ejs-layouts'
import userController from "./controllers/UserController.js"
import dashboardController from "./controllers/DashboardController.js"
import apiController from "./controllers/ApiController.js"

const app = express()
// Set up view engine
app.set('view engine', 'ejs');
// Use express-ejs-layouts for handling layouts
app.use(expressLayouts);
// Set the default layout (make sure this matches your layout.ejs filename)
app.set('layout', 'layout');
app.set('view engine', 'ejs'); // Set EJS as the template engine
app.use(express.static('public')); // Serve static files (CSS, JS)

// VIEWS
dashboardController(app, db)
// FUNCTIONS
userController(app, db, express)
// API
apiController(app, db)

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})