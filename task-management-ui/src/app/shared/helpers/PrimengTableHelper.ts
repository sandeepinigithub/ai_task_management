import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';

export class PrimengTableHelper {
    predefinedRecordsCountPerPage = [5, 10, 25, 50, 100, 250, 500];

    defaultRecordsCountPerPage = 10;

    resizableColumns: boolean = false;

    totalRecordsCount = 0;

    records: any[] = [];

    isLoading = false;

    showLoadingIndicator(): void {
        this.isLoading = true;
    }

    hideLoadingIndicator(): void {
        this.isLoading = false;
    }

    getSorting(table: Table): string {
        let sorting = '';

        if (table.sortMode === 'multiple') {
            if (table.multiSortMeta) {
                for (let i = 0; i < table.multiSortMeta.length; i++) {
                    const element = table.multiSortMeta[i];
                    if (i > 0) {
                        sorting += ',';
                    }
                    sorting += element.field;
                    if (element.order === 1) {
                        sorting += ' ASC';
                    } else if (element.order === -1) {
                        sorting += ' DESC';
                    }
                }
            }
        } else {
            if (table.sortField) {
                sorting = table.sortField;
                if (table.sortOrder === 1) {
                    sorting += ' ASC';
                } else if (table.sortOrder === -1) {
                    sorting += ' DESC';
                }
            }
        }

        return sorting;
    }

    getMaxResultCount(paginator: Paginator, event: LazyLoadEvent): number | any {
        if (paginator.rows) {
            return paginator.rows;
        }

        if (!event) {
            return 0;
        }

        return event.rows;
    }

    getSkipCount(paginator: Paginator, event: LazyLoadEvent): number | any {
        if (paginator.first) {
            return paginator.first;
        }

        if (!event) {
            return 0;
        }

        return event.first;
    }

    shouldResetPaging(event: LazyLoadEvent): boolean {
        if (!event /*|| event.sortField*/) {
            // if you want to reset after sorting, comment out parameter
            return true;
        }

        return false;
    }

    adjustScroll(table: Table) {
        const body: HTMLElement = table.el.nativeElement.querySelector('.p-datatable-scrollable-body');
        const header: HTMLElement = table.el.nativeElement.querySelector('.p-datatable-scrollable-header');
        body.addEventListener('scroll', () => {
            header.scrollLeft = body.scrollLeft;
        });
    }
}
