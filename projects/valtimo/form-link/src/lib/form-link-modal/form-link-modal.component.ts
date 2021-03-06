/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {FormManagementService} from '@valtimo/form-management';
import {
  BpmnElement,
  compareFormDefinitions,
  CreateFormAssociationRequest,
  FormAssociation,
  FormDefinition,
  ModifyFormAssociationRequest
} from '@valtimo/contract';
import {FormLinkService} from '../form-link.service';
import {AlertService, ModalComponent} from '@valtimo/components';
import {NGXLogger} from 'ngx-logger';

declare var $;

@Component({
  selector: 'valtimo-form-link-modal',
  templateUrl: './form-link-modal.component.html',
  styleUrls: ['./form-link-modal.component.scss']
})
export class FormLinkModalComponent implements OnInit {

  public modalOptions: NgbModalOptions;
  public formDefinitions: FormDefinition[] = [];
  public selectedElement: BpmnElement | null = null;
  public associationType: string | null = null;
  public selectedFormDefinition: FormDefinition | null = null;
  public enteredCustomUrl: string | null = null;
  public enteredAngularState: string | null = null;
  public isPublic: boolean;
  public previousFormLink: FormAssociation | null = null;
  private processDefinitionKey: string | null = null;
  private isListenersAdded = false;
  private isFormDefinitionSelected = false;
  private isAngularStateSelected = false;
  private isCustomUrlSelected = false;
  @ViewChild('formLinkModal') modal: ModalComponent;

  private static convertElementType(elementType: string): string | null {
    switch (elementType) {
      case 'bpmn:StartEvent':
        return 'start-event';
      case 'bpmn:UserTask':
        return 'user-task';
      default:
        return null;
    }
  }

  constructor(
    private modalService: NgbModal,
    private formLinkService: FormLinkService,
    private formManagementService: FormManagementService,
    private alertService: AlertService,
    private logger: NGXLogger,
    private ngZone: NgZone
  ) {
    this.modalOptions = {};
  }

  ngOnInit() {
    this.formManagementService.getFormDefinitions().subscribe((formDefinitions: any) => {
      this.formDefinitions = formDefinitions['content'];
    });
  }

  compareFormDefinitions(fd1: FormDefinition, fd2: FormDefinition) {
    return compareFormDefinitions(fd1, fd2);
  }

  public get selectedAssociationType() {
    if (this.isFormDefinitionSelected) {
      return 'form-definition';
    } else if (this.isAngularStateSelected) {
      return 'angular-state';
    } else if (this.isCustomUrlSelected) {
      return 'custom-url';
    } else {
      return null;
    }
  }

  private addCollapseListeners(collapseFormDefinition, collapseAngularState, collapseCustomUrl) {
    collapseFormDefinition.on('show.bs.collapse', () => {
      this.ngZone.run(() => {
        this.isFormDefinitionSelected = true;
      });
    });
    collapseFormDefinition.on('hide.bs.collapse', () => {
      this.ngZone.run(() => {
        this.isFormDefinitionSelected = false;
      });
    });
    collapseAngularState.on('show.bs.collapse', () => {
      this.ngZone.run(() => {
        this.isAngularStateSelected = true;
      });
    });
    collapseAngularState.on('hide.bs.collapse', () => {
      this.ngZone.run(() => {
        this.isAngularStateSelected = false;
      });
    });
    collapseCustomUrl.on('show.bs.collapse', () => {
      this.ngZone.run(() => {
        this.isCustomUrlSelected = true;
      });
    });
    collapseCustomUrl.on('hide.bs.collapse', () => {
      this.ngZone.run(() => {
        this.isCustomUrlSelected = false;
      });
    });
  }

  openModal(element: BpmnElement, processDefinitionKey: string) {
    this.selectedElement = element;
    this.processDefinitionKey = processDefinitionKey;
    this.selectedFormDefinition = null;
    this.enteredAngularState = null;
    this.enteredCustomUrl = null;
    this.isPublic = false;
    this.associationType = null;
    this.formLinkService.getFormLinkByAssociation(this.processDefinitionKey, element.id).subscribe((formLink: FormAssociation) => {
      this.previousFormLink = formLink;
      const collapseFormDefinition = $('#collapseFormDefinition');
      const collapseCustomUrl = $('#collapseCustomUrl');
      const collapseAngularState = $('#collapseAngularState');
      if (!this.isListenersAdded) {
        this.addCollapseListeners(collapseFormDefinition, collapseAngularState, collapseCustomUrl);
        this.isListenersAdded = true;
      }
      if (formLink !== null) {
        const className = formLink.formLink.className.split('.');
        const linkType = className[className.length - 1];
        this.isPublic = formLink.formLink.isPublic;
        switch (linkType) {
          case 'BpmnElementFormIdLink':
            const foundFormDefinition = this.formDefinitions.find(formDefinition => formDefinition.id === formLink.formLink.formId);
            if (foundFormDefinition !== undefined) {
              this.selectedFormDefinition = foundFormDefinition;
            }
            collapseFormDefinition.collapse('show');
            break;
          case 'BpmnElementUrlLink':
            this.enteredCustomUrl = formLink.formLink.url;
            collapseCustomUrl.collapse('show');
            break;
          case 'BpmnElementAngularStateUrlLink':
            this.enteredAngularState = formLink.formLink.url;
            collapseAngularState.collapse('show');
            break;
          default:
            this.logger.fatal('Unsupported class name');
        }
      } else {
        collapseFormDefinition.collapse('hide');
        collapseCustomUrl.collapse('hide');
        collapseAngularState.collapse('hide');
      }
      this.modal.show();
    });
  }

