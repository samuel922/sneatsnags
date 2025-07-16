import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Chip,
  Typography,
  Grid,
  Button,
  IconButton,
  Collapse,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { debounce } from 'lodash';
import {
  Event,
  EventFilters,
  EventSearchProps,
  EVENT_TYPES,
  EVENT_STATUSES,
  DEFAULT_FILTERS,
} from '../../types/events';
import { useEventSearch } from '../../contexts/EventContext';

// Search suggestion interface
interface SearchSuggestion {
  type: 'event' | 'venue' | 'city' | 'category';
  value: string;
  label: string;
  icon: React.ReactNode;
  event?: Event;
}

// Advanced search component
const EventSearch: React.FC<EventSearchProps> = ({
  query,
  onQueryChange,
  onSearch,
  loading = false,
  placeholder = "Search events, venues, cities...",
}) => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const { results } = useEventSearch(300);

  // Generate suggestions based on search results
  const generateSuggestions = useCallback((searchResults: Event[], searchQuery: string): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    const seen = new Set<string>();

    // Add event suggestions
    searchResults.slice(0, 5).forEach(event => {
      const suggestionKey = `event-${event.id}`;
      if (!seen.has(suggestionKey)) {
        suggestions.push({
          type: 'event',
          value: event.name,
          label: event.name,
          icon: <EventIcon />,
          event,
        });
        seen.add(suggestionKey);
      }
    });

    // Add venue suggestions
    const venues = Array.from(new Set(searchResults.map(e => e.venue)))
      .filter(venue => venue.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3);
    
    venues.forEach(venue => {
      const suggestionKey = `venue-${venue}`;
      if (!seen.has(suggestionKey)) {
        suggestions.push({
          type: 'venue',
          value: venue,
          label: `${venue} (Venue)`,
          icon: <LocationIcon />,
        });
        seen.add(suggestionKey);
      }
    });

    // Add city suggestions
    const cities = Array.from(new Set(searchResults.map(e => `${e.city}, ${e.state}`)))
      .filter(city => city.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3);
    
    cities.forEach(city => {
      const suggestionKey = `city-${city}`;
      if (!seen.has(suggestionKey)) {
        suggestions.push({
          type: 'city',
          value: city,
          label: `${city} (City)`,
          icon: <LocationIcon />,
        });
        seen.add(suggestionKey);
      }
    });

    // Add category suggestions
    const categories = Array.from(new Set(searchResults.map(e => e.category).filter(Boolean)))
      .filter(category => category!.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3);
    
    categories.forEach(category => {
      const suggestionKey = `category-${category}`;
      if (!seen.has(suggestionKey)) {
        suggestions.push({
          type: 'category',
          value: category!,
          label: `${category} (Category)`,
          icon: <CategoryIcon />,
        });
        seen.add(suggestionKey);
      }
    });

    return suggestions;
  }, []);

  // Update suggestions when search results change
  useEffect(() => {
    if (query.length >= 2) {
      setLoadingSuggestions(true);
      const newSuggestions = generateSuggestions(results, query);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
      setLoadingSuggestions(false);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [results, query, generateSuggestions]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    onQueryChange(suggestion.value);
    setShowSuggestions(false);
    onSearch();
  }, [onQueryChange, onSearch]);

  // Handle search input change
  const handleInputChange = useCallback((value: string) => {
    onQueryChange(value);
    if (value.length === 0) {
      setShowSuggestions(false);
    }
  }, [onQueryChange]);

  // Handle search submit
  const handleSearchSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    setShowSuggestions(false);
    onSearch();
  }, [onSearch]);

  // Handle clear search
  const handleClear = useCallback(() => {
    onQueryChange('');
    setShowSuggestions(false);
  }, [onQueryChange]);

  return (
    <Box position="relative">
      <form onSubmit={handleSearchSubmit}>
        <TextField
          fullWidth
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {loading && <CircularProgress size={20} />}
                {query && (
                  <IconButton onClick={handleClear} edge="end" size="small">
                    <ClearIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
      </form>

      {/* Search Suggestions */}
      {showSuggestions && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 300,
            overflow: 'auto',
            mt: 1,
          }}
        >
          <List dense>
            {loadingSuggestions ? (
              <ListItem>
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="textSecondary">
                    Loading suggestions...
                  </Typography>
                </Box>
              </ListItem>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <ListItem
                  key={`${suggestion.type}-${index}`}
                  button
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <ListItemIcon>{suggestion.icon}</ListItemIcon>
                  <ListItemText
                    primary={suggestion.label}
                    secondary={suggestion.event && `${suggestion.event.venue}, ${suggestion.event.city}`}
                  />
                </ListItem>
              ))
            ) : query.length >= 2 ? (
              <ListItem>
                <ListItemText
                  primary="No suggestions found"
                  secondary="Try a different search term"
                />
              </ListItem>
            ) : null}
          </List>
        </Paper>
      )}
    </Box>
  );
};

