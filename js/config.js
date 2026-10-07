// Konfigurasi Umum & Lingkungan
const mode = 'prod';
const IMG_PATH = mode === 'local' ? 'img/' : './img/';
const API_PATH = mode === 'local' ? 'http://127.0.0.1:8000/' : 'https://bangdream-api-nu.vercel.app/';

let currentLang = 'id';

// Kamus Multi-Bahasa
const languages = {
  id: {
    title: '「Ganso! BanG Dream!」<br>Tembakan Nada',
    instructions: 'Gerakkan karakter dengan mouse atau jari<br>Tahan layar untuk menembak nada!',
    startGame: 'Mulai Game',
    defeatMessage: 'Jangan menyerah, coba lagi!',
    retry: 'Coba Lagi',
    winMessage: 'Kamu Menang!',
    playAgain: 'Main Lagi',
    backToHome: 'Kembali ke Beranda',
    lives: 'Nyawa',
    score: 'Poin',
    version: 'Versi',
    updateTime: 'Waktu Pembaruan',
    contact: 'Hubungi Kami',
    submit: 'Kirim',
    close: 'Tutup',
    contactHolder: "Masukkan isi (maks 100 karakter). Jika ingin balasan, jangan lupa sertakan alamat email.",
    easy: 'Mudah',
    normal: 'Normal',
    hard: 'Sulit',
    endless: 'Mode Tanpa Akhir',
    gameTime: 'Waktu Bermain',
    mode: 'Mode',
    alertEmpty: 'Harap masukkan pesan',
    alertFrequent: 'Jangan mengirim terlalu sering',
    alertSuccess: 'Pengiriman berhasil!',
    alertError: 'Gagal mengirim. Silakan coba lagi nanti.',
    killScore: 'Skor Eliminasi',
    maxCombo: 'Kombo Maksimum',
    totalScore: 'Total Skor',
    level1: 'Level 1',
    level2: 'Level 2',
    scoreOrder: 'Urutkan Skor',
    rankOrder: 'Urutkan Level',
    leaderboard: 'Papan Peringkat',
    'leaderboard-desc': 'Diperbarui setiap 2 menit (Rekor di bawah 15 detik diabaikan)',
    noData: 'Tidak ada data peringkat',
    loadError: 'Gagal memuat. Silakan coba lagi nanti.',
    show_top: 'Top 30',
    show_best: 'Terbaik 30',
    show_recent: '30 Terakhir',
    show_myRank: 'Peringkat Saya',
    show_myBest: '30 Terbaik Saya',
    show_myRecent: '30 Terakhir Saya',
  },
  en: {
    title: 'GANSO! BanG Dream Chan<br>Note Shooter',
    instructions: 'Move mouse or finger to control character<br>Hold screen to shoot notes continuously!',
    startGame: 'Start Game',
    defeatMessage: "Don't give up, try again!",
    retry: 'Retry',
    winMessage: 'KIRAKIRA DOKIDOKI!',
    playAgain: 'Play Again',
    backToHome: 'Back to Home',
    lives: 'Lives',
    score: 'Score',
    version: 'Version',
    updateTime: 'Update time',
    contact: 'Contact Me',
    submit: 'Submit',
    close: 'Close',
    contactHolder: "Please enter your message (up to 100 characters). If you'd like a reply, don't forget to leave your email address.",
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    endless: 'Endless',
    gameTime: 'Duration',
    mode: 'Mode',
    alertEmpty: 'Please enter content',
    alertFrequent: 'Please do not submit frequently',
    alertSuccess: 'Successfully submitted!',
    alertError: 'Submission failed, please try again later',
    killScore: 'Kill Score',
    maxCombo: 'Max Combo',
    totalScore: 'Total Score',
    level1: 'Level 1',
    level2: 'Level 2',
    scoreOrder: 'By Score',
    rankOrder: 'By Level',
    leaderboard: 'Score Ranking',
    'leaderboard-desc': 'Updated every 2 minutes, games under 15 seconds not recorded',
    noData: 'No leaderboard data',
    loadError: 'Failed to load, please try again later',
    show_top: 'Top 30',
    show_best: 'Best 30',
    show_recent: 'Recent 30',
    show_myRank: 'My Rank',
    show_myBest: 'My Best 30',
    show_myRecent: 'My Recent 30',
  },
  ja: {
    title: '「元祖！バンドリちゃん」<br>ノートシューター',
    instructions: 'マウスや指で キャラクターを操作<br>画面を押し続けて ノートを連射！',
    startGame: 'ゲーム開始',
    defeatMessage: '諦めないで、もう一度！',
    retry: 'リトライ',
    winMessage: 'キラキラドキドキ！',
    playAgain: 'もう一度',
    backToHome: 'ホームに戻る',
    lives: 'ライフ',
    score: 'ポイント',
    version: 'バージョン',
    updateTime: '更新日時',
    contact: 'お問い合わせ',
    submit: '送信',
    close: '閉じる',
    contactHolder: "内容を入力してください（100文字以内）。返信をご希望の方は、メールアドレスを忘れずにご記入ください。",
    easy: '簡単',
    normal: '普通',
    hard: '難しい',
    endless: '無限モード',
    gameTime: 'ゲーム時間',
    mode: 'モード',
    alertEmpty: '内容を入力してください',
    alertFrequent: '頻繁に送信しないでください',
    alertSuccess: '送信が完了しました！',
    alertError: '送信に失敗しました。しばらくしてからもう一度お試しください',
    killScore: '撃破スコア',
    maxCombo: '最大コンボ',
    totalScore: '合計スコア',
    level1: 'ステージ 1',
    level2: 'ステージ 2',
    scoreOrder: 'スコア順',
    rankOrder: 'レベル順',
    leaderboard: 'ランキング',
    'leaderboard-desc': '2分毎に更新 (15秒未満の記録は除外)',
    noData: 'ランキングデータがありません',
    loadError: '読み込みに失敗しました。しばらくしてからもう一度お試しください',
    show_top: 'トップ 30',
    show_best: 'ベスト 30',
    show_recent: '最近30回',
    show_myRank: '自分の順位',
    show_myBest: '自分のベスト30',
    show_myRecent: '自分の最近30回',
  }
};

