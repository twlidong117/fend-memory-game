/**
 * Class Game:
 * 属性id：表示当前局的id，用于保存
 * 属性deck：一个deck类的instance
 * 属性score：星级（1，2，3），初始值3
 * 属性moves：步数（0+），初始值0
 * 属性time：持续时间（0+），初始值0
 * 方法start:开始游戏并计时
 * 方法stop：暂停游戏并计算持续时间time
 * 方法end：退出游戏
 */
/**
 * Class Deck:
 * 属性cards：length为16的数组，元素是Card类的instance
 * 属性openCard：处于open状态的card实例，初始值null
 * 方法match：匹配card。如果openCard为null，则把当前card赋值给openCard。如果openCard不为null，则把当前card与openCard的name值进行比较，相等success，不相等fail。
 */
/**
 * Class Card:
 * 属性name：数字，card值，用于匹配检查（1,1,2,2,-7,7,8,8）
 * 属性status：card状态（'default','open','matched'）初始值'default'
 * 方法changeStatus：改变card的status值。输入'open','success','fail'
 */


function Card(name) {
    this.name = name;
    this.status = 'default';
}
Card.prototype.changeStatus = function(msg) {
    if (msg === 'open' && this.status === 'default') {
        this.status = 'open';
    } else if (msg === 'success' && this.status === 'open') {
        this.status = 'matched';
    } else if (msg === 'fail' && this.status === 'open') {
        this.status = 'default';
    } else {
        //error处理
    }
};

function Deck() {
    this.cards = [];
    for (let i = 0; i < 8; i++) {
        this.cards[i * 2] = new Card(i + 1);
        this.cards[i * 2 + 1] = new Card(i + 1);
    }
    for (let i = 15, rand; i >= 0; i--) {
        rand = Math.floor(Math.random() * (i + 1));
        let tmp = this.cards[i];
        this.cards[i] = this.cards[rand];
        this.cards[rand] = tmp;
    }
    this.openCard = null;
    this.leftCards = 16;
}
Deck.prototype.match = function(pos) {
    this.cards[pos].changeStatus('open');
    if (this.openCard === null) {
        this.openCard = this.cards[pos];
    } else {
        if (this.openCard.name === this.cards[pos].name) {
            this.openCard.changeStatus('success');
            this.cards[pos].changeStatus('success');
            this.leftCards -= 2;

        } else {
            this.openCard.changeStatus('fail');
            this.cards[pos].changeStatus('fail');
        }
        this.openCard = null;
    }
};

function Game() {
    this.id = Game.prototype.id + 1;
    Game.prototype.id = this.id;
    this.deck = new Deck();
    this.score = 3;
    this.moves = 0;
    this.time = 0;
}
Game.prototype.id = 1;
Game.prototype.start = function() {
    startTime = new Date();
};
Game.prototype.stop = function() {
    stopTime = new Date();
    this.time = this.time + stopTime - startTime;
    startTime = 0;
};
Game.prototype.end = function() {
    this.stop();
    //保存状态数据到localStorage
};

(function() {
    window.onload = function() {
        let startTime = 0;
        let controlFlag = 'stop';
        let deckNode = document.querySelector('.deck');
        let cardNodes = deckNode.children;
        let controlButton = document.querySelector('.control-btn');
        let starNodes = document.querySelectorAll('.star');
        let movesNode = document.querySelector('#moves');
        let game = new Game();
        let lastOpenCardNode = null;
        let domFunction = {
            checkScore: function(steps) {
                if (24 < steps && steps < 40) {
                    starNodes[0].style.visibility = 'hidden';
                } else if (steps >= 40) {
                    starNodes[0].style.visibility = 'hidden';
                    starNodes[1].style.visibility = 'hidden';
                }
            },
            changeMoves: function(steps) {
                movesNode.textContent = steps;
            },
            toggleControlBtn: function() {
                let controlNodes = document.querySelector('.control-btn > i');
                controlNodes.classList.toggle('fa-stop');
            },
            initCards: function(cards) {
                let faArr = ['fa-briefcase', 'fa-camera', 'fa-cloud', 'fa-coffee', 'fa-envelope', 'fa-flag', 'fa-pencil', 'fa-car'];
                for (let i = 0; i < cardNodes.length; i++) {
                    let newFaNode = document.createElement('i');
                    newFaNode.classList.add('fa');
                    faIndex = parseInt(cards[i].name) - 1;
                    newFaNode.classList.add(faArr[faIndex]);
                    cardNodes.item(i).appendChild(newFaNode);
                }
            },
            toggleCard: function(cardNode) {
                cardNode.classList.toggle('open');
            },
            matchCard: function(cardNode) {
                cardNode.classList.add('match');
            },
            reset: function() {
                starNodes.forEach(function(value, index, listObj) {
                    console.dir(value);
                    value.style.visibility = 'visible';
                });
                this.changeMoves(0);
                this.toggleControlBtn();
                for (let i = 0; i < 16; i++) {
                    let cardNode = cardNodes.item(i);
                    cardNode.classList.remove('match');
                    cardNode.classList.remove('open');
                    cardNode.removeChild(cardNode.firstElementChild);
                }
                this.toggleControlBtn();
            },
            showStatistics: function() {

            },
            closeStatistics: function() {

            }

        };
        let callbacks = {
            onControlClick: function(event) {
                event.stopPropagation();
                if (controlFlag === 'stop') {
                    controlFlag = 'doing';
                    game = game || new Game();
                    domFunction.initCards(game.deck.cards);
                    game.start();
                    deckNode.addEventListener('click', callbacks.onDeckClick, false);
                } else if (controlFlag === 'doing') {
                    controlFlag = 'stop';
                    game.stop();
                    domFunction.reset();
                    game = null;
                    deckNode.removeEventListener('click', callbacks.onDeckClick, false);
                }
                domFunction.toggleControlBtn();
            },
            onDeckClick: function(event) {
                event.stopPropagation();
                let index = parseInt(event.target.id);
                if (event.target.nodeName === "LI" && game.deck.cards[index].status === 'default') {
                    domFunction.toggleCard(event.target);
                    game.deck.match(index);
                    console.log(game.deck.leftCards);
                    if (game.deck.cards[index].status === 'open') {
                        lastOpenCardNode = cardNodes.item(index);
                    } else if (game.deck.cards[index].status === 'matched') {
                        domFunction.matchCard(lastOpenCardNode);
                        domFunction.toggleCard(lastOpenCardNode);
                        domFunction.matchCard(cardNodes.item(index));
                        domFunction.toggleCard(cardNodes.item(index));
                        lastOpenCardNode = null;
                    } else if (game.deck.cards[index].status === 'default') {
                        domFunction.toggleCard(event.target);
                        domFunction.toggleCard(lastOpenCardNode);
                        lastOpenCardNode = null;
                    }
                    game.moves++;
                    domFunction.changeMoves(game.moves);
                    domFunction.checkScore(game.moves);
                    if (game.deck.leftCards === 0) {
                        game.stop();
                        domFunction.reset();
                        let clickBtn = new Event('click');
                        controlButton.dispatchEvent(clickBtn);
                        console.dir(game);
                    }
                }


            }
        };
        controlButton.addEventListener('click', callbacks.onControlClick, false);

    };
})();