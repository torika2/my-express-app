import authenticateJWT from "../middlewares/authenticateJWT.js"
import crypto from 'crypto'

const SHARED_SECRET = process.env.SHARED_SECRET_KEY
const ALLOWED_TIME_DIFF = 5 * 60 * 1000

export default (app, db)=>{
    // Create player statistics
    app.post('/api/player-statistics',authenticateJWT ,async (req, res) => {
        const { total, choosen_card, random_card } = req.body
        let player_id = req.cookies.playerId
        let insert = `
            INSERT INTO deck_player_stats (deck_id, player_id, status, randomized_card, selected_card, total) 
            VALUES(?, ?, ?, ?, ?, ?)
        `
        let status = (random_card.suit === choosen_card) ? 'WON' : 'LOST'
        try {
            db.query(`SELECT balance FROM players WHERE id = ?`, [player_id], (err, player)=> {
                db.query(`SELECT * FROM deck_players WHERE player_id = ?`, [player_id], (err, deck_player)=> {
                    let balance = (random_card.suit === choosen_card) ? parseFloat(total)*2+parseFloat(player[0].balance) : parseFloat(player[0].balance)-parseFloat(total)
                    db.query(insert, [deck_player.deck_id, player_id, status, random_card.suit, choosen_card, balance], (err, response)=> {
                        db.query(`UPDATE players SET balance = ? WHERE id = ?`, [balance, player_id], (err, response)=> {
                            res.json({
                                success: true,
                                result:{
                                    status,
                                    total,
                                    balance
                                }
                            })
                        })
                    })
                })
            })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })
    app.post('/api/player-leaving' ,async (req, res) => {
        const { status } = req.body
        db.query(`UPDATE deck_players SET status = ? WHERE player_id = ?`, [status, req.cookies.playerId])
    })

    function generateSignature(method, path, timestamp, body) {
        const bodyString = JSON.stringify(body)
        const canonicalString = `${method}:${path}:${timestamp}:${bodyString}`
        return crypto.createHmac('sha256', SHARED_SECRET).update(canonicalString).digest('hex')
    }

    function constantTimeCompare(a, b) {
        return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
    }

    app.post('/api/deposit', (req, res) => {
        const signature = req.headers['x-signature']
        const timestamp = req.headers['x-timestamp']
        const method = 'POST'
        const path = '/api/deposit'
        const now = Date.now()

        if (!signature || !timestamp) {
            return res.status(401).json({ error: 'Missing signature or timestamp' })
        }

        if (Math.abs(now - parseInt(timestamp)) > ALLOWED_TIME_DIFF) {
            return res.status(408).json({ error: 'Request timestamp too old or too far in future' })
        }

        const expectedSignature = generateSignature(method, path, timestamp, req.body)

        if (!constantTimeCompare(expectedSignature, signature)) {
            return res.status(403).json({ error: 'Invalid signature' })
        }

        res.json({ success: true, message: 'Deposit successful' })
    })
}