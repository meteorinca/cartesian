/* ============================================
   📍 MASTERING CARTESIAN COORDINATES - APP
   Interactive quiz for learning the coordinate plane
   ============================================ */

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate random integer between min and max (inclusive)
 */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Round to a specific number of decimal places
 */
function roundTo(num, decimals = 2) {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Check if two numbers are approximately equal
 */
function approxEqual(a, b, tolerance = 0.01) {
    return Math.abs(a - b) < tolerance;
}

/**
 * Safely parse a number from text
 */
function parseNumSafe(text) {
    const t = String(text).trim();
    if (t === '') return null;
    const num = parseFloat(t);
    if (isNaN(num)) return null;
    return num;
}

// ==================== COORDINATE GRID RENDERER ====================

/**
 * Draw an interactive coordinate grid on a canvas
 * @param {HTMLCanvasElement} canvas
 * @param {Object} opts - { range, points, showLabels, interactive, onClick, highlightQuadrant }
 */
function drawGrid(canvas, opts = {}) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const range = opts.range || 5;
    const points = opts.points || [];
    const showLabels = opts.showLabels !== false;
    const highlightQuadrant = opts.highlightQuadrant || null;

    // Coordinate helpers
    const margin = 36;
    const plotW = W - margin * 2;
    const plotH = H - margin * 2;
    const unitX = plotW / (range * 2);
    const unitY = plotH / (range * 2);

    const toCanvasX = (x) => margin + (x + range) * unitX;
    const toCanvasY = (y) => margin + (range - y) * unitY;
    const toWorldX = (cx) => roundTo((cx - margin) / unitX - range, 1);
    const toWorldY = (cy) => roundTo(range - (cy - margin) / unitY, 1);

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Highlight quadrant if specified
    if (highlightQuadrant) {
        const cx = toCanvasX(0);
        const cy = toCanvasY(0);
        ctx.globalAlpha = 0.08;
        const colors = { 'I': '#10b981', 'II': '#3b82f6', 'III': '#f59e0b', 'IV': '#ef4444' };
        ctx.fillStyle = colors[highlightQuadrant] || '#6366f1';
        switch (highlightQuadrant) {
            case 'I': ctx.fillRect(cx, margin, W - margin - cx, cy - margin); break;
            case 'II': ctx.fillRect(margin, margin, cx - margin, cy - margin); break;
            case 'III': ctx.fillRect(margin, cy, cx - margin, H - margin - cy); break;
            case 'IV': ctx.fillRect(cx, cy, W - margin - cx, H - margin - cy); break;
        }
        ctx.globalAlpha = 1;
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.lineWidth = 1;
    for (let i = -range; i <= range; i++) {
        // Vertical
        const vx = toCanvasX(i);
        ctx.beginPath();
        ctx.moveTo(vx, margin);
        ctx.lineTo(vx, H - margin);
        ctx.stroke();
        // Horizontal
        const hy = toCanvasY(i);
        ctx.beginPath();
        ctx.moveTo(margin, hy);
        ctx.lineTo(W - margin, hy);
        ctx.stroke();
    }

    // Axes (thicker)
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.8)';
    ctx.lineWidth = 2;
    // X axis
    const axisY = toCanvasY(0);
    ctx.beginPath();
    ctx.moveTo(margin, axisY);
    ctx.lineTo(W - margin, axisY);
    ctx.stroke();
    // Y axis
    const axisX = toCanvasX(0);
    ctx.beginPath();
    ctx.moveTo(axisX, margin);
    ctx.lineTo(axisX, H - margin);
    ctx.stroke();

    // Axis arrows
    ctx.fillStyle = 'rgba(71, 85, 105, 0.8)';
    // Right arrow
    ctx.beginPath();
    ctx.moveTo(W - margin, axisY);
    ctx.lineTo(W - margin - 8, axisY - 4);
    ctx.lineTo(W - margin - 8, axisY + 4);
    ctx.fill();
    // Up arrow
    ctx.beginPath();
    ctx.moveTo(axisX, margin);
    ctx.lineTo(axisX - 4, margin + 8);
    ctx.lineTo(axisX + 4, margin + 8);
    ctx.fill();

    // Labels
    if (showLabels) {
        ctx.fillStyle = '#475569';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        for (let i = -range; i <= range; i++) {
            if (i === 0) continue;
            // X labels
            const lx = toCanvasX(i);
            ctx.fillText(i, lx, axisY + 6);
        }

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = -range; i <= range; i++) {
            if (i === 0) continue;
            // Y labels
            const ly = toCanvasY(i);
            ctx.fillText(i, axisX - 8, ly);
        }

        // Axis names
        ctx.fillStyle = '#4f46e5';
        ctx.font = '700 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('x', W - margin + 16, axisY - 6);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('y', axisX + 14, margin - 16);

        // Origin label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('0', axisX - 6, axisY + 6);
    }

    // Draw points
    points.forEach(pt => {
        const px = toCanvasX(pt.x);
        const py = toCanvasY(pt.y);
        const color = pt.color || '#f472b6';
        const radius = pt.radius || 7;

        // Glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.shadowBlur = 0;
        if (pt.label) {
            ctx.fillStyle = '#1e293b';
            ctx.font = '700 12px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.fillText(pt.label, px + radius + 4, py - 4);
        }
    });

    ctx.shadowBlur = 0;

    // Return helpers for hit-detection
    return { toCanvasX, toCanvasY, toWorldX, toWorldY, margin, range };
}

