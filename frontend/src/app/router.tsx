/* eslint-disable react-refresh/only-export-components */
import { Navigate, createBrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './auth-context';
import { AuthPage } from '../pages/auth-page';
import { BpmsConsolePage } from '../pages/bpms-console-page';
import { CampaignPage } from '../pages/campaign-page';
import { CatalogPage } from '../pages/catalog-page';
import { ContactsPage } from '../pages/contacts-page';
import { DashboardPage } from '../pages/dashboard-page';
import { FarmerCampaignCreatePage } from '../pages/farmer-campaign-create-page';
import { FarmerCampaignEditPage } from '../pages/farmer-campaign-edit-page';
import { FarmerPublicProfileEditPage } from '../pages/farmer-public-profile-edit-page';
import { FarmerProfilePage } from '../pages/farmer-profile-page';
import { FarmersPage } from '../pages/farmers-page';
import { HomePage } from '../pages/home-page';
import { RestaurantsPage } from '../pages/restaurants-page';
import { RouteErrorPage, NotFoundPage } from '../pages/route-error-page';
import { RootLayout } from './root-layout';

function ProtectedDashboard() {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <DashboardPage />;
}

function ProtectedFarmerPage({ children }: { children: ReactNode }) {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (session.user.role !== 'farmer') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/farmers',
        element: <FarmersPage />,
      },
      {
        path: '/farmers/:farmerId',
        element: <FarmerProfilePage />,
      },
      {
        path: '/restaurants',
        element: <RestaurantsPage />,
      },
      {
        path: '/catalog',
        element: <CatalogPage />,
      },
      {
        path: '/contacts',
        element: <ContactsPage />,
      },
      {
        path: '/auth',
        element: <AuthPage />,
      },
      {
        path: '/campaigns/:id',
        element: <CampaignPage />,
      },
      {
        path: '/dashboard',
        element: <ProtectedDashboard />,
      },
      {
        path: '/dashboard/farmer/public-profile/edit',
        element: (
          <ProtectedFarmerPage>
            <FarmerPublicProfileEditPage />
          </ProtectedFarmerPage>
        ),
      },
      {
        path: '/dashboard/farmer/campaigns/create',
        element: (
          <ProtectedFarmerPage>
            <FarmerCampaignCreatePage />
          </ProtectedFarmerPage>
        ),
      },
      {
        path: '/dashboard/farmer/campaigns/:campaignId/edit',
        element: (
          <ProtectedFarmerPage>
            <FarmerCampaignEditPage />
          </ProtectedFarmerPage>
        ),
      },
      {
        path: '/bpms-console',
        element: <BpmsConsolePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
