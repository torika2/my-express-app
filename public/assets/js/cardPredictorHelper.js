const state = {
    _bidding: false,
    set bidding(val) {
        this._bidding = val
        disableDivsByValue()
    },
    get bidding() {
        return this._bidding
    }
}

function disableDivsByValue(){
    let divs = document.querySelectorAll('.disable-divs')
    let round_text = document.getElementById('round-text')
    if(state.bidding){
        round_text.innerText = ''
        divs.forEach((div)=>{
            div.setAttribute('style', 'opacity:0.5;pointer-events: none;')
        })
    }else{
        round_text.innerText = 'Round starts in'
        divs.forEach((div)=>{
            div.setAttribute('style', '')
        })
    }
}
function getRandomCard(){
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades']
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'J', 'Q', 'K', 'A']
    const suit = suits[Math.floor(Math.random() * suits.length)]
    const value = values[Math.floor(Math.random() * values.length)]
    return { suit, value }
}
function getCardColor(suit){
    return suit === 'Hearts' || suit === 'Diamonds' ? 'Red' : 'Black'
}
function chooseAmount(index){
    let amount_children = document.getElementById('amount').children
    for (let i = 0; i < amount_children.length; i++) {
        amount_children[i].classList.remove('active')
    }
    setTimeout(()=>{
        amount_children[index].classList.add('active')
    })
}
function chooseCardIcon(index ,card_type){
    let card_icon_children = document.getElementById('card-icons').children
    for (let i = 0; i < card_icon_children.length; i++) {
        card_icon_children[i].classList.remove('active')
    }
    card_icon_children[index].classList.add('active')
}
function getChoosenAmount(){
    let amount = document.getElementById('amount').children
    for (let i = 0; i < amount.length; i++){
        if(amount[i].classList.contains('active') && i > 0){
            return parseFloat(amount[i].innerText)
        }
    }
    return 0
}
function getChoosenCardIcon(){
    let card_icons = document.getElementById('card-icons').children
    for (let i = 0; i < card_icons.length; i++){
        if(card_icons[i].classList.contains('active')){
            return card_icons[i].firstElementChild.alt
        }
    }
    return 'Hearts'
}
function setVisibleAlert(status, text,timeout = 2500){
    let style = (status === 'WON')?'#008102':'#e2e3e5'
    let response_alert_div = document.getElementById('response-alert')
    response_alert_div.innerText = text
    response_alert_div.setAttribute(
    'style' ,`display:block!important;background:${style};color:white;`
    )
    setTimeout(()=>{
        response_alert_div.setAttribute(
            'style' ,`display:none!important`
        )
    }, timeout)
}
function savePlayerStatistics(choosen_card, random_card, total){
    axios.post('/api/player-statistics', {
        total,
        choosen_card,
        random_card,
    }).then((response)=>{
        let res = response.data.result
        let header_balance_div = document.getElementById('header-balance')
        header_balance_div.innerText = res.balance
        state.bidding = false
        if (total > 0){
            setVisibleAlert(res.status, `You ${res.status}`)
        }
    })
}
function setCanvasImage(image_name){
    return new Promise((resolve,reject)=>{
        let image = document.getElementById("table-card-image")
        image.setAttribute('class','image-canvas-hide')
        setTimeout(()=>{
            if(image.src.includes('2B.svg')){
                image.setAttribute('class','image-canvas-show')
                image.src = "/assets/images/game/"+image_name
                resolve()
            }else{
                image.src = "/assets/images/game/2B.svg"
                image.setAttribute('class','image-canvas-show')
                setTimeout(()=>{
                    image.setAttribute('class','image-canvas-hide')
                    setTimeout(()=>{
                        image.setAttribute('class','image-canvas-show')
                        image.src = "/assets/images/game/"+image_name
                        resolve()
                    }, 600)
                }, 465)
            }
        },465)
    })
}
function startRound(){
    let selected_amount = getChoosenAmount()
    let balance = document.getElementById('header-balance').innerText
    const chosen_card = getChoosenCardIcon()
    if(selected_amount >= 100 && selected_amount <= 500 && chosen_card || selected_amount === 0){
        if(parseFloat(balance) >= selected_amount){
            let random_card = getRandomCard()
            let image_name = random_card.value+random_card.suit.split('')[0]+'.svg'
            setCanvasImage(image_name).then(()=>{
                savePlayerStatistics(chosen_card, random_card, selected_amount)
            })
        }else{
            alert('You have no balance!')
        }
    }
}
function countDownTimer(time = 15){
    let timeLeft = time
    let timerDisplay = document.getElementById('timer')
    let countdown = setInterval(() => {
        timerDisplay.innerText = timeLeft
        timeLeft--
        timerDisplay.innerText = timeLeft
        if (timeLeft === 0) {
            clearInterval(countdown)
            timerDisplay = "Time's up!"
            // Do something like start next round
        }
    }, 1000)
}
function manageRounds() {
    let rounds = 1
    setInterval(() => {
        countDownTimer()
        state.bidding = true
        startRound()
        rounds+=1
        document.getElementById('round').innerText = rounds
    }, 15000) // every 15 seconds switch
}
window.addEventListener("beforeunload", (event) => {
    const roundText = document.getElementById('round')?.innerText || 'unknown'

    const data = JSON.stringify({
        status: 'Unfinished round ' + roundText
    })

    const blob = new Blob([data], { type: 'application/json' })

    navigator.sendBeacon('/api/player-leaving', blob)
})

countDownTimer(30)
setTimeout(() => {
    countDownTimer()
    manageRounds() // start toggling every 10 sec
}, 15000)
