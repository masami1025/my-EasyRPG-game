// --- オーディオアセット ---
const sounds = {
    bgm: new Audio('https://view.mozaic.fm/assets/audio/loop_forest.mp3'),
    click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
    type: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
    death: new Audio('https://assets.mixkit.co/active_storage/sfx/2513/2513-preview.mp3'),
    open: new Audio('https://assets.mixkit.co/active_storage/sfx/252/252-preview.mp3'),
    shout: new Audio('https://assets.mixkit.co/active_storage/sfx/2182/2182-preview.mp3'),
    fanfare: new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3')
};

sounds.bgm.loop = true;
sounds.bgm.volume = 0.2;
sounds.type.volume = 0.05;
sounds.fanfare.volume = 0.4;

// --- シナリオデータ ---
const scenario = {
    start: {
        img: "🏰",
        text: "あなたは　古城の前に　立っている。\n重厚な扉が　閉ざされているようだ。",
        choices: [
            { text: "扉をノックする", next: "scene_knock" },
            { text: "周囲を調べる", next: "scene_search" },
            { text: "松明をおもむろに取り出す", next: "scene_torch" }
        ]
    },
    scene_torch: {
        img: "🔥",
        text: "あなたは　松明に　火を灯した。\n暗闇を照らす炎が　怪しく揺れている。",
        choices: [
            { text: "自分に使う", next: "scene_torch_self" },
            { text: "古城に使う", next: "scene_torch_castle" }
        ]
    },
    scene_torch_self: {
        img: "😱",
        sound: "death",
        text: "わー、体が焼ける様に熱いぞ！\n\nあなたは　死んでしまった！\n(GAME OVER - リロードして再挑戦)",
        choices: []
    },
    scene_torch_castle: {
        img: "🔥🏰",
        sound: "shout",
        text: "「火事だー！放火魔だ！」\n衛兵が飛び出してきた！私は捕まってしまった！\n\nあなたは放火魔として　古城に捕らわれの身となってしまった！\n(END - リロードして再挑戦)",
        choices: []
    },
    scene_knock: {
        img: "🚪",
        text: "コンコン……。\n\n中から　誰かの気配がする。",
        choices: [
            { text: "「誰かいますか？」と叫ぶ", next: "scene_shout" },
            { text: "逃げ出す", next: "scene_run" }
        ]
    },
    scene_search: {
        img: "🗝️",
        text: "足元に　鍵が落ちていた！\nこれで扉が　開くかもしれない。",
        choices: [
            { text: "鍵を使って開ける", next: "scene_open" },
            { text: "見なかったことにして帰る", next: "scene_run" }
        ]
    },
    scene_shout: {
        img: "💂",
        sound: "shout",
        text: "「うるさいぞ！」\n古城から怒った衛兵が　飛び出してきた！",
        choices: [
            { text: "斬りかかる", next: "scene_slash" },
            { text: "謝ってこの場を去る", next: "scene_goodbye" }
        ]
    },
    scene_run: {
        img: "🏃",
        text: "あなたは　全力で　逃げ出した。\n君子危うきに近寄らず、だ。\n\n(GAME OVER - リロードして再挑戦)",
        choices: []
    },
    scene_open: {
        img: "✨🏰",
        sound: "fanfare",
        text: "ガチャリ。\n扉が開いた。\nあなたの冒険は　ここから始まる……！\n\n(TO BE CONTINUED)",
        choices: []
    },
    scene_slash: {
        img: "💀",
        sound: "death",
        text: "あなたは　衛兵に斬りかかった。\nしかし、負けた、あなたの旅は終わってしまった！\n\n(GAME OVER - リロードして再挑戦)",
        choices: []
    },
    scene_goodbye: {
        img: "🙇",
        text: "あなたは　全力で　謝った。\n60°に及ぶ土下座によって許された。\n\n(END - リロードして再挑戦)",
        choices: []
    }
};

// --- 状態管理 ---
let currentSceneId = "start";
let isTyping = false;
let typingInterval;
let fullText = "";

// --- DOM取得 ---
const textElement = document.getElementById("text-content");
const cursorElement = document.getElementById("next-cursor");
const choicesContainer = document.getElementById("choices-container");
const sceneDisplay = document.getElementById("scene-display");

// --- ゲーム開始 ---
function startGame() {
    document.getElementById("start-overlay").classList.add("hidden");
    sounds.bgm.play().catch(() => {});
    playSe("click");
    loadScene("start");
}

// --- SE再生 ---
function playSe(name) {
    if (!sounds[name]) return;
    sounds[name].currentTime = 0;
    sounds[name].play().catch(() => {});
}

// --- シーン読み込み ---
function loadScene(sceneId) {
    currentSceneId = sceneId;
    const sceneData = scenario[sceneId];

    if (sceneData.sound) playSe(sceneData.sound);

    sceneDisplay.textContent = sceneData.img;
    textElement.innerHTML = "";
    cursorElement.classList.add("hidden");
    choicesContainer.classList.add("hidden");
    choicesContainer.innerHTML = "";

    fullText = sceneData.text;
    startTypewriter(fullText, () => {
        showChoices(sceneData.choices);
    });
}

// --- タイプライター ---
function startTypewriter(text, callback) {
    isTyping = true;
    let index = 0;
    textElement.innerHTML = "";

    typingInterval = setInterval(() => {
        if (index < text.length) {
            const char = text[index];
            if (char === "\n") {
                textElement.innerHTML += "<br>";
            } else {
                textElement.innerHTML += char;
                if (char !== " " && index % 2 === 0) playSe("type");
            }
            index++;
        } else {
            finishTyping(callback);
        }
    }, 50);
}

function finishTyping(callback) {
    clearInterval(typingInterval);
    textElement.innerHTML = fullText.replace(/\n/g, "<br>");
    isTyping = false;

    if (scenario[currentSceneId].choices.length > 0) {
        cursorElement.classList.remove("hidden");
        cursorElement.classList.add("cursor-blink");
    }

    if (callback) callback();
}

// --- メッセージクリック ---
function handleMessageClick() {
    if (isTyping) {
        finishTyping(() => {
            showChoices(scenario[currentSceneId].choices);
        });
    }
}

// --- 選択肢表示 ---
function showChoices(choices) {
    if (!choices || choices.length === 0) return;

    setTimeout(() => {
        choicesContainer.classList.remove("hidden");
        choices.forEach(choice => {
            const btn = document.createElement("button");
            btn.textContent = choice.text;
            btn.className = "choice-btn";
            btn.onclick = e => {
                e.stopPropagation();
                playSe("click");
                loadScene(choice.next);
            };
            choicesContainer.appendChild(btn);
        });
    }, 200);
}