// ==================== PROBLEM GENERATORS ====================

const DIFFICULTY_CONFIGS = {
    easy: { range: 5, minCoord: 0, maxCoord: 5 },
    medium: { range: 6, minCoord: -6, maxCoord: 6 },
    hard: { range: 10, minCoord: -10, maxCoord: 10 }
};

/**
 * Generate a random coordinate pair
 */
function randomCoord(difficulty) {
    const c = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.medium;
    let x, y;
    if (difficulty === 'easy') {
        x = randInt(0, c.maxCoord);
        y = randInt(0, c.maxCoord);
        // At least one non-zero
        if (x === 0 && y === 0) x = randInt(1, c.maxCoord);
    } else {
        x = randInt(c.minCoord, c.maxCoord);
        y = randInt(c.minCoord, c.maxCoord);
        if (x === 0 && y === 0) x = randInt(1, c.maxCoord);
    }
    return { x, y };
}

/**
 * Determine which quadrant a point is in
 */
function getQuadrant(x, y) {
    if (x > 0 && y > 0) return 'I';
    if (x < 0 && y > 0) return 'II';
    if (x < 0 && y < 0) return 'III';
    if (x > 0 && y < 0) return 'IV';
    return 'Axis'; // on an axis
}

/**
 * Generate a "Plot the Point" problem
 */
function generatePlotPoint(difficulty) {
    const { x, y } = randomCoord(difficulty);
    const c = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.medium;
    return {
        type: 'plot-point',
        targetX: x,
        targetY: y,
        range: c.range,
        display: `(${x}, ${y})`
    };
}

/**
 * Generate an "Identify the Point" problem
 */
function generateIdentifyPoint(difficulty) {
    const { x, y } = randomCoord(difficulty);
    const c = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.medium;
    return {
        type: 'identify-point',
        pointX: x,
        pointY: y,
        range: c.range,
        display: '?'
    };
}

/**
 * Generate a "Find the Quadrant" problem
 */
function generateFindQuadrant(difficulty) {
    let x, y;
    const c = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.medium;
    // Ensure point is NOT on an axis
    do {
        const coord = randomCoord(difficulty);
        x = coord.x;
        y = coord.y;
    } while (x === 0 || y === 0);

    return {
        type: 'find-quadrant',
        pointX: x,
        pointY: y,
        range: c.range,
        quadrant: getQuadrant(x, y),
        display: `(${x}, ${y})`
    };
}

