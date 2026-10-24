// CONFIGURATION
const CORRECT_PIN = "25102002"; // Secret Passcode (Birth Date)
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mljjdqey";

// GLOBAL RESPONSE DATA LOG
let responseData = {
    quizAnswers: [],
    preEmotion: "",
    postEmotion: "",
    finalEmotion: "",
    reactions: {},
    comments: "",
    skyWish: "",
    timestamp: new Date().toLocaleString()
};

// MEMORY WALL DATA & LOGIC
const memoriesData = [
    { img: "photo1.jpg", caption: "See how happy we are. It's so beautiful together." },
    { img: "photo2.jpg", caption: "See how cute we are looking." },
    { img: "photo3.jpg", caption: "See, this is the beautiful family I have ever seen. This is so good. I wish to be a part of it." },
    { img: "photo4.jpg", caption: "Haha, see, I was like waiting for the lift. Not so. It's not true. I was waiting for your reply." },
    { img: "photo5.jpg", caption: "See this grown handsome man. Damn good, damn good. You're looking so handsome." },
    { img: "photo6.jpg", caption: "See, this is your birthday pic. Remember 2024 birthday. I think that's the finest day in my life." },
    { img: "photo7.jpg", caption: "Look how you are looking at me. It gives me blush whenever I see this photo." },
    { img: "photo8.jpg", caption: "I miss those days, like these are all the days we spend time together, like it's so rare nowadays. See how we are looking at each other." },
    { img: "photo9.jpg", caption: "Look at the attitude you have, it suits you so well. You're damn handsome." },
    { img: "photo10.jpg", caption: "Remember the days I come to visit you." }
];

let activeMemoryIndex = 0;

function openMemoryModal(index) {
    activeMemoryIndex = index;
    updateModalContent();
    document.getElementById('memory-modal').classList.remove('hidden');
    document.getElementById('memory-modal').classList.add('flex');
    playTone(523.25, 0.2);
}

function closeMemoryModal() {
    document.getElementById('memory-modal').classList.add('hidden');
    document.getElementById('memory-modal').classList.remove('flex');
}

function updateModalContent() {
    const mem = memoriesData[activeMemoryIndex];
    document.getElementById('modal-img').src = mem.img;
    document.getElementById('modal-caption').innerText = mem.caption;
    document.getElementById('modal-counter').innerText = `${activeMemoryIndex + 1} / ${memoriesData.length}`;

    const existingReaction = responseData.reactions[`photo${activeMemoryIndex + 1}`] || "";
    document.getElementById('modal-reaction-status').innerText = existingReaction ? `Reacted: ${existingReaction}` : "";
}

function nextMemory() {
    activeMemoryIndex = (activeMemoryIndex + 1) % memoriesData.length;
    updateModalContent();
    playTone(659.25, 0.15);
}

function prevMemory() {
    activeMemoryIndex = (activeMemoryIndex - 1 + memoriesData.length) % memoriesData.length;
    updateModalContent();
    playTone(440.0, 0.15);
}

function reactToCurrentModal(emoji) {
    const photoId = `photo${activeMemoryIndex + 1}`;
    responseData.reactions[photoId] = emoji;
    document.getElementById('modal-reaction-status').innerText = `Reacted: ${emoji}`;
    playTone(880.0, 0.2);
}

// QUIZ DATA
const quizQuestions = [
    { q: "1. Who takes longer to reply to messages?", options: ["You", "Me", "Both equally"] },
    { q: "2. Who is the better cook?", options: ["You", "Me", "Ordering food wins"] },
    { q: "3. What is our ultimate comfort activity?", options: ["Late night drives", "Bingeing shows", "Eating good food"] },
    { q: "4. Who is more dramatic?", options: ["Definitely You", "Definitely Me", "100% Equal"] },
    { q: "5. Guess how many days we've been connected?", options: ["Hundreds!", "Thousands!", "Lost count!"] },
    { q: "6. Who falls asleep first during movie night?", options: ["You", "Me", "Neither!"] },
    { q: "7. Who makes the decisions on where to eat?", options: ["You", "Me", "We argue for 1 hour first"] },
    { q: "8. What is my favorite thing about you?", options: ["Your laugh", "Your kindness", "Everything!"] },
    { q: "9. Who is more likely to buy useless cute things?", options: ["You", "Me", "Both of us"] },
    { q: "10. Are you ready for your main birthday surprise?", options: ["YES!", "ABSOLUTELY!", "100% READY!"] }
];

