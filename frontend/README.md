# Frontend - Logs Dashboard

## Overview

A modern React-based dashboard application for log management and visualization,
built with Next.js and a comprehensive design system approach.

## Tech Stack

### Core Framework

- **Next.js 16** - React framework with App Router and API routes
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Turbopack** - High-performance bundler for development

### UI & Styling

- **Tailwind 4** - Utility-first CSS framework with modern color system (OKLCH)
- **shadcn/ui** - High-quality, accessible component system
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Icon library
- **Class Variance Authority** - Type-safe component variants

### State Management & Data Fetching

- **TanStack Query 5.x** - Server state management and caching
- **TanStack Form** - Type-safe form handling with Zod validation
- **React Hook Form** - Additional form utilities
- **Zod 4.x** - Schema validation and type inference

### Development & Testing

- **Bun** - All-in-one JavaScript runtime, package manager, and test runner
- **ESLint 9.x** - Code linting with Next.js config
- **Prettier** - Code formatting
- **Storybook 9.x** - Component development and documentation
- **Testing Library** - Component testing utilities
- **Happy DOM** - Lightweight DOM implementation for testing

#### Bun Runtime & Tooling

- **Multi-purpose tool** - Serves as runtime, package manager, bundler, and test
  runner
- **Zig-based runtime** - Built with Zig for superior performance over
  traditional JS runtimes
- **Package management** - Significantly faster dependency installation and
  resolution
- **Native testing** - Built-in test runner with exceptional performance
  characteristics

**Testing Performance Comparison** (lower is better):
[Benchmark article](https://dev.to/kcsujeet/your-tests-are-slow-you-need-to-migrate-to-bun-9hh)

- **Jest**: ~17,000ms average test suite execution
- **Vitest**: ~12,000ms average test suite execution
- **Bun**: ~4,500ms average test suite execution

**Performance Advantage**: Bun's JS runtime built with Zig provides ~3-4x faster
test execution compared to Jest/Vitest, which runs on traditional JavaScript
runtimes like Node. This dramatically improves developer productivity during TDD
cycles and CI/CD.

### Additional Libraries

- **date-fns** - Date manipulation and formatting
- **Recharts** - Data visualization and charting
- **Sonner** - Toast notifications
- **cmdk** - Command menu interface

## Architecture & Design Decisions

### Project Structure

```
frontend/
├── app/                # Next.js App Router pages
│   ├── dashboard/      # Dashboard page and components
│   ├── logs/           # Logs page and components
│   └── api/            # API routes
├── components/         # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   ├── logs/           # Log-specific components
│   ├── providers/      # React context providers
│   └── ui/             # Base UI components (shadcn/ui)
└──lib/                 # Utilities, services, hooks, types, wrappers and shared logic
```

### Design System

#### Color System

- Uses **OKLCH color space** for consistent perceptual brightness
- Comprehensive light/dark theme support with CSS custom properties
- Neutral base color palette with semantic color tokens
- Chart-specific color palette for data visualization

#### Component Philosophy

- **shadcn/ui New York variant** for consistent, professional aesthetics
- **Radix UI primitives** ensure accessibility compliance
- **Compound component patterns** for flexible, reusable interfaces
- **Variant-based styling** using Class Variance Authority

#### Typography & Spacing

- **Geist Sans & Mono fonts** for modern, readable typography
- **Consistent border radius** system (0.625rem base)
- **Semantic spacing** through Tailwind's design tokens

### Rendering Strategy

#### Hybrid SSR/CSR Approach

- **Server-Side Rendering (SSR)** for initial page loads to improve performance
  and SEO
- **Client-Side Rendering (CSR)** for dynamic interactions and real-time updates
- **Next.js App Router** enables seamless transitions between server and client
  rendering
- Initial data is hydrated on the server, then client takes over for subsequent
  interactions

#### API Routes Architecture

- **Next.js API routes** serve as a centralized request layer between frontend
  and backend API
- **Request orchestration** - API routes aggregate, transform, and validate
  backend responses
- **Security boundary** - Sensitive backend endpoints are proxied through API
  routes
- **Error handling** - Consistent error formatting and logging at the API layer
- **Caching strategy** - API routes can implement custom caching logic before
  reaching backend

### State Management Strategy

#### Server State

- **TanStack Query** handles all server state with intelligent caching
- **API routes + React Query** combination provides optimal data orchestration
- Automatic background refetching and stale-while-revalidate patterns
- Optimistic updates for improved user experience
- Query invalidation and cache management for real-time data consistency

#### Form State

- **TanStack Form + Zod** for type-safe, validated forms
- Schema-first approach ensures runtime and compile-time safety
- Seamless integration with UI components

### Performance Optimizations and Bundle Optimization

#### Build & Runtime

- **Turbopack** for faster development builds
- **Standalone output** for optimized production deployments
- **Automatic code splitting** through Next.js App Router
- **Tree shaking** enabled for all dependencies
- **Dynamic imports** for non-critical components

### Development Experience

#### Type Safety

- **Strict TypeScript configuration** with ESLint for Nextjs
- **Path aliases** for clean import statements
- **Zod schemas** provide runtime type validation

#### Testing Strategy

- **Component testing** with Testing Library
- **Happy DOM** for fast, lightweight test environment
- **Storybook** for component development and visual testing of components
  (instead of unit tests)
- **Coverage reporting** integrated with Bun test runner

#### Code Quality

- **ESLint** with Next.js and Storybook rules
- **Prettier** for consistent formatting
- **Commit linting** for standardized git history