/**
 * Generate a "Calculate Distance" problem
 */
function generateDistance(difficulty) {
    const c = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.medium;
    let x1, y1, x2, y2;
    do {
        const p1 = randomCoord(difficulty);
        const p2 = randomCoord(difficulty);
        x1 = p1.x; y1 = p1.y;
        x2 = p2.x; y2 = p2.y;
    } while (x1 === x2 && y1 === y2);

    const dist = roundTo(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)), 2);

    return {
        type: 'distance',
        x1, y1, x2, y2,
        distance: dist,
        range: c.range,
        display: `(${x1}, ${y1}) to (${x2}, ${y2})`
    };
}

// ==================== PROBLEM BUILDER ====================

/**
 * Get problem generator for mode
 */
function getGenerator(mode) {
    switch (mode) {
        case 'plot-point': return generatePlotPoint;
        case 'identify-point': return generateIdentifyPoint;
        case 'find-quadrant': return generateFindQuadrant;
        case 'distance': return generateDistance;
        default: return generatePlotPoint;
    }
}

/**
 * Build a visual problem card
 */
function buildProblem(index, problem, mode) {
    const wrapper = document.createElement('div');
    wrapper.className = 'problem';
    wrapper.dataset.mode = mode;
    wrapper.dataset.problem = JSON.stringify(problem);

    // Top section
    const top = document.createElement('div');
    top.className = 'problem-top';

    const qnum = document.createElement('div');
    qnum.className = 'qnum';
    qnum.textContent = index;

    const prompt = document.createElement('div');
    prompt.className = 'prompt';
    prompt.textContent = getPromptText(mode, problem);

    top.appendChild(qnum);
    top.appendChild(prompt);

    // Main section
    const main = document.createElement('div');
    main.className = 'problem-main';

    switch (mode) {
        case 'plot-point':
            buildPlotPoint(main, problem);
            break;
        case 'identify-point':
            buildIdentifyPoint(main, problem);
            break;
        case 'find-quadrant':
            buildFindQuadrant(main, problem);
            break;
        case 'distance':
            buildDistance(main, problem);
            break;
    }

    wrapper.appendChild(top);
    wrapper.appendChild(main);

    return wrapper;
}

/**
 * Get prompt text
 */
function getPromptText(mode, problem) {
    switch (mode) {
        case 'plot-point':
            return `Click on the grid to plot the point ${problem.display}`;
        case 'identify-point':
            return `What are the coordinates of the point shown on the grid?`;
        case 'find-quadrant':
            return `Which quadrant is the point ${problem.display} in?`;
        case 'distance':
            return `Find the distance between ${problem.display}`;
        default:
            return 'Solve the problem';
    }
}

// ==================== MODE-SPECIFIC BUILDERS ====================

/**
 * Create a canvas element for the coordinate grid
 */
function createCanvasGrid(problem, size) {
    const canvasSize = size || 320;
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'coord-canvas-wrap';

    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    canvasWrap.appendChild(canvas);

    return { canvasWrap, canvas };
}

/**
 * Build "Plot the Point" problem
 */
