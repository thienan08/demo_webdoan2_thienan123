// ==================== CẤU HÌNH FIREBASE ====================
const firebaseConfig = {
    apiKey: "AIzaSyDMsToDJS9rzDLdCABAjPNTqmyTgR56RJI",
    authDomain: "doan2-a7a5b.firebaseapp.com",
    databaseURL: "https://doan2-a7a5b-default-rtdb.firebaseio.com",
    projectId: "doan2-a7a5b",
    storageBucket: "doan2-a7a5b.firebasestorage.app",
    messagingSenderId: "178339693613",
    appId: "1:178339693613:web:b528dc235ec42bb7e264a4",
    measurementId: "G-N6981FKLX1"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ==================== DỮ LIỆU ====================
let settings = {
    room1PowerThreshold: 150,
    room2PowerThreshold: 150,
    room1CostThreshold: 150 * 3500,
    room2CostThreshold: 150 * 3500,
    electricityPrice: 3500
};

const roomData = { room101: {}, room102: {} };
let paymentData = [];

// ==================== KHỞI TẠO ====================
document.addEventListener('DOMContentLoaded', () => {
    initDateTime();
    initNavigation();
    initFirebaseListeners();
    initCharts();
    initModals();
    loadSettings();
    loadPaymentData();
    renderPaymentTable();
});

// ==================== FIREBASE ====================
function initFirebaseListeners() {
    database.ref('Room1').on('value', snap => {
        const data = snap.val();
        if (data) {
            roomData.room101 = data;
            updateDashboard();
        }
    });
    database.ref('Room2').on('value', snap => {
        const data = snap.val();
        if (data) {
            roomData.room102 = data;
            updateDashboard();
        }
    });
}

// ==================== THỜI GIAN ====================
function initDateTime() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
}
function updateDateTime() {
    const now = new Date();
    document.getElementById('currentDate').textContent =
        now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('currentTime').textContent =
        now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ==================== ĐIỀU HƯỚNG ====================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = {
        dashboardBtn: 'dashboardSection',
        reportBtn: 'reportSection',
        paymentBtn: 'paymentSection'
    };
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            const sectionId = sections[this.id];
            if (sectionId) document.getElementById(sectionId).classList.add('active');
        });
    });
}

// ==================== DASHBOARD ====================
function updateDashboard() {
    document.getElementById('room1Voltage').textContent = (roomData.room101.Voltage1 || 0) + ' V';
    document.getElementById('room1Current').textContent = (roomData.room101.Current1 || 0) + ' A';
    document.getElementById('room1Power').textContent = (roomData.room101.Power1 || 0) + ' W';
    document.getElementById('room1Energy').textContent = (roomData.room101.Energy1 || 0) + ' kWh';
    document.getElementById('room1Cost').textContent = (roomData.room101.Price1 || 0).toLocaleString('vi-VN') + ' VNĐ';

    document.getElementById('room2Voltage').textContent = (roomData.room102.Voltage2 || 0) + ' V';
    document.getElementById('room2Current').textContent = (roomData.room102.Current2 || 0) + ' A';
    document.getElementById('room2Power').textContent = (roomData.room102.Power2 || 0) + ' W';
    document.getElementById('room2Energy').textContent = (roomData.room102.Energy2 || 0) + ' kWh';
    document.getElementById('room2Cost').textContent = (roomData.room102.Price2 || 0).toLocaleString('vi-VN') + ' VNĐ';

    updateAlerts();
}

// ==================== TRẠNG THÁI CẢNH BÁO ====================
function updateAlerts() {
    const warn1 = roomData.room101.Warn1 ?? 0;
    const energy1 = roomData.room101.Energy1 ?? 0;
    const threshold1 = roomData.room101.Threshold1 ?? settings.room1PowerThreshold;

    const warn2 = roomData.room102.Warn2 ?? 0;
    const energy2 = roomData.room102.Energy2 ?? 0;
    const threshold2 = roomData.room102.Threshold2 ?? settings.room2PowerThreshold;

    const r1Alert = document.getElementById('room1Alert');
    const r1Msg = document.getElementById('room1AlertMsg');
    const r2Alert = document.getElementById('room2Alert');
    const r2Msg = document.getElementById('room2AlertMsg');

    if (warn1 === 1 || energy1 > threshold1) {
        r1Alert.className = 'param-card alert-card';
        r1Alert.querySelector('.param-icon').textContent = '⚠️';
        r1Msg.textContent = `Vượt ngưỡng ${(energy1 - threshold1).toFixed(1)} kWh`;
    } else {
        r1Alert.className = 'param-card alert-card success';
        r1Alert.querySelector('.param-icon').textContent = '✅';
        r1Msg.textContent = 'Bình thường';
    }

    if (warn2 === 1 || energy2 > threshold2) {
        r2Alert.className = 'param-card alert-card';
        r2Alert.querySelector('.param-icon').textContent = '⚠️';
        r2Msg.textContent = `Vượt ngưỡng ${(energy2 - threshold2).toFixed(1)} kWh`;
    } else {
        r2Alert.className = 'param-card alert-card success';
        r2Alert.querySelector('.param-icon').textContent = '✅';
        r2Msg.textContent = 'Bình thường';
    }
}

