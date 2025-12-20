/**
 * maezato
 * https://github.com/paazmaya/maezato
 *
 * Clone all repositories of a given user or organization at GitHub,
 * by ordering them according to fork/contributing/mine
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license
 */

import fs from 'node:fs';

import {
  graphql, HttpResponse
} from 'msw';

const payload = fs.readFileSync(new URL('../fixtures/users-paazmaya-repos.json', import.meta.url), 'utf8');
const response = JSON.parse(payload);

// Mock server that catches all GraphQL requests
export const handlers = [
  graphql.operation(({
    request, operationName
  }) => {
    //console.log('[MSW] Request', request);
    //console.log(`[MSW] Intercepted a ${operationName} operation`);
    const authHeader = request.headers.get('authorization');

    const {
      ssh_url
    } = request.body;
    if (ssh_url === 'git@github.com:user/repo.git') {
      return HttpResponse.json({
        message: 'Clone successful'
      }, {
        status: 200
      });
    }

    if (ssh_url === 'git@github.com:user/clone-error.git') {
      return HttpResponse.json({
        error: 'Repository already exists and is not empty'
      }, {
        status: 400
      });
    }

    //return HttpResponse.json({ error: 'Unknown error' }, { status: 500 });


    if (authHeader.includes('bearer valid-token')) {
      return HttpResponse.json({
        data: response
      });
    }
    else if (authHeader.includes('bearer invalid-token')) {
      return HttpResponse.json({
        message: 'Bad credentials'
      }, {
        status: 401
      });
    }


    return HttpResponse.json({
      message: 'Bad credentials'
    }, {
      status: 401
    });
  })

];