function buildPlotPoint(main, problem) {
    const { canvasWrap, canvas } = createCanvasGrid(problem);

    // State for user's click
    let userPlot = null;

    const coordsDisplay = document.createElement('div');
    coordsDisplay.className = 'plot-coords-display';
    coordsDisplay.textContent = 'Click on the grid!';

    const hint = document.createElement('div');
    hint.className = 'plot-hint';
    hint.textContent = `Target: ${problem.display}`;

    // Draw initial grid
    const helpers = drawGrid(canvas, {
        range: problem.range,
        points: []
    });

    // Click handler
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * scaleY;

        // Snap to nearest integer
        let wx = Math.round(helpers.toWorldX(cx));
        let wy = Math.round(helpers.toWorldY(cy));

        // Clamp to range
        wx = Math.max(-problem.range, Math.min(problem.range, wx));
        wy = Math.max(-problem.range, Math.min(problem.range, wy));

        userPlot = { x: wx, y: wy };

        // Redraw with user's point
        drawGrid(canvas, {
            range: problem.range,
            points: [{ x: wx, y: wy, color: '#818cf8', label: `(${wx}, ${wy})`, radius: 8 }]
        });

        coordsDisplay.textContent = `Your point: (${wx}, ${wy})`;

        // Store on canvas dataset
        canvas.dataset.plotX = wx;
        canvas.dataset.plotY = wy;
    });

    // QFeedback
    const qfb = document.createElement('div');
    qfb.className = 'qfeedback';

    // Buttons
    const btnRow = document.createElement('div');
    btnRow.className = 'answerRow';

    const btnHint = document.createElement('button');
    btnHint.type = 'button';
    btnHint.className = 'smallBtn';
    btnHint.textContent = '💡 Hint';
    btnHint.addEventListener('click', () => {
        qfb.textContent = `Start at origin (0,0). Go ${problem.targetX >= 0 ? 'right' : 'left'} ${Math.abs(problem.targetX)}, then ${problem.targetY >= 0 ? 'up' : 'down'} ${Math.abs(problem.targetY)}.`;
        qfb.style.color = '#94a3b8';
    });

    const btnReset = document.createElement('button');
    btnReset.type = 'button';
    btnReset.className = 'smallBtn';
    btnReset.textContent = '↺ Reset';
    btnReset.addEventListener('click', () => {
        userPlot = null;
        canvas.dataset.plotX = '';
        canvas.dataset.plotY = '';
        drawGrid(canvas, { range: problem.range, points: [] });
        coordsDisplay.textContent = 'Click on the grid!';
        qfb.textContent = '';
        qfb.style.color = '';
    });

    btnRow.appendChild(btnHint);
    btnRow.appendChild(btnReset);

    main.appendChild(canvasWrap);
    main.appendChild(coordsDisplay);
    main.appendChild(hint);
    main.appendChild(btnRow);
    main.appendChild(qfb);
}

/**
 * Build "Identify the Point" problem
 */
function buildIdentifyPoint(main, problem) {
    const { canvasWrap, canvas } = createCanvasGrid(problem);

    // Draw grid with the mystery point
    drawGrid(canvas, {
        range: problem.range,
        points: [{ x: problem.pointX, y: problem.pointY, color: '#f472b6', label: '?', radius: 8 }]
    });

    // Answer inputs
    const answerRow = document.createElement('div');
    answerRow.className = 'answerRow';

    const label = document.createElement('span');
    label.className = 'coord-label';
    label.textContent = '( ';

    const inputX = document.createElement('input');
    inputX.type = 'text';
    inputX.inputMode = 'numeric';
    inputX.placeholder = 'x';
    inputX.className = 'ansX';
    inputX.style.width = '70px';

    const comma = document.createElement('span');
    comma.className = 'coord-label';
    comma.textContent = ' , ';

    const inputY = document.createElement('input');
    inputY.type = 'text';
    inputY.inputMode = 'numeric';
    inputY.placeholder = 'y';
    inputY.className = 'ansY';
    inputY.style.width = '70px';

    const paren = document.createElement('span');
    paren.className = 'coord-label';
    paren.textContent = ' )';

    const qfb = document.createElement('div');
    qfb.className = 'qfeedback';

    const btnHint = document.createElement('button');
    btnHint.type = 'button';
    btnHint.className = 'smallBtn';
    btnHint.textContent = '💡 Hint';
    btnHint.addEventListener('click', () => {
        const q = getQuadrant(problem.pointX, problem.pointY);
        qfb.textContent = q !== 'Axis'
            ? `The point is in Quadrant ${q}. Count units from each axis.`
            : `The point is on an axis. Read coordinates from the grid.`;
        qfb.style.color = '#94a3b8';
    });

    const btnReset = document.createElement('button');
    btnReset.type = 'button';
    btnReset.className = 'smallBtn';
    btnReset.textContent = '↺ Reset';
    btnReset.addEventListener('click', () => {
        inputX.value = '';
        inputY.value = '';
        inputX.classList.remove('correct', 'wrong');
        inputY.classList.remove('correct', 'wrong');
        qfb.textContent = '';
        qfb.style.color = '';
    });

    // Clear feedback on input
    [inputX, inputY].forEach(inp => {
        inp.addEventListener('input', () => {
            inp.classList.remove('correct', 'wrong');
            qfb.textContent = '';
            qfb.style.color = '';
        });
    });

    answerRow.appendChild(label);
    answerRow.appendChild(inputX);
    answerRow.appendChild(comma);
    answerRow.appendChild(inputY);
    answerRow.appendChild(paren);
    answerRow.appendChild(btnHint);
    answerRow.appendChild(btnReset);

    main.appendChild(canvasWrap);
    main.appendChild(answerRow);
    main.appendChild(qfb);
}

