import cookieParser from 'cookie-parser'
import authenticateJWT from '../middlewares/authenticateJWT.js'
import jwt from "jsonwebtoken";

export default (app, db)=>{
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'
    const isLoggedIn=(req)=>{
        return !!req.cookies?.token || req.headers['authorization']?.split(' ')[1]
    }
    app.use(cookieParser())
    app.get('/', (req, res)=>{
        db.query('SELECT * FROM players', (err, players) => {
            db.query(`SELECT decks.id,decks.title as title,COUNT(deck_players.player_id) as players_count FROM decks LEFT JOIN deck_players ON deck_players.deck_id = decks.id group by decks.id`, (err, decks) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' })
                }
                res.render('index', {
                    players,
                    decks,
                    auth_user: players.find(player => player.id === parseInt(req.cookies.playerId)),
                    is_logged_in:isLoggedIn(req),
                    title: 'Dashboard',
                })
            })
        })
    })
    app.get('/login', (req, res) => {
        db.query('SELECT * FROM players WHERE id = ?' ,[req.cookies.playerId] ,(err, players) => {
            res.render('login', {
                auth_user:players[0],
                is_logged_in:isLoggedIn(req),
                title: 'Login',
            })
        })
    })
    app.get('/register', (req, res) => {
        db.query('SELECT * FROM players WHERE id = ?' ,[req.cookies.playerId] ,(err, players) => {
            res.render('register', {
                auth_user:players[0],
                is_logged_in:isLoggedIn(req),
                title: 'Register',
            })
        })
    })
    app.get('/joinGame/:deck_id', authenticateJWT, (req, res)=>{
        const { deck_id } = req.params
        let player_id = req.cookies.playerId
        const insert_deck_player = `
            INSERT INTO deck_players (deck_id, player_id, status) VALUES (?, ?, 'joined')
            ON DUPLICATE KEY UPDATE deck_id = ?
        `
        const select_players = `
            SELECT decks.id as deck_id, decks.title as title, player_id ,username ,balance ,status FROM decks
            RIGHT JOIN deck_players ON deck_players.deck_id = decks.id 
            LEFT JOIN players ON deck_players.player_id = players.id
            WHERE decks.id = ?
        `
        db.query(insert_deck_player, [deck_id, player_id, deck_id], ()=>{
            db.query(select_players, [deck_id],(err, players) => {
                if(!err){
                    res.render('game', {
                        players,
                        auth_user: players.find(player => player.player_id === player_id),
                        is_logged_in:isLoggedIn(req),
                        title: 'Game',
                    })
                }else{
                    res.redirect('/')
                }
            })
        })
    })
}