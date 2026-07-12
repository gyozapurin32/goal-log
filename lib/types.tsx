type Post = {
    id: string;
    post_type: "start" | "finish";
    photo_url: string;
    comment: string | null;
    created_at: string;
};



type Member = {
    id: string;
    display_name: string;
    goals: Goal[];
};


type Goal = {
    id: string;
    goal_text: string;
    status: string;
    goal_date: string;
    display_order: number;
    posts: Post[];
};


