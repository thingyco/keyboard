// Character mappings for different styles (with uppercase support)
const styleMappings = {
  normal: {
    ...createIdentityMap('abcdefghijklmnopqrstuvwxyz'),
    ...createIdentityMap('ABCDEFGHIJKLMNOPQRSTUVWXYZ', true)
  },
  bold: {
    ...mapRange('a', 'z', i => String.fromCodePoint(0x1D41A + i)), // 𝐚–𝐳
    ...mapRange('A', 'Z', i => String.fromCodePoint(0x1D400 + i))  // 𝐀–𝐙
  },
  italic: {
    ...mapRange('a', 'z', i => String.fromCodePoint(0x1D48A + i)), // 𝑎–𝑧
    ...mapRange('A', 'Z', i => String.fromCodePoint(0x1D470 + i))  // 𝐴–𝑍
  },
  strikethrough: {
    ...Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map(ch => [ch, ch + '\u0336'])),
    ...Object.fromEntries('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(ch => [ch, ch + '\u0336']))
  },
  crazy: {
    ...mapRange('a', 'z', i => String.fromCodePoint(0x1F130 + i)), // 🅐–🅩
    ...mapRange('A', 'Z', i => String.fromCodePoint(0x1F130 + i))
  },
  tiny: {
    ...mapRange('a', 'e', i => ['ᵃ','ᵇ','ᶜ','ᵈ','ᵉ'][i]),
    'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ᶦ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ',
    'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'q': '۹', 'r': 'ʳ', 's': 'ˢ',
    't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
    ' ': ' '
  }
};

// Helper: Create map from char range
function mapRange(start, end, fn) {
  const map = {};
  for (let i = 0; i < 26; i++) {
    const ch = start === 'a' ? String.fromCharCode(97 + i) : String.fromCharCode(65 + i);
    map[ch] = fn(i);
  }
  return map;
}

// Identity map for normal (a-z and A-Z)
function createIdentityMap(chars, isUpper = false) {
  const map = {};
  for (const ch of chars) {
    map[ch.toLowerCase()] = isUpper ? ch.toUpperCase() : ch.toLowerCase();
  }
  return map;
}

// State
let currentStyle = 'normal';
let isCaps = false;
let isEmojiPanelVisible = false;

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
      if (key === '⌫' || key === '⇪') keyEl.classList.add('backspace');

      let displayChar, outputChar;

      if (key === '⇪') {
        displayChar = '⇪';
        outputChar = null;
        keyEl.style.fontWeight = 'bold';
        if (isCaps) keyEl.style.backgroundColor = '#007bff';
      } else if (key === '⌫') {
        displayChar = '⌫';
        outputChar = null;
      } else if (key === 'space') {
        displayChar = 'Space';
        outputChar = ' ';
        keyEl.classList.add('space');
      } else {
        const lower = key.toLowerCase();
        const upper = key.toUpperCase();
        if (isCaps && map[upper]) {
          displayChar = map[upper];
          outputChar = upper;
        } else {
          displayChar = map[lower] || lower;
          outputChar = lower;
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
        } else {
          const insertChar = isCaps && map[outputChar] ? map[outputChar] : map[outputChar.toLowerCase()] || outputChar;
          output.value += insertChar;
        }
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

// Clear button
clearBtn.addEventListener('click', () => {
  output.value = '';
  output.focus();
});

// Copy button
copyBtn.addEventListener('click', () => {
  if (output.value) {
    navigator.clipboard.writeText(output.value).then(() => {
      copyBtn.textContent = '✅ Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = '📋 Copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      alert('Failed to copy: ', err);
    });
  }
});

// Emoji button
emojiBtn.addEventListener('click', () => {
  isEmojiPanelVisible = !isEmojiPanelVisible;
  emojiPanel.classList.toggle('active', isEmojiPanelVisible);
});

// Insert emoji from panel
emojiPanel.addEventListener('click', (e) => {
  if (e.target.textContent.length === 1 || e.target.textContent.trim().length <= 2) {
    const emoji = e.target.textContent.trim();
    if (emoji) {
      output.value += emoji;
      output.focus();
    }
  }
});

// Physical keyboard input (real keyboard)
output.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return; // Ignore shortcuts

  setTimeout(() => {
    // Get what was just typed
    const lastChar = output.value.slice(-1);
    const code = lastChar.toLowerCase();
    const isUpper = lastChar === lastChar.toUpperCase() && lastChar !== lastChar.toLowerCase();

    if (/[a-z]/i.test(lastChar)) {
      e.preventDefault();
      output.value = output.value.slice(0, -1); // Remove plain char

      const map = styleMappings[currentStyle];
      const styledChar = isUpper && map[lastChar] ? map[lastChar] : map[code] || lastChar;
      output.value += styledChar;
    }
  }, 10);
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