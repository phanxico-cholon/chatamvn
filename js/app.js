// LINK GOOGLE SHEET CSV ĐÃ KẾT NỐI TRỰC TIẾP TỪ GOOGLE SHEETS CỦA BẠN:
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQDqsKXut4tys4GoS-D19eQ_hthJIhLXxX8a6_neYoavoIOpbMgnHPOH8wlvSO-N783DrjUZfWRCPYc/pub?gid=255516434&single=true&output=csv";

let parishData = null;
let columbariumData = [];

// Hàm chuyển đổi dữ liệu CSV từ Google Sheets thành Mảng Object JS
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (currentline.length < headers.length) continue;

    const obj = {};
    headers.forEach((header, index) => {
      let val = currentline[index] ? currentline[index].trim() : '';
      val = val.replace(/^"|"$/g, '');
      obj[header] = val;
    });
    results.push(obj);
  }
  return results;
}

// Tải dữ liệu trang web chính
async function loadParishData(lang = 'vi') {
  const loadingEl = document.getElementById('contentLoading');
  const contentArea = document.getElementById('pageContentArea');
  
  if (loadingEl) loadingEl.style.display = 'block';
  if (contentArea) contentArea.innerHTML = '';

  try {
    const response = await fetch(`data/${lang}.json`); if (!response.ok) throw new Error('Không thể tải dữ liệu ngôn ngữ');  parishData = await response.json();  document.getElementById('parishName').innerText = parishData.parishName; document.getElementById('parishSubtitle').innerText = parishData.parishSubtitle; document.getElementById('footerText').innerText = parishData.footerText; document.getElementById('siteTitle').innerText = `${parishData.parishName} - Thông tin Mục vụ`;

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

// Hiển thị nội dung chi tiết Menu
function displayMenuContent(menuItem) {
  const contentArea = document.getElementById('pageContentArea');
  if (!contentArea) return;

  let htmlContent = '';

  // Khi chọn "7. NHÀ CHỜ PHỤC SINH"
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
          <div id="searchStatusSummary" style="font-size: 0.875rem; color: #666; margin-bottom: 16px;">Đang kết nối dữ liệu Google Sheet...</div>
        </div>

        <div id="columbariumResultsList" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px;"></div>

        <div class="card" style="background: #fffbf7; padding: 20px; border-radius: 8px; border: 1px solid #e2d9cc;">
          <h3 style="
