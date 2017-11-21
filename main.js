/**
 * Card类，描述卡片
 * @constructor
 * @param {number} name - 卡片名称
 * @return Card的实例
 */
function Card(name) {
    /**
     * 卡片名称，用于进行匹配，{1,1,2,2,...,7,7,8,8}
     * @type {number}
     */
    this.name = name;
    /**
     * 卡片状态，{'default','open','matched'}，初始值'default'
     * @type {string}
     */
    this.status = 'default';
}
/**
 * Card实例方法，翻开卡片
 */
Card.prototype.open = function() {
    if (this.status !== 'matched') {
        this.status = 'open';
    }
};
/**
 * Card实例方法，关闭卡片
 */
Card.prototype.close = function() {
    if (this.status !== 'matched') {
        this.status = 'default';
    }
};
/**
 * Card实例方法，卡片已匹配
 */
Card.prototype.matched = function() {
    this.status = 'matched';
};

/**
 * Deck类，描述卡片组
 * @constructor
 */
function Deck() {
    /**
     * Card实例的数组
     * @type {array}
     */
    this.cards = [];
    /* cards数组初始化 */
    for (let i = 0; i < 8; i++) {
        this.cards[i * 2] = new Card(i + 1);
        this.cards[i * 2 + 1] = new Card(i + 1);
    }
    /* 洗牌 */
    for (let i = 15, rand; i >= 0; i--) {
        rand = Math.floor(Math.random() * (i + 1));
        let tmp = this.cards[i];
        this.cards[i] = this.cards[rand];
        this.cards[rand] = tmp;
    }
    /**
     * 打开的card
     * @type {array}
     */
    this.openCards = [];
    /**
     * 剩余的未匹配的卡片数
     * @type {number}
     */
    this.leftCardsNum = 16;
}
/**
 * Deck实例方法，打开指定位置的card
 * @param {number} pos
 */
Deck.prototype.openCardByPos = function(pos) {
    this.cards[pos].open();
    this.openCards.push(this.cards[pos]);
};
/**
 * Deck实例方法，把open的card进行匹配
 * @returns {bool} 匹配结果，成功true，失败false
 */
Deck.prototype.matchOpenCards = function() {
    let result = this.openCards.reduce((firstCard, secondCard) => {
        return (firstCard.name === secondCard.name) ? true : false;
    });
    this.leftCardsNum = result ? this.leftCardsNum - 2 : this.leftCardsNum;
    this.openCards.forEach(function(card, i, arr) {
        if (result) {
            card.matched();
        } else {
            card.close();
        }
    });
    this.openCards = [];
    return result;
};
/**
 * Game类，描述一局游戏
 * @constructor
 */
function Game() {
    /**
     * 当前游戏的卡片组
     * @type {Deck}
     */
    this.deck = new Deck();
    /**
     * 当前游戏的星级，{3,2,1}
     * @type {number}
     */
    this.score = 3;
    /**
     * 当前游戏已经进行的步数
     * @type {number}
     */
    this.moves = 0;
    /**
     * 当前游戏耗时（毫秒）
     * @type {number}
     */
    this.time = 0;
}
/**
 * Game实例方法，启动游戏
 * @returns {number} 启动游戏时间（毫秒）
 */
Game.prototype.start = function() {
    return Date.now();
};
/**
 * Game实例方法，暂停游戏
 * @param {number} beginTime - 启动时间(毫秒)
 */
Game.prototype.pause = function(beginTime) {
    let endTime = Date.now();
    this.time = this.time + endTime - beginTime;
};
/**
 * Game实例方法，根据步数修改星级
 */
Game.prototype.changeScore = function() {
    if (this.moves < 40) {
        this.score = 3;
    } else if (this.moves >= 40 && this.moves < 80) {
        this.score = 2;
    } else if (this.moves >= 80) {
        this.score = 1;
    }
};
/**
 * Game实例方法，结束游戏
 * @param {number} beginTime - 启动时间(毫秒)
 */
