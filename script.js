// Helper function — must be defined BEFORE use
function mapRange(start, end, fn) {
  const map = {};
  const base = start === 'a' ? 97 : 65; // 'a' = 97, 'A' = 65
  for (let i = 0; i < 26; i++) {
    const ch = String.fromCharCode(base + i);
    map[ch] = fn(i);
  }
  return map;
}

// Character mappings — now properly support uppercase variants
const styleMappings = {
  normal: {
    ...Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map(ch => [ch, ch])),
    ...Object.fromEntries('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(ch => [ch, ch]))
  },
  bold: {
    ...Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map((ch, i) => [ch, String.fromCodePoint(0x1D41A + i)])), // 𝐚–𝐳
    ...Object.fromEntries('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((ch, i) => [ch, String.fromCodePoint(0x1D400 + i)]))  // 𝐀–𝐙
  },
  italic: {
    ...Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map((ch, i) => [ch, String.fromCodePoint(0x1D48A + i)])), // 𝑎–𝑧
    ...Object.fromEntries('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((ch, i) => [ch, String.fromCodePoint(0x1D470 + i)]))  // 𝐼–𝐾
  },
  bolditalic: {
    ...mapRange('a', 'z', i => String.fromCodePoint(0x1D442 + i)), // 𝒂–𝒛
    ...mapRange('A', 'Z', i => String.fromCodePoint(0x1D428 + i))  // 𝑨–𝒁
  },
  strikethrough: {
    ...Object.fromEntries('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(ch => [ch, ch + '\u0336']))
  },
  crazy: {
    ...Object.fromEntries('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((ch, i) => {
      const code = 0x1F130 + (ch.toLowerCase().charCodeAt(0) - 97);
      return [ch, String.fromCodePoint(code)];
    }))
  },
  tiny: {
    'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
    'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ᶦ', 'j': 'ʲ',
    'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ',
    'p': 'ᵖ', 'q': '۹', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ',
    'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
    ' ': ' '
  }
};

// State
let currentStyle = 'normal';
let isCaps = false;
let isEmojiPanelVisible = false;

// DOM Elements
const output = document.getElementById('output');
const keyboard = document.getElementById('keyboard');
const tabs = document.querySelectorAll('.tab');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPanel = document.getElementById('emojiPanel');

// Keyboard layout
const keyboardLayout = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['⇪', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
  [' ', 'space']
];

// Render keyboard
function renderKeyboard() {
  keyboard.innerHTML = '';
  const map = styleMappings[currentStyle];

  keyboardLayout.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row';

    row.forEach(key => {
      const keyEl = document.createElement('div');
      keyEl.className = 'key';

      if (key === ' ') keyEl.classList.add('space');
      if (['⌫', '⇪'].includes(key)) keyEl.classList.add('backspace');

      let displayChar = '';
      let outputChar = null;

      if (key === '⇪') {
        displayChar = '⇪';
        keyEl.style.fontWeight = 'bold';
        if (isCaps) keyEl.style.backgroundColor = '#007bff';
      } else if (key === '⌫') {
        displayChar = '⌫';
      } else if (key === 'space') {
        displayChar = 'Space';
        outputChar = ' ';
        keyEl.classList.add('space');
      } else {
        const lower = key.toLowerCase();
        const upper = key.toUpperCase();

        if (isCaps && currentStyle !== 'tiny') {
          displayChar = map[upper] || upper;
          outputChar = upper;
        } else {
          displayChar = map[lower] || lower;
          outputChar = lower;
        }

        if (currentStyle === 'normal') {
          displayChar = isCaps ? upper : lower;
        }
      }

      keyEl.textContent = displayChar;

      keyEl.addEventListener('click', () => {
        if (key === '⌫') {
          output.value = output.value.slice(0, -1);
        } else if (key === '⇪') {
          isCaps = !isCaps;
          renderKeyboard();
        } else if (key === 'space') {
          output.value += ' ';
        } else if (outputChar) {
          let charToInsert;
          if (currentStyle === 'tiny') {
            charToInsert = map[outputChar] || outputChar;
          } else {
            const finalKey = isCaps ? outputChar.toUpperCase() : outputChar.toLowerCase();
            charToInsert = map[finalKey] || finalKey;
          }
          output.value += charToInsert;
        }
        output.focus();
      });

      rowDiv.appendChild(keyEl);
    });

    keyboard.appendChild(rowDiv);
  });
}

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentStyle = tab.dataset.style;
    isCaps = false;
    renderKeyboard();
  });
});

// Clear
clearBtn.addEventListener('click', () => {
  output.value = '';
  output.focus();
});

// Copy
copyBtn.addEventListener('click', () => {
  if (output.value.trim()) {
    navigator.clipboard.writeText(output.value).then(() => {
      copyBtn.textContent = '✅ Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = '📋 Copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    }).catch(() => alert('Copy failed. Please copy manually.'));
  }
});

// Emoji toggle
emojiBtn.addEventListener('click', () => {
  isEmojiPanelVisible = !isEmojiPanelVisible;
  emojiPanel.classList.toggle('active', isEmojiPanelVisible);
});

// Insert emoji
emojiPanel.addEventListener('click', (e) => {
  const text = e.target.textContent.trim();
  if (text.length > 0 && text.length <= 2) {
    output.value += text;
    output.focus();
  }
});

// Physical keyboard input
output.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.key === 'Backspace') {
    setTimeout(() => {
      // Let default happen
    }, 10);
    return;
  }

  if (/[a-zA-Z]/.test(e.key)) {
    e.preventDefault();
    const lower = e.key.toLowerCase();
    const upper = e.key.toUpperCase();
    const map = styleMappings[currentStyle];
    const keyToUse = isCaps ? upper : lower;
    const charToInsert = currentStyle === 'tiny' ? map[lower] || lower : map[keyToUse] || keyToUse;
    output.value += charToInsert;
  }
});

// Close emoji panel when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.actions') && !e.target.closest('.emoji-panel')) {
    emojiPanel.classList.remove('active');
    isEmojiPanelVisible = false;
  }
});

// Initialize
renderKeyboard();
output.focus();