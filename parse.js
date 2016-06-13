var request = require('request');
var cheerio = require('cheerio');
var icalendar = require('icalendar');
var fs = require('fs');

var tds, title, url, author, title, start, end, day;

var ical = new icalendar.iCalendar();

request('http://www.enterjs.de/abstracts.html', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    // console.log(body)

    $ = cheerio.load(body);

    $('.container-fluid>.row:not(:first-child)').each(function(ti, session) {

      session = $(session);
      id = session.find('div[id]').attr('id');
      title = session.find('h2:first-child').text().trim();
      timeInfoChunks = session.find('.address>p:last-child')
        .text()
        .replace(/\n/g, ',')
        .split(',')
        .map(function(chunk) {
          return chunk.trim();
        })
        .filter(function(chunk) {
          return !!chunk;
        });
      if (timeInfoChunks.length === 0) return;

      dateChunks = timeInfoChunks[1].split('.');
      timeChunks = timeInfoChunks[2]
        .split('-')
        .map(function(chunk) {
          return chunk.replace('h', '');
        });
      from = new Date(Date.parse(dateChunks[2]+'-'+dateChunks[1]+'-'+dateChunks[0]+' '+timeChunks[0]));
      to = new Date(Date.parse(dateChunks[2]+'-'+dateChunks[1]+'-'+dateChunks[0]+' '+timeChunks[1]));

      var event = ical.addComponent('VEVENT');
      event.setSummary(title);
      event.setDescription('https://www.enterjs.de/abstracts.html#' + id);
      event.setDate(from, to);
      event.addProperty('CATEGORIES', 'ejs16');
      event.setLocation('Darmstadium');
    });

    // console.log();

    fs.writeFile("enterJS-2016.ics", ical.toString(), function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
  }
});
