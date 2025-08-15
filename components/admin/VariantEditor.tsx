"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, PackageOpen, Plus, AlertCircle } from "lucide-react";
import type { VariantType } from "@prisma/client";

interface VariantOption {
  variantTypeId: string;
  optionId: string;
}

export interface VariantForm {
  id?: string;
  sku: string;
  price: string;
  stock: number;
  selectedOptions: VariantOption[];
}

interface VariantEditorProps {
  value: VariantForm[];
  variantTypes: Array<{
    id: string;
    name: string;
    options: Array<{ id: string; name: string }>;
  }>;
  productPrice: string;
  allowedOptions: { variantTypeId: string; optionId: string }[];
  onChange: (variants: VariantForm[]) => void;
  onAllowedOptionsChange: (allowedOptions: { variantTypeId: string; optionId: string }[]) => void;
}

// VariantCreator component for dropdown-based variant creation
function VariantCreator({
  variantTypes,
  onCreate,
  productPrice,
  existingVariants,
  baseName
}: {
  variantTypes: VariantEditorProps["variantTypes"];
  onCreate: (variant: VariantForm) => void;
  productPrice: string;
  existingVariants: VariantForm[];
  baseName?: string;
}) {
  const [rows, setRows] = React.useState<Array<{ typeId: string; optionId: string }>>([
    { typeId: "", optionId: "" }
  ]);
  const [error, setError] = React.useState<string>("");

  // Get available types for each row: only exclude types already selected in other rows
  const getAvailableTypes = (currentIdx: number) =>
    variantTypes.filter(vt => !rows.some((r, i) => i !== currentIdx && r.typeId === vt.id));

  // Handler to change type or value in a row
  const handleRowChange = (idx: number, field: "typeId" | "optionId", value: string) => {
    setRows(rows => rows.map((r, i) =>
      i === idx
        ? field === "typeId"
          ? { ...r, typeId: value, optionId: "" } // Reset optionId if type changes
          : { ...r, optionId: value }
        : r
    ));
  };

  // Handler to add another type/value row
  const handleAddRow = () => {
    setRows(rows => [...rows, { typeId: "", optionId: "" }]);
  };

  // Handler to remove a type/value row
  const handleRemoveRow = (idx: number) => {
    setRows(rows => rows.filter((_, i) => i !== idx));
  };

  // Handler to create variant
  const handleCreate = () => {
    setError("");
    // Validate all rows filled
    if (rows.some(r => !r.typeId || !r.optionId)) {
      setError("Please select all types and values.");
      return;
    }
    // Validate unique combination
    const selectedOptions = rows.map(r => ({ variantTypeId: r.typeId, optionId: r.optionId }));
    // SKU: baseName + value names
    function slugify(str: string) {
      return str
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 10);
    }
    const base = slugify(baseName || 'PROD');
    const values = selectedOptions
      .map(opt => {
        const vt = variantTypes.find(vt => vt.id === opt.variantTypeId);
        const vo = vt?.options.find(o => o.id === opt.optionId);
        return vo ? vo.name.toUpperCase() : null;
      })
      .filter(Boolean)
      .join('-');
    const sku = values ? `${base}-${values}` : base;
    if (existingVariants.some(v => v.sku === sku)) {
      setError("This variant combination already exists.");
      return;
    }
    onCreate({
      sku,
      price: productPrice,
      stock: 0,
      selectedOptions
    });
    setRows([{ typeId: "", optionId: "" }]);
  };

  return (
    <div className="p-0 w-full">
      <div className="space-y-3 w-full">
        {rows.map((row, idx) => (
          <div key={idx} className="flex gap-4 items-start w-full">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={row.typeId}
                onValueChange={(value: string) => handleRowChange(idx, "typeId", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {variantTypes
                    .filter(vt => !rows.some((r, i) => r.typeId === vt.id && i !== idx))
                    .map(vt => (
                      <SelectItem key={vt.id} value={vt.id}>
                        {vt.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <div className="flex-1 col-span-2">
                <Select
                  value={row.optionId}
                  onValueChange={(value: string) => handleRowChange(idx, "optionId", value)}
                  disabled={!row.typeId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    {row.typeId && 
                      (variantTypes.find(vt => vt.id === row.typeId)?.options ?? []).map(opt => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {rows.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-destructive hover:text-destructive/80"
                onClick={() => handleRemoveRow(idx)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove row</span>
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-4 mt-4 w-full">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          disabled={getAvailableTypes(rows.length).length === 0}
          className="text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Type
        </Button>
        
        <Button
          type="button"
          size="sm"
          onClick={handleCreate}
          disabled={rows.some(r => !r.typeId || !r.optionId)}
        >
          Create Variant
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive p-2 bg-destructive/10 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}
    </div>
  );
}

export const VariantEditor: React.FC<VariantEditorProps & { baseName?: string }> = ({ value, variantTypes, productPrice, allowedOptions, onChange, onAllowedOptionsChange, baseName }) => {
  // --- NEW STATE for selected variant types ---
  const [selectedTypeIds, setSelectedTypeIds] = React.useState<string[]>(() => {
    // Initialize with types that have at least one allowed option
    const initial = Array.from(new Set(allowedOptions.map(o => o.variantTypeId)));
    return initial.length > 0 ? initial : [];
  });

  // --- Handler for toggling variant types ---
  const handleTypeToggle = (variantTypeId: string, checked: boolean) => {
    let updatedTypes: string[];
    if (checked) {
      updatedTypes = [...selectedTypeIds, variantTypeId];
    } else {
      updatedTypes = selectedTypeIds.filter(id => id !== variantTypeId);
      // Remove allowedOptions for this type
      const updatedOptions = allowedOptions.filter(opt => opt.variantTypeId !== variantTypeId);
      onAllowedOptionsChange(updatedOptions);
      // Remove variant selectedOptions for this type
      const updatedVariants = value.map(v => ({
        ...v,
        selectedOptions: v.selectedOptions.filter(opt => opt.variantTypeId !== variantTypeId)
      }));
      onChange(updatedVariants);
    }
    setSelectedTypeIds(updatedTypes);
  };

  // Helper to slugify and shorten base name
  function slugify(str: string) {
    return str
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 10);
  }

  // SKU: baseName + variant values only, order as chosen
  const generateSku = (selectedOptions: VariantOption[]) => {
    const base = slugify(baseName || 'PROD');
    const values = selectedOptions
      .map(opt => {
        const vt = variantTypes.find(vt => vt.id === opt.variantTypeId);
        const vo = vt?.options.find(o => o.id === opt.optionId);
        return vo ? vo.name.toUpperCase() : null;
      })
      .filter(Boolean)
      .join('-');
    return values ? `${base}-${values}` : base;
  };


  // If you want to pass baseName as a prop, replace the window usage with: props.baseName || 'PROD'

  // Only enabled options for this product
  const enabledOptionsByType: Record<string, string[]> = {};
  allowedOptions.forEach(opt => {
    if (!enabledOptionsByType[opt.variantTypeId]) enabledOptionsByType[opt.variantTypeId] = [];
    enabledOptionsByType[opt.variantTypeId].push(opt.optionId);
  });

  // Add variant with default price and auto SKU
  const handleAdd = () => {
    // Pick the first enabled option for each enabled type
    const selectedOptions: VariantOption[] = Object.entries(enabledOptionsByType).map(([variantTypeId, optionIds]) => ({
      variantTypeId,
      optionId: optionIds[0] || ""
    }));
    const sku = generateSku(selectedOptions);
    onChange([
      ...value,
      {
        sku,
        price: productPrice,
        stock: 0,
        selectedOptions
      }
    ]);
  };

  // Update selectedOptions for a variant
  const handleOptionChange = (idx: number, variantTypeId: string, optionId: string) => {
    const updated = value.map((v, i) => {
      if (i !== idx) return v;
      // Only keep selectedOptions for enabled types
      const selectedOptions = v.selectedOptions.filter(opt => enabledOptionsByType[opt.variantTypeId])
        .map(opt => opt.variantTypeId === variantTypeId ? { ...opt, optionId } : opt);
      // Add missing enabled types
      if (!selectedOptions.find(opt => opt.variantTypeId === variantTypeId)) {
        selectedOptions.push({ variantTypeId, optionId });
      }
      // Auto-generate SKU
      const sku = generateSku(selectedOptions);
      return { ...v, selectedOptions, sku };
    });
    onChange(updated);
  };

  const handleVariantFieldChange = (idx: number, field: keyof VariantForm, fieldValue: any) => {
    const updated = value.map((v, i) =>
      i === idx ? { ...v, [field]: fieldValue } : v
    );
    onChange(updated);
  };

  const handleRemove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  // Handle allowed options selection
  const handleAllowedOptionChange = (variantTypeId: string, optionId: string, checked: boolean) => {
    let updated = allowedOptions.filter(opt => !(opt.variantTypeId === variantTypeId && opt.optionId === optionId));
    if (checked) {
      updated.push({ variantTypeId, optionId });
    }
    onAllowedOptionsChange(updated);
  };


  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="px-0 pt-0 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-semibold">Product Variants</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage product variations, pricing, and inventory
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 space-y-6 w-full">
        {/* Create Variant Section */}
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium">Create New Variant</h3>
              <p className="text-sm text-muted-foreground">
                Add a new variant by selecting type and value
              </p>
            </div>
          </div>
          <VariantCreator
            variantTypes={variantTypes}
            onCreate={variant => onChange([...value, variant])}
            productPrice={productPrice}
            existingVariants={value}
            baseName={baseName}
          />
        </div>

        {/* Variants List Section */}
        <div className="space-y-4 pt-6 border-t mt-6 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium">Existing Variants</h3>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{value.length}</span> variant{value.length !== 1 ? 's' : ''} configured
              </div>
            </div>
          </div>
          
          {value.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20">
              <PackageOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <h4 className="font-medium">No variants added yet</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Use the form above to create your first variant
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/5">
                    <tr>
                      {Object.entries(enabledOptionsByType).map(([variantTypeId]) => {
                        const vt = variantTypes.find(vt => vt.id === variantTypeId);
                        return vt ? (
                          <th 
                            key={variantTypeId} 
                            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                          >
                            {vt.name}
                          </th>
                        ) : null;
                      })}
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {value.map((variant, idx) => (
                      <tr key={idx} className="hover:bg-muted/20 transition-colors">
                        {Object.entries(enabledOptionsByType).map(([variantTypeId, optionIds]) => {
                          const vt = variantTypes.find(vt => vt.id === variantTypeId);
                          return vt ? (
                            <td key={variantTypeId} className="px-4 py-3 whitespace-nowrap">
                              <Select
                                value={variant.selectedOptions.find(opt => opt.variantTypeId === variantTypeId)?.optionId || ""}
                                onValueChange={value => handleOptionChange(idx, variantTypeId, value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={`Select ${vt.name}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {optionIds.map(optionId => {
                                    const opt = vt.options.find(o => o.id === optionId);
                                    return opt ? (
                                      <SelectItem key={optionId} value={optionId}>
                                        {opt.name}
                                      </SelectItem>
                                    ) : null;
                                  })}
                                </SelectContent>
                              </Select>
                            </td>
                          ) : null;
                        })}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <Input 
                              value={variant.sku} 
                              readOnly 
                              className="font-mono text-sm bg-muted/20"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              value={variant.price}
                              onChange={e => handleVariantFieldChange(idx, "price", e.target.value)}
                              min="0"
                              step="0.01"
                              className="pl-6 w-24"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Input
                            type="number"
                            value={variant.stock}
                            onChange={e => handleVariantFieldChange(idx, "stock", Number(e.target.value))}
                            min="0"
                            className="w-20"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemove(idx)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove variant</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 border-t bg-muted/5 text-xs text-muted-foreground">
                <div className="max-w-4xl mx-auto">
                  Each variant must have a unique combination of options. SKUs are auto-generated from the product name and selected values.
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
