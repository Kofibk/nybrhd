import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-8 text-center border-destructive/50 bg-destructive/5">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            An error occurred while loading this section. This has been logged for review.
          </p>
          {this.state.error && (
            <p className="text-xs text-muted-foreground font-mono mb-4 p-2 bg-muted rounded max-w-md mx-auto overflow-auto">
              {this.state.error.message}
            </p>
          )}
          <Button onClick={this.handleRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for functional component wrapping
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook-friendly wrapper component
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  name?: string;
}

export function SafeComponent({ children, name }: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error(`Error in ${name || 'component'}:`, error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
