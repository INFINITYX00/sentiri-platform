
import { useAuth } from '@/contexts/AuthContext';

export function useCompanyData() {
  const { profile, company } = useAuth();

  const getCompanyId = () => profile?.company_id;
  
  const getCompanyLimits = () => ({
    maxMaterials: company?.max_materials || 50,
    maxProjects: company?.max_projects || 10,
  });

  const isTrialExpired = () => {
    if (!company?.trial_ends_at) return false;
    return new Date() > new Date(company.trial_ends_at);
  };

  const getSubscriptionStatus = () => ({
    status: company?.subscription_status || 'trial',
    tier: company?.subscription_tier || 'basic',
    isActive: company?.subscription_status === 'active',
    isTrial: company?.subscription_status === 'trial',
    trialExpired: isTrialExpired(),
  });

  return {
    companyId: getCompanyId(),
    company,
    profile,
    limits: getCompanyLimits(),
    subscription: getSubscriptionStatus(),
  };
}
