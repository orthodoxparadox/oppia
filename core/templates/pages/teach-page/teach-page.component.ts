// Copyright 2016 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Component for the teach page.
 */

import { Component, Input, OnInit } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';
import { SiteAnalyticsService } from 'services/site-analytics.service';
import { WindowRef } from 'services/contextual/window-ref.service';
import { UrlInterpolationService } from
  'domain/utilities/url-interpolation.service';

@Component({
  selector: 'teach-page',
  templateUrl: './teach-page.component.html',
  styleUrls: []
})
export class TeachPageComponent implements OnInit {
  TAB_ID_TEACH: string = 'teach';
  TAB_ID_PARTICIPATION: string = 'participation';
  TEACH_FORM_URL: string = 'https://goo.gl/forms/0p3Axuw5tLjTfiri1';
  ALLOWED_TABS = [this.TAB_ID_TEACH, this.TAB_ID_PARTICIPATION];
  activeTabName = this.TAB_ID_TEACH;
  constructor(
    private siteAnalyticsService: SiteAnalyticsService,
    private urlInterpolationService: UrlInterpolationService,
    private windowRef: WindowRef
  ) {}
  ngOnInit(): void {
    console.log('Fires up teach-page');
    const hash = this.windowRef.nativeWindow.location.hash.slice(1);
    console.log(hash);
    if (this.ALLOWED_TABS.includes(hash)) {
      this.activeTabName = hash;
    }
    this.windowRef.nativeWindow.onhashchange = () => {
      const hashChange = this.windowRef.nativeWindow.location.hash.slice(1);
      if (this.ALLOWED_TABS.includes(hashChange)) {
        this.activeTabName = hashChange;
      }
    };
  }
  onTabClick(tabName: string) {
    // ---- Update hash ----
    this.windowRef.nativeWindow.location.hash = '#' + tabName;
    this.activeTabName = tabName;
    return this.windowRef.nativeWindow;
  }

  getStaticImageUrl(imagePath: string): string {
    return this.urlInterpolationService.getStaticImageUrl(imagePath);
  }

  onApplyToTeachWithOppia(): boolean {
    console.log('Click apply to teach');
    this.siteAnalyticsService.registerApplyToTeachWithOppiaEvent();
    setTimeout(() => {
      this.windowRef.nativeWindow.location.href = this.TEACH_FORM_URL;
    }, 150);
    return false;
  }
}

angular.module('oppia').directive(
  'teachPage', downgradeComponent(
    {component: TeachPageComponent}));
