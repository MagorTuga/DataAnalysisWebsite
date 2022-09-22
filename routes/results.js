const c = require('cheerio');
const a = require('axios');
const e = require('express');
const r = e.Router();
const mysql = require('mysql');

r.post('/', (req, res) =>{
    var prices = [];
    var names = [];
    var conditions = [];
    var links = [];
    var dates = [];
    var search = "";
    var count = 0;
    var min;
    var max;
    var amount = 100;
    var average = 0;
    var highest = 0;
    var lowest = 0;
    var win_h = 1080;
    var cc = "";
    var type = "";
    var currency;
    var table_dates = [];
    var table_prices = [];

    search = res.req.body.search;
    min = res.req.body.min;
    max = res.req.body.max;
    cc = res.req.body.country;
    type = res.req.body.type;
    amount = res.req.body.amount;

    var typeToInput = type
    if (type == "Any"){
        typeToInput = ""
    }

    switch (cc){
        case "UK":
            currency = "£";
            break;
        case "US":
            currency = "$";
            break;
        default:
            console.log("Error. No country selected.")
            break;
    }

    var searchString = res.req.body.search.replace(/ /g, "+");
    var url = 'http://www.watchcount.com/completed.php?bkw=' + searchString + "+" + typeToInput +'&bcat=0&bcts=&sfsb=Show+Me%21&csbin=all&cssrt=ts&bfw=1&bslr=&bnp='+min+'&bxp='+max+'#serp';
    
    a.get(url, 
        {headers: {'User-Agent' : 'Chrome/68.0.3440.106', Cookie : "cc=" + cc }})
        .then(response =>{
        const $ = c.load(response.data);

        for(let div of $('.midbox .framebox .frameboxcells .displaybox .displayboxbottom .dt.bg0 .serptablecell2-adv .serptablebasestyle2').get()){
            
            var tempLink = $(div).find('.underlinedlinks').attr('href');
            var fixedLinks = tempLink.split("=");
            var fixedLinks = fixedLinks[1].split("&");

            var fixedStr = $(div).find('.padr2.bhserp-txt1.bhserp-new1').text().replace(/,|£|\$|\s|[(GBP)]|[(USD)]/g, '');
            
            var tempDate = new Date();
            var valueToChangeDate = parseInt($(div).find('.splittablecell1 .bhserp-dim1 .bhserp-dim2').text());
            tempDate.setDate(tempDate.getDate() - valueToChangeDate);
            
            let item = {
                link: "https://www.ebay.co.uk/itm/" + fixedLinks[0],
                name: $(div).find('.valtitle.lovewrap.padr4 .underlinedlinks').text(),
                price: Number(fixedStr),
                condition: $(div).find('.padl1.labinfo').text(),
                date: tempDate

            }
            average+= item.price;
            count++;

            var con = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "",
                database: "100520093"
            });

            con.connect(function(err){
                if (err) throw err;
                var sql = "INSERT IGNORE INTO `item` (`link`, `title`, `price`, `date`, `item_condition`, `country`) VALUES (?)";
                var values = [item.link, item.name, item.price, item.date, item.condition, cc];
                
                con.query(sql, [values], function(err, result){
                    if (err) throw err;
                    });
                
                var sql = "SELECT * FROM `item` WHERE `link` = ?";
                var values = item.link;
                    
                con.query(sql, [values], function(err, result){
                    if (err) throw err;
                    var sql = "INSERT INTO `search` (`item_ID`, `string`) VALUES (?)";
                    var values = [result[0].ID, search];
                
                    con.query(sql, [values], function(err, result){
                        if (err) throw err;
                    });
                });
            });
        };

        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "100520093",
            multipleStatements: true
        });
        
        con.connect(function(err){
            if (err) throw err;
            var sql = "SELECT DISTINCT search.item_ID, search.string,item.title, item.link,item.price,item.date,item.item_condition,item.country FROM `search` INNER JOIN `item` ON `item`.`ID` = `search`.`item_ID` WHERE `string` = ? ORDER BY `item`.`date` DESC; SELECT CAST(AVG(price) AS decimal(5,2)) AS price, CAST(date AS date) AS date FROM (SELECT DISTINCT search.item_ID, search.string,item.title, item.link,item.price,item.date,item.item_condition,item.country FROM `search` INNER JOIN `item` ON `item`.`ID` = `search`.`item_ID` WHERE `string` = ? ORDER BY `item`.`date` DESC) AS fixed_query GROUP BY date";
            var values = [search];
            
            con.query(sql, [values, values], function(err, result){
                if (err) throw err;
                for (x in result[0]){
                    names[x] = result[0][x].title;
                    links[x] = result[0][x].link;
                    prices[x] = result[0][x].price;
                    conditions[x] = result[0][x].item_condition;
                    dates[x] = result[0][x].date.toLocaleDateString("en-GB");
                };

                for (x in result[1]){
                    table_prices[x] = result[1][x].price;
                    table_dates[x] = String(result[1][x].date.toLocaleDateString("en-GB"));
                };
            
                average/= count;
                average = average.toFixed(2);

                highest = Math.max(...prices);
                lowest = Math.min(...prices);

                console.log();

                res.render('results', {search: search,
                    average: average,
                    names: names,
                    prices: prices,
                    conditions: conditions,
                    links: links,
                    dates: dates,
                    min: min,
                    max: max,
                    amount: amount,
                    win_h: win_h,
                    highest: highest,
                    lowest: lowest,
                    type: type,
                    currency: currency,
                    cc: cc,
                    table_dates: table_dates,
                    table_prices: table_prices
                });
                
            });
        });
    });
});
module.exports = r;