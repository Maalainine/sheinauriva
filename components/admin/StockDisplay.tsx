'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { 
  Product, 
  StockSummary, 
  calculateStockFromVariants, 
  getStockBreakdown 
} from '@/lib/stockUtils';

interface StockBadgeProps {
  product: Product;
  lowStockThreshold?: number;
  showTooltip?: boolean;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ 
  product, 
  lowStockThreshold = 10,
  showTooltip = false 
}) => {
  const stockInfo = calculateStockFromVariants(product, lowStockThreshold);
  const breakdown = getStockBreakdown(product);
  
  return (
    <div className="relative group">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockBadgeColor(stockInfo.stockLevel)}`}
        title={showTooltip ? breakdown : undefined}
      >
        {stockInfo.stockDisplay}
      </span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-pre-line pointer-events-none z-10">
          {breakdown}
        </div>
      )}
    </div>
  );
};

export const renderStock = (product: Product): React.ReactNode => {
  const stockInfo = calculateStockFromVariants(product, 10);
  const breakdown = getStockBreakdown(product);
  
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockBadgeColor(stockInfo.stockLevel)}`}
        title={breakdown}
      >
        {stockInfo.stockDisplay}
      </span>
      {stockInfo.stockStatus === 'low_stock' && (
        <AlertCircle className="h-4 w-4 text-yellow-500" />
      )}
      {stockInfo.stockStatus === 'out_of_stock' && (
        <AlertCircle className="h-4 w-4 text-red-500" />
      )}
    </div>
  );
};

const getStockBadgeColor = (stockLevel: 'high' | 'medium' | 'low' | 'out') => {
  switch (stockLevel) {
    case 'high':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'medium':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'low':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'out':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};
