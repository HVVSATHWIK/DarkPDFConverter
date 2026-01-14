import { Routes, Route, Navigate } from 'react-router-dom';
import ToolsDashboard from '@/pages/ToolsDashboard';
import ExplorePage from '@/pages/ExplorePage';
import WorkspacePanel from '@/components/WorkspacePanel';
import { TOOL_DEFINITIONS } from '@/config/tools';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ToolsDashboard />} />
      <Route path="/explore" element={<ExplorePage />} />

      <Route path="/merge" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[1]} />} />
      <Route path="/split" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[2]} />} />
      <Route path="/rotate" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[3]} />} />
      <Route path="/extract" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[5]} />} />
      <Route path="/optimize" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[4]} />} />
      <Route path="/dark-mode" element={<WorkspacePanel activeTool={TOOL_DEFINITIONS[0]} />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
