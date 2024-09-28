const angleStartToEnd = Math.atan2(ey - sy, ex - sx);
    const angleStartToMid = Math.atan2(my - sy, mx - sx);
    const angleStartToP = Math.atan2(Py - sy, Px - sx);
    
    // 半円の範囲内にある場合
    const isInArc = (angleStartToP > angleStartToEnd && angleStartToP < angleStartToMid) ||
                    (angleStartToP < angleStartToEnd && angleStartToP > angleStartToMid);
    
    return isInArc;