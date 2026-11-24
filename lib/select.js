import { emitKeypressEvents } from 'node:readline';

// A minimal arrow-key menu, so the CLI stays dependency-free.
// Up/Down (or k/j) move, a number jumps to that choice, Enter confirms,
// Ctrl+C or Escape cancels with an AbortError.

const ansi = (code) => (text) => `\x1b[${code}m${text}\x1b[0m`;
const plain = (text) => text;
const visibleLength = (text) => text.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').length;

export function select({ message, choices, initial = 0, input = process.stdin, output = process.stdout }) {
  const color = output.isTTY && !('NO_COLOR' in process.env);
  const cyan = color ? ansi(36) : plain;
  const dim = color ? ansi(2) : plain;
  const bold = color ? ansi(1) : plain;
  const green = color ? ansi(32) : plain;

  return new Promise((resolve, reject) => {
    let index = initial;
    let rows = 0;
    const wasRaw = input.isRaw;

    // Count terminal rows, not lines, so redrawing stays correct when a
    // description wraps in a narrow window.
    const countRows = (lines) => {
      const width = output.columns || 80;
      return lines.reduce((sum, line) => sum + Math.max(1, Math.ceil(visibleLength(line) / width)), 0);
    };
    const clear = () => { if (rows) output.write(`\x1b[${rows}A\r\x1b[0J`); rows = 0; };
    const render = () => {
      clear();
      const lines = [
        `${cyan('?')} ${bold(message)} ${dim('(↑/↓ to move, Enter to confirm)')}`,
        ...choices.map((choice, i) => (i === index
          ? `${cyan('❯')} ${cyan(choice.label)}  ${dim(choice.description)}`
          : `  ${choice.label}  ${dim(choice.description)}`)),
      ];
      output.write(`${lines.join('\n')}\n`);
      rows = countRows(lines);
    };
    const finish = () => {
      input.off('keypress', onKey);
      if (input.isTTY) input.setRawMode(wasRaw);
      input.pause();
      output.write('\x1b[?25h');
      clear();
    };
    const onKey = (text, key = {}) => {
      const count = choices.length;
      if ((key.ctrl && key.name === 'c') || key.name === 'escape') {
        finish();
        const error = new Error('Cancelled; nothing was written.');
        error.name = 'AbortError';
        reject(error);
      } else if (key.name === 'return' || key.name === 'enter') {
        finish();
        output.write(`${green('✔')} ${bold(message)} ${cyan(choices[index].label)}\n`);
        resolve(choices[index].value);
      } else if (key.name === 'up' || key.name === 'k') {
        index = (index - 1 + count) % count;
        render();
      } else if (key.name === 'down' || key.name === 'j' || key.name === 'tab') {
        index = (index + 1) % count;
        render();
      } else if (/^[1-9]$/.test(text ?? '') && Number(text) <= count) {
        index = Number(text) - 1;
        render();
      }
    };

    emitKeypressEvents(input);
    if (input.isTTY) input.setRawMode(true);
    input.on('keypress', onKey);
    input.resume();
    output.write('\x1b[?25l');
    render();
  });
}
