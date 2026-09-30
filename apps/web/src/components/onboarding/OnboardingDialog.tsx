'use client';

import OnboardingForm from '@/components/onboarding/OnboardingForm';
import FormDialog from '@/components/utility/FormDialog';
import { useMe } from '@/hooks/useMe';

export default function OnboardingDialog() {
  const { data: me } = useMe();

  if (!me || me.username) return null;

  return (
    <FormDialog title="Set up your profile" onClose={() => {}} dismissible={false} className="w-[560px]">
      <OnboardingForm me={me} />
    </FormDialog>
  );
}
