import cookieParser from 'cookie-parser'
import jwtMiddleware from "../middlewares/JwtMiddleware.js";
export default (app, db)=>{
    const isLoggedIn=(req, res)=>{
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
                    is_logged_in:isLoggedIn(req),
                    title: 'Dashboard',
                })
            })
        })
    })
    app.get('/login', (req, res) => {
        res.render('login', {
            is_logged_in:isLoggedIn(req),
            title: 'Login',
        })
    })
    app.get('/register', (req, res) => {
        res.render('register', {
            is_logged_in:isLoggedIn(req),
            title: 'Register',
        })
    })
    app.get('/joinGame/:deck_id', jwtMiddleware,(req, res)=>{
        const { deck_id } = req.params
        let player_id = res.cookies.player_id
        db.query(`insert into deck_players (deck_id, player_id) values (?, ?)`, [deck_id, player_id], (err, res)=>{
            if(err){
                return res.redirect('/')
            }
            db.query(`SELECT * FROM decks WHERE id = ? RIGHT JOIN deck_players ON deck_players.deck_id = decks.id`, [deck_id],(err, players) => {
                res.render('game', {
                    players,
                    title: 'Game',
                })
            })
        })
    })
}