// 外卖食物列表
const foods = [
    '🍔 汉堡',
    '🍗 炸鸡',
    '🍜 螺蛳粉',
    '🍝 火鸡面',
    '🍕 披萨',
    '🍚 鸡腿饭',
    '🥣 面汤',
    '🍲 炒米粉'
];

// 颜色方案
const colors = [
    'rgba(255, 107, 107, 0.95)',   // 半透明红色
    'rgba(152, 216, 200, 0.95)',   // 半透明蓝绿
    'rgba(69, 183, 209, 0.95)',    // 半透明蓝色
    'rgba(255, 110, 160, 0.95)',   // 半透明粉色
    'rgba(255, 234, 167, 0.95)',   // 半透明黄色
    'rgba(221, 160, 221, 0.95)',   // 半透明紫色
    'rgba(78, 205, 196, 0.95)',    // 半透明青色
    'rgba(247, 220, 111, 0.95)'    // 半透明金色
];

// 获取DOM元素
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const resultDiv = document.getElementById('result');
const resultOverlay = document.getElementById('resultOverlay');

// 转盘状态
let isSpinning = false;
let currentAngle = 0;
let spinSpeed = 0;
const segments = foods.length;
const segmentAngle = (2 * Math.PI) / segments;
// 光晕动画变量
let glowTime = 0;

// ============================================
// 控制转动时间的参数 - 在这里修改！
// ============================================
const friction = 0.992;     // 摩擦系数，如0.99为每帧保留99%的速度，越大转动越久
const minSpeed = 0.0002;     // 最小速度阈值，越小转动越久

// 初始转动速度配置
const SPEED_CONFIG = {
    randomRange: 0.4,  // 随机浮动速度范围
    baseSpeed: 0.4     // 基础速度，越大转动越久
};
// ============================================


// ============================================
// 高清屏适配 - 解决文字模糊问题
// ============================================
function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width || 500;
    const displayHeight = displayWidth; // 保持正方形
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
setupCanvas();
window.addEventListener('resize', () => {
    setupCanvas();
    drawWheel(currentAngle);
});

// 绘制转盘
function drawWheel(angle) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const displaySize = canvas.clientWidth || 500;
    const centerX = displaySize / 2;
    const centerY = displaySize / 2;
    const radius = centerX - 10;

    // 绘制各个扇区
    for (let i = 0; i < segments; i++) {
        const startAngle = angle + i * segmentAngle;
        const endAngle = startAngle + segmentAngle;

        // 绘制扇区
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        // 创建渐变色
        const gradient = ctx.createLinearGradient(
            centerX + Math.cos(startAngle) * radius * 0.5,
            centerY + Math.sin(startAngle) * radius * 0.5,
            centerX + Math.cos(endAngle) * radius,
            centerY + Math.sin(endAngle) * radius
        );
        // 在原来颜色基础上生成渐变色
        const baseColor = colors[i].replace('0.95', '').replace('rgba', '').replace('(', '').replace(')', '').split(',').map(Number);
        const lightColor = `rgba(${Math.min(255, baseColor[0] + 12)}, ${Math.min(255, baseColor[1] + 12)}, ${Math.min(255, baseColor[2] + 12)}, 0.95)`;
        const darkColor = `rgba(${Math.max(0, baseColor[0] - 5)}, ${Math.max(0, baseColor[1] - 5)}, ${Math.max(0, baseColor[2] - 5)}, 0.95)`;

        gradient.addColorStop(0, lightColor);
        gradient.addColorStop(1, darkColor);
        // 填充渐变色
        ctx.fillStyle = gradient;
        ctx.fill();

        // 绘制边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 绘制文字
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#333';
        const fontSize = Math.min(displaySize * 0.052, 23);
        ctx.font = `bold ${fontSize}px "Microsoft YaHei", Arial`;

        // 文字位置
        const textRadius = radius * 0.81;
        ctx.fillText(foods[i], textRadius, 6);
        ctx.restore();
    }
    // ============================================
    // 转盘外圈动态光晕效果（精致常驻版）
    // ============================================
    glowTime += 0.025;
    const glowAlpha1 = 0.3 + Math.sin(glowTime) * 0.25;
    const glowAlpha2 = 0.45 + Math.sin(glowTime * 1.6) * 0.3;
    const glowAlpha3 = 0.55 + Math.sin(glowTime * 0.9) * 0.35;
    const glowBlur1 = 6 + Math.sin(glowTime) * 5;
    const glowBlur2 = 4 + Math.sin(glowTime * 1.6) * 4;
    const glowBlur3 = 2 + Math.sin(glowTime * 0.9) * 3;

    // 外层光晕（紧贴边缘外侧）
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 3, 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(255, 200, 180, ${glowAlpha1})`;
    ctx.lineWidth = 5;
    ctx.shadowColor = `rgba(255, 180, 150, ${glowAlpha1 + 0.2})`;
    ctx.shadowBlur = glowBlur1;
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 中层光晕（紧贴边缘）
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 1, 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(255, 220, 200, ${glowAlpha2})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = `rgba(255, 200, 170, ${glowAlpha2 + 0.2})`;
    ctx.shadowBlur = glowBlur2;
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 内层光晕（边缘内侧）
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 1, 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(255, 235, 220, ${glowAlpha3})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = `rgba(255, 220, 190, ${glowAlpha3 + 0.2})`;
    ctx.shadowBlur = glowBlur3;
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 绘制中心圆 - 紧贴外圈的动态光晕
    const centerCircleRadius = displaySize * 0.062;
    const centerGlowAlpha = 0.3 + Math.sin(glowTime * 1.2) * 0.25;
    const centerGlowBlur = 2 + Math.sin(glowTime * 1.2) * 2;

    // 中心圆外圈动态光晕（紧贴边缘）
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerCircleRadius + 0.5, 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(255, 200, 160, ${centerGlowAlpha})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = `rgba(255, 180, 140, ${centerGlowAlpha + 0.2})`;
    ctx.shadowBlur = centerGlowBlur;
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 主圆 - 柔和金橙色 + 微弱边缘光
    const centerMainGradient = ctx.createRadialGradient(centerX - 2, centerY - 2, centerCircleRadius * 0.1, centerX, centerY, centerCircleRadius);
    centerMainGradient.addColorStop(0, 'rgba(255, 250, 245, 1)');
    centerMainGradient.addColorStop(0.5, 'rgba(250, 225, 205, 1)');
    centerMainGradient.addColorStop(1, 'rgba(240, 195, 165, 1)');
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerCircleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = centerMainGradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 高光点
    const highlightOffsetX = centerCircleRadius * 0.19;
    const highlightOffsetY = centerCircleRadius * 0.22;
    const highlightRadius = centerCircleRadius * 0.13;
    ctx.beginPath();
    ctx.arc(centerX - highlightOffsetX, centerY - highlightOffsetY, highlightRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fill();

    // 中心文字
    const centerFontSize = Math.min(displaySize * 0.032, 16);
    ctx.fillStyle = 'rgba(30, 30, 30, 0.99)';
    ctx.font = `bold ${centerFontSize}px "Microsoft YaHei", Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('柯基猪', centerX, centerY);
}

