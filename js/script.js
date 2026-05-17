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

// ============================================
// 控制转动时间的参数 - 在这里修改！
// ============================================
const friction = 0.986;     // 摩擦系数（0.9-0.999），越大转动越久
const minSpeed = 0.002;     // 最小速度阈值，越小转动越久

// 初始转动速度配置
const SPEED_CONFIG = {
    randomRange: 0.5,  // 随机速度范围
    baseSpeed: 0.3     // 基础速度，越大转动越久
};
// ============================================

// 绘制转盘
function drawWheel(angle) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;

    // 绘制各个扇区
    for (let i = 0; i < segments; i++) {
        const startAngle = angle + i * segmentAngle;
        const endAngle = startAngle + segmentAngle;

        // 绘制扇区
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        // 填充颜色(基础版)
        // ctx.fillStyle = colors[i];
        // ctx.fill();

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
        ctx.font = 'bold 23px "Microsoft YaHei", Arial';

        // 文字位置
        const textRadius = radius * 0.79;
        ctx.fillText(foods[i], textRadius, 6);
        ctx.restore();
    }

    // 绘制中心圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 中心文字
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px "Microsoft YaHei", Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GO', centerX, centerY);
}

// ============================================
// 修复后的获取指针指向食物函数
// ============================================
function getSelectedFood(angle) {
    // 指针在顶部（-π/2位置，即canvas的12点钟方向）
    const pointerAngle = -Math.PI / 2;

    // 标准化角度到0到2π之间
    let normalizedAngle = angle % (2 * Math.PI);
    if (normalizedAngle < 0) {
        normalizedAngle += 2 * Math.PI;
    }

    // 计算指针相对于转盘的角度
    // pointerAngle是固定向上，normalizedAngle是转盘的旋转角度
    let relativeAngle = (pointerAngle - normalizedAngle) % (2 * Math.PI);
    if (relativeAngle < 0) {
        relativeAngle += 2 * Math.PI;
    }

    // 确定扇区索引
    let segmentIndex = Math.floor(relativeAngle / segmentAngle);

    // 安全检查：确保索引在有效范围内
    if (segmentIndex >= segments) {
        segmentIndex = segments - 1;
    }
    if (segmentIndex < 0) {
        segmentIndex = 0;
    }

    // 调试输出
    console.log('角度计算:', {
        currentAngle: angle.toFixed(4),
        normalizedAngle: normalizedAngle.toFixed(4),
        relativeAngle: relativeAngle.toFixed(4),
        segmentIndex: segmentIndex,
        selectedFood: foods[segmentIndex]
    });

    return foods[segmentIndex];
}

// 动画循环
function animate() {
    if (isSpinning) {
        // 应用摩擦力减速
        spinSpeed *= friction;
        currentAngle += spinSpeed;

        // 绘制转盘
        drawWheel(currentAngle);

        // 检查是否应该停止
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

    // 隐藏之前的结果
    hideResult();

    // 设置初始速度 - 修改 SPEED_CONFIG 来控制转动时间
    spinSpeed = Math.random() * SPEED_CONFIG.randomRange + SPEED_CONFIG.baseSpeed;

    // 输出调试信息
    console.log('🎡 开始转动！初始速度:', spinSpeed.toFixed(4));

    animate();
}

// 停止转动
function stopSpinning() {
    isSpinning = false;
    spinSpeed = 0;
    spinBtn.disabled = false;

    // 获取结果
    const selectedFood = getSelectedFood(currentAngle);

    // 再次确认结果有效
    if (selectedFood && foods.includes(selectedFood)) {
        showResult(selectedFood);
        console.log('✅ 转动结束！选中:', selectedFood);
    } else {
        // 如果出现undefined，使用默认值
        console.error('❌ 计算结果异常，使用默认值');
        showResult(foods[0]);
    }
}

// ============================================
// 弹窗显示结果 - 屏幕正中间
// ============================================
function showResult(food) {
    // 确保food参数有效
    if (!food) {
        food = foods[0]; // 默认使用第一个食物
        console.warn('⚠️ 食物参数无效，使用默认值:', food);
    }

    // 创建结果内容
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

    // 阻止滚动
    document.body.style.overflow = 'hidden';
}

// 隐藏结果弹窗
function hideResult() {
    resultOverlay.classList.remove('show');
    resultDiv.innerHTML = '';

    // 恢复滚动
    document.body.style.overflow = '';
}

// 点击遮罩层关闭弹窗
resultOverlay.addEventListener('click', function(e) {
    if (e.target === resultOverlay) {
        hideResult();
    }
});

// 事件监听
spinBtn.addEventListener('click', startSpinning);

// 初始绘制
drawWheel(currentAngle);

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isSpinning) {
        e.preventDefault();
        startSpinning();
    }

    // ESC键关闭弹窗
    if (e.code === 'Escape') {
        hideResult();
    }
});

// 输出配置信息
console.log('🎡 转盘已就绪！');
console.log('食物列表:', foods);
console.log('扇区数量:', segments);
console.log('每个扇区角度:', (segmentAngle * 180 / Math.PI).toFixed(2) + '度');
console.log('当前速度配置:', {
    friction: friction,
    minSpeed: minSpeed,
    randomRange: SPEED_CONFIG.randomRange,
    baseSpeed: SPEED_CONFIG.baseSpeed
});
console.log('按空格键转动，按ESC键或点击遮罩关闭结果弹窗');