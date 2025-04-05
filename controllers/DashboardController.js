import cookieParser from 'cookie-parser'
export default (app, db)=>{
    const isLoggedIn=(req, res)=>{
        return !!req.cookies?.token || req.headers['authorization']?.split(' ')[1]
    }
    app.use(cookieParser())
    app.get('/', (req, res)=>{
        db.query('SELECT * FROM players', (err, players) => {
            db.query(`SELECT * FROM decks JOIN deck_players ON deck_players.deck_id = decks.id
                JOIN deck_player_stats ON deck_players.id=deck_player_stats.deck_player_id
                LEFT JOIN players ON players.id=deck_players.player_id`, (err, decks) => {
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
}