// Advanced filters component
interface AdvancedFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: Partial<EventFilters>) => void;
  onReset: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);

  // Update price range when filters change
  useEffect(() => {
    const minPrice = typeof filters.minPrice === 'number' ? filters.minPrice : 0;
    const maxPrice = typeof filters.maxPrice === 'number' ? filters.maxPrice : 1000;
    setPriceRange([minPrice, maxPrice]);
  }, [filters.minPrice, filters.maxPrice]);

  // Handle price range change
  const handlePriceRangeChange = useCallback(
    debounce((newValue: number[]) => {
      onFiltersChange({
        minPrice: newValue[0] > 0 ? newValue[0] : '',
        maxPrice: newValue[1] < 1000 ? newValue[1] : '',
      });
    }, 300),
    [onFiltersChange]
  );

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'search') return false;
      return value !== '' && value !== null && value !== undefined;
    });
  }, [filters]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={expanded ? 2 : 0}>
            <Box display="flex" alignItems="center" gap={1}>
              <FilterListIcon />
              <Typography variant="h6">
                Advanced Filters
                {hasActiveFilters && (
                  <Chip
                    label={Object.values(filters).filter(v => v !== '' && v !== null).length - 1}
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
            </Box>
            
            <Box display="flex" gap={1}>
              {hasActiveFilters && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={onReset}
                >
                  Clear All
                </Button>
              )}
              <IconButton onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          <Collapse in={expanded}>
            <Grid container spacing={3}>
              {/* Location Filters */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                  Location
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={filters.city}
                  onChange={(e) => onFiltersChange({ city: e.target.value })}
                  placeholder="Enter city"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={filters.state}
                  onChange={(e) => onFiltersChange({ state: e.target.value })}
                  placeholder="Enter state"
                />
              </Grid>

              {/* Event Type & Category */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom color="primary">
                  <CategoryIcon fontSize="small" sx={{ mr: 1 }} />
                  Type & Category
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    value={filters.eventType}
                    onChange={(e) => onFiltersChange({ eventType: e.target.value as EventFilters['eventType'] })}
                    label="Event Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {EVENT_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Category"
                  value={filters.category}
                  onChange={(e) => onFiltersChange({ category: e.target.value })}
                  placeholder="Enter category"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => onFiltersChange({ status: e.target.value as EventFilters['status'] })}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {EVENT_STATUSES.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        <Chip
                          label={status.label}
                          size="small"
                          sx={{ bgcolor: `${status.color}.main`, color: 'white' }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Date Range */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom color="primary">
                  <ScheduleIcon fontSize="small" sx={{ mr: 1 }} />
                  Date Range
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="From Date"
                  value={filters.dateFrom ? new Date(filters.dateFrom) : null}
                  onChange={(date) => onFiltersChange({ dateFrom: date?.toISOString().split('T')[0] || '' })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="To Date"
                  value={filters.dateTo ? new Date(filters.dateTo) : null}
                  onChange={(date) => onFiltersChange({ dateTo: date?.toISOString().split('T')[0] || '' })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              {/* Price Range */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom color="primary">
                  <MoneyIcon fontSize="small" sx={{ mr: 1 }} />
                  Price Range
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Box px={2}>
                  <Typography gutterBottom>
                    Price Range: ${priceRange[0]} - ${priceRange[1] === 1000 ? '1000+' : priceRange[1]}
                  </Typography>
                  <Slider
                    value={priceRange}
                    onChange={(_, newValue) => {
                      setPriceRange(newValue as number[]);
                      handlePriceRangeChange(newValue as number[]);
                    }}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
                    step={10}
                    marks={[
                      { value: 0, label: '$0' },
                      { value: 250, label: '$250' },
                      { value: 500, label: '$500' },
                      { value: 750, label: '$750' },
                      { value: 1000, label: '$1000+' },
                    ]}
                  />
                </Box>
              </Grid>

              {/* Additional Options */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.isActive === true}
                        onChange={(e) => onFiltersChange({ isActive: e.target.checked ? true : '' })}
                      />
                    }
                    label="Active Events Only"
                  />
                </Stack>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

// Combined search and filters component
interface EventSearchAndFiltersProps {
  onSearch: (query: string, filters: EventFilters) => void;
  loading?: boolean;
  initialQuery?: string;
  initialFilters?: EventFilters;
}

const EventSearchAndFilters: React.FC<EventSearchAndFiltersProps> = ({
  onSearch,
  loading = false,
  initialQuery = '',
  initialFilters = DEFAULT_FILTERS,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<EventFilters>(initialFilters);

  // Handle search
  const handleSearch = useCallback(() => {
    onSearch(query, filters);
  }, [query, filters, onSearch]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Partial<EventFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Handle filter reset
  const handleFilterReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setQuery('');
  }, []);

  // Auto-search when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, handleSearch]);

  return (
    <Box>
      <Box mb={3}>
        <EventSearch
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          loading={loading}
          placeholder="Search events, venues, cities, or categories..."
        />
      </Box>
      
      <AdvancedFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleFilterReset}
      />
    </Box>
  );
};

export default EventSearch;
export { AdvancedFilters, EventSearchAndFilters };