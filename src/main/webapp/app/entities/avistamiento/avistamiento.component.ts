import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JhiEventManager, JhiParseLinks, JhiAlertService, JhiDataUtils } from 'ng-jhipster';

import { IAvistamiento } from 'app/shared/model/avistamiento.model';
import { AccountService, IUser } from 'app/core';

import { ITEMS_PER_PAGE } from 'app/shared';
import { AvistamientoService } from './avistamiento.service';

@Component({
  selector: 'jhi-avistamiento',
  styles: ['agm-map { height: 300px; /* height is required */ }'],
  templateUrl: './avistamiento.component.html'
})
export class AvistamientoComponent implements OnInit, OnDestroy {
  currentAccount: IUser;
  canEdit: boolean;
  avistamientos: IAvistamiento[];
  allAvs: IAvistamiento[];
  error: any;
  success: any;
  eventSubscriber: Subscription;
  routeData: any;
  links: any;
  totalItems: any;
  itemsPerPage: any;
  page: any;
  predicate: any;
  previousPage: any;
  reverse: any;
  latitude: Number;
  longitude: Number;
  mapType = 'satellite';

  constructor(
    protected avistamientoService: AvistamientoService,
    protected parseLinks: JhiParseLinks,
    protected jhiAlertService: JhiAlertService,
    protected accountService: AccountService,
    protected activatedRoute: ActivatedRoute,
    protected dataUtils: JhiDataUtils,
    protected router: Router,
    protected eventManager: JhiEventManager
  ) {
    this.itemsPerPage = ITEMS_PER_PAGE;
    this.routeData = this.activatedRoute.data.subscribe(data => {
      this.page = data.pagingParams.page;
      this.previousPage = data.pagingParams.page;
      this.reverse = data.pagingParams.ascending;
      this.predicate = data.pagingParams.predicate;
    });
  }

  loadAll() {
    this.avistamientoService
      .query({
        page: this.page - 1,
        size: this.itemsPerPage,
        sort: this.sort()
      })
      .subscribe(
        (res: HttpResponse<IAvistamiento[]>) => this.paginateAvistamientos(res.body, res.headers),
        (res: HttpErrorResponse) => this.onError(res.message)
      );
    this.avistamientoService.query().subscribe((res: HttpResponse<IAvistamiento[]>) => (this.allAvs = res.body));
  }

  loadPage(page: number) {
    if (page !== this.previousPage) {
      this.previousPage = page;
      this.transition();
    }
  }

  transition() {
    this.router.navigate(['/avistamiento'], {
      queryParams: {
        page: this.page,
        size: this.itemsPerPage,
        sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
      }
    });
    this.loadAll();
  }

  clear() {
    this.page = 0;
    this.router.navigate([
      '/avistamiento',
      {
        page: this.page,
        sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
      }
    ]);
    this.loadAll();
  }

  ngOnInit() {
    this.canEdit = false;
    this.loadAll();
    this.accountService.identity().then(account => {
      this.currentAccount = account;
      this.canEditorDelete();
    });
    this.registerChangeInAvistamientos();
    this.latitude = 43.25164798997068;
    this.longitude = -5.78615017059326;
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  trackId(index: number, item: IAvistamiento) {
    return item.id;
  }

  byteSize(field) {
    return this.dataUtils.byteSize(field);
  }

  openFile(contentType, field) {
    return this.dataUtils.openFile(contentType, field);
  }

  registerChangeInAvistamientos() {
    this.eventSubscriber = this.eventManager.subscribe('avistamientoListModification', response => this.loadAll());
  }

  sort() {
    const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  canEditorDelete() {
    if (this.currentAccount.authorities.includes('ROLE_ADMIN')) {
      this.canEdit = true;
    } else {
      this.canEdit == false;
    }
  }

  protected paginateAvistamientos(data: IAvistamiento[], headers: HttpHeaders) {
    this.links = this.parseLinks.parse(headers.get('link'));
    this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
    this.avistamientos = data;
  }

  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }
}