// ============================================
// 获取指针指向食物函数
// ============================================
function getSelectedFood(angle) {
    const pointerAngle = -Math.PI / 2;

    let normalizedAngle = angle % (2 * Math.PI);
    if (normalizedAngle < 0) {
        normalizedAngle += 2 * Math.PI;
    }

    let relativeAngle = (pointerAngle - normalizedAngle) % (2 * Math.PI);
    if (relativeAngle < 0) {
        relativeAngle += 2 * Math.PI;
    }

    let segmentIndex = Math.floor(relativeAngle / segmentAngle);

    if (segmentIndex >= segments) {
        segmentIndex = segments - 1;
    }
    if (segmentIndex < 0) {
        segmentIndex = 0;
    }

    return foods[segmentIndex];
}

// 动画循环
function animate() {
    if (isSpinning) {
        // 微非线性：速度高时保留多，速度低时保留少，低速加快衰减
        const speedFactor = Math.abs(spinSpeed) / 0.3;
        const adjustedFriction = friction + 0.001 - (0.003 * (1 - Math.min(speedFactor, 1)));

        spinSpeed *= adjustedFriction;
        currentAngle += spinSpeed;

        drawWheel(currentAngle);

        // 低速额外衰减
        if (Math.abs(spinSpeed) < 0.005) {
            spinSpeed *= 0.985;
        }

        if (Math.abs(spinSpeed) < minSpeed) {
            stopSpinning();
        } else {
            requestAnimationFrame(animate);
        }
    }
}

// 开始转动
function startSpinning() {
    if (isSpinning) return;

    isSpinning = true;
    spinBtn.disabled = true;

    hideResult();

    spinSpeed = Math.random() * SPEED_CONFIG.randomRange + SPEED_CONFIG.baseSpeed;

    animate();
}

// 停止转动
function stopSpinning() {
    isSpinning = false;
    spinSpeed = 0;
    spinBtn.disabled = false;

    const selectedFood = getSelectedFood(currentAngle);

    if (selectedFood && foods.includes(selectedFood)) {
        showResult(selectedFood);
    } else {
        showResult(foods[0]);
    }
}

