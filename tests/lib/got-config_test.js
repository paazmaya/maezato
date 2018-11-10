
const tape = require('tape'),
  gotConfig = require('../../lib/got-config');

tape('gotConfig - token gets used', (test) => {
  test.plan(1);

  const input = 'hoplaa';

  const output = gotConfig(input);

  test.equal(output.headers.authorization, 'token hoplaa');
});