// Daftar Aset Gambar
const assets = {
  player1: 'player1.png',
  player2: 'player2.png',
  player3: 'player3.png',
  player4: 'player4.png',
  player5: 'player5.png',
  player6: 'player6.png',
  bear1: 'kuma1.png',
  bear2: 'kuma2.png',
  boss1: 'kkr1.png',
  boss2: 'kkr2.png',
  boss3: 'kkr3.png',
  boss4: 'kkr4.png',
  bullet1: 'bullet1.png',
  bullet2: 'bullet2.png',
  bullet3: 'bullet3.png',
  bullet4: 'bullet4.png',
  flash1: 'flash1.png',
  flash2: 'flash2.png',
  fire1: 'fire1.png',
  fire2: 'fire2.png',
  defeat1: 'defeat1.png',
  defeat2: 'defeat2.png',
  defeat3: 'defeat3.png',
  scoreIcon: 'kuma_icon.png',
  comboIcon: 'combo.png',
  win: 'win.png',
  defeat: 'defeat.png',
  chara1: 'chara1.png',
  chara2: 'chara2.png',
  chara3: 'chara3.png',
  blood: 'blood.png',
  fullcombo: 'full_combo.png',
  rank_sss: 'rank_sss.png',
  rank_ssp: 'rank_ssp.png',
  rank_ss: 'rank_ss.png',
  rank_sp: 'rank_sp.png',
  rank_s: 'rank_s.png',
  rank_ap: 'rank_ap.png',
  rank_a: 'rank_a.png',
  rank_bp: 'rank_bp.png',
  rank_b: 'rank_b.png',
  rank_cp: 'rank_cp.png',
  rank_c: 'rank_c.png',
  rank_d: 'rank_d.png',
};

const assetImages = {};

// Fungsi Pemuatan Gambar
function loadAssets(callback, onProgress, onError) {
  let loadedCount = 0;
  const totalCount = Object.keys(assets).length;

  function handleProgress() {
    loadedCount++;
    if (onProgress) onProgress(loadedCount, totalCount);
    if (loadedCount === totalCount) callback();
  }

  Object.entries(assets).forEach(([key, filename]) => {
    const img = new Image();
    img.src = IMG_PATH + filename;
    img.onload = handleProgress;
    img.onerror = () => {
      retryLoad(img, IMG_PATH + filename, 3, handleProgress, onError);
    };
    assetImages[key] = img;
  });
}

