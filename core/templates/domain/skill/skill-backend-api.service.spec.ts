// Copyright 2018 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Unit tests for SkillBackendApiService.
 */

import { HttpClientTestingModule, HttpTestingController } from
  '@angular/common/http/testing';
import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';


import { SkillBackendApiService } from
  'domain/skill/skill-backend-api.service.ts';
import { CsrfTokenService } from 'services/csrf-token.service.ts';


describe('Skill backend API service', () => {
  let skillBackendApiService:
    SkillBackendApiService = null;
  let httpTestingController: HttpTestingController;
  let csrfService: CsrfTokenService = null;
  let sampleResponse = null;
  let sampleResponse2 = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    httpTestingController = TestBed.get(HttpTestingController);
    skillBackendApiService = TestBed.get(SkillBackendApiService);
    csrfService = TestBed.get(CsrfTokenService);
    spyOn(csrfService, 'getTokenAsync').and.callFake(() => {
      return new Promise((resolve) => {
        resolve('sample-csrf-token');
      });
    });

    const misconceptionDict1 = {
      id: '2',
      name: 'test name',
      notes: 'test notes',
      feedback: 'test feedback',
      must_be_addressed: true
    };

    const misconceptionDict2 = {
      id: '4',
      name: 'test name',
      notes: 'test notes',
      feedback: 'test feedback',
      must_be_addressed: true
    };

    const example1 = {
      question: {
        html: 'worked example question 1',
        content_id: 'worked_example_q_1'
      },
      answer: {
        html: 'worked example answer 1',
        content_id: 'worked_example_a_1'
      }
    };
    const example2 = {
      question: {
        html: 'worked example question 1',
        content_id: 'worked_example_q_1'
      },
      answer: {
        html: 'worked example answer 1',
        content_id: 'worked_example_a_1'
      }
    };

    const skillContentsDict = {
      explanation: 'test explanation',
      worked_examples: [example1, example2]
    };

    const skillDict = {
      id: '1',
      description: 'test description',
      misconceptions: [misconceptionDict1, misconceptionDict2],
      skill_contents: skillContentsDict,
      language_code: 'en',
      version: 3,
      prerequisite_skill_ids: []
    };

    const skillDict2 = {
      id: '2',
      description: 'test description 2',
      misconceptions: [misconceptionDict1],
      skill_contents: skillContentsDict,
      language_code: 'en',
      version: 2,
      prerequisite_skill_ids: []
    };

    sampleResponse = {
      skill: skillDict,
      groupedSkillSummaries: {}
    };

    sampleResponse2 = {
      skills: [skillDict, skillDict2]
    };
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should succesfully fetch an existing skill from the backend',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      skillBackendApiService.fetchSkill('1').then(
        successHandler, failHandler);
      var req = httpTestingController.expectOne(
        '/skill_editor_handler/data/1');
      expect(req.request.method).toEqual('GET');
      req.flush(sampleResponse);

      flushMicrotasks();

      expect(successHandler).toHaveBeenCalledWith({
        skill: sampleResponse.skill,
        groupedSkillSummaries: sampleResponse.groupedSkillSummaries
      });
      expect(failHandler).not.toHaveBeenCalled();
    }));

  it('should use the rejection handler if backend request failed',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      skillBackendApiService.fetchSkill('1').then(
        successHandler, failHandler);
      var req = httpTestingController.expectOne(
        '/skill_editor_handler/data/1');
      expect(req.request.method).toEqual('GET');
      req.flush('Error loading skill 1.', {
        status: 500,
        statusText: 'Error loading skill 1.'
      });

      flushMicrotasks();

      expect(successHandler).not.toHaveBeenCalled();
      expect(failHandler).toHaveBeenCalledWith('Error loading skill 1.');
    }));

  it('should make a request to update the skill in the backend',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      let skillDict = null;
      skillBackendApiService.fetchSkill('1').then(
        (data) => {
          skillDict = data;
        });
      var reqGet = httpTestingController.expectOne(
        '/skill_editor_handler/data/1');
      expect(reqGet.request.method).toEqual('GET');
      reqGet.flush(sampleResponse);

      flushMicrotasks();

      skillBackendApiService.updateSkill(
        skillDict.skill.id, skillDict.version, 'commit message', []).then(
        successHandler, failHandler);
      var reqPut = httpTestingController.expectOne(
        '/skill_editor_handler/data/1');
      expect(reqPut.request.method).toEqual('PUT');
      reqPut.flush({
        skill: skillDict
      });

      flushMicrotasks();

      expect(successHandler).toHaveBeenCalledWith(skillDict);
      expect(failHandler).not.toHaveBeenCalled();
    }));

  it('should use the rejection handler if the skill update in the backend' +
    'failed', fakeAsync(() => {
    let successHandler = jasmine.createSpy('success');
    let failHandler = jasmine.createSpy('fail');

    let skillDict = null;
    skillBackendApiService.fetchSkill('1').then(
      (data) => {
        skillDict = data;
      });
    var reqGet = httpTestingController.expectOne(
      '/skill_editor_handler/data/1');
    expect(reqGet.request.method).toEqual('GET');
    reqGet.flush(sampleResponse);

    flushMicrotasks();

    skillBackendApiService.updateSkill(
      skillDict.skill.id, skillDict.version, 'commit message', []
    ).then(successHandler, failHandler);
    var reqPut = httpTestingController.expectOne(
      '/skill_editor_handler/data/1');
    expect(reqPut.request.method).toEqual('PUT');
    reqPut.flush('Error on update skill 1.', {
      status: 500,
      statusText: 'Error on update skill 1.'
    });

    flushMicrotasks();

    expect(successHandler).not.toHaveBeenCalled();
    expect(failHandler).toHaveBeenCalledWith('Error on update skill 1.');
  }));

  it('should succesfully fetch multiple existing skills from the backend',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      let skillDataUrl = '/skill_data_handler/' + encodeURIComponent('1,2');
      skillBackendApiService.fetchMultiSkills(['1', '2']).then(
        successHandler, failHandler);
      var req = httpTestingController.expectOne(
        skillDataUrl);
      expect(req.request.method).toEqual('GET');
      req.flush(sampleResponse2);

      flushMicrotasks();

      expect(successHandler).toHaveBeenCalledWith(sampleResponse2.skills);
      expect(failHandler).not.toHaveBeenCalled();
    }));

  it('should use the rejection handler if fetch multiple skills from the ' +
    'backend failed', fakeAsync(() => {
    let successHandler = jasmine.createSpy('success');
    let failHandler = jasmine.createSpy('fail');

    let skillDataUrl = '/skill_data_handler/' + encodeURIComponent('1,2');
    skillBackendApiService.fetchMultiSkills(['1', '2']).then(
      successHandler, failHandler);
    var req = httpTestingController.expectOne(
      skillDataUrl);
    expect(req.request.method).toEqual('GET');
    req.flush('Error on fetching skills 1 and 2.', {
      status: 500,
      statusText: 'Error on fetching skills 1 and 2.'
    });

    flushMicrotasks();

    expect(successHandler).not.toHaveBeenCalled();
    expect(failHandler).toHaveBeenCalledWith(
      'Error on fetching skills 1 and 2.');
  }));

  it('should successfully delete a skill', fakeAsync(() => {
    let successHandler = jasmine.createSpy('success');
    let failHandler = jasmine.createSpy('fail');

    skillBackendApiService.deleteSkill('1').then(
      successHandler, failHandler);
    var req = httpTestingController.expectOne(
      '/skill_editor_handler/data/1');
    expect(req.request.method).toEqual('DELETE');
    req.flush(200);

    flushMicrotasks();

    expect(successHandler).toHaveBeenCalledWith(200);
    expect(failHandler).not.toHaveBeenCalled();
  }));

  it('should use the rejection handler if delete a existing skill fails',
    fakeAsync(() => {
      var successHandler = jasmine.createSpy('success');
      var failHandler = jasmine.createSpy('fail');

      skillBackendApiService.deleteSkill('1').then(
        successHandler, failHandler);
      var req = httpTestingController.expectOne(
        '/skill_editor_handler/data/1');
      expect(req.request.method).toEqual('DELETE');
      let errorResponse = {
        status: 500,
        statusText: 'It is not possible to delete skill 1.'
      };
      req.flush('It is not possible to delete skill 1.', errorResponse);


      flushMicrotasks();

      expect(successHandler).not.toHaveBeenCalled();
      expect(failHandler).toHaveBeenCalledWith(
        'It is not possible to delete skill 1.');
    }
    ));
});
