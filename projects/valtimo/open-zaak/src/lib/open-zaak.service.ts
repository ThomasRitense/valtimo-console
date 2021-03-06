/*
 * Copyright 2020 Dimpact.
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

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '@valtimo/config';
import {Observable} from 'rxjs';
import {
  CreateOpenZaakConfigRequest,
  CreateOpenZaakConfigResult,
  CreateZaakTypeLinkRequest,
  ModifyOpenZaakConfigRequest,
  ModifyOpenZaakConfigResult,
  OpenZaakConfig, ServiceTaskHandlerRequest,
  ZaakType,
  ZaakTypeLink,
  ZaakTypeRequest
} from '@valtimo/contract';

@Injectable({
  providedIn: 'root'
})
export class OpenZaakService {

  private valtimoApiConfig: any;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.valtimoApiConfig = configService.config.valtimoApi;
  }

  getOpenZaakConfig(): Observable<OpenZaakConfig> {
    return this.http.get<OpenZaakConfig>(`${this.valtimoApiConfig.endpointUri}openzaak/config`);
  }

  createOpenZaakConfig(request: CreateOpenZaakConfigRequest): Observable<CreateOpenZaakConfigResult> {
    return this.http.post<CreateOpenZaakConfigResult>(`${this.valtimoApiConfig.endpointUri}openzaak/config`, request);
  }

  modifyOpenZaakConfig(request: ModifyOpenZaakConfigRequest): Observable<ModifyOpenZaakConfigResult> {
    return this.http.put<ModifyOpenZaakConfigResult>(`${this.valtimoApiConfig.endpointUri}openzaak/config`, request);
  }

  deleteOpenZaakConfig(): Observable<any> {
    return this.http.delete<any>(`${this.valtimoApiConfig.endpointUri}openzaak/config`);
  }

  getZaakTypes(): Observable<ZaakType[]> {
    return this.http.get<ZaakType[]>(`${this.valtimoApiConfig.endpointUri}openzaak/zaaktype`);
  }

  getZaakTypeLink(id: string): Observable<ZaakTypeLink> {
    return this.http.get<ZaakTypeLink>(`${this.valtimoApiConfig.endpointUri}openzaak/link/${id}`);
  }

  createZaakTypeLink(request: CreateZaakTypeLinkRequest): Observable<any> {
    return this.http.post<any>(`${this.valtimoApiConfig.endpointUri}openzaak/link`, request);
  }

  getZaakTypeLinkListByProcess(processDefinitionKey: string): Observable<any> {
    return this.http.get(`${this.valtimoApiConfig.endpointUri}openzaak/link/process/${processDefinitionKey}`);
  }

  getStatusTypes(zaakTypeRequest: ZaakTypeRequest): Observable<any> {
    return this.http.post(`${this.valtimoApiConfig.endpointUri}openzaak/status`, zaakTypeRequest);
  }

  getStatusResults(zaakTypeRequest): Observable<any> {
    return this.http.post(`${this.valtimoApiConfig.endpointUri}openzaak/resultaat`, zaakTypeRequest);
  }

  createServiceTaskHandler(id: string, request: ServiceTaskHandlerRequest): Observable<any> {
    return this.http.post<any>(`${this.valtimoApiConfig.endpointUri}openzaak/link/${id}/service-handler`, request);
  }

  modifyServiceTaskHandler(id: string, request: ServiceTaskHandlerRequest): Observable<any> {
    return this.http.put<any>(`${this.valtimoApiConfig.endpointUri}openzaak/link/${id}/service-handler`, request);
  }

  deleteServiceTaskHandler(id: string, serviceTaskId: string): Observable<any> {
    return this.http.delete<any>(`${this.valtimoApiConfig.endpointUri}openzaak/link/${id}/service-handler/${serviceTaskId}`);
  }
}
