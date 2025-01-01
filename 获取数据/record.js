const { chromium } = require('playwright');

(async () => {
  try {
    console.log('正在连接到已打开的Chrome...');
    
    // 连接到已打开的Chrome
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    console.log('成功连接到Chrome');
    
    // 获取当前上下文
    const contexts = await browser.contexts();
    const context = contexts[0];
    
    if (!context) {
      throw new Error('未能获取到浏览器上下文');
    }
    
    // 创建新标签页
    const page = await context.newPage();
    console.log('成功创建新标签页');
    
    // 启动录制器
    await page.goto('about:blank');  // 先打开空白页
    
    // 开启录制模式
    process.env.PWDEBUG = '1';
    
    // 这里会打开 Playwright Inspector
    await page.pause();
    
    console.log('已启动录制模式，请在浏览器中操作');
    
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
})();