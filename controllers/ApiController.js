import authenticateJWT from "../middlewares/authenticateJWT.js"

export default (app, db, express)=>{
    // Create player statistics
    app.post('/api/player-statistics',authenticateJWT ,async (req, res) => {
        const { total, choosen_card, random_card } = req.body
        let player_id = req.cookies.playerId
        let insert = `
            INSERT INTO deck_player_statistics (deck_id, player_id, status, randomized_card, selected_card, total) VALUES(?, ?, ?, ?, ?)
        `
        let status = (random_card.suit === choosen_card) ? 'WON' : 'LOST'
        try {
            db.query(`SELECT * FROM deck_players WHERE player_id = ?`, [player_id], (err, deck_player)=> {
                db.query(insert, [deck_player.deck_id, player_id, status, random_card.suit, choosen_card], (err, response)=> {
                    res.json({
                        success: true,
                        result:{
                            status,
                            response
                        }
                    })
                })
            })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })
}