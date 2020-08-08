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
 * @fileoverview Controller for the main story editor.
 */

require(
  'components/common-layout-directives/common-elements/' +
  'confirm-or-cancel-modal.controller.ts');
require(
  'components/forms/custom-forms-directives/thumbnail-uploader.directive.ts');
require(
  'components/forms/schema-based-editors/schema-based-editor.directive.ts');
require('pages/story-editor-page/editor-tab/story-node-editor.directive.ts');
require(
  'pages/story-editor-page/modal-templates/' +
  'new-chapter-title-modal.controller.ts');

require('domain/editor/undo_redo/undo-redo.service.ts');
require('domain/story/story-update.service.ts');
require('pages/story-editor-page/services/story-editor-state.service.ts');
require('services/alerts.service.ts');
require('services/contextual/window-dimensions.service.ts');

require('pages/story-editor-page/story-editor-page.constants.ajs.ts');
require('pages/topic-editor-page/modal-templates/' +
    'preview-thumbnail.component.ts');

import { Subscription } from 'rxjs';

// TODO(#9186): Change variable name to 'constants' once this file
// is migrated to Angular.
const storyConstants = require('constants.ts');

angular.module('oppia').directive('storyEditor', [
  'UrlInterpolationService', function(UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/pages/story-editor-page/editor-tab/story-editor.directive.html'),
      controller: [
        '$scope', '$window', 'StoryEditorStateService', 'StoryUpdateService',
        'UndoRedoService', 'StoryEditorNavigationService',
        'WindowDimensionsService', '$uibModal',
        'AlertsService', 'MAX_CHARS_IN_STORY_TITLE',
        'MAX_CHARS_IN_CHAPTER_TITLE',
        function(
            $scope, $window, StoryEditorStateService, StoryUpdateService,
            UndoRedoService, StoryEditorNavigationService,
            WindowDimensionsService, $uibModal,
            AlertsService, MAX_CHARS_IN_STORY_TITLE,
            MAX_CHARS_IN_CHAPTER_TITLE) {
          var ctrl = this;
          ctrl.directiveSubscriptions = new Subscription();
          $scope.MAX_CHARS_IN_STORY_TITLE = MAX_CHARS_IN_STORY_TITLE;
          var TOPIC_EDITOR_URL_TEMPLATE = '/topic_editor/<topic_id>';
          var _init = function() {
            $scope.story = StoryEditorStateService.getStory();
            $scope.storyContents = $scope.story.getStoryContents();
            if ($scope.storyContents) {
              $scope.setNodeToEdit($scope.storyContents.getInitialNodeId());
            }
            _initEditor();
          };

          var _initEditor = function() {
            $scope.story = StoryEditorStateService.getStory();
            $scope.storyContents = $scope.story.getStoryContents();
            $scope.disconnectedNodes = [];
            $scope.linearNodesList = [];
            $scope.nodes = [];
            $scope.allowedBgColors = (
              storyConstants.ALLOWED_THUMBNAIL_BG_COLORS.story);
            if ($scope.storyContents &&
                $scope.storyContents.getNodes().length > 0) {
              $scope.nodes = $scope.storyContents.getNodes();
              $scope.initialNodeId = $scope.storyContents.getInitialNodeId();
              $scope.linearNodesList =
                $scope.storyContents.getLinearNodesList();
            }
            $scope.notesEditorIsShown = false;
            $scope.storyTitleEditorIsShown = false;
            $scope.editableTitle = $scope.story.getTitle();
            $scope.editableNotes = $scope.story.getNotes();
            $scope.editableDescription = $scope.story.getDescription();
            $scope.editableDescriptionIsEmpty = (
              $scope.editableDescription === '');
            $scope.storyDescriptionChanged = false;
          };

          $scope.setNodeToEdit = function(nodeId) {
            $scope.idOfNodeToEdit = nodeId;
          };

          $scope.openNotesEditor = function() {
            $scope.notesEditorIsShown = true;
          };

          $scope.closeNotesEditor = function() {
            $scope.notesEditorIsShown = false;
          };

          $scope.isInitialNode = function(nodeId) {
            return (
              $scope.story.getStoryContents().getInitialNodeId() === nodeId);
          };

          $scope.onMoveChapterStart = function(index, node) {
            $scope.dragStartIndex = index;
            $scope.nodeBeingDragged = node;
          };

          $scope.rearrangeNodeInStory = function(toIndex) {
            StoryUpdateService.rearrangeNodeInStory(
              $scope.story, $scope.dragStartIndex, toIndex);
            _initEditor();
          };

          $scope.deleteNode = function(nodeId) {
            if ($scope.isInitialNode(nodeId)) {
              AlertsService.addInfoMessage(
                'Cannot delete the first chapter of a story.', 3000);
              return;
            }
            $uibModal.open({
              templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
                '/pages/story-editor-page/modal-templates/' +
                'delete-chapter-modal.template.html'),
              backdrop: true,
              controller: 'ConfirmOrCancelModalController'
            }).result.then(function() {
              StoryUpdateService.deleteStoryNode($scope.story, nodeId);
              _initEditor();
              StoryEditorStateService.onRecalculateAvailableNodes.emit();
            }, function() {
              // Note to developers:
              // This callback is triggered when the Cancel button is clicked.
              // No further action is needed.
            });
          };

          $scope.createNode = function() {
            var nodeTitles = $scope.linearNodesList.map(function(node) {
              return node.getTitle();
            });
            $uibModal.open({
              templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
                '/pages/story-editor-page/modal-templates/' +
                'new-chapter-title-modal.template.html'),
              backdrop: true,
              resolve: {
                nodeTitles: () => nodeTitles
              },
              windowClass: 'create-new-chapter',
              controller: 'CreateNewChapterModalController'
            }).result.then(function() {
              _initEditor();
              // If the first node is added, open it just after creation.
              if ($scope.story.getStoryContents().getNodes().length === 1) {
                $scope.setNodeToEdit(
                  $scope.story.getStoryContents().getInitialNodeId());
              }
              StoryEditorStateService.onRecalculateAvailableNodes.emit();
            }, function() {
              // Note to developers:
              // This callback is triggered when the Cancel button is clicked.
              // No further action is needed.
            });
          };

          $scope.updateNotes = function(newNotes) {
            if (newNotes === $scope.story.getNotes()) {
              return;
            }
            StoryUpdateService.setStoryNotes($scope.story, newNotes);
            _initEditor();
          };

          $scope.navigateToChapterWithId = function(id, index) {
            StoryEditorNavigationService.navigateToChapterEditorWithId(
              id, index);
          };

          $scope.updateStoryDescriptionStatus = function(description) {
            $scope.editableDescriptionIsEmpty = (description === '');
            $scope.storyDescriptionChanged = true;
          };

          $scope.returnToTopicEditorPage = function() {
            if (UndoRedoService.getChangeCount() > 0) {
              $uibModal.open({
                templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
                  '/pages/story-editor-page/modal-templates/' +
                    'story-save-pending-changes-modal.template.html'),
                backdrop: true,
                controller: 'ConfirmOrCancelModalController'
              }).result.then(function() {}, function() {
                // Note to developers:
                // This callback is triggered when the Cancel button is clicked.
                // No further action is needed.
              });
            } else {
              const topicId = (
                StoryEditorStateService.getStory().getCorrespondingTopicId());
              $window.open(
                UrlInterpolationService.interpolateUrl(
                  TOPIC_EDITOR_URL_TEMPLATE, {
                    topic_id: topicId
                  }
                ), '_self');
            }
          };

          $scope.getTopicName = function() {
            return StoryEditorStateService.getTopicName();
          };

          $scope.updateStoryTitle = function(newTitle) {
            if (newTitle === $scope.story.getTitle()) {
              return;
            }
            StoryUpdateService.setStoryTitle($scope.story, newTitle);
          };

          $scope.updateStoryThumbnailFilename = function(
              newThumbnailFilename) {
            if (newThumbnailFilename === $scope.story.getThumbnailFilename()) {
              return;
            }
            StoryUpdateService.setThumbnailFilename(
              $scope.story, newThumbnailFilename);
          };

          $scope.updateStoryThumbnailBgColor = function(
              newThumbnailBgColor) {
            if (newThumbnailBgColor === $scope.story.getThumbnailBgColor()) {
              return;
            }
            StoryUpdateService.setThumbnailBgColor(
              $scope.story, newThumbnailBgColor);
          };

          $scope.updateStoryDescription = function(newDescription) {
            if (newDescription !== $scope.story.getDescription()) {
              StoryUpdateService.setStoryDescription(
                $scope.story, newDescription);
            }
          };

          $scope.togglePreview = function() {
            $scope.storyPreviewCardIsShown = !($scope.storyPreviewCardIsShown);
          };

          $scope.toggleChapterEditOptions = function(chapterIndex) {
            $scope.selectedChapterIndex = (
              $scope.selectedChapterIndex === chapterIndex) ? -1 : chapterIndex;
          };

          $scope.toggleChapterLists = function() {
            if (!WindowDimensionsService.isWindowNarrow()) {
              return;
            }
            $scope.chaptersListIsShown = !$scope.chaptersListIsShown;
          };

          $scope.toggleStoryEditorCard = function() {
            if (!WindowDimensionsService.isWindowNarrow()) {
              return;
            }
            $scope.mainStoryCardIsShown = !$scope.mainStoryCardIsShown;
          };

          ctrl.$onInit = function() {
            $scope.storyPreviewCardIsShown = false;
            $scope.mainStoryCardIsShown = true;
            $scope.chaptersListIsShown = (
              !WindowDimensionsService.isWindowNarrow());
            $scope.NOTES_SCHEMA = {
              type: 'html',
              ui_config: {
                startupFocusEnabled: false
              }
            };
            ctrl.directiveSubscriptions.add(
              StoryEditorStateService.onViewStoryNodeEditor.subscribe(
                (nodeId) => $scope.setNodeToEdit(nodeId)
              )
            );

            ctrl.directiveSubscriptions.add(
              StoryEditorStateService.onStoryInitialized.subscribe(
                () => _init()
              ));
            ctrl.directiveSubscriptions.add(
              StoryEditorStateService.onStoryReinitialized.subscribe(
                () => _initEditor()
              ));

            _init();
            _initEditor();
          };

          ctrl.$onDestroy = function() {
            ctrl.directiveSubscriptions.unsubscribe();
          };
        }
      ]
    };
  }]);