let currentQuizIndex = 0;

// WEB AUDIO SYNTHESIS
let audioCtx = null;
let isMusicPlaying = false;
let musicInterval = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTone(freq, duration, type = 'sine') {
    initAudio();
    try {
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function toggleMusic() {
    initAudio();
    isMusicPlaying = !isMusicPlaying;
    document.getElementById('music-status').innerText = isMusicPlaying ? "ON" : "OFF";
    if (isMusicPlaying) {
        const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00];
        let i = 0;
        musicInterval = setInterval(() => {
            playTone(notes[i % notes.length], 1.2, 'sine');
            i++;
        }, 1400);
    } else {
        clearInterval(musicInterval);
    }
}

// NAVIGATION
function goToPage(pageNum) {
    document.querySelectorAll('.page-step').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${pageNum}`);
    if (target) target.classList.add('active');
    if (pageNum === 3) loadQuizQuestion();
    if (pageNum === 9) initScratchCard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// PASSCODE CHECK
function checkPasscode() {
    const val = document.getElementById('passcode-input').value.trim();
    if (val === CORRECT_PIN || CORRECT_PIN === "") {
        playTone(523.25, 0.3);
        goToPage(3);
    } else {
        document.getElementById('pin-error').classList.remove('hidden');
        playTone(150.0, 0.4, 'sawtooth');
    }
}

// QUIZ LOGIC
function loadQuizQuestion() {
    const q = quizQuestions[currentQuizIndex];
    document.getElementById('quiz-progress').innerText = `Question ${currentQuizIndex + 1} / ${quizQuestions.length}`;
    document.getElementById('quiz-question').innerText = q.q;
    const optsContainer = document.getElementById('quiz-options');
    optsContainer.innerHTML = "";
    q.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = "w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium transition";
        btn.innerText = opt;
        btn.onclick = () => {
            responseData.quizAnswers[currentQuizIndex] = opt;
            playTone(440.0, 0.2);
            nextQuizQuestion();
        };
        optsContainer.appendChild(btn);
    });
}

function nextQuizQuestion() {
    currentQuizIndex++;
    if (currentQuizIndex < quizQuestions.length) {
        loadQuizQuestion();
    } else {
        goToPage(4);
    }
}

// EMOTION SELECTION
function selectEmotion(type, val) {
    playTone(523.25, 0.2);
    if (type === 'pre') {
        responseData.preEmotion = val;
        goToPage(5);
    } else if (type === 'post') {
        responseData.postEmotion = val;
        goToPage(7);
    } else if (type === 'final') {
        responseData.finalEmotion = val;
    }
}

// CANDLE BLOW
function blowCandle() {
    document.getElementById('flame').style.opacity = '0';
    document.getElementById('candle-status').innerText = "Happy Birthday! Candle blown!";
    document.getElementById('cake-next-btn').classList.remove('hidden');
    playTone(587.33, 0.5);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
}

function saveGalleryComments() {
    responseData.comments = document.getElementById('gallery-comment').value;
}

// ENVELOPES & REASON JAR
function openEnvelope(title, msg) {
    alert(`${title}\n\n${msg}`);
    playTone(349.23, 0.3);
}

const reasons = [
    "Your smile brightens up any room instantly.",
    "You are deeply kind and care for everyone around you.",
    "Your hilarious sense of humor never fails to make me laugh.",
    "You are resilient, strong, and truly inspiring.",
    "Just being around you feels like home."
];

function drawReason() {
    const randReason = reasons[Math.floor(Math.random() * reasons.length)];
    document.getElementById('jar-text').innerText = randReason;
    playTone(523.25, 0.3);
}

// SCRATCH CARD
let scratchInitialized = false;
function initScratchCard() {
    const canvas = document.getElementById('scratch-canvas');
    if (!canvas || scratchInitialized) return;
    scratchInitialized = true;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText("Scratch here with mouse/finger!", canvas.width / 2, canvas.height / 2);

    let isDrawing = false;
    function scratch(e) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('touchstart', () => isDrawing = true);
    canvas.addEventListener('touchend', () => isDrawing = false);
    canvas.addEventListener('touchmove', scratch);
}

// SKY LANTERN
function releaseLantern() {
    const val = document.getElementById('sky-wish-input').value.trim();
    if (val) {
        responseData.skyWish = val;
        alert('🏮 Your sky lantern has been released into the night sky!');
        playTone(880.0, 0.6);
    } else {
        alert('Please enter a wish first!');
    }
}

// VINTAGE LETTER & FLYING HEARTS
function openVintageLetter() {
    const closedEnv = document.getElementById('closed-envelope');
    const openedLet = document.getElementById('opened-letter');
    closedEnv.classList.add('hidden');
    openedLet.classList.remove('hidden');
    setTimeout(() => {
        openedLet.classList.remove('scale-95', 'opacity-0');
        openedLet.classList.add('scale-100', 'opacity-100');
    }, 50);
    createFlyingHearts();
}

function createFlyingHearts() {
    const container = document.getElementById('hearts-container');
    if (!container) return;
    const hearts = ['💖', '💕', '💗', '💓', '✨'];
    for (let i = 0; i < 25; i++) {
        const heart = document.createElement('div');
        heart.innerText = hearts[Math.floor(Math.random() * hearts.length)];
        heart.className = 'absolute text-2xl md:text-3xl transition-all duration-1000 ease-out pointer-events-none';
        heart.style.left = `calc(50% + ${(Math.random() - 0.5) * 120}px)`;
        heart.style.top = `calc(50% + ${(Math.random() - 0.5) * 60}px)`;
        heart.style.opacity = '1';
        container.appendChild(heart);

        setTimeout(() => {
            const xOffset = (Math.random() - 0.5) * 350;
            const yOffset = -(180 + Math.random() * 250);
            heart.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(${1 + Math.random() * 0.8}) rotate(${(Math.random() - 0.5) * 60}deg)`;
            heart.style.opacity = '0';
        }, 50);

        setTimeout(() => { heart.remove(); }, 1200);
    }
}

