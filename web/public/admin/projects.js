// Projects: the registry of Mochan Labs applications and, for Weighbridge, its
// licensing (list, detail, create, extend, revoke, computers, activity).
// One page, hash routes:
//   #/                            all projects
//   #/<code>                      a project (Overview tab)
//   #/<code>/licenses             Licensing tab
//   #/<code>/licenses/<id>        one license
(function () {
  'use strict';

  var view = document.getElementById('view');
  var API = '/api/projects';
  var projects = [];          // cached list, refreshed when the hub opens

  // ---------------------------------------------------------------- helpers

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
  }
  function fmtDateTime(d) {
    return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  }
  function ago(d) {
    var s = Math.max(0, Math.round((Date.now() - new Date(d).getTime()) / 1000));
    if (s < 60) return 'just now';
    var m = Math.round(s / 60); if (m < 60) return m + ' min ago';
    var h = Math.round(m / 60); if (h < 24) return h + ' hour' + (h === 1 ? '' : 's') + ' ago';
    var days = Math.round(h / 24); if (days < 30) return days + ' day' + (days === 1 ? '' : 's') + ' ago';
    return fmtDate(d);
  }
  function daysLeft(d) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }

  function api(path, opts) {
    opts = opts || {};
    var init = { method: opts.method || 'GET', headers: {} };
    if (opts.body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(opts.body);
    }
    return fetch(API + path, init).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (json) {
        if (!res.ok || json.success === false) {
          var err = new Error(json.message || 'Something went wrong. Please try again.');
          err.status = res.status;
          throw err;
        }
        return json.data;
      });
    });
  }

  function toast(message, type) {
    var box = document.getElementById('pjToasts');
    var el = document.createElement('div');
    el.className = 'pj-toast ' + (type || 'success');
    el.textContent = message;
    box.appendChild(el);
    setTimeout(function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 250); }, 3200);
  }

  function copy(text, btn) {
    var done = function () {
      var old = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> Copied';
      setTimeout(function () { btn.innerHTML = old; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
    else {
      var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ } t.remove();
    }
  }

  var COLORS = {
    blue: '#2b59ff', emerald: '#059669', violet: '#7c3aed', amber: '#d97706',
    rose: '#e11d48', teal: '#0d9488', slate: '#334155', orange: '#ea580c',
  };

  function iconTile(app, size) {
    var s = size || 44;
    if (app.icon_data) {
      return '<span class="pj-icon" style="width:' + s + 'px;height:' + s + 'px"><img src="' + esc(app.icon_data) + '" alt=""></span>';
    }
    return '<span class="pj-icon" style="width:' + s + 'px;height:' + s + 'px;background:' + (COLORS[app.color] || COLORS.blue) +
      ';font-size:' + Math.round(s * 0.42) + 'px">' + esc((app.name || '?').charAt(0).toUpperCase()) + '</span>';
  }

  function chip(status) {
    var label = { live: 'Live', planned: 'Planned', active: 'Active', expiring: 'Expiring soon', expired: 'Expired', revoked: 'Revoked' }[status] || status;
    return '<span class="pj-chip pj-' + esc(status) + '">' + label + '</span>';
  }

  function emptyState(icon, title, text) {
    return '<div class="pj-empty"><i class="fas ' + icon + '"></i><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p></div>';
  }

  var ACTIONS = {
    'license-created': 'License created', 'license-extended': 'Expiry changed', 'license-revoked': 'License revoked',
    'license-reinstated': 'License reinstated', 'license-updated': 'Details edited', 'machine-deactivated': 'Computer removed',
    activated: 'Computer activated', reactivated: 'Computer re-activated', 'machine-limit': 'Activation refused (computer limit)',
  };

  // Readable label for an activity entry, including ones this page has no wording for.
  function actionLabel(a) {
    if (ACTIONS[a]) return ACTIONS[a];
    var t = String(a || '').replace(/-/g, ' ');
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  // ------------------------------------------------------------------ modals

  function modal(opts) {
    var overlay = document.createElement('div');
    overlay.className = 'pj-overlay';
    overlay.innerHTML =
      '<div class="pj-modal" role="dialog" aria-modal="true" aria-label="' + esc(opts.title) + '">' +
        '<div class="pj-modal-head"><h3>' + esc(opts.title) + '</h3><button type="button" class="close-btn" aria-label="Close">&times;</button></div>' +
        '<form novalidate>' +
          '<div class="pj-modal-body">' + opts.body + '</div>' +
          '<p class="pj-form-error" role="alert"></p>' +
          '<div class="pj-modal-foot">' +
            '<button type="button" class="btn btn-secondary" data-close>Cancel</button>' +
            '<button type="submit" class="btn ' + (opts.danger ? 'btn-danger-solid' : '') + '">' + esc(opts.submit || 'Save') + '</button>' +
          '</div>' +
        '</form></div>';
    document.body.appendChild(overlay);
    var form = overlay.querySelector('form');
    var errBox = overlay.querySelector('.pj-form-error');
    var submit = form.querySelector('[type="submit"]');

    function close() { overlay.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.close-btn').addEventListener('click', close);
    overlay.querySelector('[data-close]').addEventListener('click', close);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errBox.textContent = '';
      submit.disabled = true;
      Promise.resolve(opts.onSubmit(form, overlay)).then(function (keepOpen) {
        if (!keepOpen) close();
      }).catch(function (err) {
        errBox.textContent = err.message || 'Something went wrong.';
      }).then(function () { submit.disabled = false; });
    });
    if (opts.onOpen) opts.onOpen(form, overlay);
    var first = form.querySelector('input:not([type=hidden]):not([type=radio]), textarea, select');
    if (first) first.focus();
    return overlay;
  }

  // The "valid for" picker, shared by New license and Extend.
  function planPicker(withHint) {
    return '<div class="pj-field"><label>Valid for</label>' +
      '<div class="pj-segment" role="radiogroup">' +
        '<label><input type="radio" name="plan" value="6m" checked><span>6 months</span></label>' +
        '<label><input type="radio" name="plan" value="1y"><span>1 year</span></label>' +
        '<label><input type="radio" name="plan" value="custom"><span>Custom date</span></label>' +
      '</div>' +
      '<input type="date" name="custom_date" class="pj-custom" hidden>' +
      (withHint ? '<small>' + withHint + '</small>' : '') + '</div>';
  }
  function wirePlan(form) {
    var date = form.querySelector('.pj-custom');
    form.querySelectorAll('input[name=plan]').forEach(function (r) {
      r.addEventListener('change', function () { date.hidden = form.plan.value !== 'custom'; if (!date.hidden) date.focus(); });
    });
  }
  function planData(form) {
    return { plan: form.plan.value, custom_date: form.custom_date.value };
  }

  // ------------------------------------------------------------------- views

  function crumbs(items) {
    return '<nav class="pj-crumbs" aria-label="Breadcrumb">' + items.map(function (it, i) {
      var last = i === items.length - 1;
      return (it.href && !last ? '<a href="' + it.href + '">' + esc(it.label) + '</a>' : '<span' + (last ? ' aria-current="page"' : '') + '>' + esc(it.label) + '</span>') +
        (last ? '' : '<i class="fas fa-chevron-right"></i>');
    }).join('') + '</nav>';
  }

  function loading() { view.innerHTML = '<div class="pj-loading"><span></span><span></span><span></span></div>'; }

  function failed(err) {
    view.innerHTML = emptyState('fa-triangle-exclamation', 'Could not load this page', err.message || 'Please try again.') +
      '<p class="pj-center"><button class="btn btn-secondary" onclick="location.reload()">Reload</button></p>';
  }

  // ---- hub: all projects
  function renderHub() {
    loading();
    return api('').then(function (list) {
      projects = list;
      var tiles = list.map(function (a) {
        var foot = a.stats
          ? '<span><b>' + a.stats.licenses + '</b> license' + (a.stats.licenses === 1 ? '' : 's') + '</span>' +
            '<span><b>' + a.stats.inForce + '</b> in force</span>' +
            (a.stats.expiring ? '<span class="pj-warn"><b>' + a.stats.expiring + '</b> expiring</span>' : '')
          : '<span class="pj-muted">Not connected yet</span>';
        return '<a class="pj-tile" href="#/' + esc(a.code) + '">' +
          '<div class="pj-tile-top">' + iconTile(a, 44) + chip(a.status) + '</div>' +
          '<h3>' + esc(a.name) + '</h3>' +
          '<p>' + esc(a.description || 'No description yet.') + '</p>' +
          '<div class="pj-tile-foot">' + foot + '</div></a>';
      }).join('');
      view.innerHTML =
        '<header class="pj-head"><div><h1>Projects</h1><p>Every Mochan Labs application, and everything you manage for it.</p></div>' +
        '<button class="btn" id="newProject"><i class="fas fa-plus"></i> New project</button></header>' +
        '<div class="pj-grid">' + tiles +
          '<button class="pj-tile pj-tile-new" id="newProject2"><i class="fas fa-plus"></i><span>New project</span></button></div>';
      document.getElementById('newProject').addEventListener('click', function () { projectForm(null); });
      document.getElementById('newProject2').addEventListener('click', function () { projectForm(null); });
    }).catch(failed);
  }

  // ---- project workspace shell (header + tabs)
  function workspace(app, tab, inner, extraCrumbs) {
    var base = '#/' + app.code;
    var licensing = app.panels.filter(function (p) { return p.slug === 'licenses'; })[0];
    view.innerHTML =
      crumbs([{ label: 'Projects', href: '#/' }, { label: app.name, href: extraCrumbs ? base : null }].concat(extraCrumbs || [])) +
      '<header class="pj-app-head">' +
        '<div class="pj-app-id">' + iconTile(app, 52) +
          '<div><div class="pj-app-title"><h1>' + esc(app.name) + '</h1>' + chip(app.status) + '</div>' +
          '<p>' + esc(app.description || 'No description yet.') + '</p></div></div>' +
        '<button class="btn btn-secondary" id="editProject"><i class="fas fa-pen"></i> Edit project</button>' +
      '</header>' +
      '<div class="pj-tabs" role="tablist">' +
        '<a role="tab" class="' + (tab === 'overview' ? 'active' : '') + '" href="' + base + '">Overview</a>' +
        '<a role="tab" class="' + (tab === 'licenses' ? 'active' : '') + '" href="' + (licensing && licensing.connected ? base + '/licenses' : base + '/licenses') + '">Licensing</a>' +
        '<span role="tab" class="soon" aria-disabled="true">Users <em>Soon</em></span>' +
      '</div>' +
      '<div id="tabBody">' + inner + '</div>';
    document.getElementById('editProject').addEventListener('click', function () { projectForm(app); });
  }

  function getApp(code) {
    return api('/' + encodeURIComponent(code));
  }

  // ---- Overview tab
  function renderOverview(code) {
    loading();
    getApp(code).then(function (app) {
      if (!app.connected) {
        workspace(app, 'overview',
          emptyState('fa-plug', 'Nothing is connected to ' + app.name + ' yet',
            'Its panels (Licensing, Users) appear here as soon as they are wired up. Until then this project is just a listing.') +
          '<div class="pj-panels">' + app.panels.map(function (p) {
            return '<div class="pj-panel"><h4>' + esc(p.name) + '</h4><p>' + esc(p.description) + '</p><span class="pj-chip pj-planned">Not connected yet</span></div>';
          }).join('') + '</div>');
        return;
      }
      return api('/' + code + '/overview').then(function (o) {
        var c = o.counts;
        var stat = function (label, value, tone) {
          return '<div class="pj-stat"><div class="pj-stat-label">' + label + '</div><div class="pj-stat-value ' + (tone || '') + '">' + value + '</div></div>';
        };
        var attention = o.attention.length
          ? o.attention.map(function (r) {
              var d = daysLeft(r.expires_at);
              return '<a class="pj-row" href="#/' + code + '/licenses/' + r.id + '"><span><b>' + esc(r.customer_name) + '</b>' +
                '<small>Expires ' + fmtDate(r.expires_at) + '</small></span><span class="pj-warn">' + d + ' day' + (d === 1 ? '' : 's') + ' left</span></a>';
            }).join('')
          : '<p class="pj-muted pj-pad">Nothing needs attention. No license expires in the next 30 days.</p>';
        var activity = o.activity.length
          ? o.activity.map(function (a) {
              return '<div class="pj-event"><span class="pj-dot"></span><div><b>' + esc(actionLabel(a.action)) + '</b>' +
                (a.customer_name ? ' <span class="pj-muted">· ' + esc(a.customer_name) + '</span>' : '') +
                '<small>' + esc(a.detail || '') + (a.detail ? ' · ' : '') + ago(a.at) + ' · ' + esc(a.actor) + '</small></div></div>';
            }).join('')
          : '<p class="pj-muted pj-pad">No activity yet.</p>';
        workspace(app, 'overview',
          '<div class="pj-stats">' +
            stat('Licenses', c.total) + stat('In force', c.inForce, 'good') +
            stat('Expiring in 30 days', c.expiring, c.expiring ? 'warn' : '') + stat('Opened in 24 hours', c.online) +
          '</div>' +
          '<div class="pj-two">' +
            '<section class="pj-card"><div class="pj-card-head"><h3>Needs attention</h3><a href="#/' + code + '/licenses">All licenses</a></div>' + attention + '</section>' +
            '<section class="pj-card"><div class="pj-card-head"><h3>Recent activity</h3></div><div class="pj-feed">' + activity + '</div></section>' +
          '</div>');
      });
    }).catch(failed);
  }

  // ---- Licensing tab: list
  var listState = { status: '', q: '' };

  function renderLicenses(code) {
    loading();
    getApp(code).then(function (app) {
      if (!app.connected) return [app, null];
      return api('/' + code + '/licenses').then(function (rows) { return [app, rows]; });
    }).then(function (res) {
      var app = res[0], rows = res[1];
      if (!rows) {
        workspace(app, 'licenses', emptyState('fa-plug', 'Licensing is not connected for ' + app.name + ' yet',
          'Once this application checks in with the licensing service, its licenses are managed here.'));
        return;
      }
      var counts = {
        total: rows.length,
        inForce: rows.filter(function (r) { return r.status === 'active' || r.status === 'expiring'; }).length,
        expiring: rows.filter(function (r) { return r.status === 'expiring'; }).length,
        ended: rows.filter(function (r) { return r.status === 'expired' || r.status === 'revoked'; }).length,
      };
      var FILTERS = [['', 'All'], ['active', 'Active'], ['expiring', 'Expiring soon'], ['expired', 'Expired'], ['revoked', 'Revoked']];

      workspace(app, 'licenses',
        '<div class="pj-bar"><h2>Licensing</h2><button class="btn" id="newLicense"><i class="fas fa-plus"></i> New license</button></div>' +
        '<div class="pj-stats">' +
          '<div class="pj-stat"><div class="pj-stat-label">Licenses</div><div class="pj-stat-value">' + counts.total + '</div></div>' +
          '<div class="pj-stat"><div class="pj-stat-label">In force</div><div class="pj-stat-value good">' + counts.inForce + '</div></div>' +
          '<div class="pj-stat"><div class="pj-stat-label">Expiring in 30 days</div><div class="pj-stat-value ' + (counts.expiring ? 'warn' : '') + '">' + counts.expiring + '</div></div>' +
          '<div class="pj-stat"><div class="pj-stat-label">Expired / revoked</div><div class="pj-stat-value">' + counts.ended + '</div></div>' +
        '</div>' +
        '<div class="pj-filters"><div class="pj-pills" id="pills">' + FILTERS.map(function (f) {
          return '<button type="button" data-s="' + f[0] + '" class="' + (listState.status === f[0] ? 'active' : '') + '">' + f[1] + '</button>';
        }).join('') + '</div>' +
        '<div class="pj-search"><i class="fas fa-magnifying-glass"></i><input id="q" type="search" placeholder="Search customer or key" value="' + esc(listState.q) + '"></div></div>' +
        '<div class="pj-card pj-table-wrap"><table class="pj-table"><thead><tr>' +
          '<th>Customer</th><th>License key</th><th>Status</th><th>Expires</th><th>Computers</th><th>Last opened</th>' +
        '</tr></thead><tbody id="rows"></tbody></table></div>');

      function paint() {
        var needle = listState.q.trim().toLowerCase();
        var visible = rows.filter(function (r) {
          return (!listState.status || r.status === listState.status) &&
            (!needle || r.customer_name.toLowerCase().indexOf(needle) > -1 || r.key.toLowerCase().indexOf(needle) > -1);
        });
        var body = document.getElementById('rows');
        if (!visible.length) {
          body.innerHTML = '<tr><td colspan="6" class="pj-none">' + (rows.length ? 'No licenses match.' : 'No licenses yet. Create the first one with "New license".') + '</td></tr>';
          return;
        }
        body.innerHTML = visible.map(function (r) {
          return '<tr data-id="' + r.id + '"><td><a class="pj-link" href="#/' + code + '/licenses/' + r.id + '">' + esc(r.customer_name) + '</a></td>' +
            '<td><span class="pj-key">' + esc(r.key) + '</span> <button type="button" class="pj-copy" data-key="' + esc(r.key) + '" aria-label="Copy key"><i class="fas fa-copy"></i></button></td>' +
            '<td>' + chip(r.status) + '</td><td>' + fmtDate(r.expires_at) + '</td>' +
            '<td>' + r.active_count + ' of ' + r.max_machines + '</td>' +
            '<td>' + (r.last_seen ? ago(r.last_seen) : '<span class="pj-muted">Not activated yet</span>') + '</td></tr>';
        }).join('');
      }
      paint();

      document.getElementById('pills').addEventListener('click', function (e) {
        var b = e.target.closest('button[data-s]'); if (!b) return;
        listState.status = b.dataset.s;
        document.querySelectorAll('#pills button').forEach(function (x) { x.classList.toggle('active', x === b); });
        paint();
      });
      document.getElementById('q').addEventListener('input', function (e) { listState.q = e.target.value; paint(); });
      document.getElementById('rows').addEventListener('click', function (e) {
        var c = e.target.closest('.pj-copy');
        if (c) { copy(c.dataset.key, c); return; }
        var tr = e.target.closest('tr[data-id]');
        if (tr && !e.target.closest('a')) location.hash = '#/' + code + '/licenses/' + tr.dataset.id;
      });
      document.getElementById('newLicense').addEventListener('click', function () { licenseForm(code); });
    }).catch(failed);
  }

  // ---- one license
  function renderLicense(code, id, justCreated) {
    loading();
    Promise.all([getApp(code), api('/' + code + '/licenses/' + id)]).then(function (res) {
      var app = res[0], d = res[1], l = d.license;
      var left = daysLeft(l.expires_at);
      var revoked = l.status === 'revoked';

      var machines = d.machines.length ? d.machines.map(function (m) {
        var gone = !!m.deactivated_at;
        return '<tr class="' + (gone ? 'pj-gone' : '') + '"><td><b>' + esc(m.machine_name || 'Unknown computer') + '</b>' +
          '<small>' + esc(m.os || '') + '</small></td><td>' + esc(m.app_version || '-') + '</td>' +
          '<td>' + esc(m.local_ip || '-') + '<small>seen as ' + esc(m.last_ip || '-') + '</small></td>' +
          '<td>' + fmtDate(m.activated_at) + '</td><td>' + (gone ? 'Removed ' + ago(m.deactivated_at) : ago(m.last_seen_at)) + '</td>' +
          '<td class="pj-right">' + (gone ? '' : '<button type="button" class="btn btn-secondary pj-sm" data-remove="' + m.id + '" data-name="' + esc(m.machine_name || 'this computer') + '">Remove</button>') + '</td></tr>';
      }).join('') : '<tr><td colspan="6" class="pj-none">No computer has activated this key yet.</td></tr>';

      var log = d.log.length ? d.log.map(function (a) {
        return '<div class="pj-event"><span class="pj-dot"></span><div><b>' + esc(actionLabel(a.action)) + '</b>' +
          '<small>' + esc(a.detail || '') + (a.detail ? ' · ' : '') + fmtDateTime(a.at) + ' · ' + esc(a.actor) + '</small></div></div>';
      }).join('') : '<p class="pj-muted pj-pad">No activity yet.</p>';

      workspace(app, 'licenses',
        (justCreated
          ? '<div class="pj-banner good"><i class="fas fa-circle-check"></i><span>License created. Give this key to the customer. It works on ' + l.max_machines + ' computer' + (l.max_machines > 1 ? 's' : '') + '.</span></div>'
          : '') +
        '<section class="pj-card pj-keycard">' +
          '<div class="pj-keyhead"><div><div class="pj-eyebrow">License key</div>' +
            '<div class="pj-bigkey"><span id="bigKey">' + esc(l.key) + '</span> <button class="btn btn-secondary pj-sm" id="copyKey"><i class="fas fa-copy"></i> Copy</button></div></div>' +
            '<div class="pj-keyactions">' + chip(l.status) +
              '<button class="btn btn-secondary" id="extend"><i class="fas fa-calendar-plus"></i> Extend</button>' +
              '<button class="btn btn-secondary" id="edit"><i class="fas fa-pen"></i> Edit</button>' +
              (revoked
                ? '<button class="btn" id="reinstate"><i class="fas fa-rotate-left"></i> Reinstate</button>'
                : '<button class="btn btn-danger" id="revoke"><i class="fas fa-ban"></i> Revoke</button>') +
            '</div></div>' +
          '<dl class="pj-facts">' +
            '<div><dt>Customer</dt><dd>' + esc(l.customer_name) + '</dd></div>' +
            '<div><dt>Expires</dt><dd>' + fmtDate(l.expires_at) + '<small>' + (left > 0 ? left + ' day' + (left === 1 ? '' : 's') + ' left' : 'Already expired') + '</small></dd></div>' +
            '<div><dt>Computers</dt><dd>' + d.machines.filter(function (m) { return !m.deactivated_at; }).length + ' of ' + l.max_machines + '</dd></div>' +
            '<div><dt>Offline grace</dt><dd>' + l.grace_days + ' days</dd></div>' +
            '<div><dt>Created</dt><dd>' + fmtDate(l.created_at) + '</dd></div>' +
          '</dl>' +
          (l.notes ? '<p class="pj-notes"><b>Notes</b> ' + esc(l.notes) + '</p>' : '') +
        '</section>' +
        '<section class="pj-card"><div class="pj-card-head"><h3>Computers</h3></div><div class="pj-table-wrap"><table class="pj-table"><thead><tr>' +
          '<th>Computer</th><th>App version</th><th>Address</th><th>Activated</th><th>Last opened</th><th></th></tr></thead><tbody id="machines">' + machines + '</tbody></table></div></section>' +
        '<section class="pj-card"><div class="pj-card-head"><h3>Activity</h3></div><div class="pj-feed">' + log + '</div></section>',
        [{ label: 'Licensing', href: '#/' + code + '/licenses' }, { label: l.customer_name }]);

      var again = function () { renderLicense(code, id, false); };
      document.getElementById('copyKey').addEventListener('click', function (e) { copy(l.key, e.currentTarget); });
      document.getElementById('extend').addEventListener('click', function () { extendForm(code, l, again); });
      document.getElementById('edit').addEventListener('click', function () { licenseForm(code, l, again); });

      var rv = document.getElementById('revoke');
      if (rv) rv.addEventListener('click', function () {
        modal({
          title: 'Revoke this license?',
          body: '<p class="pj-text">The app locks on its next check-in. You can reinstate the license later.</p>',
          submit: 'Revoke license', danger: true,
          onSubmit: function () { return api('/' + code + '/licenses/' + id + '/revoke', { method: 'POST' }).then(function () { toast('License revoked.'); again(); }); },
        });
      });
      var ri = document.getElementById('reinstate');
      if (ri) ri.addEventListener('click', function () {
        api('/' + code + '/licenses/' + id + '/reinstate', { method: 'POST' }).then(function () { toast('License reinstated.'); again(); })
          .catch(function (err) { toast(err.message, 'error'); });
      });
      document.getElementById('machines').addEventListener('click', function (e) {
        var b = e.target.closest('[data-remove]'); if (!b) return;
        modal({
          title: 'Remove this computer?',
          body: '<p class="pj-text"><b>' + esc(b.dataset.name) + '</b> stops being licensed and frees its slot. It can activate again if a slot is free.</p>',
          submit: 'Remove computer', danger: true,
          onSubmit: function () {
            return api('/' + code + '/licenses/' + id + '/machines/' + b.dataset.remove + '/deactivate', { method: 'POST' })
              .then(function () { toast('Computer removed.'); again(); });
          },
        });
      });
    }).catch(function (err) { if (err.status === 404) { location.hash = '#/' + code + '/licenses'; toast('That license no longer exists.', 'error'); } else failed(err); });
  }

  // ------------------------------------------------------------------- forms

  function licenseForm(code, l, done) {
    var editing = !!l;
    modal({
      title: editing ? 'Edit license' : 'New license',
      submit: editing ? 'Save changes' : 'Create license',
      body:
        '<div class="pj-field"><label>Customer name</label><input name="customer_name" maxlength="200" value="' + esc(editing ? l.customer_name : '') + '" placeholder="e.g. Shri Guru Stone Crusher"></div>' +
        '<div class="pj-cols">' +
          '<div class="pj-field"><label>Computers allowed</label><input name="max_machines" type="number" min="1" max="50" value="' + (editing ? l.max_machines : 1) + '"></div>' +
          '<div class="pj-field"><label>Offline grace (days)</label><input name="grace_days" type="number" min="1" max="60" value="' + (editing ? l.grace_days : 7) + '"></div>' +
        '</div>' +
        (editing ? '' : planPicker('The license is valid from today.')) +
        '<div class="pj-field"><label>Notes <em>(optional)</em></label><textarea name="notes" rows="3" maxlength="2000">' + esc(editing ? l.notes || '' : '') + '</textarea></div>',
      onOpen: function (form) { if (!editing) wirePlan(form); },
      onSubmit: function (form) {
        var body = {
          customer_name: form.customer_name.value, notes: form.notes.value,
          max_machines: form.max_machines.value, grace_days: form.grace_days.value,
        };
        if (editing) {
          return api('/' + code + '/licenses/' + l.id, { method: 'PUT', body: body }).then(function () { toast('Changes saved.'); if (done) done(); });
        }
        var p = planData(form); body.plan = p.plan; body.custom_date = p.custom_date;
        return api('/' + code + '/licenses', { method: 'POST', body: body }).then(function (created) {
          location.hash = '#/' + code + '/licenses/' + created.id + '?created=1';
        });
      },
    });
  }

  function extendForm(code, l, done) {
    modal({
      title: 'Extend license',
      submit: 'Extend',
      body: '<p class="pj-text">Currently valid until <b>' + fmtDate(l.expires_at) + '</b>. ' +
        'The 6 month and 1 year options add time on top of what is left (or from today if it has lapsed).</p>' + planPicker(''),
      onOpen: function (form) { wirePlan(form); },
      onSubmit: function (form) {
        return api('/' + code + '/licenses/' + l.id + '/extend', { method: 'POST', body: planData(form) })
          .then(function () { toast('Expiry updated.'); done(); });
      },
    });
  }

  function projectForm(app) {
    var editing = !!app;
    var color = editing ? app.color : 'blue';
    var iconData = null, removeIcon = false;

    modal({
      title: editing ? 'Edit project' : 'New project',
      submit: editing ? 'Save changes' : 'Create project',
      body:
        '<div class="pj-field"><label>Project name</label><input name="name" maxlength="60" value="' + esc(editing ? app.name : '') + '" placeholder="e.g. Order Dispatch Tracking"></div>' +
        '<div class="pj-field"><label>Project code</label><input name="code" maxlength="30" value="' + esc(editing ? app.code : '') + '" ' + (editing ? 'disabled' : 'placeholder="e.g. odts"') + '>' +
          '<small>' + (editing ? 'The code is fixed once a project exists.' : 'Lowercase letters, numbers and hyphens. Also names this project\'s own database schema.') + '</small></div>' +
        '<div class="pj-field"><label>Description</label><textarea name="description" rows="2" maxlength="300">' + esc(editing ? app.description : '') + '</textarea></div>' +
        '<div class="pj-cols">' +
          '<div class="pj-field"><label>Status</label><select name="status"><option value="planned"' + (editing && app.status === 'planned' || !editing ? ' selected' : '') + '>Planned</option><option value="live"' + (editing && app.status === 'live' ? ' selected' : '') + '>Live</option></select></div>' +
          '<div class="pj-field"><label>Colour</label><div class="pj-swatches" id="swatches">' + Object.keys(COLORS).map(function (c) {
            return '<button type="button" data-c="' + c + '" class="' + (c === color ? 'active' : '') + '" style="background:' + COLORS[c] + '" aria-label="' + c + '"></button>';
          }).join('') + '</div></div>' +
        '</div>' +
        '<div class="pj-field"><label>Icon <em>(optional, PNG, JPEG, WebP or SVG up to 200 KB)</em></label>' +
          '<div class="pj-iconrow"><span id="iconPreview">' + (editing ? iconTile(app, 44) : iconTile({ name: 'N', color: color }, 44)) + '</span>' +
          '<input type="file" name="icon" accept="image/png,image/jpeg,image/webp,image/svg+xml">' +
          (editing && app.icon_data ? '<label class="pj-check"><input type="checkbox" name="remove_icon"> Remove icon</label>' : '') + '</div></div>',
      onOpen: function (form) {
        var nameInput = form.elements.name, codeInput = form.elements.code, touched = editing;
        if (!editing) {
          codeInput.addEventListener('input', function () { touched = true; });
          nameInput.addEventListener('input', function () {
            if (touched) return;
            codeInput.value = nameInput.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/^[^a-z]+/, '').slice(0, 30).replace(/-+$/, '');
          });
        }
        form.querySelector('#swatches').addEventListener('click', function (e) {
          var b = e.target.closest('button[data-c]'); if (!b) return;
          color = b.dataset.c;
          form.querySelectorAll('#swatches button').forEach(function (x) { x.classList.toggle('active', x === b); });
          if (!iconData && !(editing && app.icon_data && !removeIcon)) {
            form.querySelector('#iconPreview').innerHTML = iconTile({ name: nameInput.value || 'N', color: color }, 44);
          }
        });
        form.icon.addEventListener('change', function () {
          var f = form.icon.files[0];
          if (!f) { iconData = null; return; }
          if (f.size > 200 * 1024) { form.querySelector('.pj-form-error').textContent = 'The icon is too large (limit 200 KB).'; form.icon.value = ''; return; }
          var r = new FileReader();
          r.onload = function () { iconData = r.result; form.querySelector('#iconPreview').innerHTML = iconTile({ icon_data: iconData }, 44); };
          r.readAsDataURL(f);
        });
      },
      onSubmit: function (form) {
        var body = { name: form.elements.name.value, description: form.description.value, status: form.status.value, color: color };
        if (iconData) body.icon = iconData;
        if (editing) {
          body.removeIcon = !!(form.remove_icon && form.remove_icon.checked);
          return api('/' + app.code, { method: 'PUT', body: body }).then(function () { toast('Project updated.'); route(); });
        }
        body.code = form.code.value;
        return api('', { method: 'POST', body: body }).then(function (created) {
          toast('Project created.'); location.hash = '#/' + created.code;
        });
      },
    });
  }

  // ------------------------------------------------------------------ router

  function route() {
    var raw = location.hash.replace(/^#\/?/, '');
    var created = /[?&]created=1/.test(raw);
    var parts = raw.split('?')[0].split('/').filter(Boolean);
    window.scrollTo(0, 0);
    if (parts.length === 0) return renderHub();
    if (parts.length === 1) return renderOverview(parts[0]);
    if (parts[1] === 'licenses' && parts.length === 2) return renderLicenses(parts[0]);
    if (parts[1] === 'licenses' && parts.length === 3) return renderLicense(parts[0], parts[2], created);
    location.hash = '#/' + parts[0];
  }

  window.addEventListener('hashchange', route);
  route();
})();
