import type { LinkedInProfile } from './apify-client';

// Calculate total years of experience from the experience array.
// Uses the earliest startDate and latest endDate (or now) to compute the span.
const calculateYearsOfExperience = (
  experience: LinkedInProfile['experience'],
): number | null => {
  if (!experience?.length) return null;

  let earliestYear: number | null = null;

  for (const exp of experience) {
    const year = exp.startDate?.year;
    if (year && (earliestYear === null || year < earliestYear)) {
      earliestYear = year;
    }
  }

  if (earliestYear === null) return null;

  const currentYear = new Date().getFullYear();
  return currentYear - earliestYear;
};

// Format experience array as markdown for RICH_TEXT field
const formatWorkHistory = (
  experience: LinkedInProfile['experience'],
): string | null => {
  if (!experience?.length) return null;

  return experience
    .map((exp) => {
      const lines: string[] = [];

      const title = exp.position || 'Unknown Role';
      const company = exp.companyName || 'Unknown Company';
      lines.push(`**${title}** at ${company}`);

      const parts: string[] = [];
      if (exp.startDate?.text) parts.push(exp.startDate.text);
      if (exp.endDate?.text) parts.push(exp.endDate.text);
      if (parts.length) {
        const dateLine = parts.join(' - ');
        const durationSuffix = exp.duration ? ` (${exp.duration})` : '';
        lines.push(`${dateLine}${durationSuffix}`);
      }

      if (exp.employmentType || exp.workplaceType) {
        const meta = [exp.employmentType, exp.workplaceType]
          .filter(Boolean)
          .join(' · ');
        lines.push(meta);
      }

      if (exp.description) {
        lines.push('');
        lines.push(exp.description);
      }

      return lines.join('\n');
    })
    .join('\n\n---\n\n');
};

// Format honors and awards as markdown for RICH_TEXT field
const formatHonorsAndAwards = (
  honors: LinkedInProfile['honorsAndAwards'],
): string | null => {
  if (!honors?.length) return null;

  return honors
    .map((h) => {
      const lines: string[] = [];
      lines.push(`**${h.title || 'Untitled'}**`);
      if (h.issuedBy) lines.push(`Issued by ${h.issuedBy}`);
      if (h.issuedAt) lines.push(h.issuedAt);
      if (h.description) {
        lines.push('');
        lines.push(h.description);
      }
      return lines.join('\n');
    })
    .join('\n\n---\n\n');
};

// Format projects as markdown for RICH_TEXT field
const formatProjects = (
  projects: LinkedInProfile['projects'],
): string | null => {
  if (!projects?.length) return null;

  return projects
    .map((p) => {
      const lines: string[] = [];
      lines.push(`**${p.title || 'Untitled'}**`);
      if (p.description) {
        lines.push('');
        lines.push(p.description);
      }
      return lines.join('\n');
    })
    .join('\n\n---\n\n');
};

// Format recommendations as markdown for RICH_TEXT field
const formatRecommendations = (
  recs: LinkedInProfile['receivedRecommendations'],
): string | null => {
  if (!recs?.length) return null;

  return recs
    .map((r) => {
      const lines: string[] = [];
      const name = r.givenBy || 'Unknown';
      lines.push(`**${name}**`);
      if (r.givenByHeadline) lines.push(r.givenByHeadline);
      if (r.givenAt) lines.push(`*${r.givenAt}*`);
      if (r.description) {
        lines.push('');
        lines.push(`> ${r.description}`);
      }
      return lines.join('\n');
    })
    .join('\n\n---\n\n');
};

const richText = (markdown: string | null): { blocknote: null; markdown: string } | null =>
  markdown ? { blocknote: null, markdown } : null;

type PersonUpdateFields = Record<string, unknown>;

