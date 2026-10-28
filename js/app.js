let parishData = null;
let columbariumData = []; // Dữ liệu tra cứu Nhà Chờ Phục Sinh

// Hàm tải dữ liệu ngôn ngữ chính
async function loadParishData(lang = 'vi') {
  const loadingEl = document.getElementById('contentLoading');
  const contentArea = document.getElementById('pageContentArea');
  
  if (loadingEl) loadingEl.style.display = 'block';
  if (contentArea) contentArea.innerHTML = '';

  try {
    const response = await fetch(`data/${lang}.json`);
    if (!response.ok) throw new Error('Không thể tải dữ liệu ngôn ngữ');
    
    parishData = await response.json();
    
    document.getElementById('parishName').innerText = parishData.parishName;
    document.getElementById('parishSubtitle').innerText = parishData.parishSubtitle;
    document.getElementById('footerText').innerText = parishData.footerText;
    document.getElementById('siteTitle').innerText = `${parishData.parishName} - Thông tin Mục vụ`;

    renderMainMenu(parishData.menu);

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
      
      document.querySelectorAll('.menu-link').forEach(el => el.classList.remove('active'));
      link.classList.add('active');

      displayMenuContent(item);
    });

    menuItemDiv.appendChild(link);
    container.appendChild(menuItemDiv);
  });
}

// Hiển thị nội dung chi tiết của Menu
function displayMenuContent(menuItem) {
  const contentArea = document.getElementById('pageContentArea');
  if (!contentArea) return;

  let htmlContent = '';

  // Kiểm tra nếu là mục "7. NHÀ CHỜ PHỤC SINH" (id: nha-cho-phuc-sinh)
  if (menuItem.id === 'nha-cho-phuc-sinh') {
    htmlContent += `
      <div class="columbarium-portal">
        <div class="card" style="background: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #e2d9cc; margin-bottom: 20px;">
          <h2 style="color: #5c3a21; font-family: 'Merriweather', serif; margin-bottom: 8px;">✝ Tra Cứu Vị Trí Hài Cốt - Nhà Chờ Phục Sinh</h2>
          <p style="color: #666; margin-bottom: 16px;">Nhập Tên Thánh, Họ và Tên, hoặc Số Hộc (VD: A12, B05) để tra cứu vị trí lưu giữ và lịch cầu nguyện.</p>
          
          <div class="search-box" style="position: relative; margin-bottom: 12px;">
            <input type="text" id="columbariumSearchInput" placeholder="Nhập tên thánh, họ tên hoặc số hộc..." style="width: 100%; padding: 12px 40px 12px 16px; font-size: 1rem; border: 1px solid #e2d9cc; border-radius: 8px; outline: none;">
            <button id="clearSearchBtn" type="button" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.1rem; color: #666; cursor: pointer;">✕</button>
          </div>
          <div id="searchStatusSummary" style="font-size: 0.875rem; color: #666; margin-bottom: 16px;">Đang tải dữ liệu danh sách...</div>
        </div>

        <!-- Kết quả tra cứu -->
        <div id="columbariumResultsList" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px;"></div>

        <!-- Lịch cầu nguyện hôm nay -->
        <div class="card" style="background: #fffbf7; padding: 20px; border-radius: 8px; border: 1px solid #e2d9cc;">
          <h3 style="color: #5c3a21; font-family: 'Merriweather', serif; margin-bottom: 10px;">🕯️ Cầu Nguyện Hôm Nay (“Xin đừng quên chúng tôi”)</h3>
          <p style="font-size: 0.9rem; color: #666; margin-bottom: 12px;">Cộng đoàn hiệp ý cầu nguyện cho các linh hồn có ngày giỗ trong ngày hôm nay:</p>
          <div id="todayPrayersContainer">Đang tải lịch cầu nguyện...</div>
        </div>
      </div>
    `;

    contentArea.innerHTML = htmlContent;
    initColumbariumModule();
    return;
  }

  // Xử lý các Menu có Sub-menu thông thường
  if (menuItem.subMenu && menuItem.subMenu.length > 0) {
    htmlContent += `<div class="submenu-container" style="margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 8px;">`;
    menuItem.subMenu.forEach((sub, idx) => {
      htmlContent += `<button class="submenu-btn" data-sub-idx="${idx}" style="padding: 8px 14px; background: #f5efe6; border: 1px solid #e2d9cc; border-radius: 4px; cursor: pointer; font-size: 0.9rem; color: #5c3a21; font-weight: 500;">${sub.title}</button>`;
    });
    htmlContent += `</div>`;
    
    htmlContent += `<div id="subContentDisplay" class="card" style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e2d9cc;">${menuItem.subMenu[0].content}</div>`;
  } else {
    htmlContent += `<div class="card" style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e2d9cc;">${menuItem.content || '<p>Đang cập nhật nội dung...</p>'}</div>`;
  }

  contentArea.innerHTML = htmlContent;

  if (menuItem.subMenu && menuItem.subMenu.length > 0) {
    const subButtons = contentArea.querySelectorAll('.submenu-btn');
    const subDisplay = document.getElementById('subContentDisplay');

    if (subButtons.length > 0) {
      subButtons[0].style.background = '#c89d5c';
      subButtons[0].style.color = '#fff';
    }

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

// --- MODULE TRA CỨU NHÀ CHỜ PHỤC SINH ---
async function initColumbariumModule() {
  // Dữ liệu mẫu (sau này bạn có thể thay bằng file JSON riêng hoặc Google Sheet CSV)
  columbariumData = [
    { id: "001", tenThanh: "Giuse", hoTen: "Nguyễn Văn An", ngaySinh: "15/08/1945", ngayMat: "20/10/2022", ngayGioDuong: "20/10", khu: "A", day: "3", soHoc: "A3-12", ghiChu: "Dãy bên trái lối vào chính" },
    { id: "002", tenThanh: "Maria", hoTen: "Trần Thị Bình", ngaySinh: "02/01/1950", ngayMat: "27/10/2021", ngayGioDuong: "27/10", khu: "B", day: "1", soHoc: "B1-05", ghiChu: "Khu tầng trệt" },
    { id: "003", tenThanh: "Phero", hoTen: "Lê Văn Cường", ngaySinh: "10/11/1938", ngayMat: "15/05/2023", ngayGioDuong: "15/05", khu: "A", day: "2", soHoc: "A2-08", ghiChu: "Gần cửa sổ" }
  ];

  renderColumbariumList(columbariumData);
  checkTodayPrayers(columbariumData);

  const searchInput = document.getElementById('columbariumSearchInput');
  const clearBtn = document.getElementById('clearSearchBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const keyword = removeVietnameseTones(e.target.value);
      if (!keyword) {
        renderColumbariumList(columbariumData);
        return;
      }

      const filtered = columbariumData.filter(item => {
        const target = removeVietnameseTones(`${item.tenThanh} ${item.hoTen} ${item.soHoc} Khu ${item.khu}`);
        return target.includes(keyword);
      });

      renderColumbariumList(filtered);
    });
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      renderColumbariumList(columbariumData);
    });
  }
}

