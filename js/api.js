// Modul API & Komunikasi Backend

let playerId = null;
function getPlayerId() {
  if (playerId) return playerId;
  playerId = localStorage.getItem('playerId');
  return playerId && playerId.length > 0 ? playerId : "";
}

// Logika Modal Username
function initUsernameModal() {
  const usernameModal = document.getElementById('username-modal');
  const usernameInput = document.getElementById('custom-username-input');
  const saveUsernameBtn = document.getElementById('save-username-btn');

  if (!usernameModal || !usernameInput || !saveUsernameBtn) return;

  const storedName = localStorage.getItem("bd_username");
  if (storedName) {
    usernameModal.style.display = 'none';
    usernameInput.value = storedName;
  } else {
    usernameModal.style.display = 'flex';
  }

  saveUsernameBtn.addEventListener('click', () => {
    let inputName = usernameInput.value.trim();
    if (!inputName) {
      inputName = "Guest_" + Math.floor(Math.random() * 1000);
    }
    localStorage.setItem("bd_username", inputName);
    usernameModal.style.display = 'none';
  });
}

// Statistik Kunjungan Online
async function sendStat() {
  const from = document.referrer;
  const width = window.outerWidth;
  const height = window.outerHeight;
  let currentPid = getPlayerId();
  try {
    const res = await fetch(API_PATH + 'openStat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, width, height, playerId: currentPid })
    });
    const data = await res.json();
    if (data.online !== undefined) {
      const onlineEl = document.getElementById('online-count');
      if (onlineEl) onlineEl.textContent = `Online: ${data.online}`;
    }
    if (data.playerId) {
      localStorage.setItem("playerId", data.playerId);
      playerId = data.playerId;
      currentPid = data.playerId;
    }
    const myIdEl = document.getElementById('my-id');
    if (myIdEl) myIdEl.textContent = `ID: ${currentPid}`;
  } catch (e) {
    // Abaikan status error saat offline
  }
}

// Mengirim statistik hasil permainan
async function gameStat(pid, levels, difficulty, fps, win, ranks, duration, kumaKill, kumaLive,
                  maxCombo, life, lifeLost, bossRatio, bulletRatio, itemRatio, finalScore) {
  const currentUsername = localStorage.getItem("bd_username") || "Guest";
  try {
    fetch(API_PATH + 'gameStat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: pid, 
        username: currentUsername,
        levels, difficulty, fps, win, ranks, duration, kumaKill, kumaLive,
        maxCombo, life, lifeLost, bossRatio, bulletRatio, itemRatio, finalScore
      })
    });
  } catch (e) {
    // Abaikan error jaringan statistik
  }
}

// Papan Peringkat
let leaderboardData = null;

async function loadLeaderboard(levels, difficulty, type, pid) {
  const listEl = document.getElementById('leaderboard-list');
  if (!listEl) return;
  listEl.innerHTML = '<div class="loading-spinner"></div>';
  try {
    let prefix = API_PATH + 'getRanking';
    if (type === 'myRank') prefix = API_PATH + 'getMyRanking';
    const url = `${prefix}?levels=${levels}&difficulty=${difficulty}&type=${type}&playerId=${pid}`;
    const response = await fetch(url);
    const data = await response.json();
    leaderboardData = data.data;
    renderLeaderboard();
  } catch (e) {
    const texts = languages[currentLang];
    listEl.innerHTML = `<div class="empty-leaderboard">${texts.loadError}</div>`;
  }
}

function renderLeaderboard() {
  const listEl = document.getElementById('leaderboard-list');
  const orderSelect = document.getElementById('lb-order');
  const orderType = orderSelect ? orderSelect.value : 'score';
  const currentPlayerId = getPlayerId();

  if (!listEl) return;

  if (!leaderboardData || leaderboardData.length === 0) {
    const texts = languages[currentLang];
    listEl.innerHTML = `<div class="empty-leaderboard">${texts.noData}</div>`;
    return;
  }

  const texts = languages[currentLang];
  let sortedData = [...leaderboardData];

  if (orderType === 'rank') {
    const rankOrder = ['sss', 'ssp', 'ss', 'sp', 's', 'ap', 'a', 'bp', 'b', 'cp', 'c', 'd'];
    sortedData.sort((a, b) => {
      const rankA = a.ranks ? a.ranks.toLowerCase() : 'z';
      const rankB = b.ranks ? b.ranks.toLowerCase() : 'z';
      const indexA = rankOrder.indexOf(rankA);
      const indexB = rankOrder.indexOf(rankB);

      if (indexA === indexB) return (b.final_score || 0) - (a.final_score || 0);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }

  listEl.innerHTML = sortedData.map(item => {
    const rank = item.user_rank;
    const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';
    const displayName = `${item.player_id || 'Unknown'}`;
    const createTime = `${item.create_time || ''}`;
    const timeStr = Math.floor(item.duration / 60) + ':' + (item.duration % 60).toString().padStart(2, '0');
    const rankIcon = item.ranks ? `<img src="${IMG_PATH}rank_${item.ranks.toLowerCase()}.png" style="height: 40px; margin-right: 8px;">` : '';
    const fullComboIcon = (item.full_combo === 1) ? `<img src="${IMG_PATH}full_combo.png" style="height: 20px;">` : '';
    const isCurrentUser = currentPlayerId && item.player_id === currentPlayerId;
    const highlightClass = isCurrentUser ? ' highlight' : '';

    return `
      <div class="leaderboard-item${highlightClass}">
        <div class="leaderboard-rank ${rankClass}">${rank}</div>
        <div class="leaderboard-info">
          <div class="leaderboard-name">${displayName} <span style="font-size: 12px; color: rgba(255, 255, 255, 0.8);">${createTime}</span></div>
          <div class="leaderboard-details">
            <span>${texts.maxCombo}: ${item.max_combo}</span>
            <span>${texts.gameTime}: ${timeStr}</span>
            <span>${fullComboIcon}</span>
          </div>
        </div>
        <div class="leaderboard-score">
          ${rankIcon}${item.final_score}
        </div>
      </div>
    `;
  }).join('');
}

function initLeaderboard() {
  const leaderboard = document.getElementById('leaderboard');
  const btn = document.getElementById('leaderboard-button');
  const closeBtn = document.getElementById('leaderboard-close');
  const levelSelect = document.getElementById('lb-level');
  const difficultySelect = document.getElementById('lb-difficulty');
  const orderSelect = document.getElementById('lb-order');
  const showSelect = document.getElementById('lb-show');

  if (!leaderboard || !btn) return;

  btn.onclick = async () => {
    const pid = getPlayerId();
    levelSelect.value = document.getElementById('level-selector').value;
    difficultySelect.value = currentDifficulty;
    showSelect.value = 'top';
    leaderboard.style.display = 'flex';
    await loadLeaderboard(levelSelect.value, difficultySelect.value, showSelect.value, pid);
  };

  if (closeBtn) {
    closeBtn.onclick = () => { leaderboard.style.display = 'none'; };
  }

  if (levelSelect && difficultySelect && showSelect) {
    levelSelect.onchange = difficultySelect.onchange = showSelect.onchange = () => {
      loadLeaderboard(levelSelect.value, difficultySelect.value, showSelect.value, getPlayerId());
    };
  }

  if (orderSelect) {
    orderSelect.onchange = () => { renderLeaderboard(); };
  }

  leaderboard.onclick = (e) => {
    if (e.target === leaderboard) leaderboard.style.display = 'none';
  };
}
