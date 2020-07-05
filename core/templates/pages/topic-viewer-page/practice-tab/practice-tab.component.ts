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
 * @fileoverview Component for the stories list.
 */

import { Component, Input, OnInit } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';

import { Subtopic } from 'domain/topic/SubtopicObjectFactory';
import { UrlInterpolationService } from
  'domain/utilities/url-interpolation.service';
import { PracticeSessionPageConstants} from
  'pages/practice-session-page/practice-session-page.constants.ts';

@Component({
  selector: 'practice-tab',
  templateUrl: './practice-tab.component.html',
  styleUrls: []
})
export class PracticeTabComponent implements OnInit {
  selectedSubtopics: Array<Subtopic> = [];
  availableSubtopics: Array<Subtopic> = [];
  selectedSubtopicIndices: Array<Boolean> = [];
  @Input() topicName: string;
  @Input() subtopicsList: Array<Subtopic>;
  constructor(
    private urlInterpolationService: UrlInterpolationService
  ) {}
  ngOnInit(): void {
    this.selectedSubtopics = [];
    this.availableSubtopics = this.subtopicsList.filter(
      (subtopic: Subtopic) => {
        return subtopic.getSkillSummaries().length > 0;
      }
    );
    this.selectedSubtopicIndices = Array(
      this.availableSubtopics.length).fill(false);
  }
  isStartButtonDisabled(): boolean {
    for (var idx in this.selectedSubtopicIndices) {
      if (this.selectedSubtopicIndices[idx]) {
        return false;
      }
    }
    return true;
  }
  openNewPracticeSession(): void {
    var selectedSubtopicIds = [];
    for (var idx in this.selectedSubtopicIndices) {
      if (this.selectedSubtopicIndices[idx]) {
        selectedSubtopicIds.push(
          this.availableSubtopics[idx].getId());
      }
    }
    var practiceSessionsUrl = this.urlInterpolationService.interpolateUrl(
      PracticeSessionPageConstants.PRACTICE_SESSIONS_URL, {
        topic_name: this.topicName,
        comma_separated_subtopic_ids: selectedSubtopicIds.join(',')
      });
    window.location.href = practiceSessionsUrl;
  }
}
angular.module('oppia').directive(
  'practiceTab', downgradeComponent(
    {component: PracticeTabComponent}));
