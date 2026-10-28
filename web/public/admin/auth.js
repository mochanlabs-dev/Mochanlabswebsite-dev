// Shared admin auth. Load first on every admin page.
//  - Adds the session token to every same-origin /api request.
//  - Sends you to the login page if there is no token, or if the server
//    rejects it (expired, tampered with, or signed out).
(function () {
  'use strict';

  var KEY = 'ml_admin_token';
  var onLoginPage = /\/login(\.html)?$/.test(location.pathname);

  function token() {
    return sessionStorage.getItem(KEY);
  }

  function toLogin() {
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem('ml_admin');
    if (!onLoginPage) location.replace('login.html');
  }

  function isApi(url) {
    var u = new URL(url, location.href);
    return u.origin === location.origin && u.pathname.indexOf('/api/') === 0 && u.pathname !== '/api/auth/login';
  }

  var nativeFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    init = init || {};
    var url = typeof input === 'string' ? input : input.url;
    var api = isApi(url);
    if (api && token()) {
      var headers = new Headers(init.headers || (typeof input === 'string' ? undefined : input.headers));
      if (!headers.has('Authorization')) headers.set('Authorization', 'Bearer ' + token());
      init = Object.assign({}, init, { headers: headers });
    }
    return nativeFetch(input, init).then(function (res) {
      if (api && res.status === 401) toLogin();
      return res;
    });
  };

  window.mlAuth = { token: token, logout: toLogin };

  if (!onLoginPage) {
    if (!token()) {
      location.replace('login.html');
      return;
    }
    // Confirm the token is still valid before the page does anything else.
    nativeFetch('/api/auth/verify', { headers: { Authorization: 'Bearer ' + token() } })
      .then(function (res) { if (!res.ok) toLogin(); })
      .catch(function () {});
  }
})();
