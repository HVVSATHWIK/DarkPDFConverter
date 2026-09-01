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
        <Route path="/all-tools" element={<ToolsPage />} />
        <Route path="/explore" element={<ExplorePage />} />

        {/* Primary Tool Workspaces */}
        <Route path="/merge" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[1]} />} />
        <Route path="/merge-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[1]} />} />

        <Route path="/split" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[2]} />} />
        <Route path="/split-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[2]} />} />

        <Route path="/rotate" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[3]} />} />
        <Route path="/rotate-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[3]} />} />

        <Route path="/extract" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[5]} />} />
        <Route path="/extract-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[5]} />} />

        <Route path="/optimize" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[4]} />} />
        <Route path="/compress-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[4]} />} />

        <Route path="/dark-mode" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[0]} />} />
        <Route path="/dark-mode-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[0]} />} />
        <Route path="/convert/pdf-to-dark-mode" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[0]} />} />
        <Route path="/invert-pdf-colors" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[0]} />} />

        {/* New White Space Opportunity Tools */}
        <Route path="/cleanse-metadata" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[6]} />} />
        <Route path="/scrub-metadata" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[6]} />} />
        <Route path="/remove-pdf-metadata" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[6]} />} />

        <Route path="/images-to-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[7]} />} />
        <Route path="/jpg-to-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[7]} />} />
        <Route path="/png-to-pdf" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[7]} />} />

        {/* Programmatic SEO: Industry & Persona Hubs */}
        <Route path="/tools-for/:industry" element={<IndustryPage />} />

        {/* Programmatic SEO: Competitor Displacement Hubs */}
        <Route path="/alternatives/:competitor" element={<CompetitorAlternativePage />} />

        {/* Whitepaper & Privacy Architecture */}
        <Route path="/privacy-architecture" element={<PrivacyArchitecturePage />} />
        <Route path="/security" element={<PrivacyArchitecturePage />} />
        <Route path="/compliance" element={<PrivacyArchitecturePage />} />

        {/* Legal & Policy Pages */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/terms-of-service" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/privacy-policy" element={<PrivacyPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