// ============================================
// 弹窗显示结果
// ============================================
function showResult(food) {
    if (!food) {
        food = foods[0];
    }

    const resultContent = `
        <button class="close-icon" onclick="hideResult()" title="关闭">×</button>
        <div class="result-text">
            <div class="result-emoji">🎉</div>
            <div class="result-title">今天吃：</div>
            <div class="result-food">${food}</div>
        </div>
        <button class="close-btn" onclick="hideResult()">确定</button>
    `;

    resultDiv.innerHTML = resultContent;
    resultOverlay.classList.add('show');

    document.body.style.overflow = 'hidden';
}

// 隐藏结果弹窗
function hideResult() {
    resultOverlay.classList.remove('show');
    resultDiv.innerHTML = '';

    document.body.style.overflow = '';
}

// 点击遮罩层关闭弹窗
resultOverlay.addEventListener('click', function(e) {
    if (e.target === resultOverlay) {
        hideResult();
    }
});

// ============================================
// 手机端/电脑端按钮初始化与切换
// ============================================
function initButtons() {
    if (window.innerWidth <= 600) {
        // 手机端：显示初始按钮，隐藏平板按钮
        spinBtn.classList.add('initial-btn');
        spinBtn.classList.remove('tablet-btn', 'show');
        spinBtn.innerHTML = '召唤猪猪';
    } else {
        // 电脑端：使用默认按钮
        spinBtn.classList.remove('initial-btn', 'tablet-btn', 'show');
        spinBtn.textContent = '开始转动';
    }
}

function switchToTabletButton() {
    if (window.innerWidth > 600) return; // 只在手机端执行

    // 先移除初始按钮类
    spinBtn.classList.remove('initial-btn');

    spinBtn.style.animation = '';
    void spinBtn.offsetWidth;

    // 添加平板按钮类并显示
    spinBtn.classList.add('tablet-btn', 'show');

    // 设置平板按钮内容
    spinBtn.innerHTML = `
        <div class="status-bar">
            <span class="time">13:14 &nbsp5月20日周六</span>
            <span class="battery">🛜99%🔋</span>
        </div>
        <span class="back-link">🔙返回</span>
        <span class="btn-text">猪猪选食</span>
    `;
}

function switchToInitialButton() {
    if (window.innerWidth > 600) return; // 只在手机端执行

    // 移除平板按钮类
    spinBtn.classList.remove('tablet-btn', 'show');

    // 添加初始按钮类
    spinBtn.classList.add('initial-btn');

    // 清除可能残留的内联样式
    spinBtn.style.animation = '';

    // 强制重排后重新应用动画
    void spinBtn.offsetWidth;
    spinBtn.style.animation = 'initialFloat 3s ease-in-out infinite';

    // 恢复初始按钮内容
    spinBtn.innerHTML = '召唤猪猪';
}

// 按钮点击事件
spinBtn.addEventListener('click', function(e) {
    // 如果点击的是返回链接
    if (e.target.classList.contains('back-link')) {
        e.preventDefault();
        e.stopPropagation();
        switchToInitialButton();
        return;
    }

    // 如果是手机端且是初始按钮
    if (window.innerWidth <= 600 && spinBtn.classList.contains('initial-btn')) {
        e.preventDefault();
        switchToTabletButton();
        return;
    }

    // 正常转动逻辑
    startSpinning();
});

// 初始绘制
drawWheel(currentAngle);

// 初始化按钮状态
initButtons();

// 窗口大小改变时重新初始化按钮
window.addEventListener('resize', () => {
    // 如果不是手机端，确保按钮恢复正常
    if (window.innerWidth > 600) {
        spinBtn.classList.remove('initial-btn', 'tablet-btn', 'show');
        spinBtn.textContent = '开始转动';
    } else {
        // 手机端且还未切换过
        if (!spinBtn.classList.contains('tablet-btn')) {
            spinBtn.classList.add('initial-btn');
            spinBtn.innerHTML = '召唤猪猪';
        }
    }
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isSpinning) {
        e.preventDefault();
        startSpinning();
    }

    if (e.code === 'Escape') {
        hideResult();
    }
});

// ============================================
// 背景音乐控制
// ============================================
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let musicPlaying = false;

musicToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    if (musicPlaying) {
        bgMusic.pause();
        musicToggle.textContent = '🔇';
    } else {
        bgMusic.play().catch(() => {});
        musicToggle.textContent = '🔊';
    }
    musicPlaying = !musicPlaying;
});

// 首次用户交互后自动播放
document.addEventListener('click', function autoPlay() {
    if (!musicPlaying) {
        bgMusic.play().catch(() => {});
        musicToggle.textContent = '🔊';
        musicPlaying = true;
    }
}, { once: true });