Game.prototype.stop = function(beginTime) {
    this.pause(beginTime);
    //保存状态数据到sessionStorage.sessionStorage只接受字符串
    let gameInfo = {
        moves: this.moves,
        score: this.score,
        time: (this.time / 1000)
    };
    let gameInfos = JSON.parse(sessionStorage.getItem('memoryGame')) || [];
    gameInfos.push(gameInfo);
    sessionStorage.setItem('memoryGame', JSON.stringify(gameInfos));
};

/**
 * DOM相关函数集合
 */
const dom = {
    /**
     * 获得指定节点
     * @param {string} selector - 选择器
     * @returns {HTMLElement} 选择器对应的节点对象
     */
    getNode: (selector) => {
        return document.querySelector(selector);
    },
    /**
     * 改变步数
     * @param {HTMLElement} node - star节点
     * @param {number} moves - 操作的步数
     */
    changeMovesAndScore: function(movesNode, scoreNode, moves) {
        let stars = scoreNode.children;
        for (let i = 0; i < 3; i++) {
            let node = stars.item(i);
            if (moves <= 40) {
                node.style.visibility = 'visible';
            } else if ((40 < moves && moves < 80 && i === 0) || (moves >= 80 && i !== 2)) {
                node.style.visibility = 'hidden';
            }
        }
        movesNode.textContent = moves;
    },
    /**
     * 改变控制按钮
     * @param {HTMLElement} btn
     */
    toggleCtrlBtn: function(btn) {
        btn.firstElementChild.classList.toggle('fa-pause');
    },
    /**
     * 重置界面
     * @param {HTMLElement} deckNode
     * @param {HTMLElement} scoreNode
     * @param {HTMLElement} movesNode
     * @param {HTMLElement} btnNode
     */
    reset: function(deckNode, scoreNode, movesNode, btnNode) {
        for (let i = 0; i < 16; i++) {
            let cardNode = deckNode.children.item(i);
            cardNode.classList.remove('match');
            cardNode.classList.remove('open');
            cardNode.removeChild(cardNode.firstElementChild);
        }
        this.changeMovesAndScore(movesNode, scoreNode, 0);
        btnNode.firstElementChild.classList.remove('fa-stop');
    },
    /**
     * 初始化卡片界面
     * @param {HTMLElement} node - deckNode
     * @param {array} cards - cards数组
     */
    initCards: function(node, cards) {
        let faArr = ['fa-briefcase', 'fa-camera', 'fa-cloud', 'fa-coffee', 'fa-envelope', 'fa-flag', 'fa-pencil', 'fa-car'];
        let cardNodes = node.children;
        for (let i = 0; i < cardNodes.length; i++) {
            let newFaNode = document.createElement('i');
            newFaNode.classList.add('fa');
            faIndex = parseInt(cards[i].name) - 1;
            newFaNode.classList.add(faArr[faIndex]);
            cardNodes.item(i).appendChild(newFaNode);

        }
    },
    /**
     * 翻开／关闭卡片
     * @param {HTMLElement} cardNode
     */
    toggleCard: function(cardNode) {
        cardNode.classList.toggle('open');
    },
    /**
     * 匹配卡片成功
     * @param {HTMLElement} cardNode
     */
    matchCard: function(cardNode) {
        cardNode.classList.add('match');
    },
    /**
     * 显示结果弹窗
     * @param {HTMLElement} msgNode
     * @param {Game} game - 当前游戏实例game
     */
    showMsg: function(msgNode, game) {
        let msgBodyNode = msgNode.firstElementChild.children.item(1);
        msgBodyNode.children.item(0).textContent = game.moves;
        msgBodyNode.children.item(1).textContent = game.score;
        msgBodyNode.children.item(2).textContent = game.time / 1000;
        dom.showHistory(msgNode);
        msgNode.style.display = 'block';
    },
    /**
     * 关闭结果弹窗
     * @param {HTMLElement} msgNode
     */
    closeMsg: function(msgNode) {
        let tableNode = msgNode.firstElementChild.children.item(2);
        tableNode.removeChild(tableNode.lastElementChild);
        msgNode.style.display = 'none';
    },
    /**
     * 显示游戏历史记录
     * @param {HTMLElement} msgNode
     */
    showHistory: function(msgNode) {
        let tabelNode = msgNode.firstElementChild.children.item(2);
        let games = JSON.parse(sessionStorage.getItem('memoryGame'));
        if (games !== null) {
            let df = new DocumentFragment();
            let tbody = document.createElement('tbody');
            games.forEach(function(game, index, games) {
                let tr = document.createElement('tr');
                for (p in game) {
                    if (game.hasOwnProperty(p)) {
                        let td = document.createElement('td');
                        td.textContent = game[p];
                        tr.appendChild(td);
                    }
                }
                tbody.appendChild(tr);
            });
            df.appendChild(tbody);
            tabelNode.appendChild(df);
        }
    }

};

