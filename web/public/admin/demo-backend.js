// Demo back end for the admin panel (front-end-only phase).
//
// Load first on every admin page. It answers every same-origin /api/* request
// in the browser, with the same request/response shapes as the Express server
// in /server, storing data in localStorage (seeded with sample data). When the
// real back end is ready, remove this script and the pages talk to /api again.
//
// Demo login: see DEMO_USER / DEMO_PASS below (also shown on the login page).
// Reset the sample data from the console with: mlDemo.reset()
(function () {
  'use strict';

  var DEMO_USER = 'admin';
  var DEMO_PASS = 'mochan@demo';
  var TOKEN_KEY = 'ml_admin_token';
  var DB_KEY = 'ml_demo_db_v1';
  var onLoginPage = /\/login(\.html)?$/.test(location.pathname);

  // ---------- helpers ----------
  function id() {
    var hex = '';
    for (var i = 0; i < 24; i++) hex += Math.floor(Math.random() * 16).toString(16);
    return hex;
  }
  function iso(daysAgo) {
    return new Date(Date.now() - (daysAgo || 0) * 864e5).toISOString();
  }
  function ymd(daysAgo) {
    return iso(daysAgo).slice(0, 10);
  }
  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }
  function byDateDesc(key) {
    return function (a, b) { return new Date(b[key] || 0) - new Date(a[key] || 0); };
  }

  // ---------- sample data ----------
  function seed() {
    var invoices = [
      { number: 'INV-2026-014', date: ymd(3), due: ymd(-12), status: 'pending', clientName: 'Rohan Sharma', clientCompany: 'Sharma Traders', clientEmail: 'accounts@sharmatraders.in', clientPhone: '98100 00000', clientAddress: 'Dehradun, Uttarakhand', items: [{ desc: 'ODTS — monthly support', qty: 1, rate: 25000, amount: 25000 }, { desc: 'WhatsApp API integration', qty: 1, rate: 18000, amount: 18000 }], taxPct: 18, discPct: 0, currency: '₹', notes: 'Thank you for your business.', terms: 'Payment due within 15 days.' },
      { number: 'INV-2026-013', date: ymd(18), due: ymd(3), status: 'paid', clientName: 'Anil Gupta', clientCompany: 'Gupta Agencies', clientEmail: 'anil@guptaagencies.in', clientPhone: '98200 00000', clientAddress: 'Haridwar, Uttarakhand', items: [{ desc: 'Website redesign', qty: 1, rate: 60000, amount: 60000 }], taxPct: 18, discPct: 5, currency: '₹', notes: '', terms: 'Payment due within 15 days.' },
      { number: 'INV-2026-012', date: ymd(40), due: ymd(25), status: 'overdue', clientName: 'Meera Rawat', clientCompany: 'Demo Stone Industries', clientEmail: 'office@demostone.in', clientPhone: '98300 00000', clientAddress: 'Kharghatiya, Uttarakhand', items: [{ desc: 'Weighbridge licence (1 year)', qty: 1, rate: 45000, amount: 45000 }, { desc: 'On-site installation', qty: 1, rate: 8000, amount: 8000 }], taxPct: 18, discPct: 0, currency: '₹', notes: '', terms: 'Payment due within 15 days.' },
    ].map(function (inv, i) {
      var subtotal = inv.items.reduce(function (s, it) { return s + it.amount; }, 0);
      var discountAmt = Math.round((subtotal * inv.discPct) / 100);
      var taxAmt = Math.round(((subtotal - discountAmt) * inv.taxPct) / 100);
      return Object.assign({ _id: id(), subtotal: subtotal, discountAmt: discountAmt, taxAmt: taxAmt, grandTotal: subtotal - discountAmt + taxAmt, createdAt: iso([3, 18, 40][i]), updatedAt: iso([3, 18, 40][i]) }, inv);
    });

    function tx(daysAgo, amount, type, description, category, status, ref) {
      return { _id: id(), amount: amount, type: type, description: description, category: category, date: iso(daysAgo), referenceId: ref || '', invoiceId: null, lineItemIndex: null, status: status, notes: '', isActive: true, createdAt: iso(daysAgo), updatedAt: iso(daysAgo) };
    }
    var transactions = [
      tx(1, 70800, 'credit', 'Payment — Gupta Agencies (INV-2026-013)', 'Client payment', 'completed', 'UTR 4021'),
      tx(2, 12999, 'debit', 'Cloud hosting — October', 'Infrastructure', 'completed'),
      tx(4, 4500, 'debit', 'Domain & SSL renewals', 'Infrastructure', 'completed'),
      tx(6, 50740, 'credit', 'Advance — Sharma Traders', 'Client payment', 'pending', 'UTR 3988'),
      tx(9, 85000, 'debit', 'Salaries — September', 'Payroll', 'completed'),
      tx(15, 2400, 'debit', 'Office internet', 'Utilities', 'completed'),
    ];

    function emp(first, last, email, gender, code, position, department, ctc, joinedDaysAgo, extra) {
      return Object.assign({
        _id: id(), firstName: first, lastName: last, email: email, mobile: '9' + Math.floor(100000000 + Math.random() * 899999999),
        gender: gender, dob: null, permanentAddress: 'Dehradun, Uttarakhand', communicationAddress: 'Dehradun, Uttarakhand', skills: '',
        employeeCode: code, position: position, department: department, reportingManager: 'Akshat Shukla', employmentType: 'full-time',
        dateOfJoining: iso(joinedDaysAgo), workLocation: 'Dehradun', officialEmail: first.toLowerCase() + '@mochanlabs.com', ctc: ctc,
        probationPeriod: '3 months', isActive: true, dateOfRelieving: null, relievingComments: '', generatedLetters: [],
        createdAt: iso(joinedDaysAgo), updatedAt: iso(joinedDaysAgo),
      }, extra || {});
    }
    var employees = [
      emp('Priya', 'Negi', 'priya.negi@example.com', 'female', 'ML-001', 'Senior Developer', 'Engineering', 960000, 420, { skills: 'React, Node.js, PostgreSQL' }),
      emp('Arjun', 'Bisht', 'arjun.bisht@example.com', 'male', 'ML-002', 'UI/UX Designer', 'Design', 600000, 260, { skills: 'Figma, design systems' }),
      emp('Kavya', 'Joshi', 'kavya.joshi@example.com', 'female', 'ML-003', 'Developer Intern', 'Engineering', 180000, 60, { employmentType: 'intern', probationPeriod: '' }),
    ];
    var positions = employees.map(function (e) {
      return { _id: id(), employeeId: e._id, position: e.position, department: e.department, ctc: e.ctc, effectiveDate: e.dateOfJoining, endDate: null, createdAt: e.createdAt, updatedAt: e.createdAt };
    });

    var pages = ['/', '/work/', '/#services', '/#contact'];
    var cities = [['India', 'Dehradun'], ['India', 'Delhi'], ['India', 'Haridwar'], ['India', 'Jaipur'], ['India', 'Lucknow']];
    var visitors = [];
    for (var v = 0; v < 38; v++) {
      var c = cities[v % cities.length];
      visitors.push({ ip: '203.0.113.' + (v + 10), country: c[0], city: c[1], visits: 1 + (v % 4), pages: pages.slice(0, 1 + (v % pages.length)), lastSeen: iso(v / 6), userAgent: v % 3 ? 'Mobile Safari' : 'Chrome on Windows' });
    }

    return { invoices: invoices, transactions: transactions, employees: employees, positions: positions, identities: [], visitors: visitors };
  }

  function load() {
    try {
      var raw = localStorage.getItem(DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    var fresh = seed();
    save(fresh);
    return fresh;
  }
  function save(db) {
    try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) {}
  }

  // ---------- routes (mirror server/routes/*) ----------
  function json(status, body) {
    return { status: status, body: body };
  }
  function withEmployeeExtras(db, e) {
    return Object.assign(clone(e), {
      positionHistory: db.positions.filter(function (p) { return p.employeeId === e._id; }).sort(byDateDesc('effectiveDate')),
      identityDocuments: db.identities.filter(function (d) { return d.employeeId === e._id; }).sort(byDateDesc('createdAt')),
    });
  }
  function toDate(v) {
    if (!v) return null;
    var d = new Date(v);
    return isNaN(d) ? null : d.toISOString();
  }

  function handle(method, path, query, body) {
    var db = load();
    var m;

    // Auth
    if (path === '/api/auth/login' && method === 'POST') {
      if (!body.username || !body.password) return json(400, { success: false, message: 'Username and password are required' });
      if (body.username === DEMO_USER && body.password === DEMO_PASS) return json(200, { success: true, message: 'Login successful', token: 'demo-session', expiresInHours: 8 });
      return json(401, { success: false, message: 'Invalid username or password' });
    }
    if (!sessionStorage.getItem(TOKEN_KEY)) return json(401, { success: false, message: 'Unauthorized' });
    if (path === '/api/auth/verify') return json(200, { success: true, username: DEMO_USER });

    // Analytics
    if (path === '/api/analytics/stats') {
      var vs = db.visitors;
      var totalVisits = vs.reduce(function (s, v) { return s + v.visits; }, 0);
      var pageMap = {};
      vs.forEach(function (v) { v.pages.forEach(function (p) { pageMap[p] = (pageMap[p] || 0) + 1; }); });
      return json(200, {
        totalVisitors: vs.length,
        totalVisits: totalVisits,
        topPages: Object.keys(pageMap).map(function (p) { return { page: p, count: pageMap[p] }; }).sort(function (a, b) { return b.count - a.count; }).slice(0, 10),
        recentVisitors: vs.slice().sort(byDateDesc('lastSeen')).slice(0, 50),
        avgVisitsPerPerson: (totalVisits / vs.length).toFixed(2),
      });
    }

    // Invoices
    if (path === '/api/invoices') {
      if (method === 'GET') return json(200, db.invoices.slice().sort(byDateDesc('createdAt')));
      if (method === 'POST') {
        if (!body.number || !body.clientName) return json(400, { error: 'Invoice number and client name are required' });
        var existing = db.invoices.find(function (i) { return i.number === body.number; });
        var now = new Date().toISOString();
        var doc = Object.assign(existing || { _id: id(), createdAt: now }, body, { updatedAt: now });
        if (!existing) db.invoices.push(doc);
        save(db);
        return json(200, doc);
      }
    }
    if ((m = path.match(/^\/api\/invoices\/(.+)$/)) && method === 'DELETE') {
      var num = decodeURIComponent(m[1]);
      db.invoices = db.invoices.filter(function (i) { return i.number !== num; });
      save(db);
      return json(200, { success: true });
    }

    // Transactions
    if (path === '/api/transactions') {
      if (method === 'GET') {
        var list = db.transactions.filter(function (t) {
          if (query.get('showInactive') !== 'true' && !t.isActive) return false;
          if (query.get('type') && t.type !== query.get('type')) return false;
          if (query.get('status') && t.status !== query.get('status')) return false;
          if (query.get('category') && t.category !== query.get('category')) return false;
          return true;
        }).sort(byDateDesc('date'));
        return json(200, { success: true, data: list });
      }
      if (method === 'POST') {
        if (!body.amount || !body.type || !body.description) return json(400, { success: false, message: 'Amount, type, and description are required' });
        if (body.type !== 'credit' && body.type !== 'debit') return json(400, { success: false, message: 'Type must be "credit" or "debit"' });
        var stamp = new Date().toISOString();
        var t = {
          _id: id(), amount: Number(body.amount), type: body.type, description: body.description, category: body.category || '',
          date: toDate(body.date) || stamp, referenceId: body.referenceId || '', invoiceId: null, lineItemIndex: null,
          status: body.status || 'pending', notes: body.notes || '', isActive: true, createdAt: stamp, updatedAt: stamp,
        };
        db.transactions.push(t);
        save(db);
        return json(201, { success: true, message: 'Transaction created successfully', data: t });
      }
    }
    if ((m = path.match(/^\/api\/transactions\/([^/]+)(\/link-invoice)?$/))) {
      var tr = db.transactions.find(function (x) { return x._id === m[1]; });
      if (!tr) return json(404, { success: false, message: 'Transaction not found' });
      if (m[2] && method === 'POST') {
        var inv = db.invoices.find(function (i) { return i._id === body.invoiceId; });
        if (!inv) return json(404, { success: false, message: 'Invoice not found' });
        var idx = body.lineItemIndex || 0;
        tr.invoiceId = inv._id; tr.lineItemIndex = idx; tr.status = 'completed';
        if (!inv.items[idx]) inv.items.push({ desc: tr.description, qty: 1, rate: tr.amount, amount: tr.amount });
        else inv.items[idx].amount = tr.amount;
        save(db);
        return json(200, { success: true, message: 'Transaction linked to invoice', data: tr });
      }
      if (method === 'GET') return json(200, { success: true, data: tr });
      if (method === 'PUT') {
        ['amount', 'type', 'description', 'category', 'referenceId', 'status', 'notes'].forEach(function (k) {
          if (body[k] !== undefined) tr[k] = k === 'amount' ? Number(body[k]) : body[k];
        });
        if (body.date) tr.date = toDate(body.date) || tr.date;
        tr.updatedAt = new Date().toISOString();
        save(db);
        return json(200, { success: true, message: 'Transaction updated successfully', data: tr });
      }
      if (method === 'DELETE') {
        if (query.get('permanent') === 'true') {
          db.transactions = db.transactions.filter(function (x) { return x._id !== tr._id; });
          save(db);
          return json(200, { success: true, message: 'Transaction permanently deleted' });
        }
        tr.isActive = false; tr.inactiveDate = new Date().toISOString(); tr.inactiveComments = body.inactiveComments || '';
        save(db);
        return json(200, { success: true, message: 'Transaction marked as inactive successfully', data: tr });
      }
    }

    // Employees
    if (path === '/api/employees') {
      if (method === 'GET') {
        return json(200, { success: true, data: db.employees.slice().sort(byDateDesc('createdAt')).map(function (e) { return withEmployeeExtras(db, e); }) });
      }
      if (method === 'POST') {
        var missing = [];
        if (!body.firstName) missing.push('First Name');
        if (!body.lastName) missing.push('Last Name');
        if (!body.email) missing.push('Email Address');
        if (!body.mobile) missing.push('Mobile Number');
        if (!body.gender) missing.push('Gender');
        if (missing.length) return json(400, { success: false, error: 'Missing required fields: ' + missing.join(', '), missingFields: missing });
        if (db.employees.some(function (e) { return e.email === body.email; })) {
          return json(400, { success: false, error: 'Email address already exists. Please use a different email or edit the existing employee.', field: 'email' });
        }
        if (body.employeeCode && db.employees.some(function (e) { return e.employeeCode === body.employeeCode; })) {
          return json(400, { success: false, error: 'Employee ID already exists. Please use a different Employee ID or leave it blank for auto-generation.', field: 'employeeCode' });
        }
        var t0 = new Date().toISOString();
        var e = Object.assign({ _id: id(), isActive: true, generatedLetters: [], employmentType: 'full-time', createdAt: t0 }, body, {
          dob: toDate(body.dob), dateOfJoining: toDate(body.dateOfJoining), dateOfRelieving: toDate(body.dateOfRelieving), updatedAt: t0,
        });
        db.employees.push(e);
        if (body.position && body.department && parseInt(body.ctc, 10) > 0) {
          db.positions.push({ _id: id(), employeeId: e._id, position: String(body.position).trim(), department: String(body.department).trim(), ctc: parseInt(body.ctc, 10), effectiveDate: e.dateOfJoining || t0, endDate: null, createdAt: t0, updatedAt: t0 });
        }
        save(db);
        return json(200, { success: true, data: withEmployeeExtras(db, e) });
      }
    }
    if ((m = path.match(/^\/api\/employees\/([^/]+)\/(identity|position-history)\/([^/]+)$/)) && method === 'DELETE') {
      var coll = m[2] === 'identity' ? 'identities' : 'positions';
      var before = db[coll].length;
      db[coll] = db[coll].filter(function (x) { return x._id !== m[3]; });
      if (db[coll].length === before) {
        return json(404, { success: false, error: m[2] === 'identity' ? 'Document not found' : 'Position history record not found' });
      }
      save(db);
      return json(200, { success: true, message: m[2] === 'identity' ? 'Identity document deleted' : 'Position history deleted' });
    }
    if ((m = path.match(/^\/api\/employees\/([^/]+)(?:\/(letters|identity|position-history))?$/))) {
      var emp = db.employees.find(function (x) { return x._id === m[1]; });
      if (!emp) return json(404, { success: false, error: 'Employee not found' });
      var stampE = new Date().toISOString();

      if (m[2] === 'letters' && method === 'POST') {
        emp.generatedLetters.push(Object.assign({ _id: id(), generatedDate: stampE }, body));
        save(db);
        return json(200, { success: true, data: emp });
      }
      if (m[2] === 'identity' && method === 'POST') {
        var doc2 = { _id: id(), employeeId: emp._id, identityType: body.identityType, identityNumber: body.identityNumber, documentName: body.documentName, documentPath: body.documentData, uploadDate: stampE, createdAt: stampE };
        db.identities.push(doc2);
        save(db);
        return json(200, { success: true, data: doc2 });
      }
      if (m[2] === 'position-history' && method === 'POST') {
        var ph = { _id: id(), employeeId: emp._id, position: body.position, department: body.department, ctc: body.ctc, effectiveDate: toDate(body.effectiveDate) || stampE, endDate: null, createdAt: stampE, updatedAt: stampE };
        db.positions.push(ph);
        save(db);
        return json(200, { success: true, data: ph });
      }
      if (!m[2] && method === 'GET') return json(200, { success: true, data: withEmployeeExtras(db, emp) });
      if (!m[2] && method === 'PUT') {
        var old = clone(emp);
        Object.assign(emp, body, { dob: toDate(body.dob) || emp.dob, dateOfJoining: toDate(body.dateOfJoining) || emp.dateOfJoining, dateOfRelieving: toDate(body.dateOfRelieving), updatedAt: stampE });
        if ((body.position && body.position !== old.position) || (body.department && body.department !== old.department) || (body.ctc && body.ctc != old.ctc)) {
          var open = db.positions.filter(function (p) { return p.employeeId === emp._id && !p.endDate; }).sort(byDateDesc('effectiveDate'))[0];
          if (open) open.endDate = stampE;
          db.positions.push({ _id: id(), employeeId: emp._id, position: body.position || old.position, department: body.department || old.department, ctc: body.ctc || old.ctc, effectiveDate: toDate(body.effectiveDate) || stampE, endDate: null, createdAt: stampE, updatedAt: stampE });
        }
        save(db);
        return json(200, { success: true, data: withEmployeeExtras(db, emp) });
      }
      if (!m[2] && method === 'DELETE') {
        if (query.get('permanent') === 'true') {
          db.employees = db.employees.filter(function (x) { return x._id !== emp._id; });
          db.positions = db.positions.filter(function (p) { return p.employeeId !== emp._id; });
          save(db);
          return json(200, { success: true, message: 'Employee permanently deleted' });
        }
        if (!body.dateOfRelieving) return json(400, { success: false, error: 'Date of relieving is required' });
        Object.assign(emp, { isActive: false, dateOfRelieving: toDate(body.dateOfRelieving), relievingComments: body.relievingComments || '', updatedAt: stampE });
        save(db);
        return json(200, { success: true, message: 'Employee marked as inactive', data: withEmployeeExtras(db, emp) });
      }
    }

    return json(404, { success: false, message: 'Not found' });
  }

  // ---------- fetch interception ----------
  var nativeFetch = window.fetch.bind(window);

  window.fetch = function (input, init) {
    init = init || {};
    var url = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (url.origin !== location.origin || url.pathname.indexOf('/api/') !== 0) return nativeFetch(input, init);

    var method = (init.method || (typeof input === 'string' ? 'GET' : input.method) || 'GET').toUpperCase();
    var body = {};
    if (typeof init.body === 'string') {
      try { body = JSON.parse(init.body); } catch (e) {}
    }
    var result = handle(method, url.pathname, url.searchParams, body);

    if (result.status === 401 && url.pathname !== '/api/auth/login') toLogin();

    // A short delay so loading states behave as they would against a server.
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(new Response(JSON.stringify(result.body), { status: result.status, headers: { 'Content-Type': 'application/json' } }));
      }, 120);
    });
  };

  function toLogin() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem('ml_admin');
    if (!onLoginPage) location.replace('login.html');
  }

  window.mlDemo = {
    credentials: { username: DEMO_USER, password: DEMO_PASS },
    reset: function () {
      localStorage.removeItem(DB_KEY);
      load();
      location.reload();
    },
  };
  window.mlAuth = { token: function () { return sessionStorage.getItem(TOKEN_KEY); }, logout: toLogin };

  // Guard: every admin page except login needs a session.
  if (!onLoginPage && !sessionStorage.getItem(TOKEN_KEY)) location.replace('login.html');
})();
