// Modul Audio & Musik
let menuMusic, battleMusic, endMusic;
let isMusicEnabled = false;
const audioPrefix = "./img/";
const musicFiles = [
  { id: "menu-music", file: "menu.mp3", loop: true },
  { id: "battle-music", file: "battle1.mp3", loop: true },
  { id: "end-music", file: "end.mp3", loop: true }
];

function createMusic() {
  const audioContainer = document.getElementById("audio-container");
  musicFiles.forEach(music => {
    const audio = document.createElement("audio");
    audio.id = music.id;
    audio.loop = music.loop;
    audio.preload = "auto";

    const source = document.createElement("source");
    source.src = `${audioPrefix}${music.file}`;
    source.type = "audio/mpeg";

    audio.appendChild(source);
    audioContainer.appendChild(audio);
  });
  initMusicControl();
}

const playMusic = (musicType) => {
  const currentMusic = getTargetMusic(musicType);
  if (currentMusic) {
    [menuMusic, battleMusic, endMusic].forEach(music => {
      if (music && music !== currentMusic) {
        music.pause();
        music.currentTime = 0;
      }
    });
    if (isMusicEnabled) {
      currentMusic.play().catch(e => console.log('Audio playback info:', e));
    }
  }
};

const getTargetMusic = (musicType) => {
  if (musicType === 'menu') return menuMusic;
  if (musicType === 'battle') return battleMusic;
  if (musicType === 'end') return endMusic;
  return null;
};

const updateMusicIcons = () => {
  const playIcons = document.querySelectorAll('[id$="-icon-play"]');
  const muteIcons = document.querySelectorAll('[id$="-icon-mute"]');

  playIcons.forEach(icon => {
    icon.style.display = isMusicEnabled ? 'none' : 'block';
  });
  muteIcons.forEach(icon => {
    icon.style.display = isMusicEnabled ? 'block' : 'none';
  });
};

const toggleMusic = () => {
  isMusicEnabled = !isMusicEnabled;
  updateMusicIcons();

  if (!isMusicEnabled) {
    [menuMusic, battleMusic, endMusic].forEach(music => {
      if (music) music.pause();
    });
  } else {
    if (gameState === 'playing') {
      playMusic('battle');
    } else if (typeof gameState !== 'undefined' && gameState === 'over') {
      const isGameOverScreen = (typeof startScreen !== 'undefined' && startScreen) ? startScreen.classList.contains('hidden') : false;
      if (isGameOverScreen) {
        playMusic('end');
      } else {
        playMusic('menu');
      }
    } else {
      playMusic('menu');
    }
  }
};

const initMusicControl = () => {
  menuMusic = document.getElementById('menu-music');
  battleMusic = document.getElementById('battle-music');
  endMusic = document.getElementById('end-music');

  const startBtnMusic = document.getElementById('music-control');
  const inGameBtnMusic = document.getElementById('game-music-control');

  if (startBtnMusic) startBtnMusic.addEventListener('click', toggleMusic);
  if (inGameBtnMusic) inGameBtnMusic.addEventListener('click', toggleMusic);
};
