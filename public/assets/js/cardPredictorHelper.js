let is_round_started = false

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
    amount_children[index].classList.add('active')
}
function getChoosenAmount(){
    let amount = document.getElementById('amount').children
    for (let i = 0; i < amount.length; i++){
        if(amount[i].classList.contains('active')){
            return parseInt(amount[i].innerText)
        }
    }
    return 100
}
function setVisibleButtonByVariable(){
    document.getElementById('button').classList.add(is_round_started?'d-none':'d-block')
}
function savePlayerStatistics(choosen_card, random_card, total){
    axios.post('/api/player-statistics', {
        total,
        choosen_card,
        random_card,
    }).then(()=>{
        is_round_started = false
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
    const selected_amount = getChoosenAmount()
    const choosen_card = document.getElementById('select-input').value
    if(choosen_card && selected_amount >= 100 && selected_amount <= 500){
        let random_card = getRandomCard()
        let image_name = random_card.value+random_card.suit.split('')[0]+'.svg'
        setCanvasImage(image_name).then(()=>{
            savePlayerStatistics(choosen_card, random_card, selected_amount)
        })
    }
}