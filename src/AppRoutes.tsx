import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import ToolsPage from '@/pages/ToolsPage';
import ExplorePage from '@/pages/ExplorePage';
import WorkspacePanel from '@/components/WorkspacePanel';
import ToolGuidePage from '@/pages/ToolGuidePage';
import IndustryPage from '@/pages/seo/IndustryPage';
import CompetitorAlternativePage from '@/pages/seo/CompetitorAlternativePage';
import PrivacyArchitecturePage from '@/pages/seo/PrivacyArchitecturePage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { getToolByPath } from '@/config/tools';
import { SEO } from '@/components/common/SEO';

export function AppRoutes() {
  return (
    <>
      <SEO />
      <Routes>
        {/* Home Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* Dedicated Tools Hub & 3D Lab */}
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/all-tools" element={<Navigate to="/tools" replace />} />
        <Route path="/explore" element={<ExplorePage />} />

        {/* Primary Tool Canonical Workspaces */}
        <Route path="/dark-mode-pdf" element={<WorkspacePanel activeTool={getToolByPath('/dark-mode-pdf')!} />} />
        <Route path="/merge-pdf" element={<WorkspacePanel activeTool={getToolByPath('/merge-pdf')!} />} />
        <Route path="/split-pdf" element={<WorkspacePanel activeTool={getToolByPath('/split-pdf')!} />} />
        <Route path="/rotate-pdf" element={<WorkspacePanel activeTool={getToolByPath('/rotate-pdf')!} />} />
        <Route path="/compress-pdf" element={<WorkspacePanel activeTool={getToolByPath('/compress-pdf')!} />} />
        <Route path="/extract-pdf" element={<WorkspacePanel activeTool={getToolByPath('/extract-pdf')!} />} />
        <Route path="/cleanse-metadata" element={<WorkspacePanel activeTool={getToolByPath('/cleanse-metadata')!} />} />
        <Route path="/images-to-pdf" element={<WorkspacePanel activeTool={getToolByPath('/images-to-pdf')!} />} />

        {/* Dedicated Full-Page Tool Guides */}
        <Route path="/dark-mode-pdf/guide" element={<ToolGuidePage toolSlug="dark-mode-pdf" />} />
        <Route path="/merge-pdf/guide" element={<ToolGuidePage toolSlug="merge-pdf" />} />
        <Route path="/split-pdf/guide" element={<ToolGuidePage toolSlug="split-pdf" />} />
        <Route path="/rotate-pdf/guide" element={<ToolGuidePage toolSlug="rotate-pdf" />} />
        <Route path="/compress-pdf/guide" element={<ToolGuidePage toolSlug="compress-pdf" />} />
        <Route path="/extract-pdf/guide" element={<ToolGuidePage toolSlug="extract-pdf" />} />
        <Route path="/cleanse-metadata/guide" element={<ToolGuidePage toolSlug="cleanse-metadata" />} />
        <Route path="/images-to-pdf/guide" element={<ToolGuidePage toolSlug="images-to-pdf" />} />

        {/* Alias Guide Redirects */}
        <Route path="/dark-mode/guide" element={<Navigate to="/dark-mode-pdf/guide" replace />} />
        <Route path="/merge/guide" element={<Navigate to="/merge-pdf/guide" replace />} />
        <Route path="/split/guide" element={<Navigate to="/split-pdf/guide" replace />} />
        <Route path="/rotate/guide" element={<Navigate to="/rotate-pdf/guide" replace />} />
        <Route path="/compress/guide" element={<Navigate to="/compress-pdf/guide" replace />} />
        <Route path="/extract/guide" element={<Navigate to="/extract-pdf/guide" replace />} />
        <Route path="/optimize/guide" element={<Navigate to="/compress-pdf/guide" replace />} />
        <Route path="/scrub-metadata/guide" element={<Navigate to="/cleanse-metadata/guide" replace />} />
        <Route path="/jpg-to-pdf/guide" element={<Navigate to="/images-to-pdf/guide" replace />} />
        <Route path="/png-to-pdf/guide" element={<Navigate to="/images-to-pdf/guide" replace />} />

        {/* Alias Redirects to Strict Canonical Routes */}
        <Route path="/dark-mode" element={<Navigate to="/dark-mode-pdf" replace />} />
        <Route path="/convert/pdf-to-dark-mode" element={<Navigate to="/dark-mode-pdf" replace />} />
        <Route path="/invert-pdf-colors" element={<Navigate to="/dark-mode-pdf" replace />} />

        <Route path="/merge" element={<Navigate to="/merge-pdf" replace />} />
        <Route path="/split" element={<Navigate to="/split-pdf" replace />} />
        <Route path="/rotate" element={<Navigate to="/rotate-pdf" replace />} />
        <Route path="/extract" element={<Navigate to="/extract-pdf" replace />} />
        <Route path="/optimize" element={<Navigate to="/compress-pdf" replace />} />

        <Route path="/scrub-metadata" element={<Navigate to="/cleanse-metadata" replace />} />
        <Route path="/remove-pdf-metadata" element={<Navigate to="/cleanse-metadata" replace />} />

        <Route path="/jpg-to-pdf" element={<Navigate to="/images-to-pdf" replace />} />
        <Route path="/png-to-pdf" element={<Navigate to="/images-to-pdf" replace />} />

        {/* Programmatic SEO: Industry & Persona Hubs */}
        <Route path="/tools-for/:industry" element={<IndustryPage />} />

        {/* Programmatic SEO: Competitor Analysis Hubs */}
        <Route path="/alternatives/:competitor" element={<CompetitorAlternativePage />} />

        {/* Whitepaper & Privacy Architecture */}
        <Route path="/privacy-architecture" element={<PrivacyArchitecturePage />} />
        <Route path="/security" element={<Navigate to="/privacy-architecture" replace />} />
        <Route path="/compliance" element={<Navigate to="/privacy-architecture" replace />} />

        {/* Legal & Policy Pages */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
