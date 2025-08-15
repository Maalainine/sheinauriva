import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconStarFilled, IconStar } from "@tabler/icons-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
}

interface ProductReviewsProps {
  reviews?: Review[];
  onAddReview?: () => void;
}

export function ProductReviews({ reviews = [], onAddReview }: ProductReviewsProps) {
  if (!reviews.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">No reviews yet.</p>
          <Button variant="outline" onClick={onAddReview}>
            Write a Review
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium">Customer Reviews</h3>
          <Button variant="outline" size="sm" onClick={onAddReview}>
            Write a Review
          </Button>
        </div>

        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    i < review.rating ? (
                      <IconStarFilled key={i} className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <IconStar key={i} className="h-4 w-4 text-muted-foreground/30" />
                    )
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  by {review.author} • {new Date(review.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-foreground">{review.comment}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
