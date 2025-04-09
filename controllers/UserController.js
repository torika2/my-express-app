import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default (app, db, express)=>{
    app.use(express.urlencoded({ extended: true }))
    app.use(express.json())
    // Secret key for JWT
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'
    // Player balance
    app.put('/players/:username/balance', async (req, res) => {
        const { username } = req.params
        const { balance } = req.body
        try {
            const sql = `UPDATE players SET balance = ? WHERE username = ?`
            const [result] = await db.query(sql, [balance, username])
            res.json({ success: result.affectedRows > 0 })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })
    // Delete a player
    app.delete('/players/:username', async (req, res) => {
        const { username } = req.params
        try {
            const sql = `DELETE FROM players WHERE username = ?`
            const [result] = await db.query(sql, [username])
            res.json({ success: result.affectedRows > 0 })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })
    app.get('/logout', async (req, res) => {
        try {
            res.clearCookie("token")
            res.clearCookie("player_id")
            return res.redirect('/')
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    })
    // Login endpoint
    app.post('/login', async (req, res) => {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' })
        }

        try {
            // Get user from database
            db.query('SELECT * FROM players WHERE username = ?', [username], async (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' })
                }

                if (results.length === 0) {
                    return res.status(404).json({ error: 'Player not found' })
                }

                const player = results[0];

                // Compare password
                const match = await bcrypt.compare(password, player.password)
                if (!match) {
                    return res.status(401).json({ error: 'Invalid credentials' })
                }

                // Generate JWT token
                const token = jwt.sign(
                    { playerId: player.id, username: player.username },
                    JWT_SECRET,
                    { expiresIn: '1h' }
                )
                res.cookie('player_id', player.id, { httpOnly: true, secure: true })
                res.cookie('token', token, { httpOnly: true, secure: true })

                // Send token in response
                // res.json({ message: 'Login successful', token })
                res.redirect('/')
            })
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' })
        }
    });
    // Register endpoint
    app.post('/register', (req, res) => {
        const { username, password, password_repeat } = req.body

        // Check if passwords match
        if (password !== password_repeat) {
            return res.status(400).send('Passwords do not match!')
        }

        // Check if fields are empty
        if (!username || !password) {
            return res.status(400).send('Username and password are required!')
        }

        // Check if username already exists
        db.query('SELECT * FROM players WHERE username = ?', [username], (err, results) => {
            if (err) {
                return res.status(500).send('Database error!')
            }

            if (results.length > 0) {
                return res.status(400).send('Username already exists!')
            }

            // Hash the password
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).send('Error hashing password!')
                }

                // Insert player into the database
                db.query('INSERT INTO players (username, password) VALUES (?, ?)',
                    [username, hashedPassword],
                    (err, result) => {
                        if (err) {
                            return res.status(500).send('Error saving player to database!')
                        }
                        res.redirect('/login') // Redirect to login page after success
                    }
                )
            })
        });
    });
    // Get all players
    app.get('/players', async (req, res) => {
        db.query('SELECT * FROM players', (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' }) // ✅ "return" prevents further execution
            }
            res.json(results)
        })
    })
    // Create a new player
    app.post('/players/create', async (req, res) => {
        const { username, password } = req.body
        try {
            const sql = `INSERT INTO players (username, password, balance) VALUES (?, ?, ?)`;
            const [result] = await db.query(sql, [username, password, 100.00])
            res.json({ success: true, id: result.insertId })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })
}