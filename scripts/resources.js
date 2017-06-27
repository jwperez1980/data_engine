function getDynamicData() {
    var data = new Object();

    for (var i = 0; i < 10000; i++) {
        data[i] = { aaaa: Math.round(Math.random() * 100), bbbb: Math.round(Math.random() * 100), cccc: Math.round(Math.random() * 100), dddd: Math.round(Math.random() * 100), eeee: Math.round(Math.random() * 100), ffff: Math.round(Math.random() * 100), gggg: Math.round(Math.random() * 100), hhhh: Math.round(Math.random() * 100), iiii: Math.round(Math.random() * 100), jjjj: Math.round(Math.random() * 100), kkkk: Math.round(Math.random() * 100) }
    }
    return data;
}