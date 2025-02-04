获取 temu 最新爆品的数据脚本

使用 playwright 浏览器爬虫脚本

先执行 npm run startChrome.js 将 playwright 链接到当前打开的浏览器上。调整 playwright.js 的 pageUrl 路径为你自己类目的链接，然后执行 npm run start 即可爬取出数据。 数据贮存在 /page 之下

npm run analysis 为将已爬取到的最新热品数据进行排序,排序的规则为寻找评论数 <1500 (说明比较新)且销量高的品，最终数据中的 seo_link_url 为详情页链接，可以自行去查看