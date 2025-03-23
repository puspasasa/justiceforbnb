/* 游戏配置 */
const GAME_CONFIG = {
    levels: [
        { 
            name: "初次卷钱", 
            moles: 5, 
            interval: 2000, 
            duration: 30,
            bonus: 0.3
        },
        { 
            name: "小试牛刀", 
            moles: 7, 
            interval: 1800, 
            duration: 35,
            bonus: 0.3
        },
        { 
            name: "东窗事发", 
            moles: 10, 
            interval: 1500, 
            duration: 40,
            bonus: 0.3
        },
        { 
            name: "疯狂敛财", 
            moles: 12, 
            interval: 1300, 
            duration: 45,
            bonus: 0.3
        },
        { 
            name: "开始逃亡", 
            moles: 15, 
            interval: 1000, 
            duration: 50,
            bonus: 0.3
        },
        { 
            name: "穷途末路", 
            moles: 18, 
            interval: 800, 
            duration: 55,
            bonus: 0.3
        },
        { 
            name: "被绳之以法", 
            moles: 20, 
            interval: 600, 
            duration: 60,
            bonus: 0.3
        }
    ],
    hitValue: 0.05,
    missValue: 0.05,
    initialFreddiBalance: 1000.00,
    holeSize: 100,
    holeGap: 20,
    holesPerRow: 3
};

/* 游戏状态 */
const gameState = {
    score: 0,
    freddieBalance: GAME_CONFIG.initialFreddiBalance,
    currentLevel: 0,
    timeRemaining: 0,
    molesHit: 0,
    molesTotal: 0,
    gameActive: false,
    gameInterval: null,
    timerInterval: null,
    activeMoles: []
};

/* DOM 元素 */
const elements = {
    gameField: document.getElementById('game-field'),
    scoreDisplay: document.getElementById('score'),
    freddieBalanceDisplay: document.getElementById('freddi-balance'),
    levelDisplay: document.getElementById('level'),
    levelNameDisplay: document.getElementById('level-name'),
    timerDisplay: document.getElementById('timer'),
    startButton: document.getElementById('start-button'),
    nextLevelButton: document.getElementById('next-level'),
    restartButton: document.getElementById('restart-button'),
    messageBox: document.getElementById('message-box'),
    messageContent: document.getElementById('message-content'),
    messageClose: document.getElementById('message-close'),
    gameOver: document.getElementById('game-over'),
    finalScore: document.getElementById('final-score'),
    playAgain: document.getElementById('play-again')
};

/* 游戏初始化 */
function initGame() {
    // 重置游戏状态
    gameState.score = 0;
    gameState.freddieBalance = GAME_CONFIG.initialFreddiBalance;
    gameState.currentLevel = 0;
    gameState.molesHit = 0;
    gameState.molesTotal = 0;
    gameState.gameActive = false;
    
    // 更新显示
    updateDisplays();
    
    // 设置事件监听器
    elements.startButton.addEventListener('click', startGame);
    elements.nextLevelButton.addEventListener('click', startNextLevel);
    elements.restartButton.addEventListener('click', resetGame);
    elements.messageClose.addEventListener('click', closeMessage);
    elements.playAgain.addEventListener('click', resetGame);
    
    // 创建游戏区域
    createGameField();
}

/* 创建游戏区域 */
function createGameField() {
    elements.gameField.innerHTML = '';
    
    const fieldWidth = (GAME_CONFIG.holeSize + GAME_CONFIG.holeGap) * GAME_CONFIG.holesPerRow;
    const fieldHeight = (GAME_CONFIG.holeSize + GAME_CONFIG.holeGap) * Math.ceil(9 / GAME_CONFIG.holesPerRow);
    
    elements.gameField.style.width = `${fieldWidth}px`;
    elements.gameField.style.height = `${fieldHeight}px`;
    
    // 创建9个洞
    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.className = 'hole';
        hole.dataset.index = i;
        
        const mole = document.createElement('div');
        mole.className = 'mole';
        mole.dataset.index = i;
        
        // 随机选择一个Freddi头像
        const randomAvatar = Math.floor(Math.random() * 5) + 1;
        mole.style.backgroundImage = `url('assets/头像/${randomAvatar}.png')`;
        
        mole.addEventListener('click', hitMole);
        
        hole.appendChild(mole);
        elements.gameField.appendChild(hole);
    }
}

/* 开始游戏 */
function startGame() {
    if (gameState.gameActive) return;
    
    elements.startButton.style.display = 'none';
    elements.restartButton.style.display = 'inline-block';
    
    startLevel(0);
}

