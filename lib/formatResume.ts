import { parseLocalDate } from '@/lib/dates';
import type { RoleBlock } from '@/hooks/useSummaryData';

function formatDateRange(startDate: string | null, endDate: string | null, isCurrent: boolean): string {
  const fmt = (d: string) => {
    const date = parseLocalDate(d);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  const start = startDate ? fmt(startDate) : '';
  const end = isCurrent ? 'Present' : endDate ? fmt(endDate) : '';
  if (!start && !end) return '';
  return `${start} — ${end}`;
}

export function formatRoleText(role: RoleBlock): string {
  const lines: string[] = [];

  const dateRange = formatDateRange(role.startDate, role.endDate, role.isCurrent);
  lines.push(`${role.companyName} — ${role.roleTitle || 'Role'}${dateRange ? ` (${dateRange})` : ''}`);
  lines.push('');

  for (const project of role.projects) {
    lines.push(project.name);
    if (project.summary) {
      lines.push(project.summary);
    }
    for (const ach of project.achievements) {
      lines.push(`• ${ach.text}`);
    }
    lines.push('');
  }

  if (role.standaloneAchievements.length > 0) {
    if (role.projects.length > 0) {
      lines.push('Other achievements');
    }
    for (const ach of role.standaloneAchievements) {
      lines.push(`• ${ach.text}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

export function formatProjectText(project: RoleBlock['projects'][0]): string {
  const lines: string[] = [];
  lines.push(project.name);
  if (project.summary) {
    lines.push(project.summary);
  }
  for (const ach of project.achievements) {
    lines.push(`• ${ach.text}`);
  }
  return lines.join('\n');
}

export function formatStandaloneText(achievements: RoleBlock['standaloneAchievements']): string {
  return achievements.map((a) => `• ${a.text}`).join('\n');
}

export function formatAllRoles(roles: RoleBlock[]): string {
  return roles.map(formatRoleText).join('\n\n---\n\n');
}
