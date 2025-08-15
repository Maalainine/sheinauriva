import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { VariantTypesTable } from "./_components/variant-types-table";

export default function VariantTypesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Variant Types</h1>
          <p className="text-muted-foreground">
            Manage your product variant types and options
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/variants/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Variant Type
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Variant Types</CardTitle>
          <CardDescription>View and manage all variant types and their options</CardDescription>
        </CardHeader>
        <CardContent>
          <VariantTypesTable />
        </CardContent>
      </Card>
    </div>
  );
}
