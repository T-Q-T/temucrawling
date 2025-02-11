const fs = require("fs");
const path = require("path");

let resource = [];
const directoryPath = path.join(__dirname, "page");
const urlFilePath = path.join(__dirname, "url.txt"); // url.txt 文件路径
const baseUrl = "https://www.temu.com";
function sortFun(resource) {
  let result = resource
    .sort((a, b) => {
      // 判断评论数是否小于 1500，先排评论数小于 1500 的项
      const aIsEligible = a.comment.comment_num_tips < 1500;
      const bIsEligible = b.comment.comment_num_tips < 1500;

      // 如果一个项符合条件而另一个不符合，符合条件的排前面
      if (aIsEligible !== bIsEligible) {
        return aIsEligible ? -1 : 1;
      }

      // 如果评论数相同，则按销量降序排列
      return parseSalesNum(b.sales_num) - parseSalesNum(a.sales_num);
    })
    .map((item) => {
      return {
        sales_num: item.sales_num,
        seo_link_url: item.seo_link_url,
        goods_id: item.goods_id,
        price_str: +item.price_info.price_str.slice(1),
        comment: item.comment.comment_num_tips,
        title: item.title,
      };
    });
  return result;
}
function removeDuplicatesByTitle(arr) {
  const uniqueMap = new Map();
  const result = [];
  for (const item of arr) {
    const title = item.title;
    if (!uniqueMap.has(title)) {
      uniqueMap.set(title, item);
      result.push(item);
    }
  }
  return result;
}


function analysis(data) {
  let result;
  try{
    // 直接使用 readFileSync 的返回值
    const fileContent = fs.readFileSync(urlFilePath, "utf8");
    const inputUrl = fileContent.trim();

    // 检查输入的 URL 是否包含查询参数
    if (!inputUrl.includes("?")) {
      console.error("输入的 URL 格式不正确，请确保包含查询参数。");
      return;
    }

    const urlParams = new URLSearchParams(inputUrl.split("?")[1]);
    let _x_sessn_id = urlParams.get("_x_sessn_id");
    let _x_enter_scene_type = urlParams.get("_x_enter_scene_type");
    let refer_page_el_sn = urlParams.get("refer_page_el_sn");
    let refer_page_name = urlParams.get("refer_page_name");
    let refer_page_id = urlParams.get("refer_page_id");
    if(data&&data.length){
      resource=data
    }else{
      try {
        const files = fs.readdirSync(directoryPath); // 同步读取目录
  
        files.forEach((file) => { 
          if (path.extname(file) === ".json") {
            const filePath = path.join(directoryPath, file);
            try {
              const data = fs.readFileSync(filePath, "utf8"); // 同步读取文件
              const jsonData = JSON.parse(data);
              resource = resource.concat(jsonData);
            } catch (readError) {
              console.error("无法读取文件: " + readError);
            }
          }
        });
      } catch (err) {
        console.error("无法读取目录: " + err);
      }
    }
    resource.forEach((item) => {
      if (item.seo_link_url) {
        item.seo_link_url = `${baseUrl}${item.seo_link_url}&_x_sessn_id=${_x_sessn_id}&_x_enter_scene_type=${_x_enter_scene_type}&refer_page_el_sn=${refer_page_el_sn}&refer_page_name=${refer_page_name}&refer_page_id=${refer_page_id}`;
      }
    });
    resource = removeDuplicatesByTitle(resource);
    result = sortFun(resource);
  }catch(e){
    console.error(e)
  }
  return result;
}

// 解析销售数字的函数
function parseSalesNum(salesNum) {
  if (salesNum.endsWith("K+")) {
    return parseFloat(salesNum) * 1000; // 将 K+ 转换为数字
  }
  return parseInt(salesNum, 10); // 处理其他数字
}

analysis()



module.exports = {
  analysis: analysis,
};
