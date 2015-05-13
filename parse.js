var request = require('request');
var cheerio = require('cheerio');
var icalendar = require('icalendar');
var fs = require('fs');

var tds, title, url, author, title, start, end, day;

var ical = new icalendar.iCalendar();

request('http://www.enterjs.de/', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    // console.log(body)

    $ = cheerio.load(body);

    $('table.agenda').each(function(ti, table) {

      table = $(table);
      title = table.parents('.row').prev().find('h2').text();

      if (!title.match(/Vorträge/)) return;

      day = title.replace(/^Tag \d, /, '').replace(/:.*/, '');

      // console.log(new Date(Date.parse(title.replace(/^Tag \d, /, '').replace(/:.*/, ''))).toISOString())

      table.find('tr').each(function(i, tr) {

        tds = $(tr).find('td');

        var time = $(tds.get(0)).text();

        if (time.match(/^Ab/)) {
          start = end = time.replace(/^Ab /, '');
        } else {
          start = time.replace(/^(.*)-(.*)$/, '$1');
          end = time.replace(/^(.*)-(.*)$/, '$2');
        }

        for (var i = 1; i < tds.length; i++) {

          title = $(tds.get(i)).find('p:nth-child(1)').text().replace(/(^„|”$)/g, '');
          author = $(tds.get(i)).find('p:nth-child(2)').text();
          url = $(tds.get(i)).find('p:nth-child(1) a').attr('href');
          if (url) {
            url = 'http://www.enterjs.de' + $(tds.get(i)).find('p:nth-child(1) a').attr('href')
          }

          // console.log(new Date(Date.parse(title.replace(/^Tag \d, /, '').replace(/:.*/, '') + ' ' + start)).toISOString())


          if (url && author) {
            var event = ical.addComponent('VEVENT');
            event.setSummary(title + '\n' + author);
            event.setDescription(url);
            event.setDate(new Date(Date.parse(day + ' ' + start)), new Date(Date.parse(day + ' ' + end)));
          }
        }



        // console.log('******\n', $(tr).html());
      });

    });

    // console.log();


    fs.writeFile("enterJS-2015.ics", ical.toString(), function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
  }
});
