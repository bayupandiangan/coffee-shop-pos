// sidebar.js
export function loadSidebar(currentRole) {
  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';

  sidebar.innerHTML = `
    <div class="logo">☕ Coffee POS</div>
    <nav>
      <a href="#" data-page="dashboard" class="nav-link active">
        <i class="fas fa-chart-line"></i> <span>Dashboard</span>
      </a>
      ${currentRole === 'admin' ? `
        <a href="#" data-page="products" class="nav-link">
          <i class="fas fa-coffee"></i> <span>Products</span>
        </a>
      ` : ''}
      <a href="#" data-page="pos" class="nav-link">
        <i class="fas fa-shopping-cart"></i> <span>POS</span>
      </a>
      ${currentRole === 'admin' ? `
        <a href="#" data-page="reports" class="nav-link">
          <i class="fas fa-chart-bar"></i> <span>Reports</span>
        </a>
      ` : ''}
      <a href="#" id="logoutBtn" class="nav-link logout">
        <i class="fas fa-sign-out-alt"></i> <span>Logout</span>
      </a>
    </nav>
  `;

  // Set active based on current page
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
  const links = sidebar.querySelectorAll('.nav-link');
  links.forEach(link => {
    const page = link.getAttribute('data-page');
    if (page === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (page) {
        window.electronAPI.navigate(page);
      }
    });
  });

  // Logout
  const logoutBtn = sidebar.querySelector('#logoutBtn');
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await window.electronAPI.logout();
    window.electronAPI.navigate('login');
  });

  return sidebar;
}