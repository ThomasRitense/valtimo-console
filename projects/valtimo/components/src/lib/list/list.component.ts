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

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ViewContentService} from '../view-content/view-content.service';
import {NGXLogger} from 'ngx-logger';
import {fromEvent} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'valtimo-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnChanges, OnInit, AfterViewInit {

  private static PAGINATION_SIZE = 'PaginationSize';

  @Input() items: Array<any>;
  @Input() fields: Array<any>;
  @Input() pagination?: any;
  @Input() viewMode?: boolean;
  @Input() isSearchable?: boolean;
  @Input() header?: boolean;
  @Input() actions: any[] = [];
  @Input() paginationIdentifier?: string;
  @Output() rowClicked: EventEmitter<any> = new EventEmitter();
  @Output() paginationClicked: EventEmitter<any> = new EventEmitter();
  @Output() paginationSet: EventEmitter<any> = new EventEmitter();
  @Output() search: EventEmitter<any> = new EventEmitter();

  public headerProvided = false;
  public viewListAs: string;
  public searchModel: string;
  public regExpStringRemoveUnderscore = /_/g;
  @ViewChild('searchBox') searchBox: ElementRef;

  constructor(
    private viewContentService: ViewContentService,
    private logger: NGXLogger
  ) {
    this.viewListAs = localStorage.getItem('viewListAs') || 'table';
  }

  loadPaginationSize() {
    const entries = localStorage.getItem(`${this.paginationIdentifier}${ListComponent.PAGINATION_SIZE}`);
    if (entries !== null) {
      this.pagination.size = +entries;
      this.logger.debug('Pagination loaded from local storage for this list. Current: ', entries);
    } else {
      this.logger.debug('Pagination does NOT exist in local storage for this list. Will use default. Change it to create an entry.');
    }
    this.paginationSet.emit();
  }

  setPaginationSize(numberOfEntries: string) {
    localStorage.setItem(`${this.paginationIdentifier}${ListComponent.PAGINATION_SIZE}`, numberOfEntries);
    this.pagination.size = numberOfEntries;
    this.logger.debug('Pagination set in local storage for this list: ', numberOfEntries);
    this.paginationSet.emit();
  }

  ngOnInit() {
    if (this.pagination) {
      this.loadPaginationSize();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.items && changes.items.currentValue) {
      this.transformListItemsMatchFields();
    }
  }

  ngAfterViewInit() {
    if (this.isSearchable) {
      fromEvent(this.searchBox.nativeElement, 'keyup')
        .pipe(debounceTime(500))
        .subscribe(() => {
          const value = this.searchBox.nativeElement.value;
          if (this.search.observers.length > 0) {
            // custom search callbak is specified, perhaps to query on the server side
            this.search.emit(value);
          } else {
            this.searchModel = value;
          }
        });
    }
  }

  public transformListItemsMatchFields() {
    if (this.items && this.fields) {
      this.items.forEach(item => {
        item.listItemFields = this.fields.map(field => ({
          key: field.key,
          label: field.label,
          value: this.resolveObject(field, item)
        }));
      });
    }
  }

  public onClickRow(item) {
    this.rowClicked.emit(item);
  }

  public resolveObject(definition: any, obj: any) {
    const resolvedObjValue = definition.key.split('.').reduce(function (prev, curr) {
      return prev ? prev[curr] : null;
    }, obj || self);
    return this.viewContentService.get(resolvedObjValue, definition);
  }

  public switchView(type) {
    localStorage.setItem('viewListAs', type);
    this.viewListAs = type;
  }

  public getTotalPageCount() {
    return Math.ceil(this.pagination.collectionSize / this.pagination.size);
  }

  public onClickPagination(page) {
    this.paginationClicked.emit(page);
  }

}
