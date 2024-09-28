function calculateIntersectionPointOnSemiCircle(start, middle, end, P) {
    // 各点の座標
    const x1 = start.x, y1 = start.y;
    const x2 = middle.x, y2 = middle.y;
    const x3 = end.x, y3 = end.y;

    // 垂直二等分線の中点計算
    const midX12 = (x1 + x2) / 2;
    const midY12 = (y1 + y2) / 2;
    const midX23 = (x2 + x3) / 2;
    const midY23 = (y2 + y3) / 2;

    // 垂直二等分線の傾き（-1 / 傾き）
    const slope12 = (x2 - x1) / (y1 - y2);
    const slope23 = (x3 - x2) / (y2 - y3);

    // 中点と傾きから垂直二等分線の方程式を導出（y = mx + b の形）
    const b12 = midY12 - slope12 * midX12;
    const b23 = midY23 - slope23 * midX23;

    // 2つの垂直二等分線の交点を求める（円の中心）
    const centerX = (b23 - b12) / (slope12 - slope23);
    const centerY = slope12 * centerX + b12;

    // 半径を計算
    const radius = Math.sqrt((centerX - x1) ** 2 + (centerY - y1) ** 2);
    
    // 点Pの座標
    const px = P.x, py = P.y;

    // 中心から点Pへのベクトル
    const dx = px - centerX;
    const dy = py - centerY;
    
    // ベクトルを半径分だけ正規化して交点を求める
    const dist = Math.sqrt(dx ** 2 + dy ** 2);
    if (dist === 0) {
        return {
            x: x1,
            y: y1
        };
    }

    const scale = radius / dist;

    // 交点の座標を計算（円周上）
    let intersectionX = centerX + dx * scale;
    let intersectionY = centerY + dy * scale;

    // 半円の角度制限を計算する
    const angleStart = Math.atan2(y1 - centerY, x1 - centerX);
    const angleEnd = Math.atan2(y3 - centerY, x3 - centerX);
    const angleIntersection = Math.atan2(intersectionY - centerY, intersectionX - centerX);

    // 角度が start から end までの反時計回り範囲内にあるか確認
    const isWithinSemiCircle = (angleStart <= angleIntersection && angleIntersection <= angleEnd) ||
                               (angleStart > angleEnd && (angleIntersection >= angleStart || angleIntersection <= angleEnd));

    if (!isWithinSemiCircle) {
        // もし交点が半円上でなければ、startまたはendに最も近い点に設定
        const distToStart = Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
        const distToEnd = Math.sqrt((px - x3) ** 2 + (py - y3) ** 2);

        if (distToStart < distToEnd) {
            return { x: x1, y: y1 };
        } else {
            return { x: x3, y: y3 };
        }
    }

    return {
        x: intersectionX,
        y: intersectionY
    };
}

// 例
const start = { x: -1, y: 0 };
const middle = { x: 0, y: -2 };
const end = { x: 1, y: 0 };
const P = { x: 0, y: 0 };

const intersection = calculateIntersectionPointOnSemiCircle(start, middle, end, P);
console.log(`Intersection Point: (${intersection.x}, ${intersection.y})`);
