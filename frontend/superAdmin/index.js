  const API = 'http://localhost:8000/api/v1';
  let token = null;

  async function doLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    hideError('login-error');
    try {
      const res = await fetch(`${API}/auth/super-admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return showError('login-error', data.error);
      token = data.token;
      localStorage.setItem('sa_token', token);
      showDashboard();
    } catch (e) {
        console.error(e);
      showError('login-error', 'Cannot connect to server. Is the backend running?');
    }
  }

  function doLogout() {
    token = null;
    localStorage.removeItem('sa_token');
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('dashboard-screen').style.display = 'none';
  }

  async function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'block';
    await loadOrgs();
  }

  async function loadOrgs() {
    document.getElementById('orgs-container').innerHTML = '<div class="loading">Loading organizations...</div>';
    try {
      const res = await fetch(`${API}/public/organisations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) { doLogout(); return; }
      renderOrgs(data);
    } catch (e) {
      document.getElementById('orgs-container').innerHTML = '<div class="loading">Failed to load</div>';
    }
  }


  function renderOrgs(orgList) {
    console.log('Organizations:', orgList);
    const totalAdmins = orgList?.data?.reduce((s, o) => s + (o.adminCount || 0), 0);
    const totalFlags = orgList?.data?.reduce((s, o) => s + (o.flagCount || 0), 0);
    document.getElementById('stat-orgs').textContent = orgList?.data?.length;
    document.getElementById('stat-admins').textContent = totalAdmins;
    document.getElementById('stat-flags').textContent = totalFlags;

    if (!orgList?.data?.length) {
      document.getElementById('orgs-container').innerHTML = `
        <div class="empty-state">
          <div class="big">⬡</div>
          <p>No organizations yet. Create one above.</p>
        </div>`;
      return;
    }
    const rows = orgList?.data?.map(o => `
      <tr class="fade-in">
        <td>
          <div class="org-name">${esc(o.name)}</div>
          ${o.description ? `<div class="org-desc">${esc(o.description)}</div>` : ''}
        </td>
        <td><div class="org-id">${o.id}</div></td>
        <td><span class="count-badge">${o.adminCount || 0} admins</span></td>
        <td><span class="count-badge">${o.flagCount || 0} flags</span></td>
        <td class="timestamp">${new Date(o.createdAt).toLocaleString()}</td>
      </tr>
    `).join('');
    document.getElementById('orgs-container').innerHTML = `
      <table class="org-table">
        <thead><tr>
          <th>ORGANIZATION</th><th>ID</th><th>ADMINS</th><th>FLAGS</th><th>CREATED</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  async function createOrg() {
    const name = document.getElementById('org-name').value.trim();
    const description = document.getElementById('org-desc').value.trim();
    hideError('create-error');
    if (!name) return showError('create-error', 'Organization name is required');
    try {
      const res = await fetch(`${API}/organisations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, description })
      });
      const data = await res.json();
      if (!res.ok) return showError('create-error', data.error);
      document.getElementById('org-name').value = '';
      document.getElementById('org-desc').value = '';
      showToast(`Organization "${name}" created!`);
      await loadOrgs();
    } catch (e) {
      showError('create-error', 'Request failed');
    }
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.style.display = 'block';
  }
  function hideError(id) { document.getElementById(id).style.display = 'none'; }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
  }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // Handle enter key on login
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.getElementById('login-screen').style.display !== 'none') doLogin();
  });

  // Auto-login if token exists
  window.addEventListener('load', () => {
    const saved = localStorage.getItem('sa_token');
    if (saved) { token = saved; showDashboard(); }
  });
