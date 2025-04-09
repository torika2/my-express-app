const readline = require('readline')

const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades']
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

getRandomCard =()=> {
    const suit = suits[Math.floor(Math.random() * suits.length)]
    const value = values[Math.floor(Math.random() * values.length)]
    return { suit, value }
}

getCardColor =(suit)=> {
    return suit === 'Hearts' || suit === 'Diamonds' ? 'Red' : 'Black'
}

playRound =()=> {
    rl.question('Predict the next card color (Red/Black): ', (answer) => {
        const card = getRandomCard()
        const actualColor = getCardColor(card.suit)
        console.log(`Card drawn: ${card.value} of ${card.suit} (${actualColor})`)

        if (answer.toLowerCase() === actualColor.toLowerCase()) {
            console.log('🎉 Correct!')
        } else {
            console.log('❌ Wrong!')
        }

        rl.question('Play again? (y/n): ', (again) => {
            if (again.toLowerCase() === 'y') {
                playRound()
            } else {
                rl.close()
            }
        })
    })
}

playRound()