'use client'

import { DateRange } from 'react-day-picker'
import { SearchIcon, XIcon, FilterIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Button } from '@/components/ui/button'
import { SeverityLevel } from '@/lib/enums/severity'
import type {
  SortOrder,
  SeverityFilter,
  SortByField
} from '@/lib/types/filters'
import { useDebouncedSearch } from '@/lib/hooks/utils/use-debounced-search'

interface LogsFiltersProps {
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  dateRange: DateRange | undefined
  onDateRangeChange: (dateRange: DateRange | undefined) => void
  selectedSeverity: SeverityFilter
  onSeverityChange: (severity: SeverityFilter) => void
  sortBy: SortByField
  sortOrder: SortOrder
  onSortChange: (sortBy: SortByField, sortOrder: SortOrder) => void
  onResetFilters: () => void
}

export function LogsFilters({
  searchQuery,
  onSearchQueryChange,
  dateRange,
  onDateRangeChange,
  selectedSeverity,
  onSeverityChange,
  sortBy,
  sortOrder,
  onSortChange,
  onResetFilters
}: LogsFiltersProps) {
  const { searchValue, setSearchValue } = useDebouncedSearch(
    searchQuery,
    onSearchQueryChange,
    { delay: 300 }
  )

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-')
    onSortChange(field as SortByField, order as SortOrder)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Search and filter logs by various criteria
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="flex items-center gap-2"
          >
            <FilterIcon className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 lg:flex-[2]">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchValue('')}
                  className="absolute right-1 top-0.5 h-8 w-8 p-0 hover:bg-transparent cursor-pointer"
                >
                  <XIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="flex-1 lg:flex-[2]">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={onDateRangeChange}
              placeholder="Select date range"
            />
          </div>

          {/* Severity */}
          <div className="w-full lg:w-48">
            <Select value={selectedSeverity} onValueChange={onSeverityChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {Object.values(SeverityLevel).map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="w-full lg:w-48">
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp-desc">Newest First</SelectItem>
                <SelectItem value="timestamp-asc">Oldest First</SelectItem>
                <SelectItem value="severity-desc">Severity ↓</SelectItem>
                <SelectItem value="severity-asc">Severity ↑</SelectItem>
                <SelectItem value="source-desc">Source ↓</SelectItem>
                <SelectItem value="source-asc">Source ↑</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
