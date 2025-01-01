const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false, // 设置为 false 以打开浏览器窗口
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        userDataDir: '/Users/tianqin/Library/Application Support/Google/Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // 添加这些参数以避免某些问题
    });
    const page = await browser.newPage();

    await page.goto('https://www.temu.com/us-zh-Hans/led-strip-lights-o3-2045.html?opt_level=2&title=LED%20%E6%9D%A1%E5%BD%A2%E7%81%AF%E5%B8%A6&_x_enter_scene_type=cate_tab&leaf_type=bro&show_search_type=3&opt1_id=-13&refer_page_el_sn=200055&_x_sessn_id=r363i5mwyf&refer_page_name=home&refer_page_id=10005_1732691923294_jaoa2dzkh1&refer_page_sn=10005');

    
})();