import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TagForm } from "../_components/tag-form";

export default function NewTagPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Tag</h1>
        <p className="text-muted-foreground">
          Add a new product tag to organize your products
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tag Details</CardTitle>
          <CardDescription>Enter the details for the new tag</CardDescription>
        </CardHeader>
        <CardContent>
          <TagForm />
        </CardContent>
      </Card>
    </div>
  );
}
