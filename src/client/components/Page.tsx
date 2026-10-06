/**
 * Page wrapper template to be used as a base for all pages.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useSession } from 'modelence/client';
import LoadingSpinner from '@/client/components/LoadingSpinner';
import { Button } from '@/client/components/ui/Button';
import { cn } from '@/client/lib/utils';

interface PageProps {
  children?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

function Header() {
  const { user } = useSession();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="font-semibold text-lg hidden sm:inline">MovieBook</span>
      </Link>

      {user ? (
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/bookings">
            <Button variant="ghost" size="sm">
              My Bookings
            </Button>
          </Link>
          <span className="text-sm text-gray-600 hidden sm:inline">
            {user.handle}
          </span>
          <Link to="/logout">
            <Button variant="outline" size="sm">
              Logout
            </Button>
          </Link>
        </div>
      ) : (
        <Link to="/login">
          <Button variant="outline">
            Sign in
          </Button>
        </Link>
      )}
    </header>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col min-h-screen max-w-full overflow-x-hidden">{children}</div>;
}

function PageBody({ children, className, isLoading = false }: PageProps) {
  return (
    <div className="flex flex-1 w-full min-h-0">
      <main className={cn("flex flex-col flex-1 p-4 space-y-4 overflow-x-hidden", className)}>
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full">
            <LoadingSpinner />
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

export default function Page({ children, className, isLoading = false }: PageProps) {
  return (
    <PageWrapper>
      <Header />
      <PageBody className={className} isLoading={isLoading}>{children}</PageBody>
    </PageWrapper>
  );
}
