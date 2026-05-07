
const API = 'http://localhost:8000/api/v1';
let history = [];

async function loadOrgs() {
    try {
        const res = await fetch(`${API}/public/organisations`);
        const {data}= await res.json();
        const sel = document.getElementById('org-select');
        if (!data.length) {
            sel.innerHTML = '<option value="">No organizations available</option>';
            return;
        }
        sel.innerHTML = '<option value="">Select an organization...</option>' +
            data.map(o => `<option value="${o.id}">${esc(o.name)}</option>`).join('');

        // Auto-select if only one
        if (data.length === 1) {
            sel.value = data[0].id;
            loadOrgFlags(data[0].id);
        }

        sel.addEventListener('change', () => {
            if (sel.value) loadOrgFlags(sel.value);
            document.getElementById('presets-row').style.display = 'none';
        });
    } catch { }
}

async function loadOrgFlags(orgId) {
    // We can't fetch flags without admin auth — show presets from history if any
    // This is the public-facing user app, no auth required
}

async function checkFlag() {
    const orgId = document.getElementById('org-select').value;
    const key = document.getElementById('feature-key').value.trim();

    if (!orgId) return showResult('error', '⚠️', 'Select an organization', 'Please choose an organization first.');
    if (!key) return showResult('error', '⚠️', 'Enter a feature key', 'Please enter a feature key to check.');

    const btn = document.getElementById('check-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Checking...';

    try {
        const res = await fetch(`${API}/public/feature-flags/check?orgId=${encodeURIComponent(orgId)}&key=${encodeURIComponent(key)}`);
        const data = await res.json();

        if (!res.ok) {
            showResult('error', '⚠️', 'Error', data.error || 'Request failed');
            addHistory(key, data.orgName || '?', 'unknown');
        } else if (!data.found) {
            showResult('not-found', '🔍', 'Flag Not Found',
                `Feature <span class="result-key">${esc(key)}</span> does not exist for <strong>${esc(data.orgName)}</strong>.`);
            addHistory(key, data.orgName, 'unknown');
        } else if (data.enabled) {
            showResult('enabled', '✅', 'Feature Enabled',
                `<span class="result-key">${esc(key)}</span> is <strong>active</strong> for <strong>${esc(data.orgName)}</strong>.`);
            addHistory(key, data.orgName, 'on');
        } else {
            showResult('disabled', '🚫', 'Feature Disabled',
                `<span class="result-key">${esc(key)}</span> is currently <strong>off</strong> for <strong>${esc(data.orgName)}</strong>.`);
            addHistory(key, data.orgName, 'off');
        }
    } catch {
        showResult('error', '⚠️', 'Connection Error', 'Cannot reach the server. Is the backend running?');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Check Feature';
    }
}

function showResult(type, icon, status, detail) {
    const box = document.getElementById('result-box');
    box.className = `result ${type} pop-in`;
    box.style.display = 'block';
    document.getElementById('result-icon').textContent = icon;
    document.getElementById('result-status').textContent = status;
    document.getElementById('result-detail').innerHTML = detail;
}

function addHistory(key, orgName, state) {
    history.unshift({ key, orgName, state, time: new Date() });
    if (history.length > 5) history.pop();
    renderHistory();
}

function renderHistory() {
    const sec = document.getElementById('history-section');
    const list = document.getElementById('history-list');
    if (!history.length) { sec.style.display = 'none'; return; }
    sec.style.display = 'block';
    list.innerHTML = history.map(h => `
      <div class="history-item">
        <div class="history-dot ${h.state}"></div>
        <div class="history-key">${esc(h.key)}</div>
        <div class="history-org">${esc(h.orgName)}</div>
        <div class="history-time">${h.time.toLocaleTimeString()}</div>
      </div>
    `).join('');
}

function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Enter key
document.getElementById('feature-key').addEventListener('keydown', e => {
    if (e.key === 'Enter') checkFlag();
});

loadOrgs();
