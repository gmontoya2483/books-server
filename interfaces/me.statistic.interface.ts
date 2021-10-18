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

export interface IShowStatisticsOptions {
    showBooksStatistics: boolean;
    showCommunityStatistics: boolean;
    showFollowStatistics: boolean;
    showMyCopiesStatistics: boolean;
    showMyFriendsCopiesStatistics: boolean;
}
