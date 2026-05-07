
  const API = 'http://localhost:8000/api/v1';
  let token = null, currentUser = null;

  // ── Tab switching
  function switchTab(tab) {
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
    document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('signup-form').style.display = tab === 'signup' ? 'block' : 'none';
    if (tab === 'signup') loadOrgOptions();
  }

  async function loadOrgOptions() {
    try {
      const res = await fetch(`${API}/public/organisations`);
      const{ data} = await res.json();
      const sel = document.getElementById('signup-org');
      if (!data.length) {
        sel.innerHTML = '<option value="">No organizations available</option>';
        return;
      }
      sel.innerHTML = '<option value="">Select your organization...</option>' +
        data.map(o => `<option value="${o.id}">${esc(o.name)}</option>`).join('');
    } catch { }
  }

  // ── Auth
  async function doLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    hideEl('login-error');
    try {
      const res = await fetch(`${API}/auth/admin/login`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return showAlert('login-error', data.error);
      setSession(data);
      showDashboard();
      
    } catch { showAlert('login-error', 'Cannot connect to server. Is the backend running?'); }
  }

  async function doSignup() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const organizationId = document.getElementById('signup-org').value;
    hideEl('signup-error'); hideEl('signup-success');
    if (!name || !email || !password || !organizationId) {
      return showAlert('signup-error', 'All fields are required');
    }
    if (password.length < 6) return showAlert('signup-error', 'Password must be at least 6 characters');
    try {
      const res = await fetch(`${API}/auth/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, organizationId })
      });
      const data = await res.json();
      if (!res.ok) return showAlert('signup-error', data.error);
      showAlert('signup-success', 'Account created! Signing you in...');
      setTimeout(() => { setSession(data); showDashboard(); }, 1000);
    } catch { showAlert('signup-error', 'Cannot connect to server. Is the backend running?'); }
  }

  function doLogout() {
    token = null; currentUser = null;
    localStorage.removeItem('admin_token');
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('dashboard-screen').style.display = 'none';
  }

  function setSession(data) {
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(currentUser));
  }

  async function showDashboard() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'block';
    document.getElementById('header-name').textContent = currentUser?.name || currentUser?.email;
    // Load org name
    try {
      const res = await fetch(`${API}/public/organisations`);
      const { data: orgs } = await res.json();
      const org = orgs.find(o => o._id === currentUser?.organizationId);
      document.getElementById('header-org').textContent = org ? org?.name : 'Unknown Org';
      document.getElementById('page-desc').textContent =
        `Managing flags for ${org ? org?.name : 'your organization'}`;
    } catch {}
    await loadFlags();
  }

  // ── Feature Flags
  async function loadFlags() {
    try {
      const res = await fetch(`${API}/feature-flags`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) { doLogout(); return; }
      const  {data } = await res.json();
      console.log('Flags:', data);
      renderFlags(data);
    } catch(err) {
      console.error('Error loading flags:', err);
      document.getElementById('flags-container').innerHTML =
        '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load flags</p></div>';
    }
  }

  function renderFlags(flagList) {
    document.getElementById('flags-count').textContent = `${flagList.length} flag${flagList.length !== 1 ? 's' : ''}`;
    if (!flagList.length) {
      document.getElementById('flags-container').innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🚩</div>
          <h3>No feature flags yet</h3>
          <p>Create your first flag using the form above.</p>
        </div>`;
      return;
    }
    document.getElementById('flags-container').innerHTML = flagList.map(f => `
      <div class="flag-card ${f.isEnabled ? 'enabled' : 'disabled'} animate-in" id="card-${f._id}">
        <div class="toggle-wrap">
          <label class="toggle">
            <input type="checkbox" ${f.isEnabled ? 'checked' : ''} onchange="toggleFlag('${f._id}', this.checked)"/>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="flag-info">
          <div class="flag-key">${esc(f?.name)}</div>
          ${f.description ? `<div class="flag-desc">${esc(f.description)}</div>` : ''}
          <div class="flag-meta">
            <span>created ${new Date(f.createdAt).toLocaleDateString()}</span>
            <span>updated ${new Date(f.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="flag-actions">
          <span class="status-pill ${f.isEnabled ? 'on' : 'off'}">
            ${f.isEnabled ? '● ENABLED' : '○ DISABLED'}
          </span>
          <button class="btn btn-danger-ghost btn-sm" onclick="deleteFlag('${f._id}', '${esc(f.name)}')">Delete</button>
        </div>
      </div>
    `).join('');
  }

  async function createFlag() {
    const key = document.getElementById('flag-key').value.trim();
    const description = document.getElementById('flag-desc').value.trim();
    hideEl('create-error');
    if (!key) return showAlert('create-error', 'Flag key is required');
    try {
      const res = await fetch(`${API}/feature-flags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ key, description, enabled: false })
      });
      const result = await res.json();
      console.log('Create response:', result);
      if (!res.ok) return showAlert('create-error', result.error);
      document.getElementById('flag-key').value = '';
      document.getElementById('flag-desc').value = '';
      showToast(`Flag "${key}" created`);
      await loadFlags();
    } catch(err) {
        showAlert('create-error', err.error); }
  }

  async function toggleFlag(id, enabled) {
    try {
      const res = await fetch(`${API}/feature-flags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ enabled })
      });
      if (!res.ok) { showToast('Failed to update flag'); await loadFlags(); return; }
      showToast(`Flag ${enabled ? 'enabled' : 'disabled'}`);
      // Update card class without full reload
      const card = document.getElementById(`card-${id}`);
      if (card) {
        card.className = `flag-card ${enabled ? 'enabled' : 'disabled'} animate-in`;
        const pill = card.querySelector('.status-pill');
        if (pill) {
          pill.className = `status-pill ${enabled ? 'on' : 'off'}`;
          pill.textContent = enabled ? '● ENABLED' : '○ DISABLED';
        }
      }
    } catch(err) { showToast('Request failed'); }
  }

  async function deleteFlag(id, key) {
    if (!confirm(`Delete flag "${key}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/feature-flags/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) { showToast('Failed to delete'); return; }
      showToast(`Flag "${key}" deleted`);
      await loadFlags();
    } catch(err) { showToast('Request failed'); }
  }

  // ── Helpers
  function showAlert(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.style.display = 'block';
  }
  function hideEl(id) { document.getElementById(id).style.display = 'none'; }
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.style.display = 'none', 2500);
  }
  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Enter key support
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (document.getElementById('login-form').style.display !== 'none') doLogin();
    }
  });

  // Auto-restore session
  window.addEventListener('load', async () => {
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    if (savedToken && savedUser) {
      token = savedToken;
      currentUser = JSON.parse(savedUser);
      showDashboard();
      
    }
    loadOrgOptions();
  });
