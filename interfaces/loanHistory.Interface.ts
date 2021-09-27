
export interface IServiceResponse {
    status: number;
    response : {
        ok: boolean;
        mensaje?: string;
        loanHistory: {} [];
    }
}


