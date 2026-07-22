// components/web/trending-card.tsx
import { Card, CardContent, CardHeader } from '../ui/card';
import { TrendingUp } from 'lucide-react';

const MOCK_TRENDING = ['#hackathon2026', '#opensource', '#golang', '#nextjs', '#ai'];

export function TrendingCard() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-semibold">Trending topics</h3>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {MOCK_TRENDING.map((topic) => (
                    <button
                        key={topic}
                        className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {topic}
                    </button>
                ))}
            </CardContent>
        </Card>
    );
}