// Map a LinkedIn profile response to Person update fields.
// Only sets fields that have values — never nulls out existing data.
export const mapProfileToPersonFields = (
  profile: LinkedInProfile,
  existingPerson: { name: { firstName: string; lastName: string }; jobTitle: string | null },
): PersonUpdateFields => {
  const fields: PersonUpdateFields = {};

  // Native: name (only if currently empty)
  if (
    !existingPerson.name.firstName &&
    !existingPerson.name.lastName &&
    (profile.firstName || profile.lastName)
  ) {
    fields.name = {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
    };
  }

  // Native: jobTitle ← current position title, fall back to headline
  const currentJobTitle =
    profile.currentPosition?.[0]?.position ?? profile.headline;
  if (currentJobTitle) {
    fields.jobTitle = currentJobTitle;
  }

  // Native: avatarUrl ← photo
  if (profile.photo) {
    fields.avatarUrl = profile.photo;
  }

  // Native: city
  if (profile.location?.parsed?.city) {
    fields.city = profile.location.parsed.city;
  }

  // Custom: currentCompany
  if (profile.currentPosition?.[0]?.companyName) {
    fields.linkedinCurrentCompany = profile.currentPosition[0].companyName;
  }

  // Custom: about (RICH_TEXT)
  if (profile.about) {
    fields.linkedinAbout = richText(profile.about);
  }

  // Custom: state
  if (profile.location?.parsed?.state) {
    fields.linkedinState = profile.location.parsed.state;
  }

  // Custom: country
  if (profile.location?.parsed?.country) {
    fields.linkedinCountry = profile.location.parsed.country;
  }

  // Custom: openToWork (BOOLEAN)
  if (profile.openToWork !== undefined) {
    fields.linkedinOpenToWork = Boolean(profile.openToWork);
  }

  // Custom: website (LINKS composite)
  if (profile.websites?.[0]) {
    fields.linkedinWebsite = {
      primaryLinkLabel: '',
      primaryLinkUrl: profile.websites[0],
      secondaryLinks: profile.websites.slice(1).map((url) => ({ label: '', url })),
    };
  }

  // Custom: workHistory (RICH_TEXT)
  const workHistoryMd = formatWorkHistory(profile.experience);
  if (workHistoryMd) {
    fields.linkedinWorkHistory = richText(workHistoryMd);
  }

  // Custom: yearsOfExperience (NUMBER)
  const years = calculateYearsOfExperience(profile.experience);
  if (years !== null) {
    fields.linkedinYearsOfExperience = years;
  }

  // Custom: education (comma-separated "Degree at School" entries)
  if (profile.education?.length) {
    const entries = profile.education
      .map((e) => {
        const school = e.schoolName?.trim();
        const degreeParts = [e.degree?.trim(), e.fieldOfStudy?.trim()].filter(
          Boolean,
        );
        const degree = degreeParts.join(' in ');
        if (!school) return degree || null;
        return degree ? `${degree} at ${school}` : school;
      })
      .filter(Boolean)
      .join(', ');
    if (entries) fields.linkedinEducation = entries;
  }

  // Custom: skills (comma-separated)
  if (profile.skills?.length) {
    const skillNames = profile.skills
      .map((s) => s.name)
      .filter(Boolean)
      .join(', ');
    if (skillNames) fields.linkedinSkills = skillNames;
  }

  // Custom: honorsAndAwards (RICH_TEXT)
  const honorsMd = formatHonorsAndAwards(profile.honorsAndAwards);
  if (honorsMd) {
    fields.linkedinHonorsAndAwards = richText(honorsMd);
  }

  // Custom: projects (RICH_TEXT)
  const projectsMd = formatProjects(profile.projects);
  if (projectsMd) {
    fields.linkedinProjects = richText(projectsMd);
  }

  // Custom: recommendations (RICH_TEXT)
  const recsMd = formatRecommendations(profile.receivedRecommendations);
  if (recsMd) {
    fields.linkedinRecommendations = richText(recsMd);
  }

  // Custom: languages (comma-separated)
  if (profile.languages?.length) {
    const langs = profile.languages
      .map((l) => l.name)
      .filter(Boolean)
      .join(', ');
    if (langs) fields.linkedinLanguages = langs;
  }

  return fields;
};
