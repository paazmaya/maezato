
const fs = require('fs');

const tape = require('tape'),
  nock = require('nock');

const getRepos = require('../../lib/get-repos');

const payload = fs.readFileSync('tests/fixtures/users-tonttu-repos.json', 'utf8');

tape('getRepos - stuff is fetched', (test) => {
  test.plan(1);

  nock('https://api.github.com')
  	.get('/users/tonttu/repos')
    .query({
      type: 'all',
      per_page: '100'
    })
  	.reply(200, payload);

  getRepos({
    username: 'tonttu',
    token: 'hoplaa',
    verbose: true
  }).then((output) => {
    test.equal(output.length, 3);
  });
});