/**
 * Build "Find the Quadrant" problem
 */
function buildFindQuadrant(main, problem) {
    const { canvasWrap, canvas } = createCanvasGrid(problem, 280);

    // Draw grid with point
    drawGrid(canvas, {
        range: problem.range,
        points: [{ x: problem.pointX, y: problem.pointY, color: '#fbbf24', label: problem.display, radius: 8 }]
    });

    // Quadrant selector buttons
    const selectorWrap = document.createElement('div');
    selectorWrap.style.marginTop = '12px';

    const selectorLabel = document.createElement('div');
    selectorLabel.style.textAlign = 'center';
    selectorLabel.style.color = '#94a3b8';
    selectorLabel.style.fontWeight = '700';
    selectorLabel.style.marginBottom = '8px';
    selectorLabel.textContent = 'Select the Quadrant:';

    const selector = document.createElement('div');
    selector.className = 'quadrant-selector';

    ['II', 'I', 'III', 'IV'].forEach(q => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quad-option';
        btn.textContent = q;
        btn.dataset.quadrant = q;
        btn.addEventListener('click', () => {
            // Deselect others
            selector.querySelectorAll('.quad-option').forEach(b => {
                b.classList.remove('selected', 'correct-quad', 'wrong-quad');
            });
            btn.classList.add('selected');
            // Clear feedback
            const qfb = main.querySelector('.qfeedback');
            if (qfb) { qfb.textContent = ''; qfb.style.color = ''; }
        });
        selector.appendChild(btn);
    });

    selectorWrap.appendChild(selectorLabel);
    selectorWrap.appendChild(selector);

    const qfb = document.createElement('div');
    qfb.className = 'qfeedback';

    // Buttons
    const btnRow = document.createElement('div');
    btnRow.className = 'answerRow';

    const btnHint = document.createElement('button');
    btnHint.type = 'button';
    btnHint.className = 'smallBtn';
    btnHint.textContent = '💡 Hint';
    btnHint.addEventListener('click', () => {
        const xSign = problem.pointX > 0 ? '+' : '−';
        const ySign = problem.pointY > 0 ? '+' : '−';
        qfb.textContent = `x is ${xSign} and y is ${ySign}. Which quadrant has (${xSign}, ${ySign})?`;
        qfb.style.color = '#94a3b8';
    });

    const btnReset = document.createElement('button');
    btnReset.type = 'button';
    btnReset.className = 'smallBtn';
    btnReset.textContent = '↺ Reset';
    btnReset.addEventListener('click', () => {
        selector.querySelectorAll('.quad-option').forEach(b => {
            b.classList.remove('selected', 'correct-quad', 'wrong-quad');
        });
        qfb.textContent = '';
        qfb.style.color = '';
    });

    btnRow.appendChild(btnHint);
    btnRow.appendChild(btnReset);

    main.appendChild(canvasWrap);
    main.appendChild(selectorWrap);
    main.appendChild(btnRow);
    main.appendChild(qfb);
}

