/* Simple dashboard overlay behavior and sample content population */
(function(){
  function toggleDashboard() {
    const el = document.getElementById('ckDashboardOverlay');
    if (!el) return;
    const isHidden = el.classList.toggle('hidden');
    // when showing, populate default tab and inject icons
    if (!isHidden) {
      const content = document.getElementById('ckDashboardContent');
      if (content) {
        content.innerHTML = renderPlayers();
        if (window.injectPixelIcons) window.injectPixelIcons(content);
      }
    }
  }

  function renderPlayers() {
    // sample static players list (matches the reference look)
    return `
      <div class="ck-players-list">
        <div class="ck-player">
          <div class="ck-player-left"><img src="/static/image/placeholder-user.jpg" alt="p"/></div>
          <div class="ck-player-info"><div class="ck-player-name">SHADOWBLADE</div><div class="ck-player-meta">LEVEL 42</div></div>
          <div class="ck-player-tag">●</div>
        </div>
        <div class="ck-player">
          <div class="ck-player-left"><img src="/static/image/placeholder-user.jpg" alt="p"/></div>
          <div class="ck-player-info"><div class="ck-player-name">FIREWIZARD</div><div class="ck-player-meta">LEVEL 38</div></div>
          <div class="ck-player-tag">●</div>
        </div>
        <div class="ck-player">
          <div class="ck-player-left"><img src="/static/image/placeholder-user.jpg" alt="p"/></div>
          <div class="ck-player-info"><div class="ck-player-name">ICEKNIGH</div><div class="ck-player-meta">LEVEL 35</div></div>
          <div class="ck-player-tag">●</div>
        </div>
      </div>
    `;
  }

  // delegate tab clicks
  document.addEventListener('click', function(e){
    const t = e.target.closest('.ck-db-tab');
    if (!t) return;
    const tab = t.getAttribute('data-tab');
    document.querySelectorAll('.ck-db-tab').forEach(b=>b.classList.remove('active'));
    t.classList.add('active');
    const content = document.getElementById('ckDashboardContent');
    if (!content) return;
    if (tab === 'players') { content.innerHTML = renderPlayers(); }
    else if (tab === 'journal') { content.innerHTML = '<div style="padding:12px;color:var(--ck-dim)">Journal entries go here.</div>'; }
    else if (tab === 'skills') { content.innerHTML = '<div style="padding:12px;color:var(--ck-dim)">Skill tree preview.</div>'; }
    else if (tab === 'items') { content.innerHTML = '<div style="padding:12px;color:var(--ck-dim)">Inventory list.</div>'; }
    else if (tab === 'ranks') { content.innerHTML = '<div style="padding:12px;color:var(--ck-dim)">Leaderboard.</div>'; }
    else if (tab === 'quests') { content.innerHTML = '<div style="padding:12px;color:var(--ck-dim)">Daily quests.</div>'; }
    if (window.injectPixelIcons) window.injectPixelIcons(content);
  });

  window.toggleDashboard = toggleDashboard;
})();
