// 引入 Express 模組
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// --- 輔助函式：生成指定範圍的隨機整數 (保持不變) ---
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- 角色基礎資料（固定不變） ---
const baseCharacters = [
  { id: 1, name: "戰神奎托斯", img: "/images/char1.png" },
  { id: 2, name: "女武神布倫希爾德", img: "/images/char2.png" },
  { id: 3, name: "吟遊詩人奧德賽", img: "/images/char3.png" },
  { id: 4, name: "雷神索爾", img: "/images/char4.png" }, // 新增一個圖片
  { id: 5, name: "魔法師甘道夫", img: "/images/char5.png" }      // 新增一個圖片
];

// 設定戰鬥力的隨機範圍
const MIN_POWER = 5000;
const MAX_POWER = 15000;

app.use(express.static(path.join(__dirname, 'public')));
// *** 關鍵修改：設定靜態檔案目錄 (將 index.html 和 gacha.html 放在根目錄) ***
// 讓 Express 能夠服務靜態檔案（例如 index.html, gacha.html, css, 圖片等）
// 假設您的 index.html 和 gacha.html 位於 app.js 相同的目錄
app.use(express.static(path.join(__dirname)));
// 如果您想讓 / 當作 index.html，且不希望靜態檔案自動服務，可以這樣設定：
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// ----------------------------------------------------------------------
// 新增 Gacha API：抽卡 (POST /api/gacha)
// ----------------------------------------------------------------------
app.post('/api/gacha', express.json(), (req, res) => {
    // 1. 取得前端傳來的抽卡次數 (times)
    const { times } = req.body;
    
    if (!times || typeof times !== 'number' || times <= 0) {
        return res.status(400).json({ message: '無效的抽卡次數 (times)' });
    }

    const results = [];
    
    // 2. 執行抽卡邏輯
    for (let i = 0; i < times; i++) {
        // 從基礎角色中隨機選一個
        const randomIndex = getRandomInt(0, baseCharacters.length - 1);
        const baseCharacter = baseCharacters[randomIndex];
        
        // 賦予隨機戰鬥力
        const character = {
            id: baseCharacter.id,
            name: baseCharacter.name,
            img: baseCharacter.img, // 圖片網址
            combatPower: getRandomInt(MIN_POWER, MAX_POWER)
        };
        results.push(character);
    }
    
    // 3. 回傳抽卡結果陣列
    res.json({ results });

    console.log(`[${new Date().toLocaleTimeString()}] API /api/gacha 被調用，抽取了 ${times} 次。`);
});


// ----------------------------------------------------------------------
// (可選) 保留您的舊有 API 路由
// ----------------------------------------------------------------------

// 獲取所有角色資料的 API (GET /api/characters) - 保持不變
app.get('/api/characters', (req, res) => {
  const charactersWithRandomPower = baseCharacters.map(char => ({
    ...char, 
    combatPower: getRandomInt(MIN_POWER, MAX_POWER) 
  }));
  res.json(charactersWithRandomPower);
});

// 根據 ID 獲取單一角色資料的 API (GET /api/characters/:id) - 保持不變
app.get('/api/characters/:id', (req, res) => {
  const characterId = parseInt(req.params.id);
  const baseCharacter = baseCharacters.find(c => c.id === characterId);

  if (baseCharacter) {
    const character = {
        ...baseCharacter,
        combatPower: getRandomInt(MIN_POWER, MAX_POWER) 
    };
    res.json(character);
  } else {
    res.status(404).json({ message: 'Character not found' });
  }
});


// --- 啟動伺服器 ---
app.listen(port, () => {
  console.log(`🚀 遊戲 API 伺服器正在 http://localhost:${port} 運行`);
});