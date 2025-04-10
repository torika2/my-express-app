import authenticateJWT from "../middlewares/authenticateJWT.js"

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
}