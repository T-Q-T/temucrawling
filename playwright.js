const { chromium } = require("playwright");
const process = require("process");

(async () => {
  try {
    const filePath = `../page/goodList.json`;
    const pageUrl =
        "https://www.temu.com/search_result.html?search_key=%E5%8E%A8%E6%88%BF%E7%BD%AE%E7%89%A9%E6%9E%B6&search_method=recent";
    // 创建数组存储商品数据
    const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");

    const contexts = await browser.contexts();
    const context = contexts[0];

    if (!context) {
      throw new Error("未能获取到浏览器上下文");
    }

    // 滚动到页面底部的函数
    async function scrollToBottom(page) {
      try {
        await page.evaluate(async () => {
          await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
              const scrollHeight = document.documentElement.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;
              if (totalHeight >= scrollHeight) {
                clearInterval(timer);
                resolve();
              }
            }, 100);
          });
        });
        console.log("已滚动到页面底部");
      } catch (error) {
        console.error("滚动过程中出错:", error.message);
      }
    }

    // 创建数组存储商品数据
    let allGoodsList = [];

    await context.route("**/**/api/poppy/v1/**", async (route) => {
      // 直接继续原始请求，不做拦截和修改
      await route.continue();

      // 尝试从响应中获取数据
      const response = await route.request().response();
      if (response) {
        const json = await response.json();
        try {
          if (json.result.data && json.result.data.goods_list) {
            console.log("捕获到商品列表数据");
            allGoodsList = allGoodsList.concat(json.result.data.goods_list);
            console.log(`当前已收集商品数量: ${allGoodsList.length}`);
          }
        } catch (error) {
          console.error("处理返回数据时出错:", error);
        }
      }
    });

    // 设置更真实的 User-Agent
    await context.setExtraHTTPHeaders({
      "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    });

    const page = await context.newPage();

    // 模拟真实用户行为
    await page.setViewportSize({ width: 1679, height: 840 });

    // 随机延迟函数
    const randomDelay = () => Math.floor(Math.random() * 2000) + 2000;

    // 访问页面
    await page.goto(pageUrl);
    await page.waitForTimeout(randomDelay());
    console.log('1');
    await page.waitForLoadState('networkidle');
    console.log('页面稳定了');
    await page.locator('#splide01-slide03').click();
    await page.waitForTimeout(randomDelay());

    // 修改：目标元素的父元素原本为 display: none
    // 先将父元素的样式修改为可见，再点击目标元素
    const element = await page.$('[data-uniqid="3"]');
    if(element) {
      console.log(111)
    } else {
      console.log(222)
    }
    if (element) {
      // 通过 evaluate 修改父元素的 display 样式为 "block"
      await page.evaluate(() => {
        const target = document.querySelector('[data-uniqid="3"]');
        if (target && target.parentElement) {
          console.log(333)
          target.parentElement.style.display = 'block';
        }
      });
      // 等待样式生效
      await page.waitForTimeout(500);
      // 点击目标元素
      await element.click();
      console.log('点击了目标元素');
    } else {
      console.error("未找到目标元素");
    }

    async function scrollAndLoadMore(page, cycles = 5) {
      // 保存初始URL
      const initialUrl = page.url();
      for (let i = 0; i < cycles; i++) {
        // 检查URL是否发生变化
        if (page.url() !== initialUrl) {
          console.log("检测到页面跳转，中断操作");
          return false; // 返回 false 表示异常中断
        }

        console.log(`开始执行第 ${i + 1} 轮滚动和加载操作`);

        // 滚动到底部
        await scrollToBottom(page);
        await page.waitForTimeout(randomDelay());

        try {
          // 点击查看更多
          await page
              .click("text=查看更多", { timeout: 5000 })
              .catch(() => page.click('[aria-label*="查看更多"]'))
              .catch(() => page.click(".load-more-button"))
              .catch(() => page.click('button:has-text("查看更多")'));

          console.log(`第 ${i + 1} 轮：成功点击查看更多按钮`);

          // 设置较短的超时时间，等待网络请求完成
          try {
            await page.waitForLoadState("networkidle", { timeout: 10000 });
          } catch (timeoutError) {
            console.log("等待网络请求超时，继续执行下一步...");
          }

          // 固定等待一段时间，确保内容加载
          await page.waitForTimeout(5000);
        } catch (error) {
          console.log(
              `第 ${i + 1} 轮：点击查看更多时出错或已无更多内容:`,
              error.message
          );
          break;
        }
      }
      return true; // 返回 true 表示正常完成
    }

    console.log("开滚");
    await scrollAndLoadMore(page, 5);

    // 在所有操作完成后，可以保存数据
    const fs = require("fs");
    fs.writeFileSync(
        filePath,
        JSON.stringify(allGoodsList, null, 2)
    );
    console.log('文件已保存');

    // 监听 Ctrl+C 信号
    process.on("SIGINT", async () => {
      const fs = require("fs");
      fs.writeFileSync(
          filePath,
          JSON.stringify(allGoodsList, null, 2)
      );
      console.log("已手动中断程序，数据已保存至goodList.json");
      process.exit(0);
    });
  } catch (error) {
    console.error("发生错误:", error);
    console.error("错误详情:", error.message);
    process.exit(1);
  }
})();