/* 开始指定关卡 */
function startLevel(levelIndex) {
    // 设置当前关卡
    gameState.currentLevel = levelIndex;
    const level = GAME_CONFIG.levels[levelIndex];
    
    // 更新关卡显示
    elements.levelDisplay.textContent = levelIndex + 1;
    elements.levelNameDisplay.textContent = `（${level.name}）`;
    
    // 设置关卡时间
    gameState.timeRemaining = level.duration;
    elements.timerDisplay.textContent = gameState.timeRemaining;
    
    // 重置关卡统计
    gameState.molesHit = 0;
    gameState.molesTotal = level.moles;
    gameState.gameActive = true;
    
    // 隐藏下一关按钮
    elements.nextLevelButton.style.display = 'none';
    
    // 开始出现地鼠
    startMoles(level);
    
    // 开始计时器
    startTimer();
}

/* 开始出现地鼠 */
function startMoles(level) {
    // 清除之前的定时器
    if (gameState.gameInterval) {
        clearInterval(gameState.gameInterval);
    }
    
    // 隐藏所有地鼠
    const moles = document.querySelectorAll('.mole');
    moles.forEach(mole => {
        mole.classList.remove('active');
    });
    
    // 重置活动地鼠数组
    gameState.activeMoles = [];
    
    // 设置新的定时器
    let molesCreated = 0;
    
    gameState.gameInterval = setInterval(() => {
        if (!gameState.gameActive) {
            clearInterval(gameState.gameInterval);
            return;
        }
        
        // 如果已经创建了足够的地鼠，停止创建
        if (molesCreated >= level.moles) {
            clearInterval(gameState.gameInterval);
            return;
        }
        
        // 随机选择一个洞
        let holeIndex;
        do {
            holeIndex = Math.floor(Math.random() * 9);
        } while (gameState.activeMoles.includes(holeIndex));
        
        // 添加到活动地鼠数组
        gameState.activeMoles.push(holeIndex);
        
        // 显示地鼠
        const mole = document.querySelector(`.mole[data-index="${holeIndex}"]`);
        
        // 随机选择一个Freddie头像
        const randomAvatar = Math.floor(Math.random() * 5) + 1;
        mole.style.backgroundImage = `url('assets/头像/${randomAvatar}.png')`;
        
        mole.classList.add('active');
        
        // 增加创建的地鼠数量
        molesCreated++;
        
        // 设置地鼠消失的定时器
        setTimeout(() => {
            if (mole.classList.contains('active')) {
                mole.classList.remove('active');
                
                // 如果地鼠没有被击中，扣分
                if (gameState.activeMoles.includes(holeIndex)) {
                    missedMole();
                }
                
                // 从活动地鼠数组中移除
                const index = gameState.activeMoles.indexOf(holeIndex);
                if (index > -1) {
                    gameState.activeMoles.splice(index, 1);
                }
                
                // 检查是否所有地鼠都已经消失
                if (gameState.activeMoles.length === 0 && molesCreated >= level.moles) {
                    // 如果所有地鼠都已经出现并消失，结束关卡
                    endLevel();
                }
            }
        }, level.interval * 0.8); // 地鼠显示时间略短于出现间隔
        
    }, level.interval);
}

/* 开始计时器 */
function startTimer() {
    // 清除之前的定时器
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // 设置新的定时器
    gameState.timerInterval = setInterval(() => {
        if (!gameState.gameActive) {
            clearInterval(gameState.timerInterval);
            return;
        }
        
        gameState.timeRemaining--;
        elements.timerDisplay.textContent = gameState.timeRemaining;
        
        // 如果时间到了，结束关卡
        if (gameState.timeRemaining <= 0) {
            endLevel();
        }
    }, 1000);
}

/* 击中地鼠 */
function hitMole(event) {
    if (!gameState.gameActive) return;
    
    const mole = event.target;
    const index = parseInt(mole.dataset.index);
    
    // 如果地鼠是活动的
    if (mole.classList.contains('active')) {
        // 移除活动状态
        mole.classList.remove('active');
        
        // 从活动地鼠数组中移除
        const arrayIndex = gameState.activeMoles.indexOf(index);
        if (arrayIndex > -1) {
            gameState.activeMoles.splice(arrayIndex, 1);
        }
        
        // 增加分数
        gameState.score += GAME_CONFIG.hitValue;
        gameState.freddieBalance -= GAME_CONFIG.hitValue;
        
        // 增加击中数量
        gameState.molesHit++;
        
        // 更新显示
        updateDisplays();
        
        // 显示得分动画
        showScoreAnimation(event.clientX, event.clientY, `+${GAME_CONFIG.hitValue.toFixed(2)} BNB`);
        
        // 检查是否已经打完了所有地鼠
        const level = GAME_CONFIG.levels[gameState.currentLevel];
        if (gameState.molesHit >= level.moles) {
            // 如果已经打完了所有地鼠，结束关卡
            endLevel();
        }
        
        // 检查分数是否为负
        if (gameState.score < 0) {
            // 显示消息
            showMessage("你的资金已经用完了！游戏将重新开始。");
            
            // 停止游戏
            gameState.gameActive = false;
            
            // 延迟一下重新开始游戏
            setTimeout(() => {
                resetGame();
                elements.startButton.style.display = 'inline-block';
                elements.restartButton.style.display = 'none';
                elements.nextLevelButton.style.display = 'none';
            }, 2000);
        }
    }
}

