const request = require('request');
const Bot = require('slackbots');
const CronJob = require('cron').CronJob;
const argv = require('minimist')(process.argv.slice(2));


console.log(argv);
const bot = new Bot({
  name: 'make-a-commit',
  token: argv.t,
});


new CronJob('* * 18 * * *', function() {
  (function checkCommits() {
    request({
      url: `https://api.github.com/users/${argv.g}/events`,
      headers: {
        'User-Agent': 'keep-me-commiting'
      }
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const lastEvent = JSON.parse(body)[0];
        const now = new Date(Date.now()).toISOString();
        const lastEventTime = lastEvent.created_at;

        if (lastEvent.public) {
          if (lastEventTime.split('-')[2].split('T')[0] !== now.split('-')[2].split('T')[0]) {
            bot.postMessageToUser(argv.s, `You haven't made any public commits today, I'll check back in an hour.`);
            setTimeout(checkCommits, 3600000);
          } else {
            bot.postMessageToUser(argv.s, `Nice you're keeping your streak alive, you've made at least one public commit today.`);
          }
        }
      }
    });
  })();
}, null, true, 'America/New_York');
