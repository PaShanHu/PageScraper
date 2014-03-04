var request = require('request'),
    cheerio = require('cheerio'),
    http = require('http'),
    url = require('url');

var host = 'http://www.amazon.cn/s/ref=sv_cps_1?ie=UTF8&page=1&rh=n%3A665002051%2Cp_n_feature_four_browse-bin%3A115583071%7C2147059051%7C2147061051%7C2147060051%7C2147058051%7C2147057051%7C80776071%7C115431071%7C115430071%7C2147062051%7C115434071%7C115433071%7C115432071%7C115429071';

var productURLs=[],
	nextPageURL=null,
	paginationURLs=[];

var title,price,commentCount;

var rprice=/(\d+\.\d{2})$/,
	rcommentCount=/(\d+)\s*条评论/;

console.log('start scrape');

function scraper(host){
	request(host,function(error,response,data){
		if(error){
			console.log('error!\ndetails:');
			console.log(error);
		}else if(response.statusCode== 200){
			var $=cheerio.load(data);
			// 获取产品的真实URL
			// 可以发现，图片的url与下面标题的URL均指向产品详细页
			// 用h3.newaps获取地址
			$("h3.newaps").each(function(index){
				productURLs[index]=$(this).find("a").attr("href");
				console.log("---------第-"+index+"-个----------");
				console.log(productURLs[index]);
			});

			// 获取分页地址
			var nextPage=$("#pagn .pagnLink").eq(0).find("a");
			nextPageURL=nextPage.attr("href");
			paginationURLs[parseInt(nextPage.text())]=nextPageURL;
			console.log("----------下一页地址-----------");
			console.log(nextPageURL);

			// 获取第一个产品的详细信息
			request(productURLs[0],function(error,response,data){
				if(error){
					console.log('error!\ndetails:');
					console.log(error);
				}else if(response.statusCode== 200){
					var $=cheerio.load(data);

					// 产品标题在 span#btAsinTitle下
					title=$("#btAsinTitle>span").text().trim();
					console.log("---------title---------");
					console.log(title);

					// 价格
					price=$("#actualPriceValue .priceLarge").text();
					price=rprice.exec(price)[1];
					console.log("---------price--------");
					console.log(price);

					// 评论总数
					commentCount=$('.acrCount>a').text();
					commentCount=rcommentCount.exec(commentCount)[1];
					console.log("---------commentCount--------");
					console.log(commentCount);

					// 保持cmd窗口
					process.stdin.resume(); 
				}
			}); 
		}
	});
};

scraper(host);