/**
 * Build "Calculate Distance" problem
 */
function buildDistance(main, problem) {
    const { canvasWrap, canvas } = createCanvasGrid(problem);

    // Draw grid with both points and a dashed line between
    const helpers = drawGrid(canvas, {
        range: problem.range,
        points: [
            { x: problem.x1, y: problem.y1, color: '#06b6d4', label: `A(${problem.x1},${problem.y1})`, radius: 7 },
            { x: problem.x2, y: problem.y2, color: '#f472b6', label: `B(${problem.x2},${problem.y2})`, radius: 7 }
        ]
    });

    // Draw dashed line between points
    const ctx = canvas.getContext('2d');
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(helpers.toCanvasX(problem.x1), helpers.toCanvasY(problem.y1));
    ctx.lineTo(helpers.toCanvasX(problem.x2), helpers.toCanvasY(problem.y2));
    ctx.stroke();
    ctx.setLineDash([]);

    // Answer row
    const answerRow = document.createElement('div');
    answerRow.className = 'answerRow';

    const label = document.createElement('span');
    label.textContent = 'Distance = ';
    label.style.fontWeight = '700';
    label.style.color = '#cbd5e1';

    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'decimal';
    input.placeholder = '?';
    input.className = 'ansDistance';
    input.style.width = '90px';

    const qfb = document.createElement('div');
    qfb.className = 'qfeedback';

    const btnHint = document.createElement('button');
    btnHint.type = 'button';
    btnHint.className = 'smallBtn';
    btnHint.textContent = '💡 Hint';
    btnHint.addEventListener('click', () => {
        const dx = problem.x2 - problem.x1;
        const dy = problem.y2 - problem.y1;
        qfb.textContent = `d = √((${dx})² + (${dy})²) = √(${dx * dx} + ${dy * dy}) = √${dx * dx + dy * dy}`;
        qfb.style.color = '#94a3b8';
    });

    const btnReset = document.createElement('button');
    btnReset.type = 'button';
    btnReset.className = 'smallBtn';
    btnReset.textContent = '↺ Reset';
    btnReset.addEventListener('click', () => {
        input.value = '';
        input.classList.remove('correct', 'wrong');
        qfb.textContent = '';
        qfb.style.color = '';
    });

    input.addEventListener('input', () => {
        input.classList.remove('correct', 'wrong');
        qfb.textContent = '';
        qfb.style.color = '';
    });

    answerRow.appendChild(label);
    answerRow.appendChild(input);
    answerRow.appendChild(btnHint);
    answerRow.appendChild(btnReset);

    main.appendChild(canvasWrap);
    main.appendChild(answerRow);
    main.appendChild(qfb);
}

// ==================== ANSWER CHECKING ====================

/**
 * Check all problems
 */
function checkAll() {
    const rows = document.querySelectorAll('.problem');
    const globalFeedback = document.getElementById('globalFeedback');
    let correctCount = 0;

    rows.forEach(row => {
        const mode = row.dataset.mode;
        const problem = JSON.parse(row.dataset.problem);
        if (checkProblem(row, mode, problem)) correctCount++;
    });

    const total = rows.length;

    if (correctCount === total) {
        globalFeedback.textContent = `🌟 Perfect! All ${total} answers are correct! You're a navigation ace!`;
        globalFeedback.style.color = '#34d399';
        globalFeedback.style.background = 'rgba(16, 185, 129, 0.1)';
        globalFeedback.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    } else if (correctCount > 0) {
        globalFeedback.textContent = `✓ ${correctCount}/${total} correct. Keep going!`;
        globalFeedback.style.color = '#fbbf24';
        globalFeedback.style.background = 'rgba(245, 158, 11, 0.1)';
        globalFeedback.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    } else {
        globalFeedback.textContent = `Not quite — review the hints and tips below!`;
        globalFeedback.style.color = '#f87171';
        globalFeedback.style.background = 'rgba(239, 68, 68, 0.1)';
        globalFeedback.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    }
}