  submit(associationType: string) {
    const currentAssociation = {
      selected: undefined,
      different: undefined
    };
    switch (associationType) {
      case 'form-definition':
        currentAssociation.selected = this.selectedFormDefinition;
        currentAssociation.different = () => this.previousFormLink.formLink.formId !== this.selectedFormDefinition.id
          || this.previousFormLink.formLink.isPublic !== this.isPublic;
        break;
      case 'custom-url':
        currentAssociation.selected = this.enteredCustomUrl;
        currentAssociation.different = () => this.previousFormLink.formLink.url !== this.enteredCustomUrl
          || this.previousFormLink.formLink.isPublic !== this.isPublic;
        break;
      case 'angular-state':
        currentAssociation.selected = this.enteredAngularState;
        currentAssociation.different = () => this.previousFormLink.formLink.url !== this.enteredAngularState
          || this.previousFormLink.formLink.isPublic !== this.isPublic;
        break;
    }
    if (this.previousFormLink === null) {
      if (currentAssociation.selected) {
        this.createFormAssociation(associationType);
      }
    } else if (currentAssociation.selected && currentAssociation.different()) {
      this.modifyFormAssociation(associationType);
    }
  }

  private modifyFormAssociation(associationType: string) {
    const modifyFormAssociationRequest: ModifyFormAssociationRequest = {
      formAssociationId: this.previousFormLink.id,
      processDefinitionKey: this.processDefinitionKey,
      formLinkRequest: {
        type: FormLinkModalComponent.convertElementType(this.selectedElement.type),
        id: this.selectedElement.id,
        isPublic: this.isPublic
      }
    };
    switch (associationType) {
      case 'form-definition':
        modifyFormAssociationRequest.formLinkRequest.formId = this.selectedFormDefinition.id;
        break;
      case 'custom-url':
        modifyFormAssociationRequest.formLinkRequest.customUrl = this.enteredCustomUrl;
        break;
      case 'angular-state':
        modifyFormAssociationRequest.formLinkRequest.angularStateUrl = this.enteredAngularState;
        break;
      default:
        this.logger.fatal('Unknown association type');
    }

    this.formLinkService.modifyFormAssociation(modifyFormAssociationRequest).subscribe(() => {
      this.alertService.success('Form relinked');
    }, err => {
      this.alertService.error('Failed to relink form');
    });
  }

  private createFormAssociation(associationType: string) {
    const createFormAssociationRequest: CreateFormAssociationRequest = {
      processDefinitionKey: this.processDefinitionKey,
      formLinkRequest: {
        type: FormLinkModalComponent.convertElementType(this.selectedElement.type),
        id: this.selectedElement.id,
        isPublic: this.isPublic
      }
    };
    switch (associationType) {
      case 'form-definition':
        createFormAssociationRequest.formLinkRequest.formId = this.selectedFormDefinition.id;
        break;
      case 'custom-url':
        createFormAssociationRequest.formLinkRequest.customUrl = this.enteredCustomUrl;
        break;
      case 'angular-state':
        createFormAssociationRequest.formLinkRequest.angularStateUrl = this.enteredAngularState;
        break;
      default:
        this.logger.fatal('Unknown association type');
    }
    this.formLinkService.createFormAssociation(createFormAssociationRequest).subscribe(() => {
      this.alertService.success('Form linked');
    }, err => {
      this.alertService.error('Failed to link form');
    });
  }

  public deleteFormAssociation() {
    this.formLinkService.deleteFormAssociation(this.processDefinitionKey, this.previousFormLink.id).subscribe(() => {
      this.alertService.success('Form unlinked');
    }, err => {
      this.alertService.error('Failed to unlink form');
    });
  }
}
