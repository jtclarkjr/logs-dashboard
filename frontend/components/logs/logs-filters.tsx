'use client'

import { DateRange } from 'react-day-picker'
import { SearchIcon, XIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DateRangePicker,
  Button
} from '@/components/ui'
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
  onSortChange
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
        <CardTitle>Filters</CardTitle>
        <CardDescription>
          Search and filter logs by various criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="col-span-1 md:col-span-2">
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
          <div className="col-span-1 md:col-span-2">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={onDateRangeChange}
              placeholder="Select date range"
            />
          </div>

          {/* Severity */}
          <Select value={selectedSeverity} onValueChange={onSeverityChange}>
            <SelectTrigger>
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

          {/* Sort */}
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger>
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
      </CardContent>
    </Card>
  )
}
