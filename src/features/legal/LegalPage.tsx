import { ActionIcon, Container, Divider, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LegalSection {
  heading: string;
  body: string;
}

function LegalPage({ i18nKey }: { i18nKey: 'privacyPolicy' | 'termsOfService' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sections = t(`${i18nKey}.sections`, { returnObjects: true }) as LegalSection[];

  return (
    <Container size="sm" py="md" pb={80}>
      <ActionIcon
        variant="subtle"
        onClick={() => navigate(-1)}
        aria-label={t('common.back')}
        mb="sm"
      >
        <IconArrowLeft size={20} />
      </ActionIcon>
      <Stack gap="md">
        <div>
          <Title order={2}>{t(`${i18nKey}.title`)}</Title>
          <Text size="xs" c="dimmed">
            {t(`${i18nKey}.lastUpdated`)}
          </Text>
        </div>
        <Text>{t(`${i18nKey}.intro`)}</Text>
        <Divider />
        {sections.map((section) => (
          <div key={section.heading}>
            <Title order={4} mb={4}>
              {section.heading}
            </Title>
            <Text>{section.body}</Text>
          </div>
        ))}
      </Stack>
    </Container>
  );
}

export function PrivacyPolicyScreen() {
  return <LegalPage i18nKey="privacyPolicy" />;
}

export function TermsOfServiceScreen() {
  return <LegalPage i18nKey="termsOfService" />;
}
