import mysql from 'mysql2'

export default mysql.createPool({
    host: 'localhost', // Change to your database host
    user: 'root',      // Your MySQL username
    password: 'Santeqniki123@', // Your MySQL password
    database: 'my_express_db',
    waitForConnections: true,
    port: 3306,
    connectionLimit: 10,
    queueLimit: 0
})
//module.exports = db // Using Promises for async/await support