// SUBMIT DATA TO FORMSPREE
function submitFinalData() {
    const status = document.getElementById('submit-status');
    status.innerText = "Sending your responses...";
    responseData.timestamp = new Date().toLocaleString();

    fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            _subject: "💖 Birthday Website Activity Log & Reaction!",
            ...responseData
        })
    }).then(res => {
        if (res.ok) {
            status.innerText = "✨ Responses sent successfully to Creator email!";
        } else {
            status.innerText = "Saved locally! (Check Formspree configuration if email fails)";
        }
        document.getElementById('creator-content').innerText = JSON.stringify(responseData, null, 2);
    }).catch(err => {
        status.innerText = "Network error. Saved locally!";
        document.getElementById('creator-content').innerText = JSON.stringify(responseData, null, 2);
    });
}

// TIME COUNTER TICKER (Start Date: October 25, 2002)
setInterval(() => {
    const startDate = new Date("2002-10-25T00:00:00");
    const now = new Date();
    const diff = now - startDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    
    const el = document.getElementById('time-counter');
    if (el) el.innerText = `${days} Days, ${hours} Hours, ${mins} Mins, ${secs} Secs`;
}, 1000);

// CREATOR DASHBOARD MODAL TRIGGER
let logoClicks = 0;
function handleLogoClick() {
    logoClicks++;
    if (logoClicks >= 3) {
        document.getElementById('creator-modal').classList.remove('hidden');
        document.getElementById('creator-modal').classList.add('flex');
        document.getElementById('creator-content').innerText = JSON.stringify(responseData, null, 2);
        logoClicks = 0;
    }
}

function closeCreatorModal() {
    document.getElementById('creator-modal').classList.add('hidden');
    document.getElementById('creator-modal').classList.remove('flex');
}

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        handleLogoClick();
        handleLogoClick();
        handleLogoClick();
    }
});

// BACKGROUND STARDUST CANVAS ANIMATION
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

for (let i = 0; i < 50; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        alpha: Math.random(),
        speed: Math.random() * 0.5 + 0.1
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.y -= p.speed;
        if (p.y < 0) p.y = canvas.height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();