// Hàm chuẩn hóa tiếng Việt không dấu để tìm kiếm cực mượt
function removeVietnameseTones(str) {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  return str.trim();
}

// Render danh sách kết quả tìm kiếm hộc cốt
function renderColumbariumList(items) {
  const container = document.getElementById('columbariumResultsList');
  const summary = document.getElementById('searchStatusSummary');
  if (!container) return;

  container.innerHTML = '';
  if (summary) summary.innerText = `Tìm thấy ${items.length} kết quả vị trí`;

  if (items.length === 0) {
    container.innerHTML = `<div style="background: #fff; padding: 16px; border-radius: 8px; border: 1px solid #e2d9cc; text-align: center; color: #666;">Không tìm thấy thông tin phù hợp.</div>`;
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.style.cssText = "background: #fff; border: 1px solid #e2d9cc; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);";
    card.innerHTML = `
      <div style="font-size: 0.85rem; color: #c89d5c; font-weight: 700; text-transform: uppercase;">${item.tenThanh}</div>
      <h3 style="font-family: 'Merriweather', serif; font-size: 1.1rem; color: #5c3a21; margin-bottom: 8px;">${item.hoTen}</h3>
      <p style="font-size: 0.95rem; margin-bottom: 4px;"><strong>Vị trí hộc:</strong> <span style="background: #5c3a21; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: 700;">${item.soHoc}</span> (Khu ${item.khu} - Dãy ${item.day})</p>
      <p style="font-size: 0.9rem; color: #666; margin-bottom: 4px;">Năm sinh - Năm mất: ${item.ngaySinh} - ${item.ngayMat}</p>
      ${item.ghiChu ? `<p style="font-size: 0.85rem; color: #666; font-style: italic;">Ghi chú: ${item.ghiChu}</p>` : ''}
    `;
    container.appendChild(card);
  });
}

// Lọc lịch cầu nguyện ngày giỗ hôm nay
function checkTodayPrayers(data) {
  const container = document.getElementById('todayPrayersContainer');
  if (!container) return;

  // Lấy ngày tháng hiện tại (DD/MM)
  const today = new Date();
  const dayStr = String(today.getDate()).padStart(2, '0');
  const monthStr = String(today.getMonth() + 1).padStart(2, '0');
  const todayFormatted = `${dayStr}/${monthStr}`;

  // Tạm thời giả lập khớp ngày giỗ (nếu muốn test ngày hôm nay, có thể chỉnh cột ngayGioDuong trong data)
  const todayList = data.filter(item => item.ngayGioDuong === todayFormatted || item.ngayGioDuong === "20/10"); 

  if (todayList.length === 0) {
    container.innerHTML = `<p style="font-size: 0.9rem; color: #666;">Hôm nay không có ngày giỗ trong danh sách.</p>`;
    return;
  }

  container.innerHTML = todayList.map(item => `
    <div style="background: #fff; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2d9cc; margin-bottom: 8px; font-size: 0.95krem;">
      ✝ <strong>${item.tenThanh} ${item.hoTen}</strong> - Vị trí hộc: <span style="color: #5c3a21; font-weight: bold;">${item.soHoc}</span> (Khu ${item.khu})
    </div>
  `).join('');
}

// Khởi chạy
document.addEventListener('DOMContentLoaded', () => {
  const langSelector = document.getElementById('langSelector');
  if (langSelector) {
    langSelector.addEventListener('change', (e) => {
      loadParishData(e.target.value);
    });
  }
  loadParishData('vi');
});
