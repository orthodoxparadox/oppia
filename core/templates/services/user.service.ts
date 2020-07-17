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

import { Injectable } from '@angular/core';
import { UserInfo, UserInfoObjectFactory, IUserInfoBackendDict } from
  'domain/user/UserInfoObjectFactory';
import { UrlService } from './contextual/url.service';
import { HttpClient } from '@angular/common/http';
import { UrlInterpolationService } from
  'domain/utilities/url-interpolation.service';

import { AppConstants } from 'app.constants';
import { WindowRef } from './contextual/window-ref.service';

/**
 * @fileoverview Service for user data.
 */

 @Injectable({
   providedIn: 'root'
 })
export class UserService {
  constructor(
    private urlService: UrlService,
    private urlInterpolationService: UrlInterpolationService,
    private http: HttpClient,
    private windowRef: WindowRef
  ) {}
  private PREFERENCES_DATA_URL: string = 'preferenceshandler/data';
  private USER_COMMUNITY_RIGHTS_DATA_URL: string = '/usercommunityrightsdatahandler';
  private userInfo: UserInfo = null;
  private userCommunityRightsInfo = null;

  private _getUserInfoAsync(
      successCallback: (value?: Object | PromiseLike<Object>) => void): void {
    let userInfoObjectFactory = new UserInfoObjectFactory();
    if (this.urlService.getPathname() === '/signup') {
      successCallback(userInfoObjectFactory.createDefault());
    }
    this.http.get<IUserInfoBackendDict>('/userinfohandler').toPromise().
      then((response) => {
        if (response.user_is_logged_in) {
          this.userInfo = userInfoObjectFactory.createFromBackendDict(response);
          successCallback(this.userInfo);
        } else {
          successCallback(userInfoObjectFactory.createDefault());
        }
      });
  }

  private _getProfileImageDataUrlAsync(userInfo: UserInfo,
      successCallback: (value?: Object | PromiseLike<Object>) => void): void {
    var profilePictureDataUrl = (
      this.urlInterpolationService.getStaticImageUrl(
        AppConstants.DEFAULT_PROFILE_IMAGE_PATH));
    if (userInfo.isLoggedIn()) {
      this.http.get('/preferenceshandler/profile_picture').toPromise().then(
        (response: any) => {
          if (response.profile_picture_data_url) {
            profilePictureDataUrl = response.profile_picture_data_url;
          }
          successCallback(profilePictureDataUrl);
        }
      );
    } else {
      successCallback(profilePictureDataUrl);
    }
  }

  private _setProfileImageDataUrlAsync(newProfileImageDataUrl: string,
      successCallback: (value?: Object | PromiseLike<Object>) => void): void {
    this.http.put(this.PREFERENCES_DATA_URL, {
      update_type: 'profile_picture_data_url',
      data: newProfileImageDataUrl
    }).toPromise().then((response) => {
      successCallback();
    });
  }

  private _getLoginUrlAsync(
      successCallback: (value?: Object | PromiseLike<Object>) => void): void {
    var urlParameters = {
      current_url: this.windowRef.nativeWindow.location.pathname
    };
    this.http.get('/url_handler', {params: urlParameters}).toPromise().then(
      (response: any) => {
        successCallback(response.login_url);
      }
    );
  }

  private _getUserCommunityRightsData(
      successCallback: (value?: Object | PromiseLike<Object>) => void): void {
    if (this.userCommunityRightsInfo) {
      successCallback(this.userCommunityRightsInfo);
    } else {
      this.http.get(this.USER_COMMUNITY_RIGHTS_DATA_URL).toPromise().then(
        (response: any) => {
          this.userCommunityRightsInfo = response.data;
          successCallback(this.userCommunityRightsInfo);
        }
      );
    }
  }

  getUserInfoAsync(): Promise<Object> {
    return new Promise((resolve) => {
      this._getUserInfoAsync(resolve);
    });
  }

  getProfileImageDataUrlAsync(): Promise<Object> {
    return new Promise((resolve) => {
      this.getUserInfoAsync().then((userInfo: UserInfo) => {
        this._getProfileImageDataUrlAsync(userInfo, resolve);
      });
    });
  }

  setProfileImageDataUrlAsync(newProfileImageDataUrl: string): Promise<Object> {
    return new Promise((resolve) => {
      this._setProfileImageDataUrlAsync(newProfileImageDataUrl, resolve);
    });
  }

  getLoginUrlAsync(): Promise<Object> {
    return new Promise((resolve) => {
      this._getLoginUrlAsync(resolve);
    });
  }

  getUserCommunityRightsData(): Promise<Object> {
    return new Promise((resolve) => {
      this._getUserCommunityRightsData(resolve);
    });
  }
}


