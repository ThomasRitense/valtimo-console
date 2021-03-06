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

export interface FormAssociation {
  className: string;
  id: string;
  formLink: {
    id: string;
    formId: string;
    url: string;
    className: string;
    isPublic: boolean;
  };
}

export interface FormLinkRequest {
  id: string;
  type: string;
  isPublic: boolean;
  formId?: string;
  customUrl?: string;
  angularStateUrl?: string;
}

export interface CreateFormAssociationRequest {
  processDefinitionKey: string;
  formLinkRequest: FormLinkRequest;
}

export interface ModifyFormAssociationRequest {
  processDefinitionKey: string;
  formAssociationId: string;
  formLinkRequest: FormLinkRequest;
}

export interface FormSubmissionResult {
  errors: string[];
  documentId?: string;
}

export interface BpmnElement {
  id: string;
  type: string;
}
