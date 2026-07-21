import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';

export interface Post {
    id: string;
    community: string;
    tags: string[];
    title: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        username: string;
        avatar?: string;
    };
}

type PostCardProps = {
    post: Post;
};
export function PostCard({ post }: PostCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent>
                <p>{post.content}</p>
            </CardContent>
        </Card>
    );
}