function retryLoad(img, src, retries, onSuccess, onError) {
  let attempts = 0;
  function tryAgain() {
    if (attempts >= retries) {
      if (onError) onError();
      return;
    }
    attempts++;
    setTimeout(() => {
      img.src = src + '?retry=' + attempts;
    }, 30 * attempts);
  }
  img.onerror = tryAgain;
  img.onload = onSuccess;
  tryAgain();
}

function loadData() {
  const loadingText = document.getElementById('loading-text');
  const progressBarFill = document.getElementById('loading-fill');
  const loadingLine = document.getElementById('loading-line');
  const scoreRank = document.getElementById('leaderboard-button');
  let hasError = false;

  loadAssets(
    () => {
      if (!hasError) {
        progressBarFill.style.width = '100%';
        setTimeout(() => {
          loadingLine.style.opacity = '0';
          loadingText.style.opacity = '0';
          setTimeout(() => {
            loadingLine.style.display = 'none';
            loadingText.style.display = 'none';
            scoreRank.style.display = 'block';
          }, 0);
        }, 400);
      }
    },
    (loaded, total) => {
      const percent = Math.round((loaded / total) * 100);
      loadingText.textContent = `Memuat... ${percent}%`;
      progressBarFill.style.width = `${percent}%`;
    },
    () => {
      if (!hasError) {
        hasError = true;
        loadingText.textContent += ' - Error';
      }
    }
  );
}

// In-Place Array Compaction untuk menghindari GC Stutters
function compactArray(arr) {
  let slow = 0;
  for (let fast = 0; fast < arr.length; fast++) {
    if (!arr[fast].markedForDeletion) {
      arr[slow++] = arr[fast];
    }
  }
  arr.length = slow;
}

function compactFinishedArray(arr) {
  let slow = 0;
  for (let fast = 0; fast < arr.length; fast++) {
    if (!arr[fast].isFinished()) {
      arr[slow++] = arr[fast];
    }
  }
  arr.length = slow;
}

function formatGameTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function roundTo2(num) {
  return Math.round((num * 100 + Number.EPSILON) * 100) / 100;
}

// Deteksi Bahasa Browser
const detectLanguage = () => {
  const lang = (navigator.language || navigator.userLanguage || 'id').toLowerCase();
  if (lang.startsWith('id')) return 'id';
  if (lang.startsWith('ja')) return 'ja';
  if (lang.startsWith('en')) return 'en';
  return 'id';
};

const updateLanguage = (lang) => {
  const texts = languages[lang] || languages.id;
  document.querySelectorAll('[data-text]').forEach(el => {
    const key = el.dataset.text;
    if (texts[key]) el.innerHTML = texts[key];
  });
  document.querySelectorAll('[data-placeholder]').forEach(el => {
    const key = el.dataset.placeholder;
    if (texts[key]) el.placeholder = texts[key];
  });
  document.title = texts.title.replace(/<br\s*\/?>/g, ' ');
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  const leaderboardSelects = ['lb-level', 'lb-difficulty', 'lb-order', 'lb-show'];
  leaderboardSelects.forEach(selectId => {
    const selectEl = document.getElementById(selectId);
    if (selectEl && selectEl.options) {
      Array.from(selectEl.options).forEach(option => {
        const key = option.dataset.text;
        if (key && texts[key]) option.text = texts[key];
      });
    }
  });
};

function setLanguage() {
  currentLang = detectLanguage();
  updateLanguage(currentLang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      updateLanguage(currentLang);
    });
  });
}

// Inisialisasi Gambar Awal
const setIndexImage = () => {
  const randomIndex = Math.floor(Math.random() * 10) + 1;
  const headerImg = document.getElementById('header-image');
  if (headerImg) headerImg.src = IMG_PATH + 'head' + randomIndex + '.jpg';
  const lbBtn = document.getElementById('leaderboard-button');
  if (lbBtn) lbBtn.src = IMG_PATH + 'score_rank.png';
};
