import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";

export class Pagination {
    private totalRecords: number;
    private pageNumber: number;
    private pageSize: number;

    constructor(totalRecords: number, pageNumber: number = 1, pageSize: number = DEFAULT_PAGE_SIZE) {
    this.totalRecords = totalRecords;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    }

    public async getPagination() {

        const totalPages = await Math.ceil(this.totalRecords / this.pageSize);
        if (this.pageNumber > totalPages) {
            this.pageNumber = (totalPages > 0) ? totalPages : 1;
        }

        const previousPage = (this.pageNumber - 1 > 0) ? this.pageNumber - 1 : null;
        const nextPage = (this.pageNumber + 1 <= totalPages) ? this.pageNumber + 1 : null;
        const pages = [];

        if (totalPages > 0){
            for (let i=0; i<totalPages; i++){
                pages.push(i+1);
            }
        } else {
            pages.push(1);
        }


        // Calcular registro mostrados
        const fromRecord = ((this.pageNumber - 1) * this.pageSize) + 1;
        const toRecord = (this.pageNumber * this.pageSize <= this.totalRecords) ? this.pageNumber * this.pageSize : this.totalRecords ;
        const ofTotal = this.totalRecords;


        return {
            previousPage: previousPage,
            currentPage: this.pageNumber,
            nextPage:nextPage,
            totalPages: (totalPages>0)? totalPages : 1,
            pageSize: this.pageSize,
            pages: pages,
            showing: {
                from: (this.totalRecords > 0) ?fromRecord: 0,
                to: toRecord,
                of: ofTotal
            }

        };


    }

}
