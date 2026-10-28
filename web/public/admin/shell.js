// Wires the shared sidebar on the standalone admin pages (the markup is in
// each page). The dashboard has its own wiring.
(function () {
  'use strict';
  var sidebar = document.getElementById('sidebar');
  var menu = document.getElementById('shellMenu');
  var logout = document.getElementById('shellLogout');
  if (menu && sidebar) menu.addEventListener('click', function () { sidebar.classList.toggle('open'); });
  if (logout) logout.addEventListener('click', function () {
    if (window.mlAuth) window.mlAuth.logout();
    else { sessionStorage.clear(); location.href = 'login.html'; }
  });
})();
