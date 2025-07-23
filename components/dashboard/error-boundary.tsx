import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console for now
    // TODO: Hook this up to a monitoring service in the future
    console.error('Dashboard Error:', error);
    console.error('Error Info:', errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md p-6 text-center">
            <h2 className="text-2xl font-semibold mb-4">Oops! Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              We apologise for the inconvenience. Please try again or contact support if the problem persists.
            </p>
            <Button onClick={this.handleRetry} variant="default">
              Try Again
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
