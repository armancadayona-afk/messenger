/* WorkTimer Admin: one route = one real mounted page.
 * Preserve live DOM nodes while tabs change; never duplicate backend connections. */
(() => {
  const main = document.querySelector('.admin-content');
  if (!main) return;
  const lookup = id => document.getElementById(id);
  const routes = {
    overview: [main.querySelector('.page-heading'), main.querySelector('.stat-grid')],
    devices: [lookup('devices')],
    monitor: [lookup('three-monitor'), lookup('monitor')],
    activity: [lookup('activity')],
    tasks: [lookup('admin-tasks-page')],
    earnings: [lookup('admin-earnings-page')],
    chat: [lookup('admin-chat-page')]
  };
  const pages = [...new Set(Object.values(routes).flat().filter(Boolean))];
  const footer = main.querySelector('.admin-footer');
  const parked = document.createDocumentFragment();
  const outlet = document.createElement('div');
  outlet.id = 'admin-route-content';
  outlet.setAttribute('role', 'region');
  outlet.setAttribute('aria-live', 'off');
  pages.forEach(page => parked.appendChild(page));
  main.replaceChildren(outlet, ...(footer ? [footer] : []));
  window.adminPageNode = id => {
    const attached = document.getElementById(id);
    if (attached) return attached;
    for (const page of pages) {
      if (page.id === id) return page;
      const found = page.querySelector?.('#' + CSS.escape(id));
      if (found) return found;
    }
    return null;
  };
  const links = [...document.querySelectorAll('.sidebar-nav a')];
  const names = ['overview','devices','monitor','activity','tasks','earnings','chat'];
  function open(name) {
    if (!Object.prototype.hasOwnProperty.call(routes, name)) return;
    while (outlet.firstChild) parked.appendChild(outlet.firstChild);
    routes[name].forEach(page => { if (page) outlet.appendChild(page); });
    links.forEach((link, i) => {
      const active = names[i] === name;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    document.body.classList.remove('nav-open');
    const toggle = document.getElementById('menuToggle');
    if (toggle) toggle.setAttribute('aria-expanded','false');
    window.scrollTo(0, 0);
  }
  links.forEach((link, i) => {
    link.setAttribute('href', '#' + names[i]);
    link.addEventListener('click', event => {
      event.preventDefault();
      open(names[i]);
    });
  });
  window.openAdminPage = open;
  open('overview');
})();
