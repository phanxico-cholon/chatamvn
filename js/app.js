let parishData = null;

// Hàm tải dữ liệu JSON theo ngôn ngữ được chọn
async function loadParishData(lang = 'vi') {
  const loadingEl = document.getElementById('contentLoading');
  const contentArea = document.getElementById('pageContentArea');
  
  if (loadingEl) loadingEl.style.display = 'block';
  if (contentArea) contentArea.innerHTML = '';

  try {
    // Hiện tại chúng ta dùng file vi.json, sau này có thể mở rộng ra en.json, zh-tw.json...
    const response = await fetch(`data/${lang}.json`);
    if (!response.ok) throw new Error('Không thể tải dữ liệu ngôn ngữ');
    
    parishData = await response.json();
    
    // Cập nhật thông tin Header & Footer từ JSON
    document.getElementById('parishName').innerText = parishData.parishName;
    document.getElementById('parishSubtitle').innerText = parishData.parishSubtitle;
    document.getElementById('footerText').innerText = parishData.footerText;
    document.getElementById('siteTitle').innerText = `${parishData.parishName} - Thông tin Mục vụ`;

    // Render thanh Menu Cấp 1
    renderMainMenu(parishData.menu);

    // Mặc định hiển thị mục đầu tiên (Trang chủ)
    if (parishData.menu && parishData.menu.length > 0) {
      displayMenuContent(parishData.menu[0]);
    }

  } catch (error) {
    console.error('Lỗi:', error);
    if (loadingEl) loadingEl.innerText = 'Đang cập nhật nội dung đa ngôn ngữ...';
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

// Render Menu chính cấp 1
function renderMainMenu(menuList) {
  const container = document.getElementById('mainMenuContainer');
  if (!container) return;

  container.innerHTML = '';

  menuList.forEach((item, index) => {
    const menuItemDiv = document.createElement('div');
    menuItemDiv.className = 'menu-item';

    const link = document.createElement('a');
    link.href = '#';
    link.className = 'menu-link' + (index === 0 ? ' active' : '');
    link.innerText = item.title;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Xóa active cũ, thêm active mới
      document.querySelectorAll('.menu-link').forEach(el => el.classList.remove('active'));
      link.classList.add('active');

      // Hiển thị nội dung
      displayMenuContent(item);
    });

    menuItemDiv.appendChild(link);
    container.appendChild(menuItemDiv);
  });
}

// Hiển thị nội dung chi tiết của Menu (bao gồm cả Sub-menu nếu có)
function displayMenuContent(menuItem) {
  const contentArea = document.getElementById('pageContentArea');
  if (!contentArea) return;

  let htmlContent = '';

  // Nếu có Sub-menu (Menu cấp 2)
  if (menuItem.subMenu && menuItem.subMenu.length > 0) {
    htmlContent += `<div class="submenu-container" style="margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 8px;">`;
    menuItem.subMenu.forEach((sub, idx) => {
      htmlContent += `<button class="submenu-btn" data-sub-idx="${idx}" style="padding: 8px 14px; background: #f5efe6; border: 1px solid #e2d9cc; border-radius: 4px; cursor: pointer; font-size: 0.9rem; color: #5c3a21; font-weight: 500;">${sub.title}</button>`;
    });
    htmlContent += `</div>`;
    
    // Khu vực chứa nội dung của menu con đang chọn
    htmlContent += `<div id="subContentDisplay" class="card" style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e2d9cc;">${menuItem.subMenu[0].content}</div>`;
  } else {
    // Nếu không có menu con, hiển thị trực tiếp nội dung
    htmlContent += `<div class="card" style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e2d9cc;">${menuItem.content || '<p>Đang cập nhật nội dung...</p>'}</div>`;
  }

  contentArea.innerHTML = htmlContent;

  // Xử lý sự kiện click chuyển đổi qua lại giữa các menu con cấp 2
  if (menuItem.subMenu && menuItem.subMenu.length > 0) {
    const subButtons = contentArea.querySelectorAll('.submenu-btn');
    const subDisplay = document.getElementById('subContentDisplay');

    // Mặc định chọn nút đầu tiên
    if (subButtons.length > 0) subButtons[0].style.background = '#c89d5c';
    if (subButtons.length > 0) subButtons[0].style.color = '#fff';

    subButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        subButtons.forEach(b => {
          b.style.background = '#f5efe6';
          b.style.color = '#5c3a21';
        });
        btn.style.background = '#c89d5c';
        btn.style.color = '#fff';

        const subIdx = btn.getAttribute('data-sub-idx');
        subDisplay.innerHTML = menuItem.subMenu[subIdx].content;
      });
    });
  }
}

// Lắng nghe sự kiện thay đổi ngôn ngữ trên thanh Top Bar
document.addEventListener('DOMContentLoaded', () => {
  const langSelector = document.getElementById('langSelector');
  
  if (langSelector) {
    langSelector.addEventListener('change', (e) => {
      const selectedLang = e.target.value;
      loadParishData(selectedLang);
    });
  }

  // Khởi chạy mặc định tiếng Việt
  loadParishData('vi');
});
