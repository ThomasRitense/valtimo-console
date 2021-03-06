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

import {Component, OnInit, ViewChild} from '@angular/core';
import {DocumentService} from '@valtimo/document';
import {DocumentDefinition, ProcessDocumentDefinition} from '@valtimo/contract';
import {ActivatedRoute} from '@angular/router';
import {DossierManagementConnectModalComponent} from '../dossier-management-connect-modal/dossier-management-connect-modal.component';
import {AlertService} from '@valtimo/components';

@Component({
  selector: 'valtimo-dossier-management-detail',
  templateUrl: './dossier-management-detail.component.html',
  styleUrls: ['./dossier-management-detail.component.scss']
})
export class DossierManagementDetailComponent implements OnInit {

  private documentDefinitionName: string | null = null;
  public documentDefinition: DocumentDefinition | null = null;
  public processDocumentDefinitions: ProcessDocumentDefinition[] = [];

  @ViewChild('dossierConnectModal') dossierConnectModal: DossierManagementConnectModalComponent;

  constructor(
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private alertService: AlertService
  ) {
    this.documentDefinitionName = this.route.snapshot.paramMap.get('name');
  }

  ngOnInit() {
    this.loadDocumentDefinition();
    this.loadProcessDocumentDefinitions();
  }

  loadProcessDocumentDefinitions() {
    this.documentService.findProcessDocumentDefinitions(this.documentDefinitionName).subscribe(
      (processDocumentDefinitions: ProcessDocumentDefinition[]) => {
        this.processDocumentDefinitions = processDocumentDefinitions;
      });
  }

  loadDocumentDefinition() {
    this.documentService.getDocumentDefinition(this.documentDefinitionName).subscribe((documentDefinition: DocumentDefinition) => {
      this.documentDefinition = documentDefinition;
    });
  }

  openDossierConnectModal() {
    this.dossierConnectModal.openModal(this.documentDefinition);
  }

  deleteProcessDocumentDefinition(processDocumentDefinition: ProcessDocumentDefinition) {
    this.documentService.deleteProcessDocumentDefinition(
      {
        documentDefinitionName: processDocumentDefinition.id.documentDefinitionId.name,
        processDefinitionKey: processDocumentDefinition.id.processDefinitionKey,
        canInitializeDocument: processDocumentDefinition.canInitializeDocument
      }
    ).subscribe(() => {
      this.alertService.success('Successfully deleted process document definition');
      this.loadProcessDocumentDefinitions();
    }, () => {
      this.alertService.error('Failed to delete process document definition');
    });
  }
}