/* 错过地鼠 */
function missedMole() {
    // 扣分
    gameState.score -= GAME_CONFIG.missValue;
    gameState.freddieBalance += GAME_CONFIG.missValue;
    
    // 更新显示
    updateDisplays();
    
    // 检查分数是否为负
    if (gameState.score < 0) {
        // 显示消息
        showMessage("你的资金已经用完了！游戏将重新开始。");
        
        // 延迟一下重新开始游戏
        setTimeout(() => {
            resetGame();
            elements.startButton.style.display = 'inline-block';
            elements.restartButton.style.display = 'none';
            elements.nextLevelButton.style.display = 'none';
        }, 2000);
    }
}

/* 结束关卡 */
function endLevel() {
    // 停止游戏
    gameState.gameActive = false;
    
    // 清除定时器
    clearInterval(gameState.gameInterval);
    clearInterval(gameState.timerInterval);
    
    // 隐藏所有地鼠
    const moles = document.querySelectorAll('.mole');
    moles.forEach(mole => {
        mole.classList.remove('active');
    });
    
    // 检查是否全部击中
    const level = GAME_CONFIG.levels[gameState.currentLevel];
    if (gameState.molesHit === level.moles) {
        // 奖励额外分数
        gameState.score += level.bonus;
        gameState.freddieBalance -= level.bonus;
        
        // 更新显示
        updateDisplays();
        
        // 显示消息
        showMessage(`恭喜！你全部击中了所有的Freddi，获得额外奖励 +${level.bonus.toFixed(2)} BNB！`);
        
        // 检查是否是最后一关
        if (gameState.currentLevel === GAME_CONFIG.levels.length - 1) {
            // 游戏结束
            setTimeout(() => {
                endGame();
            }, 1500);
        } else {
            // 自动进入下一关
            setTimeout(() => {
                startNextLevel();
            }, 1500);
        }
    } else {
        // 检查是否是最后一关
        if (gameState.currentLevel === GAME_CONFIG.levels.length - 1) {
            // 游戏结束
            setTimeout(() => {
                endGame();
            }, 1500);
        } else {
            // 显示下一关按钮
            elements.nextLevelButton.style.display = 'inline-block';
        }
    }
}

/* 开始下一关 */
function startNextLevel() {
    startLevel(gameState.currentLevel + 1);
}

/* 结束游戏 */
function endGame() {
    // 显示游戏结束界面
    elements.gameOver.style.display = 'flex';
    elements.finalScore.textContent = gameState.score.toFixed(2);
    
    // 如果是最后一关，显示特殊效果
    if (gameState.currentLevel === GAME_CONFIG.levels.length - 1) {
        // 创建手铐动画
        const gameField = document.getElementById('game-field');
        const handcuffs = document.createElement('div');
        handcuffs.className = 'handcuffs';
        gameField.appendChild(handcuffs);
        
        // 将Freddie的余额全部扣光
        const remainingBalance = gameState.freddieBalance;
        gameState.score += remainingBalance;
        gameState.freddieBalance = 0;
        
        // 更新显示
        updateDisplays();
        
        // 显示最终消息
        showMessage(`Freddie逃跑失败！钱已全部追回${gameState.score.toFixed(2)} BNB！感谢你伸张正义！`);
    }
}

/* 重置游戏 */
function resetGame() {
    // 隐藏游戏结束界面
    elements.gameOver.style.display = 'none';
    
    // 移除手铐动画
    const handcuffs = document.querySelector('.handcuffs');
    if (handcuffs) {
        handcuffs.remove();
    }
    
    // 重置游戏
    initGame();
    
    // 显示开始按钮
    elements.startButton.style.display = 'inline-block';
    elements.restartButton.style.display = 'none';
    elements.nextLevelButton.style.display = 'none';
}

/* 更新显示 */
function updateDisplays() {
    elements.scoreDisplay.textContent = gameState.score.toFixed(2);
    elements.freddieBalanceDisplay.textContent = gameState.freddieBalance.toFixed(2);
}

/* 显示消息 */
function showMessage(message) {
    elements.messageContent.textContent = message;
    elements.messageBox.style.display = 'flex';
}

/* 关闭消息 */
function closeMessage() {
    elements.messageBox.style.display = 'none';
}

/* 显示得分动画 */
function showScoreAnimation(x, y, text) {
    const scoreAnim = document.createElement('div');
    scoreAnim.className = 'score-animation';
    scoreAnim.textContent = text;
    
    // 调整位置
    scoreAnim.style.left = `${x}px`;
    scoreAnim.style.top = `${y - 30}px`;
    
    document.body.appendChild(scoreAnim);
    
    // 动画结束后移除元素
    setTimeout(() => {
        scoreAnim.remove();
    }, 1000);
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', initGame);