// ==================== BIỂU ĐỒ ====================
function initCharts() {
    const months = ['Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11'];
    const powerCtx = document.getElementById('powerChart').getContext('2d');
    new Chart(powerCtx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                { label: 'Phòng 101', data: [120, 135, 145, 168], backgroundColor: 'rgba(44,62,80,0.85)', borderRadius: 8 },
                { label: 'Phòng 102', data: [110, 128, 138, 155], backgroundColor: 'rgba(120,144,156,0.85)', borderRadius: 8 }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Điện năng (kWh)' } } }
        }
    });

    const costCtx = document.getElementById('costChart').getContext('2d');
    new Chart(costCtx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                { label: 'Phòng 101', data: [420000, 472500, 507500, 588000], borderColor: '#2c3e50', backgroundColor: 'rgba(44,62,80,0.1)', tension: 0.4 },
                { label: 'Phòng 102', data: [385000, 448000, 483000, 542500], borderColor: '#78909c', backgroundColor: 'rgba(120,144,156,0.1)', tension: 0.4 }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Chi phí (VNĐ)' }, ticks: { callback: v => v.toLocaleString('vi-VN') } } }
        }
    });
}

// ==================== MODALS ====================
function initModals() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const addPaymentBtn = document.getElementById('addPaymentBtn');
    const addPaymentModal = document.getElementById('addPaymentModal');
    const savePaymentBtn = document.getElementById('savePayment');

    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
        loadSettingsToForm();
    });
    saveSettingsBtn.addEventListener('click', () => {
        saveSettings();
        settingsModal.style.display = 'none';
    });

    addPaymentBtn.addEventListener('click', () => {
        addPaymentModal.style.display = 'block';
        document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
    });
    savePaymentBtn.addEventListener('click', () => {
        addPaymentRecord();
        addPaymentModal.style.display = 'none';
    });

    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', e => {
            document.getElementById(e.target.dataset.modal).style.display = 'none';
        });
    });
    window.addEventListener('click', e => {
        if (e.target.classList.contains('modal')) e.target.style.display = 'none';
    });
}

// ==================== CÀI ĐẶT NGƯỠNG ====================
function loadSettingsToForm() {
    document.getElementById('room1PowerThreshold').value = settings.room1PowerThreshold;
    document.getElementById('room2PowerThreshold').value = settings.room2PowerThreshold;
    document.getElementById('room1CostThreshold').value = settings.room1CostThreshold;
    document.getElementById('room2CostThreshold').value = settings.room2CostThreshold;
    document.getElementById('electricityPrice').value = settings.electricityPrice;
}

function saveSettings() {
    const r1 = parseFloat(document.getElementById('room1PowerThreshold').value);
    const r2 = parseFloat(document.getElementById('room2PowerThreshold').value);
    const price = parseFloat(document.getElementById('electricityPrice').value);

    settings.electricityPrice = price;
    settings.room1PowerThreshold = r1;
    settings.room2PowerThreshold = r2;
    settings.room1CostThreshold = r1 * price;
    settings.room2CostThreshold = r2 * price;

    document.getElementById('room1CostThreshold').value = settings.room1CostThreshold;
    document.getElementById('room2CostThreshold').value = settings.room2CostThreshold;

    localStorage.setItem('roomMonitorSettings', JSON.stringify(settings));
    database.ref('Room1').update({ Threshold1: r1 });
    database.ref('Room2').update({ Threshold2: r2 });

    alert('✅ Đã lưu & đồng bộ Firebase!');
    updateAlerts();
}

function loadSettings() {
    const saved = localStorage.getItem('roomMonitorSettings');
    if (saved) settings = JSON.parse(saved);
}

// ==================== THANH TOÁN ====================
function loadPaymentData() {
    const saved = localStorage.getItem('paymentData');
    paymentData = saved ? JSON.parse(saved) : [];
}

function savePaymentData() {
    localStorage.setItem('paymentData', JSON.stringify(paymentData));
}

function addPaymentRecord() {
    const date = document.getElementById('paymentDate').value;
    const room = document.getElementById('paymentRoom').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const status = document.getElementById('paymentStatus').value;

    if (!date || !amount) return alert('⚠️ Điền đầy đủ thông tin!');
    const record = { date, room, amount, status };
    paymentData.unshift(record);
    savePaymentData();
    renderPaymentTable();
    alert('✅ Đã thêm bản ghi!');
}

function deletePaymentRecord(index) {
    if (confirm('🗑️ Bạn có chắc muốn xóa bản ghi này không?')) {
        paymentData.splice(index, 1);
        savePaymentData();
        renderPaymentTable();
    }
}

function renderPaymentTable() {
    const tbody = document.getElementById('paymentTableBody');
    tbody.innerHTML = '';
    paymentData.forEach((r, i) => {
        const d = new Date(r.date).toLocaleDateString('vi-VN');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${d}</td>
            <td>Phòng ${r.room}</td>
            <td>${r.amount.toLocaleString('vi-VN')} VNĐ</td>
            <td>
                <select class="status-select" data-index="${i}">
                    <option value="Đã đóng" ${r.status === 'Đã đóng' ? 'selected' : ''}>Đã đóng</option>
                    <option value="Chưa đóng" ${r.status === 'Chưa đóng' ? 'selected' : ''}>Chưa đóng</option>
                </select>
            </td>
            <td><button class="delete-btn" data-index="${i}">🗑️ Xóa</button></td>`;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.status-select').forEach(sel => {
        sel.addEventListener('change', e => {
            const i = e.target.dataset.index;
            paymentData[i].status = e.target.value;
            savePaymentData();
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const i = e.target.dataset.index;
            deletePaymentRecord(i);
        });
    });
}
