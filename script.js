// ── State ──────────────────────────────────────────────────────────────────
let rows = 5;
let cols = 2;
let headerType = 'first-col';
let tableData = [];

// ── Data helpers ───────────────────────────────────────────────────────────

function initTableData(r, c) {
  return Array.from({ length: r }, () => Array(c).fill(''));
}

// Create or resize table, preserving existing cell content
function createTable(newRows, newCols) {
  tableData = Array.from({ length: newRows }, (_, i) =>
    Array.from({ length: newCols }, (_, j) =>
      tableData[i]?.[j] ?? ''
    )
  );
  rows = newRows;
  cols = newCols;

  document.getElementById('rowCount').value = rows;
  document.getElementById('colCount').value = cols;

  renderPreview();
  generateHTML();
}

// ── Render ─────────────────────────────────────────────────────────────────

function renderPreview() {
  const table = document.getElementById('tablePreview');
  table.innerHTML = '';

  for (let i = 0; i < rows; i++) {
    const tr = document.createElement('tr');

    for (let j = 0; j < cols; j++) {
      const isHeader =
        (headerType === 'first-row' && i === 0) ||
        (headerType === 'first-col' && j === 0);

      const cell = document.createElement(isHeader ? 'th' : 'td');
      cell.contentEditable = 'true';
      cell.textContent = tableData[i][j];

      // Sync edits back to state and regenerate output
      cell.addEventListener('input', () => {
        tableData[i][j] = cell.textContent;
        generateHTML();
      });

      // Strip rich-text on paste — plain text only
      cell.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain').replace(/\n/g, ' ');
        document.execCommand('insertText', false, text);
      });

      // Prevent newlines inside cells
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') e.preventDefault();
      });

      tr.appendChild(cell);
    }

    table.appendChild(tr);
  }
}

// ── HTML generation ────────────────────────────────────────────────────────

function generateHTML() {
  const lines = ['<table>'];

  if (headerType === 'first-row') {
    lines.push('  <thead>', '    <tr>');
    for (let j = 0; j < cols; j++) {
      lines.push(`      <th>${esc(tableData[0][j])}</th>`);
    }
    lines.push('    </tr>', '  </thead>');

    if (rows > 1) {
      lines.push('  <tbody>');
      for (let i = 1; i < rows; i++) {
        lines.push('    <tr>');
        for (let j = 0; j < cols; j++) {
          lines.push(`      <td>${esc(tableData[i][j])}</td>`);
        }
        lines.push('    </tr>');
      }
      lines.push('  </tbody>');
    }
  } else {
    lines.push('  <tbody>');
    for (let i = 0; i < rows; i++) {
      lines.push('    <tr>');
      for (let j = 0; j < cols; j++) {
        if (headerType === 'first-col' && j === 0) {
          lines.push(`      <th scope="row">${esc(tableData[i][j])}</th>`);
        } else {
          lines.push(`      <td>${esc(tableData[i][j])}</td>`);
        }
      }
      lines.push('    </tr>');
    }
    lines.push('  </tbody>');
  }

  lines.push('</table>');
  document.getElementById('htmlOutput').value = lines.join('\n');
}

function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Copy ───────────────────────────────────────────────────────────────────

function copyHTML() {
  const btn = document.getElementById('copyBtn');
  const text = document.getElementById('htmlOutput').value;

  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy HTML';
      btn.classList.remove('copied');
    }, 1500);
  }).catch(() => {
    // Fallback for environments without clipboard API
    const ta = document.getElementById('htmlOutput');
    ta.select();
    document.execCommand('copy');
  });
}

// ── Event listeners ────────────────────────────────────────────────────────

function setupEventListeners() {
  document.getElementById('addRow').addEventListener('click', () => createTable(rows + 1, cols));
  document.getElementById('removeRow').addEventListener('click', () => createTable(Math.max(1, rows - 1), cols));
  document.getElementById('addCol').addEventListener('click', () => createTable(rows, cols + 1));
  document.getElementById('removeCol').addEventListener('click', () => createTable(rows, Math.max(1, cols - 1)));

  document.getElementById('rowCount').addEventListener('change', (e) => {
    createTable(Math.max(1, parseInt(e.target.value, 10) || 1), cols);
  });

  document.getElementById('colCount').addEventListener('change', (e) => {
    createTable(rows, Math.max(1, parseInt(e.target.value, 10) || 1));
  });

  document.querySelectorAll('input[name="headerType"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      headerType = e.target.value;
      renderPreview();
      generateHTML();
    });
  });

  document.getElementById('copyBtn').addEventListener('click', copyHTML);
}

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  tableData = initTableData(rows, cols);
  setupEventListeners();
  renderPreview();
  generateHTML();
});
