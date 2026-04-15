import { useEffect, useState } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Trans, useLingui } from '@lingui/react/macro';
import { CoreObjectNameSingular, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

type WorkspaceMemberWithGranola = {
  __typename: string;
  id: string;
  granolaApiKey?: string | null;
  granolaFilterDomain?: string | null;
};

export const SettingsAccountsGranola = () => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const [apiKey, setApiKey] = useState('');
  const [savedApiKey, setSavedApiKey] = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [savedFilterDomain, setSavedFilterDomain] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { record } = useFindOneRecord<WorkspaceMemberWithGranola>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: currentWorkspaceMember?.id,
    recordGqlFields: { id: true, granolaApiKey: true, granolaFilterDomain: true },
    skip: !currentWorkspaceMember?.id,
  });

  useEffect(() => {
    if (record) {
      const key = record.granolaApiKey ?? '';
      setApiKey(key);
      setSavedApiKey(key);
      const domain = record.granolaFilterDomain ?? '';
      setFilterDomain(domain);
      setSavedFilterDomain(domain);
    }
  }, [record]);

  const { updateOneRecord } = useUpdateOneRecord();

  const isDirty = apiKey !== savedApiKey || filterDomain !== savedFilterDomain;

  const handleSave = async () => {
    if (!currentWorkspaceMember?.id) return;
    setIsSaving(true);
    try {
      await updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
        idToUpdate: currentWorkspaceMember.id,
        updateOneRecordInput: {
          granolaApiKey: apiKey,
          granolaFilterDomain: filterDomain || null,
        },
      });
      setSavedApiKey(apiKey);
      setSavedFilterDomain(filterDomain);
      enqueueSuccessSnackBar({ message: t`Granola settings saved.` });
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to save Granola settings.` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setApiKey(savedApiKey);
    setFilterDomain(savedFilterDomain);
  };

  return (
    <SubMenuTopBarContainer
      title={t`Granola`}
      links={[
        {
          children: <Trans>User</Trans>,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: <Trans>Accounts</Trans>,
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: <Trans>Granola</Trans> },
      ]}
      actionButton={
        isDirty ? (
          <SaveAndCancelButtons
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isSaving}
          />
        ) : undefined
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`API Key`}
            description={t`Your personal Granola API key (starts with grn_). Get it from granola.ai/settings. Once set, meetings will be synced automatically every hour.`}
          />
          <SettingsTextInput
            instanceId="granola-api-key"
            value={apiKey}
            onChange={setApiKey}
            placeholder="grn_..."
            fullWidth
          />
        </Section>
        <Section>
          <H2Title
            title={t`Filter Domain`}
            description={t`Only import meetings where at least one attendee has an email from this domain (e.g. acme.com). Leave blank to import all meetings.`}
          />
          <SettingsTextInput
            instanceId="granola-filter-domain"
            value={filterDomain}
            onChange={setFilterDomain}
            placeholder="acme.com"
            fullWidth
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
