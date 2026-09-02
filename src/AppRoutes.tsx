import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import ToolsPage from '@/pages/ToolsPage';
import ExplorePage from '@/pages/ExplorePage';
import WorkspacePanel from '@/components/WorkspacePanel';
import IndustryPage from '@/pages/seo/IndustryPage';
import CompetitorAlternativePage from '@/pages/seo/CompetitorAlternativePage';
import PrivacyArchitecturePage from '@/pages/seo/PrivacyArchitecturePage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { TOOL_DEFINITIONS } from '@/config/tools';
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
        <Route path="/dark-mode-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[0]} />} />
        <Route path="/merge-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[1]} />} />
        <Route path="/split-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[2]} />} />
        <Route path="/rotate-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[3]} />} />
        <Route path="/compress-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[4]} />} />
        <Route path="/extract-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[5]} />} />
        <Route path="/cleanse-metadata" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[6]} />} />
        <Route path="/images-to-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[7]} />} />

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
