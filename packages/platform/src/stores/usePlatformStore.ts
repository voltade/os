import { create } from 'zustand';

interface Environment {
  id: string;
  slug: string;
  name: string | null;
  is_production: boolean;
}

interface PlatformStore {
  environment: {
    slug: string;
    id: string;
  };
  isInitialized: boolean;
  setEnvironment: (slug: string, id: string) => void;
  initializeWithProduction: (environments: Environment[]) => void;
}

export const usePlatformStore = create<PlatformStore>((set) => ({
  environment: {
    slug: '',
    id: '',
  },
  isInitialized: false,
  setEnvironment: (slug, id) =>
    set(() => ({
      environment: { slug, id },
    })),
  initializeWithProduction: (environments) => {
    const productionEnvironment = environments.find(
      (env) => env.is_production === true,
    );

    if (productionEnvironment) {
      set(() => ({
        environment: {
          slug: productionEnvironment.slug,
          id: productionEnvironment.id,
        },
        isInitialized: true,
      }));
    } else {
      //TODO: Fix the logic here to handle cases where no production environment is found
      console.warn('No production environment found, using first environment.');
      // Fallback to first environment if no production environment found
      const firstEnvironment = environments[0];
      if (firstEnvironment) {
        set(() => ({
          environment: {
            slug: firstEnvironment.slug,
            id: firstEnvironment.id,
          },
          isInitialized: true,
        }));
      }
    }
  },
}));
