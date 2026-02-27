import { useMemo } from 'react';
import { useCompanies } from './useCompanies';
import { useAchievements } from './useAchievements';
import { useProjects } from './useProjects';
import type { Company, ProfessionalAchievement, Project } from '@/types/database';

export interface ProjectBlock {
  projectId: string;
  name: string;
  isHighlight: boolean;
  summary: string | null;
  achievements: { achievementId: string; text: string; isHighlight: boolean }[];
}

export interface RoleBlock {
  companyId: string;
  companyName: string;
  roleTitle: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  projects: ProjectBlock[];
  standaloneAchievements: { achievementId: string; text: string; isHighlight: boolean }[];
}

function getAchievementText(a: ProfessionalAchievement): string {
  return a.synthesis_paragraph || a.ai_generated_name || 'Achievement';
}

export function useSummaryData() {
  const { data: companies, isLoading: loadingCompanies } = useCompanies();
  const { data: achievements, isLoading: loadingAchievements } = useAchievements();
  const { data: projects, isLoading: loadingProjects } = useProjects();

  const roleBlocks = useMemo(() => {
    if (!companies || !achievements || !projects) return [];

    // Index achievements by company_id
    const achByCompany = new Map<string, ProfessionalAchievement[]>();
    for (const a of achievements) {
      const key = a.company_id || '__none__';
      const list = achByCompany.get(key) || [];
      list.push(a);
      achByCompany.set(key, list);
    }

    // Index projects by project_id
    const projectMap = new Map<string, Project>();
    for (const p of projects) {
      projectMap.set(p.project_id, p);
    }

    const blocks: RoleBlock[] = [];

    for (const company of companies) {
      const companyAchs = achByCompany.get(company.company_id) || [];
      if (companyAchs.length === 0) continue;

      // Group by project
      const byProject = new Map<string, ProfessionalAchievement[]>();
      const standalone: ProfessionalAchievement[] = [];

      for (const a of companyAchs) {
        if (a.project_id) {
          const list = byProject.get(a.project_id) || [];
          list.push(a);
          byProject.set(a.project_id, list);
        } else {
          standalone.push(a);
        }
      }

      const projectBlocks: ProjectBlock[] = [];
      for (const [projectId, achs] of byProject) {
        const project = projectMap.get(projectId);
        if (!project) continue;
        projectBlocks.push({
          projectId,
          name: project.name,
          isHighlight: project.is_highlight,
          summary: project.highlight_summary || project.highlight_summary_ai || null,
          achievements: achs.map((a) => ({
            achievementId: a.achievement_id,
            text: getAchievementText(a),
            isHighlight: a.is_highlight,
          })),
        });
      }

      blocks.push({
        companyId: company.company_id,
        companyName: company.name,
        roleTitle: company.role_title,
        startDate: company.start_date,
        endDate: company.end_date,
        isCurrent: company.is_current,
        projects: projectBlocks,
        standaloneAchievements: standalone.map((a) => ({
          achievementId: a.achievement_id,
          text: getAchievementText(a),
          isHighlight: a.is_highlight,
        })),
      });
    }

    // Also handle achievements with no company
    const noCompanyAchs = achByCompany.get('__none__');
    if (noCompanyAchs && noCompanyAchs.length > 0) {
      const byProject = new Map<string, ProfessionalAchievement[]>();
      const standalone: ProfessionalAchievement[] = [];
      for (const a of noCompanyAchs) {
        if (a.project_id) {
          const list = byProject.get(a.project_id) || [];
          list.push(a);
          byProject.set(a.project_id, list);
        } else {
          standalone.push(a);
        }
      }

      const projectBlocks: ProjectBlock[] = [];
      for (const [projectId, achs] of byProject) {
        const project = projectMap.get(projectId);
        if (!project) continue;
        projectBlocks.push({
          projectId,
          name: project.name,
          isHighlight: project.is_highlight,
          summary: project.highlight_summary || project.highlight_summary_ai || null,
          achievements: achs.map((a) => ({
            achievementId: a.achievement_id,
            text: getAchievementText(a),
            isHighlight: a.is_highlight,
          })),
        });
      }

      if (projectBlocks.length > 0 || standalone.length > 0) {
        blocks.push({
          companyId: '__none__',
          companyName: 'Other',
          roleTitle: null,
          startDate: null,
          endDate: null,
          isCurrent: false,
          projects: projectBlocks,
          standaloneAchievements: standalone.map((a) => ({
            achievementId: a.achievement_id,
            text: getAchievementText(a),
            isHighlight: a.is_highlight,
          })),
        });
      }
    }

    return blocks;
  }, [companies, achievements, projects]);

  return {
    roleBlocks,
    isLoading: loadingCompanies || loadingAchievements || loadingProjects,
    isEmpty: !roleBlocks.length,
  };
}