(function() {
    window.onload = function() {
        let startTime = 0;
        let ctrlFlag = 'pause';
        let deckNode = dom.getNode('.deck');
        let cardNodes = deckNode.children;
        let ctrlBtn = dom.getNode('.control-btn');
        let scoreNode = dom.getNode('.score');
        let movesNode = dom.getNode('#moves');
        let msgNode = dom.getNode('.message');
        let rtBtn = dom.getNode('.return-btn');
        let game = new Game();
        dom.initCards(deckNode, game.deck.cards);
        let lastOpenCardNode = null;
        const cb = {
            /**
             * control按钮click事件的回调函数
             * @param {Event} event
             */
            onCtrlBtnClick: function(event) {
                event.stopPropagation();
                dom.toggleCtrlBtn(ctrlBtn);
                if (ctrlFlag === 'pause') {
                    ctrlFlag = 'doing';
                    if (game === null) {
                        game = new Game();
                        dom.initCards(deckNode, game.deck.cards);
                    }
                    startTime = game.start();
                    deckNode.addEventListener('click', cb.onDeckClick, false);
                } else if (ctrlFlag === 'doing') {
                    ctrlFlag = 'pause';
                    game.pause(startTime);
                    deckNode.removeEventListener('click', cb.onDeckClick, false);
                }
            },
            onDeckClick: function(event) {
                event.stopPropagation();
                let index = parseInt(event.target.id);
                if (event.target.nodeName === "LI" && game.deck.cards[index].status === 'default') {
                    game.deck.openCardByPos(index);
                    dom.toggleCard(event.target);
                    if (game.deck.openCards.length === 1) {
                        lastOpenCardNode = cardNodes.item(index);
                    }
                    if (game.deck.openCards.length === 2) {
                        let res = game.deck.matchOpenCards();
                        if (res) {
                            dom.matchCard(lastOpenCardNode);
                            dom.matchCard(event.target);
                        } else {
                            dom.toggleCard(event.target);
                            dom.toggleCard(lastOpenCardNode);
                        }
                    }
                    game.moves++;
                    dom.changeMovesAndScore(movesNode, scoreNode, game.moves);
                    game.changeScore();
                    if (game.deck.leftCardsNum === 0) {
                        game.stop(startTime);
                        dom.reset(deckNode, scoreNode, movesNode, ctrlBtn);
                        dom.showMsg(msgNode, game);
                        game = null;
                        ctrlFlag = 'pause';
                    }
                }
            },
            onRtBtnClick: function(event) {
                dom.closeMsg(msgNode);
            }
        };
        ctrlBtn.addEventListener('click', cb.onCtrlBtnClick, false);
        rtBtn.addEventListener('click', cb.onRtBtnClick, false);
    };
})();