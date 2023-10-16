const { JSDOM } = require("jsdom");
const axios = require("axios");
const express = require("express");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
    const html = fs.readFileSync("./index.html", "utf8");

    res.type('html').send(html);
}
);

app.get("/index.html", (req, res) => {
  const html = fs.readFileSync("./index.html", "utf8");

  res.type('text/css').send(html);
}
);

app.get("/imgmap.json", (req, res) => {
  const html = fs.readFileSync("./imgmap.json", "utf8");
  res.type('application/json').send(html);
}
);

app.get("/images/*", (req, res) => {
  var imgpth = req.url;
  console.log(imgpth)
  res.sendFile(imgpth);  
  //const html = fs.readFileSync("./images/"+req.query.imgname+".png", "utf8");
  //res.type('image/png').send(html);
}
);

app.get("/styles.css", (req, res) => {
  const html = fs.readFileSync("./styles.css", "utf8");

  res.type('html').send(html);
}
);

app.get("/prayers", async (req, res) => {
    const resdata = await prayers(req.query.pname);
    res.type('html').send(resdata);
}
);
app.get("/masstexts", async (req, res) => {
    const resdata = await masstexts(req.query.pname);
    res.type('html').send(resdata);
}
);
app.get("/psalm", async (req, res) => {
  const resdata = await psalmget(req.query.pname);
  res.type('html').send(resdata);
}
);
app.get("/readings", async (req, res) => {
    const resdata = await readings(req.query.pname);
    res.type('html').send(resdata);
}
);
app.get("/hymnary", async (req, res) => {
    const resdata = await hymnary(req.query.pname);
    res.type('html').send(resdata);
}
);

const server = app.listen(port, () => console.log(`Mass reading app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const headhtml = ``
//<!DOCTYPE html>
//<html>
//  <head>
//    <title>Hello from Render!</title>
//  </head>
//  <body>
//`
const tailhtml = ``
//</body>
//</html>
//`
const html = `

`

const readings = async (sundate) => {
link = "https://bible.usccb.org/bible/readings/"+sundate+".cfm"
try {
    console.log(`Readings: ${link}`);

    const linkHtml = (await axios.get(link)).data;

    const doc = new JSDOM(linkHtml, {
      url: link,
    });

    const innerblock = doc.window.document.querySelectorAll('div.innerblock');
    const innerdiv = doc.window.document.querySelectorAll('div.innerblock > #content-body');
    var result = "";
    for (let blocktxt of innerblock) {
        if (blocktxt.querySelector('h3') !== null) {
            result = result + blocktxt.querySelector('h3').outerHTML; 
            result = result + blocktxt.querySelector('div.address').outerHTML; 
            result = result + blocktxt.querySelector('div.content-body').innerHTML;

        }
      }
    console.log(`Readings: ${link}`)
    return result
  } catch (error) {
    console.error(error);
    console.log(`Error at ${link}`)
  }
}

const masstexts = async (pname) => {
    link = "https://universalis.com/static/mass/orderofmass.htm";
    try {
        console.log(`MassTexts: ${link}`);

        const linkHtml = (await axios.get(link)).data;
    
        const doc = new JSDOM(linkHtml, {
          url: link,
        });
    
        const innerblock = doc.window.document.querySelector('#'+pname);

        console.log(`MassTexts: ${link}`)
        return innerblock.innerHTML;

    } catch (error) {
        console.error(error);
        console.log(`Error at ${link}`)
    }
}
 
const prayers = async (pname) => {
    link = "https://www.daily-prayers.org/"+pname+"/";
    try {
        console.log(`Prayers: ${link}`);

        const linkHtml = (await axios.get(link)).data;
    
        const doc = new JSDOM(linkHtml, {
          url: link,
        });
    
        const innerblock1 = doc.window.document.querySelector('div.entry-content > div.wp-block-group');
        const innerblock = innerblock1.querySelector('p');

        innerblock.querySelectorAll('g').forEach(e => e.remove());
        
        console.log(`Prayers: ${link}`)

        return innerblock.innerHTML;
    } catch (error) {
        console.error(error);
        console.log(`Error at ${link}`)
    }
}

const hymnary = async (pname) => {
    link = "https://hymnary.org/hymn/G32011/"+pname;
    try {
        console.log(`Hymnary: ${link}`);

        const linkHtml = (await axios.get(link)).data;
    
        const doc = new JSDOM(linkHtml, {
          url: link,
        });
    
        const images = doc.window.document.querySelectorAll('img.instance_pagescan');
        var result = "";
        let count = 0;
        for (let image of images) {
            count = count + 1;
            ilink = "https://hymnary.org" + image.getAttribute("src");
            result = result + `<img src="`+ilink+`"><br />`;     
        }
        if (count === 0) {
          result = `<p class="rubric">image not available</p>`
        }
        console.log(`Hymnary: ${link}`)
        return result;

    } catch (error) {
        console.error(error);
        console.log(`Error at ${link}`)
    }
}
 

     
    
//masstexts("#kyrieLong")
//masstexts("#niceneCreed")
//prayers("traditional-prayers/i-confess")
//prayers("father-son-holy-spirit/creed-nicene")
//readings("082023") //08-20-2023