/**
 * Check a single problem
 */
function checkProblem(row, mode, problem) {
    switch (mode) {
        case 'plot-point': return checkPlotPoint(row, problem);
        case 'identify-point': return checkIdentifyPoint(row, problem);
        case 'find-quadrant': return checkFindQuadrant(row, problem);
        case 'distance': return checkDistance(row, problem);
        default: return false;
    }
}

/**
 * Check "Plot the Point"
 */
function checkPlotPoint(row, problem) {
    const canvas = row.querySelector('canvas');
    const qfb = row.querySelector('.qfeedback');
    const px = parseNumSafe(canvas.dataset.plotX);
    const py = parseNumSafe(canvas.dataset.plotY);

    if (px === null || py === null) {
        qfb.textContent = 'Click on the grid to plot your answer!';
        qfb.style.color = '#f87171';
        return false;
    }

    if (px === problem.targetX && py === problem.targetY) {
        qfb.textContent = '✅ Perfect placement!';
        qfb.style.color = '#34d399';
        row.classList.add('correct');
        // Redraw with green dot
        drawGrid(canvas, {
            range: problem.range,
            points: [{ x: px, y: py, color: '#34d399', label: `(${px}, ${py})`, radius: 9 }]
        });
        return true;
    } else {
        qfb.textContent = `Not quite — you plotted (${px}, ${py}), the answer is (${problem.targetX}, ${problem.targetY})`;
        qfb.style.color = '#f87171';
        row.classList.add('wrong');
        // Show both
        drawGrid(canvas, {
            range: problem.range,
            points: [
                { x: px, y: py, color: '#ef4444', label: `You: (${px}, ${py})`, radius: 6 },
                { x: problem.targetX, y: problem.targetY, color: '#34d399', label: `Answer: (${problem.targetX}, ${problem.targetY})`, radius: 8 }
            ]
        });
        return false;
    }
}

/**
 * Check "Identify the Point"
 */
function checkIdentifyPoint(row, problem) {
    const inputX = row.querySelector('.ansX');
    const inputY = row.querySelector('.ansY');
    const qfb = row.querySelector('.qfeedback');

    const ux = parseNumSafe(inputX.value);
    const uy = parseNumSafe(inputY.value);

    if (ux === null || uy === null) {
        if (ux === null) inputX.classList.add('wrong');
        if (uy === null) inputY.classList.add('wrong');
        qfb.textContent = 'Enter both x and y values';
        qfb.style.color = '#f87171';
        return false;
    }

    const xCorrect = ux === problem.pointX;
    const yCorrect = uy === problem.pointY;

    inputX.classList.toggle('correct', xCorrect);
    inputX.classList.toggle('wrong', !xCorrect);
    inputY.classList.toggle('correct', yCorrect);
    inputY.classList.toggle('wrong', !yCorrect);

    if (xCorrect && yCorrect) {
        qfb.textContent = `✅ Correct! The point is (${problem.pointX}, ${problem.pointY})`;
        qfb.style.color = '#34d399';
        row.classList.add('correct');
        // Reveal label on canvas
        const canvas = row.querySelector('canvas');
        drawGrid(canvas, {
            range: problem.range,
            points: [{ x: problem.pointX, y: problem.pointY, color: '#34d399', label: `(${problem.pointX}, ${problem.pointY})`, radius: 8 }]
        });
        return true;
    } else {
        qfb.textContent = `Not quite — the answer is (${problem.pointX}, ${problem.pointY})`;
        qfb.style.color = '#f87171';
        return false;
    }
}

/**
 * Check "Find the Quadrant"
 */
