import {LoanHistory} from "../models/loan.model";
import {IServiceResponse} from "../interfaces/loanHistory.Interface";


export abstract class LoanHistoryService {

    public static async getAllLoanHistoryByCopy(copyId: string): Promise<IServiceResponse> {
        const loanHistory = await LoanHistory.find({copyId}).sort({dateTimeCreated: -1});

        return {
            status: 200,
            response: {
                ok: true,
                loanHistory
            }
        }
    }
}
