// Copyright 2020 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit tests for EmailDashboardQueryObjectFactory.
 */

import { EmailDashboardQueryObjectFactory } from
  'domain/email-dashboard/email-dashboard-query-object.factory';

describe('Email dashboard query object factory', () => {
  let edqof: EmailDashboardQueryObjectFactory;
  let queryDict = {
    created_on: '04-06-20 14:34:46',
    status: 'processing',
    submitter_username: 'testUser',
    id: 'buQW4Qhoxpjg',
    num_qualified_users: 0
  };
  let backendDict = {
    query: queryDict
  };

  beforeEach(() => {
    edqof = new EmailDashboardQueryObjectFactory();
  });

  it('should correctly convert query dict to query object', () => {
    let queryObject = edqof.createFromQueryDict(queryDict);

    expect(queryObject.id).toEqual('buQW4Qhoxpjg');
    expect(queryObject.numQualifiedUsers).toEqual(0);
    expect(queryObject.status).toEqual('processing');
    expect(queryObject.submitterUsername).toEqual('testUser');
    expect(queryObject.createdOn).toEqual('04-06-20 14:34:46');
  });

  it('should correctly convert backend dict to query object', () => {
    let queryObject = edqof.createFromBackendDict(backendDict);

    expect(queryObject.id).toEqual('buQW4Qhoxpjg');
    expect(queryObject.numQualifiedUsers).toEqual(0);
    expect(queryObject.status).toEqual('processing');
    expect(queryObject.submitterUsername).toEqual('testUser');
    expect(queryObject.createdOn).toEqual('04-06-20 14:34:46');
  });
});
