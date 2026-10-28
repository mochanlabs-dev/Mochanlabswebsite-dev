// Shared admin shell: gives the standalone pages (transactions, employees,
// invoices) the same sidebar and top bar as the dashboard. It only wraps what
// is already on the page; nothing the page does is changed. Load it last.
(function () {
  'use strict';
  if (document.querySelector('.app')) return; // the dashboard has its own

  var file = location.pathname.split('/').pop() || '';
  var titles = { 'transactions.html': 'Transactions', 'employees.html': 'Employees & Letters', 'invoices.html': 'Invoices' };
  var title = titles[file] || 'Admin';

  function link(href, icon, label, active) {
    return '<a class="nav-item' + (active ? ' active' : '') + '" href="' + href + '" style="text-decoration:none"><i class="fas ' + icon + '"></i> ' + label + '</a>';
  }

  var sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.id = 'sidebar';
  sidebar.innerHTML =
    '<div class="sidebar-logo"><img src="/brand/mark.png" alt="Mochan Labs logo"><span>MOCHAN <strong>LABS</strong></span></div>' +
    '<nav class="sidebar-nav">' +
      '<div class="nav-section"><div class="nav-section-title">Main</div>' +
        link('dashboard.html', 'fa-th-large', 'Dashboard') +
        link('dashboard.html#new-invoice', 'fa-plus-circle', 'New Invoice') +
        link('dashboard.html#invoices', 'fa-file-invoice-dollar', 'Saved Invoices') +
        link('dashboard.html#analytics', 'fa-chart-line', 'Analytics') +
        link('transactions.html', 'fa-exchange-alt', 'Transactions', file === 'transactions.html') +
        link('employees.html', 'fa-users', 'Employees &amp; Letters', file === 'employees.html') +
      '</div>' +
      '<div class="nav-section" style="margin-top:12px"><div class="nav-section-title">Quick Links</div>' +
        '<a class="nav-item" href="/" target="_blank"><i class="fas fa-globe"></i> View Website</a>' +
        '<a class="nav-item" href="mailto:mochanlabs@gmail.com"><i class="fas fa-envelope"></i> Inbox</a>' +
      '</div>' +
    '</nav>' +
    '<div class="sidebar-footer"><button class="nav-item logout-btn" id="shellLogout"><i class="fas fa-sign-out-alt"></i> Logout</button></div>';

  var main = document.createElement('div');
  main.className = 'main';
  main.innerHTML =
    '<div class="topbar"><div style="display:flex;align-items:center;gap:12px">' +
      '<button class="menu-toggle" id="shellMenu" aria-label="Menu"><i class="fas fa-bars"></i></button>' +
      '<span class="topbar-title">' + title + '</span></div>' +
      '<div class="topbar-right"><div class="topbar-user"><div class="user-avatar">A</div><span>Admin</span></div></div></div>';
  var content = document.createElement('div');
  content.className = 'page-content active shell-content';
  main.appendChild(content);

  // Move everything that is already on the page into the content area.
  var keep = function (n) { return n.nodeType === 1 && /^(SCRIPT|LINK|STYLE)$/.test(n.tagName); };
  Array.prototype.slice.call(document.body.childNodes).forEach(function (n) {
    if (!keep(n)) content.appendChild(n);
  });

  var app = document.createElement('div');
  app.className = 'app';
  app.appendChild(sidebar);
  app.appendChild(main);
  document.body.insertBefore(app, document.body.firstChild);

  document.getElementById('shellMenu').addEventListener('click', function () { sidebar.classList.toggle('open'); });
  document.getElementById('shellLogout').addEventListener('click', function () {
    if (window.mlAuth) window.mlAuth.logout();
    else { sessionStorage.clear(); location.href = 'login.html'; }
  });
})();
