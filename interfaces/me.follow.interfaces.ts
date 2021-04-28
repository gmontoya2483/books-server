export interface IServiceResponse {
    status: number;
    response : {
        ok: boolean;
        mensaje?: string;
        follower?:{};
        followers?: {
            pagination: {};
            followers: {}[];
        };
        follow?:{};
        followings?: {
            pagination: {};
            followings: {}[];
        };
        following?:{};
    }
}