function checkFindQuadrant(row, problem) {
    const qfb = row.querySelector('.qfeedback');
    const selected = row.querySelector('.quad-option.selected');

    if (!selected) {
        qfb.textContent = 'Select a quadrant!';
        qfb.style.color = '#f87171';
        return false;
    }

    const userQ = selected.dataset.quadrant;

    if (userQ === problem.quadrant) {
        qfb.textContent = `✅ Correct! (${problem.pointX}, ${problem.pointY}) is in Quadrant ${problem.quadrant}`;
        qfb.style.color = '#34d399';
        selected.classList.add('correct-quad');
        row.classList.add('correct');
        // Highlight quadrant on canvas
        const canvas = row.querySelector('canvas');
        drawGrid(canvas, {
            range: problem.range,
            points: [{ x: problem.pointX, y: problem.pointY, color: '#34d399', label: problem.display, radius: 8 }],
            highlightQuadrant: problem.quadrant
        });
        return true;
    } else {
        selected.classList.add('wrong-quad');
        qfb.textContent = `Not quite — the answer is Quadrant ${problem.quadrant}`;
        qfb.style.color = '#f87171';
        // Show correct one
        row.querySelectorAll('.quad-option').forEach(b => {
            if (b.dataset.quadrant === problem.quadrant) b.classList.add('correct-quad');
        });
        return false;
    }
}

/**
 * Check "Calculate Distance"
 */
function checkDistance(row, problem) {
    const input = row.querySelector('.ansDistance');
    const qfb = row.querySelector('.qfeedback');
    const userVal = parseNumSafe(input.value);

    if (userVal === null) {
        input.classList.add('wrong');
        qfb.textContent = 'Enter a number';
        qfb.style.color = '#f87171';
        return false;
    }

    if (approxEqual(userVal, problem.distance, 0.1)) {
        input.classList.remove('wrong');
        input.classList.add('correct');
        qfb.textContent = `✅ Correct! Distance ≈ ${problem.distance}`;
        qfb.style.color = '#34d399';
        row.classList.add('correct');
        return true;
    } else {
        input.classList.add('wrong');
        qfb.textContent = `Not quite — the distance is ${problem.distance}`;
        qfb.style.color = '#f87171';
        return false;
    }
}

// ==================== QUIZ CONTROLLER ====================

let currentMode = 'plot-point';

/**
 * Generate and display new problems
 */
function generateQuiz() {
    const count = parseInt(document.getElementById('count').value);
    const difficulty = document.getElementById('difficulty').value;
    const quizEl = document.getElementById('quiz');
    const globalFeedback = document.getElementById('globalFeedback');

    quizEl.innerHTML = '';
    globalFeedback.textContent = '';
    globalFeedback.style.color = '';
    globalFeedback.style.background = '';
    globalFeedback.style.borderColor = '';

    const generator = getGenerator(currentMode);

    for (let i = 1; i <= count; i++) {
        const problem = generator(difficulty);
        const card = buildProblem(i, problem, currentMode);
        card.style.animationDelay = `${(i - 1) * 0.1}s`;
        quizEl.appendChild(card);
    }
}

/**
 * Initialize mode switching
 */
function initModes() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            generateQuiz();
        });
    });
}

/**
 * Initialize the app
 */
function init() {
    initModes();

    document.getElementById('btnNew').addEventListener('click', generateQuiz);
    document.getElementById('btnCheck').addEventListener('click', checkAll);

    // Generate initial problems
    generateQuiz();

    // Build demo plane in tips section
    buildDemoPlane();
}

/**
 * Build the mini demo plane in the tips section
 */
function buildDemoPlane() {
    const demoEl = document.getElementById('demo-plane');
    if (!demoEl) return;

    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    canvas.style.borderRadius = '10px';
    canvas.style.border = '1px solid rgba(99, 102, 241, 0.2)';
    demoEl.appendChild(canvas);

    drawGrid(canvas, {
        range: 4,
        points: [
            { x: 2, y: 3, color: '#34d399', label: '(2,3)', radius: 6 },
            { x: -3, y: 1, color: '#f472b6', label: '(−3,1)', radius: 6 },
            { x: 0, y: 0, color: '#fbbf24', label: '', radius: 5 }
        ]
    });
}

// ==================== START ====================
document.addEventListener('DOMContentLoaded', init);
